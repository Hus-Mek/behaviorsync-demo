"""
BehaviorSync API — Behavioral Science Messaging Platform.
FastAPI backend proving end-to-end engineering capability:
classify users, select messages, run Thompson Sampling, send via WhatsApp.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from scoring import classify_full, compute_sadrisc
from messages import select_message, render_message, TEMPLATES
from bandit import get_bandit, get_bandit_system
from whatsapp import send_whatsapp, get_sandbox_info
from booking_page import render_booking_page

app = FastAPI(
    title="BehaviorSync API",
    description=(
        "Behavioral science messaging platform for diabetes screening uptake in Saudi Arabia. "
        "PDPL-aware architecture: health data (risk scores, classifications) are excluded from WhatsApp messages. "
        "All PHI stays on the booking page; WhatsApp receives only appointment details and links. "
        "Full PDPL compliance (consent, data residency, encryption) requires production implementation."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserProfile(BaseModel):
    name: str = "أحمد القحطاني"
    name_en: str = "Ahmad Al-Qahtani"
    age: int = 45
    gender: str = "male"
    waist_cm: int = 105
    family_diabetes: bool = True
    hyperglycemia_history: bool = False
    logins_90d: int = 2
    articles_read: int = 0
    screening_views: int = 0
    booking_attempts: int = 0
    screenings_completed: int = 0
    last_screening_date: Optional[str] = None
    last_login_days_ago: int = 45
    clinic_name: str = "Al-Suwaidi PHC"
    clinic_name_ar: str = "مركز السويدي الصحي"
    region: str = "Riyadh"


class BanditUpdate(BaseModel):
    arm_name: str = Field(..., description="Name of the bandit arm (framework name)")
    reward: float = Field(..., ge=0, le=1, description="0 = no conversion, 1 = booked screening")


class SendRequest(BaseModel):
    phone: str = Field(..., description="Phone number with country code, e.g. 966501234567")
    recipient_name: Optional[str] = Field(None, description="Recipient's actual name — overrides profile name in the message")
    profile: UserProfile = Field(default_factory=UserProfile)
    lang: str = "ar"


class QuickSADRISC(BaseModel):
    age: int = Field(..., ge=18, le=100)
    gender: str = Field(..., pattern="^(male|female)$")
    waist_cm: int = Field(..., ge=50, le=200)
    family_diabetes: bool = False
    hyperglycemia_history: bool = False


# --- Endpoints ---

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "behaviorsync-api",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "whatsapp": get_sandbox_info(),
    }


@app.post("/api/classify")
def classify(profile: UserProfile):
    """
    Takes a user profile, returns full behavioral classification:
    SADRISC risk score, Health Engagement Score, TTM stage,
    COM-B barrier diagnosis, recommended framework, and priority score.
    """
    result = classify_full(profile.model_dump())
    return {
        "user": profile.name_en,
        "classification": result,
    }


@app.post("/api/sadrisc")
def quick_sadrisc(data: QuickSADRISC):
    """
    Quick SADRISC assessment — the 5 variables collectable via WhatsApp Flows.
    Returns risk score (0-15) and classification.
    """
    return compute_sadrisc(data.model_dump())


@app.post("/api/message")
def get_message(profile: UserProfile, channel: str = "whatsapp", lang: str = "ar"):
    """
    Classifies user and selects the best message from the library
    based on their TTM stage, COM-B barrier, and framework match.
    """
    classification = classify_full(profile.model_dump())
    framework = classification["framework"]["primary"]
    ttm_stage = classification["ttm"]["stage"]

    bandit = get_bandit()
    selected_arm = bandit.select()

    template = select_message(selected_arm, ttm_stage, channel)
    if not template:
        template = select_message(framework, ttm_stage, channel)

    rendered = render_message(
        template,
        name=profile.name if lang == "ar" else profile.name_en,
        clinic=profile.clinic_name_ar if lang == "ar" else profile.clinic_name,
        lang=lang,
    )

    return {
        "classification": {
            "sadrisc": classification["sadrisc"],
            "ttm_stage": ttm_stage,
            "comb_barrier": classification["comb"]["barrier"],
            "framework": framework,
        },
        "bandit_selected": selected_arm,
        "template": template,
        "rendered_message": rendered,
        "language": lang,
    }


@app.get("/api/bandit")
def bandit_state():
    """Returns current Thompson Sampling arm posteriors."""
    bandit = get_bandit()
    return {
        "arms": bandit.get_state(),
        "dosage_lambda": bandit.dosage_lambda,
        "total_pulls": sum(a.pulls for a in bandit.arms.values()),
    }


@app.post("/api/bandit")
def bandit_update(update: BanditUpdate):
    """
    Updates a bandit arm with a reward signal.
    reward=1 means the user booked a screening, reward=0 means no conversion.
    """
    bandit = get_bandit()
    result = bandit.update(update.arm_name, update.reward)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Arm '{update.arm_name}' not found")
    return {"updated_arm": result, "all_arms": bandit.get_state()}


@app.get("/api/demo")
def demo_journey():
    """
    Zero-config demo: runs Ahmad Al-Qahtani's complete journey in one call.
    No Twilio credentials needed — returns the full pipeline result as JSON.
    """
    ahmad = {
        "name": "أحمد القحطاني", "name_en": "Ahmad Al-Qahtani",
        "age": 45, "gender": "male", "waist_cm": 105,
        "family_diabetes": True, "hyperglycemia_history": False,
        "logins_90d": 2, "articles_read": 0, "screening_views": 0,
        "booking_attempts": 0, "screenings_completed": 0,
        "last_login_days_ago": 45,
        "clinic_name": "Al-Suwaidi PHC", "clinic_name_ar": "مركز السويدي الصحي",
    }
    classification = classify_full(ahmad)
    from messages import select_message, render_message
    template = select_message(classification["framework"]["primary"], classification["ttm"]["stage"])
    rendered = render_message(template, name=ahmad["name"], clinic=ahmad["clinic_name_ar"])
    bandit = get_bandit()
    selected_arm = bandit.select()
    return {
        "user": "Ahmad Al-Qahtani (أحمد القحطاني)",
        "classification": classification,
        "selected_message": {"template_id": template["id"], "framework": template["framework"], "rendered": rendered},
        "bandit": {"selected_arm": selected_arm, "all_arms": bandit.get_state()},
    }


@app.get("/api/messages")
def list_messages():
    """Returns the full message template library."""
    return {"templates": TEMPLATES, "count": len(TEMPLATES)}


import secrets

AST = timezone(timedelta(hours=3))
BOOKING_EXPIRY_HOURS = 48

_booking_store: dict[str, dict] = {}
_delivery_log: dict[str, str] = {}
_rewarded_phones: set[str] = set()


def is_within_send_window(now: datetime | None = None) -> tuple[bool, str]:
    if now is None:
        now = datetime.now(AST)
    else:
        now = now.astimezone(AST)
    hour = now.hour
    if 9 <= hour < 20:
        return True, f"Within send window (AST {now.strftime('%H:%M')})"
    return False, f"Outside 09:00-20:00 AST (current: {now.strftime('%H:%M')} AST)"


@app.post("/api/send")
def send_message_updated(req: SendRequest, request: Request):
    """
    End-to-end: classify → bandit selects arm → template library renders → send via WhatsApp.
    Enforces 9 AM-8 PM AST send window (CST regulation).
    """
    allowed, reason = is_within_send_window()
    if not allowed:
        raise HTTPException(status_code=422, detail=f"Messages restricted to 09:00-20:00 AST. {reason}")

    classification = classify_full(req.profile.model_dump())
    framework = classification["framework"]["primary"]
    ttm_stage = classification["ttm"]["stage"]

    name = req.recipient_name or (req.profile.name if req.lang == "ar" else req.profile.name_en)
    clinic = req.profile.clinic_name_ar if req.lang == "ar" else req.profile.clinic_name

    bandit = get_bandit()
    selected_arm = bandit.select()

    template = select_message(selected_arm, ttm_stage, "whatsapp", gender=req.profile.gender)
    if not template:
        template = select_message(framework, ttm_stage, "whatsapp", gender=req.profile.gender)

    booking_id = secrets.token_urlsafe(16)
    _booking_store[booking_id] = {
        "name": name,
        "classification": classification,
        "clinic": clinic,
        "profile": req.profile.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    base_url = str(request.base_url).rstrip("/")
    booking_url = f"{base_url}/book/{booking_id}"

    message = render_message(template, name=name, clinic=clinic, link=booking_url, lang=req.lang)

    buttons = [
        {"id": "cancel", "title": "إلغاء" if req.lang == "ar" else "Cancel"},
        {"id": "reschedule", "title": "تغيير الموعد" if req.lang == "ar" else "Reschedule"},
    ]

    result = send_whatsapp(req.phone, message, buttons=buttons)

    phone_clean = req.phone.lstrip("+")
    _delivery_log[phone_clean] = selected_arm

    return {
        "classification": {
            "sadrisc": classification["sadrisc"],
            "ttm_stage": ttm_stage,
            "comb_barrier": classification["comb"]["barrier"],
            "framework": framework,
            "priority": classification["priority"],
        },
        "message": {
            "template_id": template["id"],
            "bandit_arm": selected_arm,
            "rendered": message,
            "language": req.lang,
            "booking_url": booking_url,
        },
        "delivery": result,
    }


@app.get("/book/{booking_id}", response_class=HTMLResponse)
def booking_page(booking_id: str):
    """Serves the personalized booking page when user taps the WhatsApp link."""
    booking = _booking_store.get(booking_id)
    if not booking:
        return HTMLResponse("<h1>Booking not found</h1>", status_code=404)

    created_at = booking.get("created_at")
    if created_at:
        created = datetime.fromisoformat(created_at)
        if datetime.now(timezone.utc) - created > timedelta(hours=BOOKING_EXPIRY_HOURS):
            del _booking_store[booking_id]
            return HTMLResponse(
                "<h1>انتهت صلاحية هذا الرابط</h1>"
                "<p>This booking link has expired (48-hour limit). "
                "Please request a new appointment via WhatsApp.</p>",
                status_code=410,
            )

    return render_booking_page(
        name=booking["name"],
        classification=booking["classification"],
        clinic=booking["clinic"],
    )


@app.post("/api/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Receives incoming WhatsApp messages and button taps.
    Twilio sends form-encoded POST with Body (text) or ButtonPayload (button tap).
    """
    form = await request.form()
    from_number = form.get("From", "")
    body = form.get("Body", "").strip().lower()
    button_payload = form.get("ButtonPayload", "").strip().lower()

    action = button_payload or body
    system = get_bandit_system()

    phone_clean = from_number.replace("whatsapp:", "").lstrip("+")
    sent_arm = _delivery_log.get(phone_clean, "Authority Endorsement")

    cancel_words = {"cancel", "إلغاء", "stop", "إيقاف"}
    keep_words = {"keep", "confirm", "تأكيد", "نعم"}

    def twiml(msg: str) -> Response:
        xml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{msg}</Message></Response>'
        return Response(content=xml, media_type="application/xml")

    if action in cancel_words:
        system.reward(phone_clean, sent_arm, 0.0, source="webhook")
        return twiml("تم إلغاء موعدك. يمكنك إعادة الحجز في أي وقت.")

    if action in keep_words:
        system.reward(phone_clean, sent_arm, 1.0, source="webhook")
        return twiml("تم تأكيد موعدك. نراك هناك!")

    if action == "reschedule":
        return twiml("سنتواصل معك لإعادة جدولة موعدك.")

    return twiml("شكراً لتواصلك. للحجز أرسل: حجز")


