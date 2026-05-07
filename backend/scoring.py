"""
SADRISC, HES, TTM, COM-B, and framework selection.
All SADRISC weights match PMC7378422 (Al-Rubeaan et al., 2020).
COM-B scoring uses behavioral signal inference with explicit confidence.
"""
import math
from datetime import datetime, timezone
from typing import Literal

TTMStage = Literal[
    "Precontemplation", "Contemplation", "Preparation", "Action", "Maintenance"
]
COMBBarrier = Literal[
    "Capability", "Opportunity-Physical", "Opportunity-Social",
    "Motivation-Reflective", "Motivation-Automatic",
]


def compute_sadrisc(profile: dict) -> dict:
    sex = 2 if profile["gender"] == "male" else 0

    age = profile["age"]
    if age < 35:
        age_score = 0
    elif age <= 44:
        age_score = 3
    elif age <= 54:
        age_score = 4
    elif age <= 64:
        age_score = 5
    else:
        age_score = 6

    if profile["gender"] == "male":
        waist = 0 if profile["waist_cm"] < 94 else 3
    else:
        waist = 0 if profile["waist_cm"] < 80 else 3

    hyperglycemia = 2 if profile.get("hyperglycemia_history", False) else 0
    family = 2 if profile.get("family_diabetes", False) else 0

    score = sex + age_score + waist + hyperglycemia + family
    risk = "High" if score >= 6 else ("Elevated" if score >= 5 else "Low")

    return {
        "score": score,
        "max_score": 15,
        "risk": risk,
        "breakdown": {
            "sex": sex,
            "age": age_score,
            "waist": waist,
            "hyperglycemia": hyperglycemia,
            "family": family,
        },
    }


def compute_hes(profile: dict) -> dict:
    lam = math.log(2) / 14

    login_score = min(100, (profile.get("logins_90d", 0) / 20) * 100)
    feature_score = min(
        100,
        ((profile.get("articles_read", 0) + profile.get("screening_views", 0)) / 8)
        * 100,
    )
    content_score = min(100, (profile.get("articles_read", 0) / 15) * 100)
    action_score = min(
        100,
        (
            (
                profile.get("screenings_completed", 0) * 5
                + profile.get("booking_attempts", 0) * 3
            )
            / 3
        )
        * 100,
    )

    days_ago = max(0, profile.get("last_login_days_ago", 90))
    recency_decay = math.exp(-lam * days_ago)
    score = round(
        (0.25 * login_score + 0.25 * feature_score + 0.25 * content_score + 0.25 * action_score)
        * recency_decay
    )

    if score > 75:
        level = "Champion"
    elif score > 55:
        level = "Active"
    elif score > 35:
        level = "Moderate"
    elif score > 15:
        level = "Low"
    else:
        level = "Dormant"

    return {
        "score": score,
        "level": level,
        "components": {
            "login": round(login_score),
            "feature": round(feature_score),
            "content": round(content_score),
            "action": round(action_score),
        },
    }


def classify_ttm(profile: dict) -> dict:
    hes = compute_hes(profile)
    if profile.get("screenings_completed", 0) >= 2 and hes["score"] >= 50:
        return {"stage": "Maintenance", "reason": "Multiple screenings + sustained engagement"}

    if profile.get("screenings_completed", 0) >= 1 and profile.get("last_screening_date"):
        try:
            days_since = (datetime.now(timezone.utc) - datetime.fromisoformat(profile["last_screening_date"]).replace(tzinfo=timezone.utc)).days
        except (ValueError, TypeError):
            days_since = 999
        if days_since <= 180:
            return {"stage": "Action", "reason": f"Screened {days_since} days ago"}

    if profile.get("booking_attempts", 0) >= 1 and profile.get("screenings_completed", 0) == 0:
        return {
            "stage": "Preparation",
            "reason": f"Started booking {profile['booking_attempts']}x but didn't complete",
        }

    if profile.get("booking_attempts", 0) >= 1 and profile.get("screenings_completed", 0) >= 1:
        return {
            "stage": "Preparation",
            "reason": f"Previously screened but lapsed — re-engaged with {profile['booking_attempts']}x booking attempts",
        }

    if profile.get("screening_views", 0) >= 1 or profile.get("articles_read", 0) >= 2:
        return {
            "stage": "Contemplation",
            "reason": f"Viewed screening info {profile.get('screening_views', 0)}x, read {profile.get('articles_read', 0)} articles",
        }

    return {"stage": "Precontemplation", "reason": "No health content views, low engagement"}


