import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Send, Calendar, Target, DollarSign } from 'lucide-react'
import { analyticsData } from '../data/messages'
import MetricCard from '../components/MetricCard'

/* ─── Shared style tokens ──────────────────────────────────────────────────── */

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-secondary)',
  marginBottom: '1.25rem',
  margin: '0 0 1.25rem',
}

const SECTION: React.CSSProperties = {
  paddingTop: '2.25rem',
  borderTop: '1px solid var(--border)',
}

/* ─── Color palettes ───────────────────────────────────────────────────────── */

// Framework bar colors: distinct per bar
const FRAMEWORK_COLORS = ['#8b5cf6', '#2563eb', '#059669', '#d97706', '#9ca3af']

// Segment bar colors: distinct per bar
const SEGMENT_COLORS = ['#059669', '#2563eb', '#d97706', '#9ca3af']

// Funnel step colors
const FUNNEL_COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#16a34a']

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  const data = analyticsData

  /* Framework bars */
  const frameworkBars = data.frameworkPerformance.map((f) => ({
    name: f.name,
    rate: f.rate,
  }))

  /* Segment bars */
  const segmentBars = data.segmentPerformance.map((s) => ({
    name: s.name,
    rate: s.rate,
  }))

  /* Thompson Sampling with factored action space — compute posteriors */
  const maxPosterior = Math.max(
    ...data.banditArms.map((a) => a.alpha / (a.alpha + a.beta))
  )
  const banditRows = data.banditArms.map((arm) => {
    const mean = arm.alpha / (arm.alpha + arm.beta)
    const isLeader = mean === maxPosterior
    return {
      name: arm.name,
      posterior: (mean * 100).toFixed(1),
      pulls: arm.pulls.toLocaleString(),
      isLeader,
    }
  })

  /* Funnel */
  const funnelSteps = [
    { label: 'Sent',      value: data.sent,      pct: null,              dropoff: null },
    { label: 'Delivered', value: data.delivered,  pct: data.deliveryRate, dropoff: 100 - data.deliveryRate },
    { label: 'Read',      value: data.read,       pct: data.readRate,     dropoff: data.deliveryRate - data.readRate },
    { label: 'Clicked',   value: data.clicked,    pct: data.clickRate,    dropoff: data.readRate - data.clickRate },
    { label: 'Booked',    value: data.booked,     pct: data.bookingRate,  dropoff: data.clickRate - data.bookingRate },
  ]
  const funnelMax = data.sent

  return (
    <main
      className="animate-fade-in"
      style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}
    >
      {/* Page context */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Breadcrumb */}
        <div style={{
          fontSize: '0.6875rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}>
          Demo Flow → Step 4 of 4 → Analytics & Optimization
        </div>
        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Campaign Analytics & Learning Loop
        </h1>
        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: 0,
          maxWidth: '640px',
          lineHeight: 1.6,
        }}>
          The system automatically learns which message style gets more people to book screenings, and sends more of what works. NNT (Messages per Booking) is the headline metric — it tells you how many messages produce one new screening appointment.
        </p>
      </div>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <header style={{ marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.3rem',
            letterSpacing: '-0.01em',
          }}
        >
          Campaign Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Saudi national diabetes pre-screening nudge campaign — live cohort · optimization loop active
        </p>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — KPI Overview
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animate-slide-up delay-1" style={{ paddingBottom: '2.25rem' }}>
        <p style={SECTION_LABEL}>KPI Overview</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <MetricCard
            title="Messages Sent"
            value={data.sent}
            delta={12}
            deltaLabel="vs last campaign"
            icon={<Send className="w-4 h-4" />}
            accentColor="#2563eb"
            duration={1800}
          />
          <MetricCard
            title="Screening Bookings"
            value={data.booked}
            delta={23.5}
            deltaLabel="vs last campaign"
            description="8.0% conversion"
            icon={<Calendar className="w-4 h-4" />}
            accentColor="#16a34a"
            duration={2000}
          />
          <MetricCard
            title="NNT"
            value={data.nnt}
            decimals={1}
            delta={-30.4}
            deltaLabel="down from 18.3 — improving"
            description="Messages per additional booking"
            icon={<Target className="w-4 h-4" />}
            accentColor="#f59e0b"
            duration={1500}
          />
          <MetricCard
            title="Cost per Booking"
            value={data.costPerBooking}
            prefix="$"
            decimals={2}
            delta={-18.6}
            deltaLabel="target: <$5.00"
            icon={<DollarSign className="w-4 h-4" />}
            accentColor="#10b981"
            duration={1600}
          />
        </div>

        {/* KPI explanatory note */}
        <p style={{ margin: '1rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
          NNT (Messages per Booking) is our headline metric — borrowed from clinical trials. It measures how many messages we need to send to produce one additional screening booking. Lower is better. Current: 12.5, meaning every ~12-13 messages generates one booking. Down from 18.3 at launch — a 32% efficiency gain through Thompson Sampling optimization.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Framework Performance (Bandit Arms)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animate-slide-up delay-2" style={SECTION}>
        <p style={SECTION_LABEL}>Framework Performance (Bandit Arms)</p>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            marginTop: '-0.5rem',
          }}
        >
          The contextual bandit allocates traffic toward higher-converting message variants each batch.
          Bar width reflects booking conversion rate.
        </p>
        <ResponsiveContainer width="100%" height={data.frameworkPerformance.length * 40 + 8}>
          <BarChart
            data={frameworkBars}
            layout="vertical"
            margin={{ left: 0, right: 56, top: 0, bottom: 0 }}
            barCategoryGap="18%"
          >
            <XAxis type="number" hide domain={[0, 32]} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={22}>
              {frameworkBars.map((_entry, i) => (
                <Cell key={i} fill={FRAMEWORK_COLORS[i] ?? '#9ca3af'} />
              ))}
              <LabelList
                dataKey="name"
                position="insideLeft"
                style={{ fill: '#ffffff', fontSize: '11px', fontWeight: 500 }}
                offset={8}
              />
              <LabelList
                dataKey="rate"
                position="right"
                formatter={(v: unknown) => `${v}%`}
                style={{
                  fill: '#111827',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Framework bars explanatory note */}
        <p style={{ margin: '1rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
          The contextual bandit automatically allocates more traffic to higher-converting frameworks. Implementation Intentions leads at 22.4% — consistent with the +23pp effect size from the literature.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Segment Conversion
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animate-slide-up delay-3" style={SECTION}>
        <p style={SECTION_LABEL}>Segment Conversion</p>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            marginTop: '-0.5rem',
          }}
        >
          Booking rates by Transtheoretical Model stage. Preparation-stage recipients convert 10× higher
          than cold (Precontemplation) audiences — informing send-list prioritisation.
        </p>
        <ResponsiveContainer width="100%" height={data.segmentPerformance.length * 40 + 8}>
          <BarChart
            data={segmentBars}
            layout="vertical"
            margin={{ left: 0, right: 56, top: 0, bottom: 0 }}
            barCategoryGap="18%"
          >
            <XAxis type="number" hide domain={[0, 38]} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={22}>
              {segmentBars.map((_entry, i) => (
                <Cell key={i} fill={SEGMENT_COLORS[i] ?? '#9ca3af'} />
              ))}
              <LabelList
                dataKey="name"
                position="insideLeft"
                style={{ fill: '#ffffff', fontSize: '11px', fontWeight: 500 }}
                offset={8}
              />
              <LabelList
                dataKey="rate"
                position="right"
                formatter={(v: unknown) => `${v}%`}
                style={{
                  fill: '#111827',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — Contextual Bandit Status
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animate-slide-up delay-4" style={SECTION}>
        <p style={SECTION_LABEL}>Contextual Bandit Status (Thompson Sampling with factored action space)</p>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem',
            marginTop: '-0.5rem',
          }}
        >
          Each "arm" is a complete pre-approved message variant from the library. The contextual bandit (inspired by the REINFORCE trial's use of Microsoft Personalizer) uses Thompson Sampling with factored action space to select messages optimizing across 5 design dimensions: framing tone, social proof, reflection question, content type, and urgency level. HeartSteps-style dosage control (λ=0.95) prevents message fatigue.
        </p>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            padding: '8px 12px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.18)',
            borderRadius: '6px',
          }}
        >
          Note: Bandit algorithms reduce statistical power vs fixed randomization. We pre-register a 2-4 week fixed randomization phase before activating Thompson Sampling to ensure baseline statistical rigor.
        </p>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8125rem',
          }}
        >
          <thead>
            <tr>
              {[
                { label: 'Arm',            align: 'left'  as const },
                { label: 'Posterior Mean', align: 'right' as const },
                { label: 'Pulls',          align: 'right' as const },
                { label: 'Status',         align: 'right' as const },
              ].map(({ label, align }) => (
                <th
                  key={label}
                  style={{
                    textAlign: align,
                    padding: '0 0.75rem 0.625rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {banditRows.map((row, i) => (
              <tr
                key={row.name}
                className="row-hover"
                style={{
                  borderBottom:
                    i < banditRows.length - 1 ? '1px solid var(--border)' : 'none',
                  background: row.isLeader ? 'rgba(37,99,235,0.04)' : 'transparent',
                }}
              >
                {/* Arm name */}
                <td
                  style={{
                    padding: '0.8rem 0.75rem',
                    color: 'var(--text-primary)',
                    fontWeight: row.isLeader ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {row.name}
                  {row.isLeader && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        background: 'rgba(37,99,235,0.14)',
                        color: 'var(--accent)',
                        padding: '0.125rem 0.4rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        border: '1px solid rgba(37,99,235,0.22)',
                      }}
                    >
                      Leader
                    </span>
                  )}
                </td>

                {/* Posterior mean — blue for leader, normal for others */}
                <td
                  style={{
                    padding: '0.8rem 0.75rem',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    color: row.isLeader ? '#2563eb' : 'var(--text-secondary)',
                    fontWeight: row.isLeader ? 700 : 400,
                    fontSize: '0.875rem',
                  }}
                >
                  {row.posterior}%
                </td>

                {/* Pulls */}
                <td
                  style={{
                    padding: '0.8rem 0.75rem',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8125rem',
                  }}
                >
                  {row.pulls}
                </td>

                {/* Status */}
                <td style={{ padding: '0.8rem 0.75rem', textAlign: 'right' }}>
                  {row.isLeader ? (
                    <span
                      style={{
                        color: '#16a34a',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                    >
                      ▲ Leader
                    </span>
                  ) : (
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      → Exploring
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            marginTop: '0.875rem',
            lineHeight: 1.6,
          }}
        >
          Posterior mean = α / (α + β). Each confirmed booking increments α; each non-response
          increments β. Traffic weight auto-adjusts every 24 h batch cycle — no human re-allocation needed.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — Conversion Funnel
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="animate-slide-up delay-5"
        style={{ ...SECTION, paddingBottom: '1rem' }}
      >
        <p style={SECTION_LABEL}>Conversion Funnel</p>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            marginTop: '-0.5rem',
          }}
        >
          Each signal feeds back into the model: read receipts update capability priors; clicks update
          motivation scores; bookings increment the bandit arm's α.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {funnelSteps.map((step, i) => {
            const widthPct = (step.value / funnelMax) * 100
            const indentPx = i * 22
            const isLast = i === funnelSteps.length - 1
            const color = FUNNEL_COLORS[i] ?? '#10b981'

            return (
              <div key={step.label}>
                {/* Drop-off annotation between steps */}
                {step.dropoff !== null && step.dropoff > 0 && (
                  <div
                    style={{
                      paddingLeft: `${indentPx}px`,
                      paddingBottom: '0.1rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      ▼ −{step.dropoff.toFixed(1)}%
                    </span>
                  </div>
                )}

                {/* Funnel row */}
                <div
                  style={{
                    paddingLeft: `${indentPx}px`,
                    paddingBottom: isLast ? 0 : '0.125rem',
                  }}
                >
                  {/* Bar track */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      height: '36px',
                      position: 'relative',
                    }}
                  >
                    {/* Filled bar */}
                    <div
                      className="animate-fill-bar"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, ${color}28, ${color}14)`,
                        borderLeft: `3px solid ${color}`,
                        borderRadius: '4px',
                      }}
                    />

                    {/* Row content overlaid on bar */}
                    <div
                      style={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0 0.875rem',
                      }}
                    >
                      {/* Label */}
                      <span
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.8125rem',
                          minWidth: '5.5rem',
                          flexShrink: 0,
                        }}
                      >
                        {step.label}
                      </span>

                      {/* Value */}
                      <span
                        style={{
                          color: isLast ? color : 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.875rem',
                          fontWeight: isLast ? 700 : 500,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {step.value.toLocaleString()}
                      </span>

                      {/* Percentage */}
                      {step.pct !== null && (
                        <span
                          style={{
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                          }}
                        >
                          ({step.pct}%)
                        </span>
                      )}

                      {/* End label for final step */}
                      {isLast && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          ✓ Conversion
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Conversion funnel explanatory note */}
        <p style={{ margin: '1rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
          The funnel shows where users drop off. The biggest gap is Read→Clicked (68.4% → 15.0%) — meaning most people read the message but don't tap the booking link. This is where message framing optimization has the highest leverage.
        </p>

        {/* Funnel footnote */}
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginTop: '1rem',
            lineHeight: 1.6,
          }}
        >
          Response signals (read, click, book) update downstream model parameters within each
          24 h batch — closing the optimization loop without manual intervention.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — The Learning Loop
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animate-slide-up delay-6" style={SECTION}>
        <p style={SECTION_LABEL}>The Learning Loop</p>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
          }}
        >
          Every screening booking feeds back into the system: the bandit arm that generated the booking message gets its alpha parameter incremented (Beta(alpha+1, beta)). Over 1-4 hour batch cycles, the posterior distribution shifts, and the system automatically allocates more traffic to higher-converting message variants. No manual A/B test management needed.
        </p>
      </section>
    </main>
  )
}