class OutcomeVerification(BaseModel):
    phone: str = Field(..., description="Phone number of screened user")
    screening_date: str = Field(..., description="Date screening was completed")
    result: str = Field("completed", description="completed | no_show | cancelled")
    verified_by: str = Field("clinical_staff", description="Source: clinical_staff | sehhaty_confirmation | self_report")


@app.post("/api/outcome")
def verify_outcome(outcome: OutcomeVerification):
    """
    Records verified screening outcomes for trial measurement.
    Three verification tiers:
    1. Clinical staff confirmation (gold standard)
    2. Sehhaty booking confirmation code forwarded by user
    3. Self-report via WhatsApp reply (lowest confidence)
    Without NPHIES API access, clinical staff verification is the primary pathway.
    """
    phone_clean = outcome.phone.lstrip("+")
    sent_arm = _delivery_log.get(phone_clean, "Unknown")
    bandit = get_bandit()

    reward = 1.0 if outcome.result == "completed" else 0.0
    if sent_arm in bandit.arms:
        bandit.update(sent_arm, reward)

    return {
        "status": "recorded",
        "phone": outcome.phone,
        "result": outcome.result,
        "verified_by": outcome.verified_by,
        "arm": sent_arm,
        "bandit_updated": sent_arm in bandit.arms,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
