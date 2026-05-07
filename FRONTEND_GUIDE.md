# BehaviorSync Demo — What You're Looking At

This interactive demo shows how the behavioral messaging platform works. Here's what each screen does.

---

## Screen 1: Audience Segmentation

**What it shows:** Three real Saudi user profiles with their computed behavioral scores.

For each user, the system calculates:
- **SADRISC score** (0-15) — diabetes risk level based on 5 variables
- **Health Engagement Score** (0-100) — how active they are in the health app
- **TTM Stage** — where they are in the behavior change journey (from "not thinking about it" to "regularly screening")
- **COM-B Barrier** — the specific reason they're not screening (lack of knowledge, anxiety, access issues, etc.)
- **Priority Score** — who to message first (high risk + low engagement = highest priority)

**Key insight:** Not all users get the same message. Ahmad (high risk, never screened) gets a different intervention than Fatimah (moderate risk, already considering screening).

---

## Screen 2: Message Composer

**What it shows:** How the system selects and generates a message for a specific user.

The left panel shows:
- Which **behavioral framework** was selected (e.g., Authority Endorsement — "MOH recommends...")
- A **WhatsApp preview** with the actual Arabic message (right-to-left text)
- **Quick-reply buttons** (Confirm / Cancel) that the user taps

The right panel shows the guardrails:
- **EAST Checklist** — is the message Easy, Attractive, Social, and Timely?
- **OSMAN Score** — Arabic readability score (is the language simple enough?)
- **COM-B Diagnosis** — what barrier this message addresses and how confident we are
- **Evidence Citation** — which research paper supports this approach

**Key insight:** Every message is backed by evidence and validated before sending.

---

## Screen 3: Campaign Setup

**What it shows:** How a campaign manager would configure a message sequence.

- **Day 0:** Initial screening invitation via WhatsApp (opt-out default — appointment is pre-reserved)
- **Day 3:** Follow-up reminder via SMS (only if no response)
- **Safety controls:** Maximum 2 messages per 3 days, 9 AM-8 PM Saudi time only
- **Approval pipeline:** Draft → Review → Compliance → Live

**Key insight:** The system prevents message fatigue and respects Saudi communication regulations.

---

## Screen 4: Analytics Dashboard

**What it shows:** How the platform measures and optimizes performance.

- **KPI cards:** Total messages sent, bookings generated, NNT (how many messages to produce one screening), cost per booking
- **Framework Performance:** Which behavioral approach converts best (Opt-Out Pre-Booking leads at 26.8%)
- **Conversion Funnel:** From sent → delivered → read → clicked → booked

**Key insight:** The Thompson Sampling algorithm automatically shifts more traffic to the best-performing message framework over time.

---

## Screen 5: User Journey

**What it shows:** Ahmad's complete journey from unaware to screened, step by step.

1. Completes a 60-second risk assessment via WhatsApp
2. System classifies him: high risk, never considered screening, doesn't understand the process
3. System selects Authority Endorsement framework (MOH recommendation)
4. Arabic WhatsApp message sent with pre-reserved appointment
5. Ahmad confirms → screening completed on Day 3

**Key insight:** The entire journey — from risk assessment to booking confirmation — happens inside WhatsApp. No app download needed.

---

## Technical Notes

- All scoring algorithms run in the browser (TypeScript) — no backend needed for the demo
- Arabic text renders right-to-left with Noto Sans Arabic font
- The demo uses 3 sample Saudi user profiles with realistic demographics
- Framework selection logic mirrors the production Python backend exactly
