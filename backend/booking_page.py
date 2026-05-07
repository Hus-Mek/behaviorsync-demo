"""
Booking confirmation page — served when user taps the WhatsApp link.
Matches the frontend demo's design system: Albert Sans, light theme, same tokens.
"""

from html import escape as html_escape


def render_booking_page(name: str, classification: dict, clinic: str, date: str = "الأحد", time: str = "10:00 صباحاً") -> str:
    name = html_escape(name)
    clinic = html_escape(clinic)
    sadrisc = classification["sadrisc"]
    ttm = classification["ttm"]
    comb = classification["comb"]
    framework = classification["framework"]

    risk_color = "#b91c1c" if sadrisc["risk"] == "High" else ("#b45309" if sadrisc["risk"] == "Elevated" else "#047857")
    risk_bg = "rgba(185,28,28,0.06)" if sadrisc["risk"] == "High" else ("rgba(180,83,9,0.06)" if sadrisc["risk"] == "Elevated" else "rgba(4,120,87,0.06)")
    risk_width = round((sadrisc["score"] / 15) * 100)
    badge_class = "high" if sadrisc["risk"] == "High" else ("elevated" if sadrisc["risk"] == "Elevated" else "low")

    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BehaviorSync — Screening Appointment</title>
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {{
  --surface: #f8f9fb;
  --card: #fefefe;
  --border: rgba(0,0,0,0.10);
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --accent: #1d4ed8;
  --accent-subtle: #dbeafe;
  --success: #047857;
  --success-subtle: rgba(4,120,87,0.06);
  --warning: #b45309;
  --danger: #b91c1c;
  --font-body: 'Albert Sans', 'Noto Sans Arabic', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
  font-family: var(--font-body);
  background: var(--surface);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 16px;
  font-size: 0.9375rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}}
.page {{ max-width: 440px; margin: 0 auto; }}

.breadcrumb {{
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 16px;
  text-align: center;
  direction: ltr;
}}

.status-banner {{
  background: var(--success-subtle);
  border: 1px solid rgba(4,120,87,0.12);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  animation: slideUp 0.5s var(--ease-out-expo) both;
}}
.status-icon {{ font-size: 1.75rem; margin-bottom: 6px; }}
.status-title {{
  font-size: 1rem;
  font-weight: 700;
  color: var(--success);
  margin-bottom: 2px;
}}
.status-sub {{
  font-size: 0.75rem;
  color: var(--text-secondary);
}}

.appt-card {{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  animation: slideUp 0.5s var(--ease-out-expo) 60ms both;
}}
.appt-header {{
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 16px;
}}
.appt-detail {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}}
.appt-detail + .appt-detail {{ border-top: 1px solid var(--border); }}
.appt-label {{ font-size: 0.8125rem; color: var(--text-secondary); }}
.appt-value {{ font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }}

.risk-section {{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  animation: slideUp 0.5s var(--ease-out-expo) 120ms both;
}}
.risk-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}}
.risk-score {{
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}}
.risk-score span {{
  font-size: 1rem;
  color: var(--text-tertiary);
  font-weight: 400;
}}
.badge {{
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}}
.badge-high {{ background: rgba(185,28,28,0.08); color: var(--danger); }}
.badge-elevated {{ background: rgba(180,83,9,0.08); color: var(--warning); }}
.badge-low {{ background: rgba(4,120,87,0.08); color: var(--success); }}
.risk-track {{
  height: 6px;
  background: rgba(0,0,0,0.06);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}}
.risk-fill {{
  height: 100%;
  border-radius: 3px;
  background: {risk_color};
  width: {risk_width}%;
  transition: width 0.8s var(--ease-out-expo);
}}
.risk-cite {{
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  direction: ltr;
  text-align: left;
}}

.class-section {{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  animation: slideUp 0.5s var(--ease-out-expo) 180ms both;
}}
.class-row {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}}
.class-row + .class-row {{ border-top: 1px solid var(--border); }}
.class-label {{ font-size: 0.8125rem; color: var(--text-secondary); }}
.class-value {{ font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); }}
.framework-note {{
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.5;
  direction: ltr;
  text-align: left;
}}

.actions {{
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  animation: slideUp 0.5s var(--ease-out-expo) 240ms both;
}}
.btn {{
  flex: 1;
  padding: 14px 16px;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s var(--ease-out-expo), opacity 0.15s;
  text-align: center;
  border: none;
}}
.btn:active {{ transform: scale(0.97); }}
.btn-cancel {{
  background: rgba(185,28,28,0.06);
  color: var(--danger);
  border: 1px solid rgba(185,28,28,0.12);
}}
.btn-cancel:hover {{ background: rgba(185,28,28,0.10); }}
.btn-reschedule {{
  background: var(--accent-subtle);
  color: var(--accent);
  border: 1px solid rgba(29,78,216,0.12);
}}
.btn-reschedule:hover {{ background: rgba(29,78,216,0.10); }}

