"""
Message library — templates tagged by framework, TTM stage, COM-B barrier, and channel.
Arabic messages validated for OSMAN readability (El-Haj & Rayson 2016).
"""
from typing import Optional

TEMPLATES = [
    {
        "id": "m1",
        "framework": "Authority Endorsement",
        "technique": "MOH recommendation + family duty",
        "ttm_stage": "Precontemplation",
        "comb_target": "Motivation-Reflective",
        "content_ar": "السلام عليكم {{name}}، تم حجز موعد فحص السكري لك.\n\n📍 {{clinic}}\n📅 الأحد — 10:00 صباحاً\n⏱️ 15 دقيقة — مجاناً\n\nتوصي وزارة الصحة بالفحص لجميع البالغين فوق 35. صحتك مسؤولية عائلتك.\n\nللإلغاء أرسل: إلغاء",
        "content_en": "{{name}}, your diabetes screening has been reserved.\n\n📍 {{clinic}}\n📅 Sunday — 10:00 AM\n⏱️ 15 minutes — Free\n\nMOH recommends screening for all adults 35+. Your health is your family's responsibility.\n\nReply CANCEL to opt out.",
        "channel": "whatsapp",
        "osman_score": 72,
    },
    {
        "id": "m2",
        "framework": "Loss Aversion",
        "technique": "Loss frame + detection urgency",
        "ttm_stage": "Precontemplation",
        "comb_target": "Motivation-Reflective",
        "content_ar": "السلام عليكم {{name}}، السكري غير المكتشف يضر بالكلى والعينين والقلب بصمت. الكشف المبكر يحمي صحتك وصحة عائلتك. افحص مجاناً: {{link}}",
        "content_en": "{{name}}, undetected diabetes silently damages kidneys, eyes, and heart. Early detection protects you and your family. Screen free: {{link}}",
        "channel": "whatsapp",
        "osman_score": 65,
    },
    {
        "id": "m3",
        "framework": "Education (COM-B)",
        "technique": "Knowledge building + fear reduction",
        "ttm_stage": "Contemplation",
        "comb_target": "Capability",
        "content_ar": "{{name}}، فحص السكري عبارة عن تحليل دم بسيط يستغرق 15 دقيقة. لا يوجد ألم. النتائج تظهر خلال يومين. المركز الأقرب لك: {{clinic}}.",
        "content_en": "{{name}}, a diabetes screening is a simple blood test — 15 minutes, no pain. Results in 2 days. Your nearest center: {{clinic}}.",
        "channel": "whatsapp",
        "osman_score": 74,
    },
    {
        "id": "m4",
        "framework": "Implementation Intentions",
        "technique": "If-then plan + specific slot",
        "ttm_stage": "Preparation",
        "comb_target": "Motivation-Reflective",
        "content_ar": "{{name}}، بدأت حجز فحصك في {{clinic}}. موعدك يوم {{date}} الساعة {{time}} لا يزال متاحاً. اضغط لتأكيد حجزك.",
        "content_en": "{{name}}, you started booking at {{clinic}}. Your slot on {{date}} at {{time}} is still available. Tap to confirm.",
        "channel": "whatsapp",
        "osman_score": 78,
    },
    {
        "id": "m5",
        "framework": "Commitment Device",
        "technique": "Confirmation + social commitment",
        "ttm_stage": "Action",
        "comb_target": "Motivation-Automatic",
        "content_ar": "{{name}}، موعد فحصك غداً في {{clinic}} الساعة {{time}}. تذكر: أنت تستثمر في صحتك وصحة عائلتك. نراك هناك!",
        "content_en": "{{name}}, your screening is tomorrow at {{clinic}} at {{time}}. Remember: you're investing in your health and your family's. See you there!",
        "channel": "whatsapp",
        "osman_score": 76,
    },
    {
        "id": "m6",
        "framework": "Identity Norms",
        "technique": "Identity reinforcement + auto-rebook",
        "ttm_stage": "Maintenance",
        "comb_target": "Motivation-Reflective",
        "content_ar": "{{name}}، مضى عام على فحصك الأخير. كشخص يهتم بصحته، حان وقت الفحص السنوي. احجز في {{clinic}}: {{link}}",
        "content_en": "{{name}}, it's been a year since your last screening. As someone who takes health seriously, it's time for your annual check. Book at {{clinic}}: {{link}}",
        "channel": "whatsapp",
        "osman_score": 70,
    },
    {
        "id": "m7",
        "framework": "Authority Endorsement",
        "technique": "Authority endorsement (SMS)",
        "ttm_stage": "Precontemplation",
        "comb_target": "Motivation-Reflective",
        "content_ar": "{{name}}، فحص السكري المجاني في {{clinic}}. احمِ عائلتك — احجز: {{link}}",
        "content_en": "{{name}}, free diabetes screening at {{clinic}}. Protect your family — book: {{link}}",
        "channel": "sms",
        "osman_score": 68,
    },
    {
        "id": "m8",
        "framework": "EAST (Timely)",
        "technique": "Timely nudge (Push)",
        "ttm_stage": "Preparation",
        "comb_target": "Opportunity-Physical",
        "content_ar": "فحص السكري المجاني متاح — 15 دقيقة في {{clinic}}",
        "content_en": "Free diabetes screening available — 15 min at {{clinic}}",
        "channel": "push",
        "osman_score": 80,
    },
    {
        "id": "m9_optout",
        "framework": "Opt-Out Pre-Booking",
        "technique": "Default appointment + cancellation prevention",
        "ttm_stage": "Precontemplation",
        "comb_target": "Motivation-Reflective",
        "content_ar": "{{name}}، تم حجز موعد فحص السكري لك في {{clinic}} يوم {{date}} الساعة {{time}}. الفحص مجاني ويستغرق 15 دقيقة.\n\n📍 {{clinic}}\n📅 {{date}} — {{time}}\n\nللإلغاء أرسل: إلغاء",
        "content_en": "{{name}}, your diabetes screening at {{clinic}} is reserved for {{date}} at {{time}}. Free, 15 minutes.\n\n📍 {{clinic}}\n📅 {{date}} — {{time}}\n\nReply CANCEL to change.",
        "channel": "whatsapp",
        "osman_score": 71,
    },
    {
        "id": "m10_email",
        "framework": "Authority Endorsement",
        "technique": "MOH authority + detailed screening info + booking link",
        "ttm_stage": "Precontemplation",
        "comb_target": "Capability",
        "content_ar": "{{name}}، تم حجز موعد فحص السكري لك في {{clinic}}. وزارة الصحة توصي بالفحص لجميع البالغين فوق 35. الفحص مجاني — 15 دقيقة فقط. النتائج خلال يومين. للإلغاء أو تغيير الموعد: {{link}}",
        "content_en": "{{name}}, your diabetes screening at {{clinic}} has been reserved. MOH recommends screening for all adults 35+. Free, 15 minutes, results in 2 days. To cancel or reschedule: {{link}}",
        "channel": "email",
        "osman_score": 68,
    },
    {
        "id": "m11_easy",
        "framework": "EAST (Easy)",
        "technique": "Friction reduction + simplicity",
        "ttm_stage": "Contemplation",
        "comb_target": "Opportunity-Physical",
        "content_ar": "السلام عليكم {{name}}، فحص السكري أسهل مما تتخيل — 15 دقيقة في {{clinic}} بدون موعد مسبق. مجاناً بالكامل.",
        "content_en": "{{name}}, diabetes screening is easier than you think — 15 minutes at {{clinic}}, no appointment needed. Completely free.",
        "channel": "whatsapp",
        "osman_score": 76,
    },
    {
        "id": "m12_attractive",
        "framework": "EAST (Attractive)",
        "technique": "Positive framing + social reward",
        "ttm_stage": "Contemplation",
        "comb_target": "Motivation-Automatic",
        "content_ar": "السلام عليكم {{name}}، كثير من الناس يقولون إن فحص السكري أعطاهم راحة بال. 15 دقيقة فقط في {{clinic}} — وتطمئن على صحتك.",
        "content_en": "{{name}}, many people say their diabetes screening gave them peace of mind. Just 15 minutes at {{clinic}} — and you'll know where you stand.",
        "channel": "whatsapp",
        "osman_score": 73,
    },
    {
        "id": "m13_reminder",
        "framework": "Simple Reminder",
        "technique": "Plain reminder + CTA",
        "ttm_stage": "Precontemplation",
        "comb_target": "Motivation-Reflective",
        "content_ar": "السلام عليكم {{name}}، تذكير: فحص السكري المجاني متاح لك في {{clinic}}. احجز الآن: {{link}}",
        "content_en": "{{name}}, reminder: your free diabetes screening is available at {{clinic}}. Book now: {{link}}",
        "channel": "whatsapp",
        "osman_score": 79,
    },
    {
        "id": "m14_female",
        "framework": "Authority Endorsement",
        "technique": "Female-specific: privacy + female staff assurance",
        "ttm_stage": "Precontemplation",
        "comb_target": "Motivation-Reflective",
        "content_ar": "السلام عليكم {{name}}، فحص السكري المجاني متاح في قسم السيدات في {{clinic}}. طاقم نسائي — خصوصية تامة. 15 دقيقة فقط. صحتك أمانة.\n\nللإلغاء أرسل: إلغاء",
        "content_en": "{{name}}, free diabetes screening is available at the women's section at {{clinic}}. Female staff — complete privacy. Just 15 minutes. Your health is a trust.\n\nReply CANCEL to opt out.",
        "channel": "whatsapp",
        "osman_score": 71,
        "gender": "female",
    },
]