def _comb_subdomain_scores(profile: dict, ttm_stage: str) -> dict[str, float]:
    """
    Score each COM-B subdomain 0-100. Higher = LESS likely to be a barrier.
    This is a behavioral signal inference heuristic, not a validated instrument.
    """
    articles = profile.get("articles_read", 0)
    screening_views = profile.get("screening_views", 0)
    logins = profile.get("logins_90d", 0)
    booking_attempts = profile.get("booking_attempts", 0)
    screenings_completed = profile.get("screenings_completed", 0)
    has_family_hx = profile.get("family_diabetes", False)
    has_hyperglycemia = profile.get("hyperglycemia_history", False)

    content_signal = min(1.0, (articles * 0.15 + screening_views * 0.2))
    completion_bonus = 0.3 if screenings_completed >= 1 else 0.0
    cap_psych = min(100, round((content_signal + completion_bonus) * 100))

    if screenings_completed >= 1:
        cap_phys = 90
    elif booking_attempts >= 1:
        cap_phys = 60
    else:
        cap_phys = 50

    if screenings_completed >= 1:
        opp_phys = 85
    elif booking_attempts >= 2 and screenings_completed == 0:
        opp_phys = 25
    elif booking_attempts == 1 and screenings_completed == 0:
        opp_phys = 45
    else:
        opp_phys = 50

    social_base = 50
    if has_family_hx or has_hyperglycemia:
        social_base += 15
    if logins >= 10:
        social_base += 10
    opp_social = min(100, social_base)

    reflective_base = {"Precontemplation": 0.15, "Contemplation": 0.40,
                       "Preparation": 0.65, "Action": 0.85, "Maintenance": 0.85}.get(ttm_stage, 0.15)
    engagement_boost = min(0.3, (articles * 0.05 + screening_views * 0.08))
    intent_boost = min(0.2, booking_attempts * 0.1)
    mot_refl = min(100, round((reflective_base + engagement_boost + intent_boost) * 100))

    if screenings_completed >= 1:
        mot_auto = 80
    elif booking_attempts >= 1 and screenings_completed == 0 and articles >= 1:
        mot_auto = 25
    elif booking_attempts >= 1 and screenings_completed == 0:
        mot_auto = 40
    elif ttm_stage == "Precontemplation":
        mot_auto = 45
    else:
        mot_auto = 55

    return {
        "Capability-Psychological": cap_psych,
        "Capability-Physical": cap_phys,
        "Opportunity-Physical": opp_phys,
        "Opportunity-Social": opp_social,
        "Motivation-Reflective": mot_refl,
        "Motivation-Automatic": mot_auto,
    }


def diagnose_comb(profile: dict, ttm_stage: str) -> dict:
    """
    Diagnose primary COM-B barrier via behavioral signal inference.
    Lowest-scoring subdomain = intervention target (mirrors validated questionnaire pattern).
    """
    scores = _comb_subdomain_scores(profile, ttm_stage)
    primary_subdomain = min(scores, key=scores.get)
    primary_score = scores[primary_subdomain]

    subdomain_to_barrier = {
        "Capability-Physical": "Capability", "Capability-Psychological": "Capability",
        "Opportunity-Physical": "Opportunity-Physical", "Opportunity-Social": "Opportunity-Social",
        "Motivation-Reflective": "Motivation-Reflective", "Motivation-Automatic": "Motivation-Automatic",
    }
    barrier = subdomain_to_barrier[primary_subdomain]

    score_values = sorted(scores.values())
    gap = score_values[1] - score_values[0]
    signal_count = sum([
        1 if profile.get("articles_read", 0) > 0 else 0,
        1 if profile.get("logins_90d", 0) >= 3 else 0,
        1 if profile.get("booking_attempts", 0) > 0 else 0,
        1 if profile.get("screenings_completed", 0) > 0 else 0,
    ])
    signal_richness = signal_count / 3

    if gap >= 20 and signal_richness >= 0.66:
        confidence = "moderate"
    elif gap >= 10 or signal_richness >= 0.33:
        confidence = "low"
    else:
        confidence = "very_low"

    interventions = {
        "Capability": "Education: what screening involves, results timeline, and why early detection matters",
        "Opportunity-Physical": "Nearest Taakkad clinic + map link + flexible scheduling + drive-through option",
        "Opportunity-Social": "Authority endorsement (MOH) + family health duty framing",
        "Motivation-Reflective": "Personalized risk data (SADRISC score) + loss framing + authority endorsement",
        "Motivation-Automatic": "Reassurance about screening process + social proof + EAST simplification",
    }

    return {
        "barrier": barrier,
        "subdomain": primary_subdomain,
        "scores": scores,
        "confidence": confidence,
        "reason": f"Lowest subdomain: {primary_subdomain} ({primary_score}/100) in {ttm_stage} stage",
        "intervention": interventions.get(barrier, "Address primary barrier with matched framework"),
        "source": "behavioral_signal_inference",
    }