.result-msg {{
  display: none;
  text-align: center;
  padding: 24px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
}}
.result-msg p {{ font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; }}
.result-msg .icon {{ font-size: 2rem; margin-bottom: 8px; }}

.footer {{
  text-align: center;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  padding-top: 16px;
  border-top: 1px solid var(--border);
  direction: ltr;
  line-height: 1.6;
}}
.footer strong {{ color: var(--text-secondary); font-weight: 500; }}

@keyframes slideUp {{
  from {{ opacity: 0; transform: translateY(12px); }}
  to {{ opacity: 1; transform: translateY(0); }}
}}
</style>
</head>
<body>
<div class="page">

  <div class="breadcrumb">BEHAVIORSYNC &middot; Screening Appointment</div>

  <div class="status-banner">
    <div class="status-icon">✅</div>
    <div class="status-title">موعدك محجوز — Your appointment is booked</div>
    <div class="status-sub">Opt-out default &middot; Cancel or reschedule below if needed</div>
  </div>

  <div class="appt-card">
    <div class="appt-header">Appointment Details</div>
    <div class="appt-detail">
      <span class="appt-label">المركز · Clinic</span>
      <span class="appt-value">{clinic}</span>
    </div>
    <div class="appt-detail">
      <span class="appt-label">التاريخ · Date</span>
      <span class="appt-value">{date}</span>
    </div>
    <div class="appt-detail">
      <span class="appt-label">الوقت · Time</span>
      <span class="appt-value">{time}</span>
    </div>
    <div class="appt-detail">
      <span class="appt-label">المدة · Duration</span>
      <span class="appt-value">15 دقيقة · Free</span>
    </div>
  </div>

  <div class="risk-section">
    <div class="appt-header">SADRISC Risk Assessment</div>
    <div class="risk-header">
      <div class="risk-score">{sadrisc['score']}<span>/15</span></div>
      <span class="badge badge-{badge_class}">{sadrisc['risk']} Risk</span>
    </div>
    <div class="risk-track"><div class="risk-fill"></div></div>
    <div class="risk-cite">Saudi-validated &middot; Al-Rubeaan et al. 2020, PMC7378422</div>
  </div>

  <div class="class-section">
    <div class="appt-header">Behavioral Classification</div>
    <div class="class-row">
      <span class="class-label">Stage</span>
      <span class="class-value">{ttm['stage']}</span>
    </div>
    <div class="class-row">
      <span class="class-label">Barrier</span>
      <span class="class-value">{comb['barrier']}</span>
    </div>
    <div class="class-row">
      <span class="class-label">Framework</span>
      <span class="class-value">{framework['primary']}</span>
    </div>
    <div class="framework-note">{html_escape(framework['reason'][:120])}</div>
  </div>

  <div class="actions" id="booking-actions">
    <button class="btn btn-cancel" onclick="cancelBooking()">إلغاء · Cancel</button>
    <button class="btn btn-reschedule" onclick="rescheduleBooking()">تغيير الموعد · Reschedule</button>
  </div>

  <div class="result-msg" id="cancelled" style="background: rgba(185,28,28,0.04);">
    <div class="icon">📋</div>
    <p>Appointment cancelled. Reply <strong>START</strong> anytime to rebook.</p>
  </div>

  <div class="result-msg" id="rescheduled" style="background: var(--accent-subtle);">
    <div class="icon">📅</div>
    <p style="color: var(--accent); font-weight: 600;">Choose a new date and time</p>
    <p style="margin-top: 4px;">In production, this opens the Sehhaty booking calendar.</p>
  </div>

  <div class="footer">
    <strong>BehaviorSync</strong> &middot; Behavioral Science Messaging Platform<br>
    COM-B diagnosis &middot; Thompson Sampling &middot; SADRISC
  </div>

</div>
<script>
function cancelBooking() {{
  document.getElementById('booking-actions').style.display = 'none';
  document.getElementById('cancelled').style.display = 'block';
  fetch('/api/bandit', {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{arm_name: '{html_escape(framework["primary"])}', reward: 0.0}})
  }});
}}
function rescheduleBooking() {{
  document.getElementById('booking-actions').style.display = 'none';
  document.getElementById('rescheduled').style.display = 'block';
}}
</script>
</body>
</html>"""
