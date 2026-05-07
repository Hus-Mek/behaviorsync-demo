"""Tests for SADRISC, HES, TTM, COM-B scoring — validates against published weights."""
from scoring import compute_sadrisc, compute_hes, classify_ttm, diagnose_comb, select_framework, classify_full


AHMAD = {
    "name": "Ahmad",
    "age": 45,
    "gender": "male",
    "waist_cm": 105,
    "family_diabetes": True,
    "hyperglycemia_history": False,
    "logins_90d": 2,
    "articles_read": 0,
    "screening_views": 0,
    "booking_attempts": 0,
    "screenings_completed": 0,
    "last_login_days_ago": 45,
}

KHALID = {
    "name": "Khalid",
    "age": 38,
    "gender": "male",
    "waist_cm": 100,
    "family_diabetes": True,
    "hyperglycemia_history": True,
    "logins_90d": 8,
    "articles_read": 2,
    "screening_views": 4,
    "booking_attempts": 2,
    "screenings_completed": 0,
    "last_login_days_ago": 3,
}

NOURA = {
    "name": "Noura",
    "age": 41,
    "gender": "female",
    "waist_cm": 78,
    "family_diabetes": False,
    "hyperglycemia_history": True,
    "logins_90d": 18,
    "articles_read": 8,
    "screening_views": 6,
    "booking_attempts": 1,
    "screenings_completed": 1,
    "last_screening_date": "2026-02-15",
    "last_login_days_ago": 1,
}


def test_sadrisc_ahmad():
    result = compute_sadrisc(AHMAD)
    assert result["score"] == 11
    assert result["risk"] == "High"
    assert result["breakdown"]["sex"] == 2
    assert result["breakdown"]["age"] == 4
    assert result["breakdown"]["waist"] == 3
    assert result["breakdown"]["family"] == 2


def test_sadrisc_female_waist():
    result = compute_sadrisc({"age": 50, "gender": "female", "waist_cm": 78, "family_diabetes": False, "hyperglycemia_history": False})
    assert result["breakdown"]["waist"] == 0
    assert result["breakdown"]["sex"] == 0

    result2 = compute_sadrisc({"age": 50, "gender": "female", "waist_cm": 85, "family_diabetes": False, "hyperglycemia_history": False})
    assert result2["breakdown"]["waist"] == 3


def test_sadrisc_risk_thresholds():
    low = compute_sadrisc({"age": 30, "gender": "female", "waist_cm": 70, "family_diabetes": False, "hyperglycemia_history": False})
    assert low["risk"] == "Low"
    assert low["score"] == 0

    elevated = compute_sadrisc({"age": 44, "gender": "male", "waist_cm": 90, "family_diabetes": False, "hyperglycemia_history": False})
    assert elevated["risk"] == "Elevated"


def test_hes_dormant():
    result = compute_hes(AHMAD)
    assert result["level"] == "Dormant"
    assert result["score"] < 15


def test_hes_active_user():
    result = compute_hes(NOURA)
    assert result["score"] > 30
    assert result["level"] in ("Moderate", "Active", "Champion")


def test_ttm_precontemplation():
    result = classify_ttm(AHMAD)
    assert result["stage"] == "Precontemplation"


def test_ttm_preparation():
    result = classify_ttm(KHALID)
    assert result["stage"] == "Preparation"


def test_ttm_action():
    result = classify_ttm(NOURA)
    assert result["stage"] == "Action"


def test_comb_capability_barrier():
    result = diagnose_comb(AHMAD, "Precontemplation")
    assert result["barrier"] == "Capability"


def test_comb_motivation_automatic():
    result = diagnose_comb(KHALID, "Preparation")
    assert result["barrier"] == "Motivation-Automatic"


def test_framework_precontemplation():
    fw = select_framework("Precontemplation", "Capability")
    assert fw["primary"] == "Authority Endorsement"
    assert fw["secondary"] == "Family Duty"


def test_framework_preparation():
    fw = select_framework("Preparation", "Motivation-Reflective")
    assert fw["primary"] == "Implementation Intentions"


def test_classify_full_ahmad():
    result = classify_full(AHMAD)
    assert result["sadrisc"]["score"] == 11
    assert result["ttm"]["stage"] == "Precontemplation"
    assert result["comb"]["barrier"] == "Capability"
    assert result["framework"]["primary"] == "Authority Endorsement"
    assert 0 <= result["priority"] <= 100


def test_classify_full_khalid():
    result = classify_full(KHALID)
    assert result["sadrisc"]["risk"] == "High"
    assert result["ttm"]["stage"] == "Preparation"
    assert result["framework"]["primary"] == "Implementation Intentions"
