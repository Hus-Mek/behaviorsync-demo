"""
SADRISC, HES, TTM, COM-B, and framework selection — ported from demo/src/lib/scoring.ts.
All weights match PMC7378422 (Al-Rubeaan et al., 2020).
"""
import math
from typing import Literal

TTMStage = Literal[
    "Precontemplation", "Contemplation", "Preparation", "Action", "Maintenance"
]
COMBBarrier = Literal[
    "Capability", "Opportunity-Physical", "Motivation-Reflective", "Motivation-Automatic"
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

    recency_decay = math.exp(-lam * profile.get("last_login_days_ago", 90))
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
        from datetime import datetime
        try:
            days_since = (datetime.now() - datetime.fromisoformat(profile["last_screening_date"])).days
        except (ValueError, TypeError):
            days_since = 999
        if days_since <= 180:
            return {"stage": "Action", "reason": f"Screened {days_since} days ago"}

    if profile.get("booking_attempts", 0) >= 1:
        return {
            "stage": "Preparation",
            "reason": f"Started booking {profile['booking_attempts']}x but didn't complete",
        }

    if profile.get("screening_views", 0) >= 1 or profile.get("articles_read", 0) >= 2:
        return {
            "stage": "Contemplation",
            "reason": f"Viewed screening info {profile.get('screening_views', 0)}x, read {profile.get('articles_read', 0)} articles",
        }

    return {"stage": "Precontemplation", "reason": "No health content views, low engagement"}


def diagnose_comb(profile: dict, ttm_stage: str) -> dict:
    if profile.get("articles_read", 0) == 0 and profile.get("logins_90d", 0) < 3:
        return {
            "barrier": "Capability",
            "reason": "No articles read, < 3 sessions — may not understand screening",
            "intervention": "Education: what screening involves, why it matters",
        }

    if profile.get("booking_attempts", 0) >= 1 and profile.get("screenings_completed", 0) == 0:
        return {
            "barrier": "Motivation-Automatic",
            "reason": "Started booking but abandoned — anxiety/fear signal",
            "intervention": "Reassurance + social norms",
        }

    if profile.get("screening_views", 0) >= 1 and profile.get("booking_attempts", 0) == 0:
        return {
            "barrier": "Motivation-Reflective",
            "reason": "Viewed info but took no action — doesn't see personal relevance",
            "intervention": "Loss framing + personalized risk data",
        }

    return {
        "barrier": "Opportunity-Physical",
        "reason": "Default: may face access/time barriers",
        "intervention": "Nearest clinic + flexible scheduling + transport info",
    }


def select_framework(stage: str, barrier: str) -> dict:
    frameworks = {
        "Precontemplation": {
            "primary": "Authority Endorsement",
            "secondary": "Family Duty",
            "east_overlay": ["Attractive", "Timely"],
            "reason": "Authority endorsement (MOH recommendation) + family duty framing — peer norms less effective in Saudi collectivist culture (Frontiers 2025)",
        },
        "Contemplation": {
            "Motivation-Reflective": {
                "primary": "Loss Aversion",
                "secondary": "Social Norms",
                "east_overlay": ["Attractive", "Social", "Timely"],
                "reason": "User considering but unmotivated — tip decisional balance",
            },
            "Motivation-Automatic": {
                "primary": "EAST (Attractive)",
                "secondary": "Social Norms",
                "east_overlay": ["Easy", "Attractive"],
                "reason": "User anxious — reduce fear, reframe as simple",
            },
            "Capability": {
                "primary": "Education (COM-B)",
                "secondary": "EAST (Easy)",
                "east_overlay": ["Easy", "Attractive"],
                "reason": "User lacks understanding — educate about screening process",
            },
            "_default": {
                "primary": "EAST (Easy)",
                "secondary": "Social Norms",
                "east_overlay": ["Easy", "Social"],
                "reason": "Address opportunity barrier — simplify access",
            },
        },
        "Preparation": {
            "primary": "Implementation Intentions",
            "secondary": "EAST (Easy) + Nudge Defaults",
            "east_overlay": ["Easy", "Timely"],
            "reason": "User ready to act — convert intention to plan (+23pp in Sheeran & Orbell 2000)",
        },
        "Action": {
            "primary": "Commitment Devices",
            "secondary": "EAST (Timely)",
            "east_overlay": ["Timely", "Social"],
            "reason": "User has acted — reinforce, prevent no-show",
        },
        "Maintenance": {
            "primary": "Identity Norms",
            "secondary": "Auto-rebook Defaults",
            "east_overlay": ["Easy", "Social", "Timely"],
            "reason": "Sustain annual screening habit through identity-based framing",
        },
    }

    fw = frameworks.get(stage, frameworks["Precontemplation"])

    if stage == "Contemplation":
        fw = fw.get(barrier, fw.get("_default", fw))

    return fw


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