def select_message(
    framework: str,
    ttm_stage: str,
    channel: str = "whatsapp",
    gender: str | None = None,
) -> Optional[dict]:
    def _gender_ok(t: dict) -> bool:
        tpl_gender = t.get("gender")
        if tpl_gender is None:
            return True
        return tpl_gender == gender

    def _prefer_specific(candidates: list[dict]) -> list[dict]:
        if gender is None:
            return [t for t in candidates if "gender" not in t]
        specific = [t for t in candidates if t.get("gender") == gender]
        return specific if specific else [t for t in candidates if "gender" not in t]

    exact = [t for t in TEMPLATES if t["framework"] == framework and t["ttm_stage"] == ttm_stage and t["channel"] == channel and _gender_ok(t)]
    preferred = _prefer_specific(exact)
    if preferred:
        return preferred[0]

    by_framework = [t for t in TEMPLATES if t["framework"] == framework and t["channel"] == channel and _gender_ok(t)]
    preferred = _prefer_specific(by_framework)
    if preferred:
        return preferred[0]

    by_stage = [t for t in TEMPLATES if t["ttm_stage"] == ttm_stage and t["channel"] == channel and _gender_ok(t)]
    preferred = _prefer_specific(by_stage)
    if preferred:
        return preferred[0]

    fallback = [t for t in TEMPLATES if t["channel"] == channel and _gender_ok(t)]
    if fallback:
        return fallback[0]

    universal = [t for t in TEMPLATES if "gender" not in t]
    return universal[0] if universal else TEMPLATES[0]


def render_message(
    template: dict,
    name: str,
    clinic: str = "مركز السويدي الصحي",
    date: str = "الأحد",
    time: str = "10:00 صباحاً",
    link: str = "https://sehhaty.sa/book/taakkad",
    lang: str = "ar",
) -> str:
    content = template["content_ar"] if lang == "ar" else template["content_en"]
    replacements = {
        "{{name}}": name,
        "{{clinic}}": clinic,
        "{{date}}": date,
        "{{time}}": time,
        "{{link}}": link,
    }
    for placeholder, value in replacements.items():
        content = content.replace(placeholder, value)
    return content
