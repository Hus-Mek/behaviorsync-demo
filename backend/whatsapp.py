"""
WhatsApp message delivery via Twilio sandbox (free) or WhatsApp Cloud API.
Supports plain text and interactive quick reply buttons.
Falls back to returning message JSON if no credentials configured.
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

_content_sid_cache: dict[str, str] = {}


def _get_client():
    from twilio.rest import Client
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def _ensure_content_template(client, body: str, buttons: list[dict]) -> str:
    cache_key = body[:50]
    if cache_key in _content_sid_cache:
        return _content_sid_cache[cache_key]

    try:
        content = client.content.v1.contents.create(
            friendly_name="behaviorsync_booking",
            language="en",
            types={
                "twilio/quick-reply": {
                    "body": body,
                    "actions": [
                        {"id": btn["id"], "title": btn["title"]}
                        for btn in buttons[:3]
                    ],
                }
            },
        )
        _content_sid_cache[cache_key] = content.sid
        return content.sid
    except Exception as e:
        logger.warning(f"Content template creation failed: {e}")
        return ""


def send_whatsapp(to: str, body: str, buttons: Optional[list[dict]] = None) -> dict:
    if not to.startswith("whatsapp:"):
        to = f"whatsapp:+{to.lstrip('+')}"

    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        return _send_twilio(to, body, buttons)

    logger.info("No Twilio credentials — returning message without sending")
    return {
        "status": "not_sent",
        "reason": "no_credentials",
        "to": to,
        "body": body,
        "buttons": buttons,
        "note": "Configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to send real messages",
    }


def _send_twilio(to: str, body: str, buttons: Optional[list[dict]] = None) -> dict:
    try:
        client = _get_client()

        if buttons:
            content_sid = _ensure_content_template(client, body, buttons)
            if content_sid:
                message = client.messages.create(
                    from_=TWILIO_WHATSAPP_FROM,
                    content_sid=content_sid,
                    to=to,
                )
                return {
                    "status": "sent",
                    "type": "interactive",
                    "sid": message.sid,
                    "to": to,
                    "body": body,
                    "buttons": [b["title"] for b in buttons],
                }

        message = client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            body=body,
            to=to,
        )
        return {
            "status": "sent",
            "type": "text",
            "sid": message.sid,
            "to": to,
            "body": body,
        }
    except Exception as e:
        logger.error(f"Twilio send failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "to": to,
            "body": body,
        }


def get_sandbox_info() -> dict:
    return {
        "provider": "Twilio WhatsApp Sandbox",
        "sandbox_number": TWILIO_WHATSAPP_FROM,
        "join_instructions": "Text 'join <your-sandbox-word>' to the sandbox number to opt in",
        "credentials_configured": bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN),
    }
