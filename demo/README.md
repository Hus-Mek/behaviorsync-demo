# BehaviorSync -- Behavioral Science Messaging Platform

Interactive demo prototype for a behavioral science messaging platform that drives diabetes screening uptake in Saudi Arabia through the Sehhaty national health app (24M users).

Built as a technical assessment submission demonstrating segmentation, behavioral framework selection, AI message generation, campaign orchestration, and adaptive optimization.

## What This Demo Shows

The platform implements a closed-loop system: Diagnose (identify behavioral barriers) -> Intervene (deliver matched messages) -> Learn (optimize through Thompson Sampling).

### Screen 1: Audience Segmentation

- Three pre-built segments with rule-based conditions (JsonLogic)
- SADRISC risk scoring -- Saudi-validated diabetes risk tool (Al-Rubeaan et al., 2020), AUC 0.76, chosen over the European FINDRISC (AUC 0.71 in Saudi populations)
- Health Engagement Score (HES) with exponential time decay (half-life 14 days)
- Transtheoretical Model (TTM) stage classification from behavioral signals
- COM-B barrier diagnosis -- determines WHY a user is not screening (Capability, Opportunity, or Motivation)
- Composite priority scoring: 0.4 x risk + 0.25 x inverse engagement + 0.35 x propensity

### Screen 2: Message Composition

- Framework selection based on TTM stage and COM-B barrier diagnosis
- Evidence-based mapping: Precontemplation -> Authority Endorsement, Preparation -> Implementation Intentions (+23pp in Sheeran and Orbell 2000)
- Message library pattern -- Claude API generates candidates offline, behavioral scientists curate, system selects at send time (not real-time generation)
- Arabic message previews with OSMAN readability validation (Flesch-Kincaid is invalid for Arabic)
- All four channel previews: WhatsApp (83% Saudi daily usage), SMS (70 char Arabic UCS-2), Email (rich HTML with booking link), Push

### Screen 3: Campaign Setup

- 2-step journey builder: Day 0 Awareness -> Day 3 Reminder (if no response)
- Cultural calendar-aware scheduling with CST-compliant send windows (9 AM - 8 PM)
- A/B split configuration with Milkman ownership frame as control arm
- HeartSteps dosage variable (lambda=0.95) for fatigue prevention
- Clinical approval pipeline: Draft -> Review -> Compliance -> Approved -> Live

### Screen 4: Analytics Dashboard

- Animated KPI cards with count-up: Messages Sent, Screening Bookings, NNT, Cost per Booking
- Framework performance bars showing Thompson Sampling arm conversion rates
- Segment conversion rates by TTM stage
- Conversion funnel: Sent -> Delivered -> Read -> Clicked -> Booked

### Screen 5: User Journey

End-to-end walkthrough of one user (Ahmad Al-Qahtani, 45, Riyadh) from first contact to screening booking:

1. SADRISC assessment via simulated WhatsApp Flows conversation (60 seconds, 5 questions)
2. Behavioral classification -- SADRISC 11/15 (High Risk), HES 3/100 (Dormant), TTM Precontemplation, COM-B Capability barrier
3. Framework selection -- Authority Endorsement + Loss Aversion (consciousness-raising for unaware users)
4. Message delivery -- WhatsApp with Arabic RTL text, SMS fallback, Email with embedded booking, Push notification
5. Outcome -- screening booked, bandit posterior updated, NNT tracked

All scores are computed live from the user's actual profile data.

## Technical Approach

### Architecture

Deliberately simple for MVP: FastAPI + PostgreSQL (5 tables) + Redis + Claude API + WhatsApp Cloud API. Docker Compose on Oracle Cloud Jeddah at approximately $2,650/month (infrastructure ~$150 + messaging ~$2,500 via Unifonic). No Kafka, no Kubernetes, no ClickHouse -- complexity is earned, not assumed.

### Key Design Decisions

- SADRISC over FINDRISC -- Saudi-validated with higher AUC and fewer variables, all collectable via WhatsApp Flows
- Message library pattern over real-time generation -- AI generates candidates offline, humans curate, system selects at runtime
- Thompson Sampling with factored action space -- contextual bandit selects complete messages from pre-approved library, optimizing across 5 message design dimensions. HeartSteps dosage control (lambda=0.95) for fatigue prevention.
- Anonymize-before-send -- PHI never leaves Saudi Arabia. Claude receives only anonymized behavioral context.
- COM-B diagnosis via WhatsApp interactive list -- maps user responses to behavioral barriers and selects matched interventions

### Saudi-Specific Considerations

- PDPL compliance -- health data classified as sensitive, explicit consent required, data stays in KSA
- WhatsApp as primary channel (83% daily usage, 98% open rate)
- CST SMS regulations -- mandatory Sender ID, 9 AM-8 PM window
- Oracle Cloud Jeddah for data residency
- Taakkad national screening campaign alignment -- platform complements existing MOH initiative
- Unifonic as Saudi BSP for WhatsApp + SMS delivery

## Tech Stack

### Frontend (Demo)
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Recharts for data visualization
- Lucide React for icons

### Backend (API)
- FastAPI (Python 3.12) with auto-generated OpenAPI docs
- SADRISC scoring, HES computation, TTM classification, COM-B diagnosis -- all ported from TypeScript
- Thompson Sampling with Beta-Bernoulli posteriors (scipy.stats.beta for CI computation)
- WhatsApp message delivery via Twilio sandbox (production: Unifonic as Saudi BSP)
- Personalized booking page served per-user with full classification display
- Webhook endpoint for WhatsApp reply handling (CANCEL/CONFIRM/RESCHEDULE)

## Running Locally

### Frontend
```
cd demo
npm install
npm run dev
```
Open http://localhost:5173

### Backend
```
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add Twilio credentials
uvicorn main:app --reload
```
Open http://localhost:8000/docs for API documentation

### API Endpoints
- POST /api/classify -- Full behavioral classification (SADRISC + HES + TTM + COM-B + framework)
- POST /api/message -- Select message via Thompson Sampling
- GET/POST /api/bandit -- View/update Beta posteriors
- POST /api/send -- End-to-end: classify, select message, generate booking page, send via WhatsApp
- GET /book/{id} -- Personalized booking page with SADRISC classification
- POST /api/webhook/whatsapp -- Receive WhatsApp replies and update bandit

## References

- SADRISC: Al-Rubeaan et al. (2020), PMC7378422
- COM-B: Michie et al. (2011), Implementation Science
- TTM: Prochaska and DiClemente (1983)
- Implementation Intentions: Sheeran and Orbell (2000), +23pp screening attendance
- Thompson Sampling: DIAMANTE trial (JMIR 2024), +19% step count for diabetes patients
- Milkman Megastudy: 47,306-patient RCT (PNAS 2021)
- OSMAN: El-Haj and Rayson (2016), ACL Anthology