def select_framework(stage: str, barrier: str) -> dict:
    """
    Select behavioral framework based on TTM stage AND COM-B barrier.
    COM-B barrier modifies framework selection in ALL stages.
    """
    if stage == "Precontemplation":
        base = {
            "primary": "Authority Endorsement",
            "secondary": "Family Duty",
            "east_overlay": ["Attractive", "Timely"],
            "reason": "Authority endorsement (MOH) + family duty — peer norms less effective in Saudi collectivist culture (Frontiers 2025)",
        }
        if barrier == "Capability":
            base["secondary"] = "Education (COM-B)"
            base["east_overlay"] = ["Easy", "Attractive"]
        elif barrier == "Motivation-Reflective":
            base["secondary"] = "Loss Aversion"
        elif barrier == "Motivation-Automatic":
            base["secondary"] = "EAST (Attractive)"
            base["east_overlay"] = ["Easy", "Attractive"]

    elif stage == "Contemplation":
        barrier_map = {
            "Motivation-Reflective": {
                "primary": "Loss Aversion", "secondary": "Authority Endorsement",
                "east_overlay": ["Attractive", "Social", "Timely"],
                "reason": "User considering but unmotivated — tip decisional balance with loss framing",
            },
            "Motivation-Automatic": {
                "primary": "EAST (Attractive)", "secondary": "Authority Endorsement",
                "east_overlay": ["Easy", "Attractive"],
                "reason": "User anxious — reduce fear, reframe screening as simple and routine",
            },
            "Capability": {
                "primary": "Education (COM-B)", "secondary": "EAST (Easy)",
                "east_overlay": ["Easy", "Attractive"],
                "reason": "User lacks understanding — educate about screening process and value",
            },
            "Opportunity-Physical": {
                "primary": "EAST (Easy)", "secondary": "Environmental Restructuring",
                "east_overlay": ["Easy", "Timely"],
                "reason": "Access/logistics barrier — simplify path to clinic with concrete support",
            },
            "Opportunity-Social": {
                "primary": "Authority Endorsement", "secondary": "Family Duty",
                "east_overlay": ["Social", "Attractive"],
                "reason": "Screening not normalized — leverage trusted authority + family duty",
            },
        }
        base = barrier_map.get(barrier, {
            "primary": "EAST (Easy)", "secondary": "Authority Endorsement",
            "east_overlay": ["Easy", "Social"],
            "reason": "Address access barrier with authority endorsement",
        })

    elif stage == "Preparation":
        base = {
            "primary": "Implementation Intentions",
            "secondary": "EAST (Easy) + Nudge Defaults",
            "east_overlay": ["Easy", "Timely"],
            "reason": "User ready to act — convert intention to plan (+23pp in Sheeran & Orbell 2000)",
        }
        if barrier == "Opportunity-Physical":
            base["secondary"] = "Environmental Restructuring + Nudge Defaults"
        elif barrier == "Motivation-Automatic":
            base["secondary"] = "EAST (Attractive) + Reassurance"
            base["east_overlay"] = ["Easy", "Attractive", "Timely"]
        elif barrier == "Capability":
            base["secondary"] = "Education (COM-B) + EAST (Easy)"
        elif barrier == "Opportunity-Social":
            base["secondary"] = "Authority Endorsement + Nudge Defaults"

    elif stage == "Action":
        base = {
            "primary": "Commitment Device",
            "secondary": "EAST (Timely)",
            "east_overlay": ["Timely", "Social"],
            "reason": "User has acted — reinforce commitment, prevent no-show",
        }
        if barrier in ("Opportunity-Physical", "Opportunity-Social"):
            base["secondary"] = "EAST (Timely) + Practical Support"
        elif barrier == "Motivation-Automatic":
            base["secondary"] = "EAST (Attractive) + Reassurance"
        elif barrier == "Motivation-Reflective":
            base["secondary"] = "Identity Reinforcement"

    elif stage == "Maintenance":
        base = {
            "primary": "Identity Norms",
            "secondary": "Auto-rebook Defaults",
            "east_overlay": ["Easy", "Social", "Timely"],
            "reason": "Sustain annual screening habit through identity-based framing + auto-rebook",
        }
        if barrier in ("Opportunity-Physical", "Opportunity-Social"):
            base["secondary"] = "Auto-rebook Defaults + Practical Support"
        elif barrier == "Motivation-Reflective":
            base["secondary"] = "Authority Endorsement + Auto-rebook Defaults"

    else:
        base = {
            "primary": "Authority Endorsement",
            "secondary": "Family Duty",
            "east_overlay": ["Attractive", "Timely"],
            "reason": "Unknown stage — defaulting to awareness-raising framework",
        }

    return base


def compute_priority(sadrisc_score: int, hes_score: int, propensity: float = 0.5) -> int:
    risk_norm = sadrisc_score / 15
    engagement_inverse = 1 - hes_score / 100
    return round((0.4 * risk_norm + 0.25 * engagement_inverse + 0.35 * propensity) * 100)


def classify_full(profile: dict) -> dict:
    sadrisc = compute_sadrisc(profile)
    hes = compute_hes(profile)
    ttm = classify_ttm(profile)
    comb = diagnose_comb(profile, ttm["stage"])
    framework = select_framework(ttm["stage"], comb["barrier"])
    priority = compute_priority(sadrisc["score"], hes["score"])

    return {
        "sadrisc": sadrisc,
        "hes": hes,
        "ttm": ttm,
        "comb": comb,
        "framework": framework,
        "priority": priority,
    }
