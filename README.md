# BehaviorSync — Behavioral Science Messaging Platform

A platform that uses behavioral science to increase diabetes screening uptake in Saudi Arabia.  
Built for a national public health authority context, integrated with the Sehhaty national health app ecosystem.

---

## What This Project Does

This platform identifies at-risk users, diagnoses **why** they're not screening (using the COM-B behavioral model), selects an evidence-based messaging framework, and delivers personalized messages via WhatsApp. It learns from every interaction using Thompson Sampling to continuously improve.

**Target behavior:** Get the user to book a free diabetes screening through the Sehhaty app.

---

## Quick Start (No Installation Required)

### View the Interactive Demo

The frontend demo is hosted at:  
**[https://behaviorsync-demo.vercel.app](https://behaviorsync-demo.vercel.app)**

No installation needed — just open the link in your browser.

### View the Presentation

Open `BehaviorSync_Case_Study.pdf` in this repository — a 16-slide presentation covering the full technical approach.

---

## Running Locally

### Prerequisites

- **Node.js** 18+ (for the frontend demo)
- **Python** 3.12+ (for the backend API)

### Frontend Demo

```bash
cd demo
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

The demo has 5 pages:
1. **Audience Segmentation** — View 3 sample Saudi users with computed risk scores
2. **Message Composer** — See how frameworks are selected and messages generated
3. **Campaign Setup** — Configure behavioral message sequences
4. **Analytics Dashboard** — View framework performance and conversion funnels
5. **User Journey** — Walk through Ahmad's complete screening journey

### Backend API

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Open **http://localhost:8000/docs** for interactive API documentation.

Key endpoints:
- `POST /api/classify` — Classify a user (SADRISC + HES + TTM + COM-B + framework)
- `POST /api/send` — Full pipeline: classify → bandit selects arm → send WhatsApp message
- `GET /api/bandit` — View Thompson Sampling state (message × time × day bandits)
- `GET /api/demo` — Zero-config demo of Ahmad's complete journey

---

## Project Structure

```
case2/
├── demo/                          # React 18 + TypeScript frontend
│   ├── src/
│   │   ├── pages/                 # 5 interactive screens
│   │   ├── lib/scoring.ts         # SADRISC, HES, TTM, COM-B (TypeScript)
│   │   └── data/                  # Sample users + message templates
│   └── dist/                      # Built output (ready to deploy)
│
├── backend/                       # FastAPI Python backend
│   ├── main.py                    # API endpoints + send pipeline
│   ├── scoring.py                 # SADRISC, HES, TTM, COM-B scoring
│   ├── bandit.py                  # Thompson Sampling (community of bandits)
│   ├── messages.py                # 14 message templates (bilingual)
│   ├── whatsapp.py                # WhatsApp delivery via Twilio
│   └── booking_page.py            # Personalized booking page
│
├── presentation.html              # 16-slide interactive deck
├── BehaviorSync_Case_Study.pdf    # PDF export of the presentation
├── RESEARCH.md                    # Comprehensive research reference
└── COUNCIL_OF_10_AUDIT.md         # Multi-perspective audit report
```

---

## How It Works

### 1. Risk Scoring (SADRISC)
A Saudi-validated diabetes risk score (AUC 0.76) using 5 self-reportable variables:
sex, age, waist circumference, hyperglycemia history, family history.
Collectable via WhatsApp Flows in 60 seconds.

### 2. Behavioral Diagnosis (COM-B)
Scores 6 subdomains (0-100 each) from behavioral signals:
- Capability (Physical + Psychological)
- Opportunity (Physical + Social)  
- Motivation (Reflective + Automatic)

The lowest-scoring subdomain is the intervention target. Each diagnosis includes a confidence level.

### 3. Framework Selection
Based on TTM stage + COM-B barrier, the system selects from:
- **Authority Endorsement** — MOH recommendation (98.2% Saudi trust)
- **Loss Aversion** — what you stand to lose from inaction
- **Implementation Intentions** — specific when/where/how plans (+23pp effect)
- **Opt-Out Pre-Booking** — default appointments (29.1% vs 9.6% completion)
- **EAST overlay** — Easy, Attractive, Social, Timely checklist on every message

### 4. Optimization (Community of Bandits)
Three independent Thompson Sampling instances optimize simultaneously:
- **Message framework** (5 arms)
- **Send time** (4 AST windows: morning/afternoon/evening/night)
- **Send day** (Sun-Thu Saudi work week)

Includes dosage control (lambda=0.95) for fatigue prevention and reward deduplication.

### 5. Delivery
WhatsApp-first (83% Saudi daily usage), with SMS fallback.
Send window enforced: 9 AM - 8 PM AST.
Gender-aware templates route female users to women's section messaging.

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| SADRISC over FINDRISC | Saudi-validated, AUC 0.76 vs 0.71, 5 WhatsApp-collectable variables |
| Authority over Social Norms | Peer norms ineffective in Saudi collectivist culture (Alhugbani 2025) |
| Message Library over real-time AI | WhatsApp requires pre-approved templates; eliminates hallucination risk |
| WhatsApp-first | 83% daily usage, $0.01/msg vs $0.19 SMS, 98% open rate |
| Thompson Sampling | Ethically superior to fixed A/B (reduces exposure to inferior messages) |

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS 4, Vite, Recharts
- **Backend:** FastAPI, Python 3.12, Pydantic, NumPy, SciPy
- **Messaging:** Twilio WhatsApp API (sandbox; Unifonic for production)
- **Deployment:** Oracle Cloud Jeddah (PDPL data residency)

---

## License

This is a technical case study submission. Confidential — for recruitment use only.
