import { useState } from 'react'
import { segments } from '../data/users'

/* ─── Icons (inline SVG) ─────────────────────────────────────────────────── */
function IconWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.418A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
        fill="currentColor"
        opacity=".9"
      />
      <path
        d="M8.5 8.5c.2-.6.8-1 1.4-1h.6c.4 0 .7.3.8.6l.7 2.1c.1.3 0 .7-.2.9l-.6.6c.5 1 1.2 1.8 2.1 2.3l.6-.6c.2-.2.6-.3.9-.2l2.1.7c.3.1.6.4.6.8v.6c0 .6-.4 1.2-1 1.4C13.5 16.9 9 13.5 8.5 8.5z"
        fill="white"
      />
    </svg>
  )
}

function IconSMS() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 9h12M6 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 18l-3 3v-3" fill="currentColor"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2l7 3v5c0 5-3.5 9-7 10C8.5 19 5 15 5 10V5l7-3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconZap() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" opacity=".85"/>
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ─── Styled Checkbox ─────────────────────────────────────────────────────── */
function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        fontSize: '0.8125rem',
        color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          borderRadius: '4px',
          border: checked ? 'none' : '1.5px solid rgba(0,0,0,0.18)',
          backgroundColor: checked ? 'var(--accent)' : 'transparent',
          flexShrink: 0,
          transition: 'background-color 0.15s, border-color 0.15s',
        }}
      >
        {checked && <IconCheck />}
      </span>
      {label}
    </span>
  )
}

/* ─── Toggle switch ───────────────────────────────────────────────────────── */
function Toggle({ on, label }: { on: boolean; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '38px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: on ? 'var(--accent)' : 'rgba(0,0,0,0.12)',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: on ? '19px' : '3px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'white',
            transition: 'left 0.2s var(--ease-out-expo)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </span>
      <span
        style={{
          fontSize: '0.8125rem',
          color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: on ? 500 : 400,
        }}
      >
        {label}
      </span>
    </span>
  )
}

/* ─── Section wrapper ─────────────────────────────────────────────────────── */
function Section({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ─── Journey step types ──────────────────────────────────────────────────── */
type Step = {
  day: number
  trigger: string
  title: string
  channel: 'WhatsApp' | 'SMS'
  framework: string
  description: string
  color: string
  bgGlow: string
  icon: React.ReactNode
}

/* ─── Journey step card ───────────────────────────────────────────────────── */
function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <div
      className="animate-scale-in hover-lift"
      style={{
        animationDelay: `${200 + index * 120}ms`,
        flex: 1,
        minWidth: 0,
        position: 'relative',
        background: 'var(--elevated)',
        border: '1px solid var(--border-mid)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow in corner */}
      <span
        style={{
          position: 'absolute',
          top: '-24px',
          right: '-24px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: step.bgGlow,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* Day badge + channel pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
            color: step.color,
            background: `${step.color}18`,
            border: `1px solid ${step.color}35`,
            borderRadius: '6px',
            padding: '3px 8px',
          }}
        >
          DAY {step.day}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.6875rem',
            color: 'var(--text-secondary)',
            background: 'var(--elevated)',
            borderRadius: '6px',
            padding: '3px 8px',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ color: step.color }}>{step.icon}</span>
          {step.channel}
        </span>
      </div>

      {/* Number circle + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: step.color,
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: `0 0 12px ${step.color}55`,
          }}
        >
          {index + 1}
        </span>
        <div>
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            {step.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {step.trigger}
          </div>
        </div>
      </div>

      {/* Framework tag */}
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: step.color,
            letterSpacing: '0.03em',
          }}
        >
          <IconZap />
          {step.framework}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          borderTop: '1px solid var(--border)',
          paddingTop: '10px',
        }}
      >
        {step.description}
      </p>
    </div>
  )
}

/* ─── Connector arrow between steps ──────────────────────────────────────── */
function Connector() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        flexShrink: 0,
        width: '36px',
        paddingTop: '12px',
      }}
    >
      <div style={{ width: '36px', borderTop: '2px dashed rgba(0,0,0,0.18)' }} />
      <span
        style={{
          fontSize: '0.625rem',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        if no
        <br />
        reply
      </span>
      <span style={{ color: 'rgba(0,0,0,0.25)', display: 'flex', marginTop: '2px' }}>
        <IconArrowRight />
      </span>
    </div>
  )
}

/* ─── Approval stage types ────────────────────────────────────────────────── */
type ApprovalStage = {
  label: string
  ts?: string
  status: 'done' | 'active' | 'pending'
}

/* ─── Approval pipeline bar ───────────────────────────────────────────────── */
function ApprovalBar({ stages }: { stages: ApprovalStage[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {stages.map((stage, i) => {
        const isDone = stage.status === 'done'
        const isActive = stage.status === 'active'
        const isLast = i === stages.length - 1

        return (
          <div
            key={stage.label}
            style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? '0 0 auto' : 1 }}
          >
            {/* Stage node */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                minWidth: '90px',
              }}
            >
              {/* Circle */}
              <div
                className={isActive ? 'animate-pulse-glow' : ''}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDone ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--elevated)',
                  border: isDone
                    ? 'none'
                    : isActive
                    ? '2px solid var(--accent)'
                    : '2px solid var(--border-mid)',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isActive ? 'white' : 'rgba(0,0,0,0.15)',
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isDone ? 'var(--success)' : isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  letterSpacing: '0.01em',
                }}
              >
                {stage.label}
              </span>

              {/* Timestamp */}
              {stage.ts && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {stage.ts}
                </span>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  marginTop: '15px',
                  background: isDone ? 'var(--success)' : 'rgba(0,0,0,0.10)',
                  transition: 'background 0.3s',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Stat badge ──────────────────────────────────────────────────────────── */
function StatBadge({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      style={{
        background: accent ? 'rgba(37,99,235,0.08)' : 'var(--elevated)',
        border: `1px solid ${accent ? 'rgba(37,99,235,0.2)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}
    >
      <span
        style={{
          fontSize: '0.625rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: accent ? 'var(--accent)' : 'var(--text-tertiary)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}
      >
        {value}
      </span>
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function CampaignPage() {
  const [selectedSegment, setSelectedSegment] = useState(segments[0].id)

  const journeySteps: Step[] = [
    {
      day: 0,
      trigger: 'Campaign launch',
      title: 'Initial Screening Invitation',
      channel: 'WhatsApp',
      framework: 'Authority Endorsement',
      description:
        'Opt-out default: screening appointment pre-reserved at nearest Taakkad clinic. Message notifies the user their appointment is booked and provides Cancel / Reschedule options. MOH authority endorsement framing — no peer social norms (ineffective in collectivist cultures, Alhugbani 2025).',
      color: '#22c55e',
      bgGlow: 'radial-gradient(circle, #22c55e, transparent)',
      icon: <IconWhatsApp />,
    },
    {
      day: 3,
      trigger: 'If no booking response',
      title: 'Follow-up Reminder',
      channel: 'SMS',
      framework: 'Implementation Intentions',
      description:
        'Prompts non-converters to form a concrete plan: "Which day this week works for you? Tap to pick a time slot at your nearest PHC." Pre-commitment reduces friction and increases follow-through.',
      color: '#3b82f6',
      bgGlow: 'radial-gradient(circle, #3b82f6, transparent)',
      icon: <IconSMS />,
    },
  ]

  const approvalStages: ApprovalStage[] = [
    { label: 'Draft',            ts: '30 Apr 09:14', status: 'done'    },
    { label: 'Clinical Review',  ts: 'In progress',  status: 'active'  },
    { label: 'Compliance',                           status: 'pending' },
    { label: 'Approved',                             status: 'pending' },
    { label: 'Live',                                 status: 'pending' },
  ]

  const selectedSeg = segments.find((s) => s.id === selectedSegment) ?? segments[0]
  const dotColor = (id: string) =>
    id === 's1' ? '#ef4444' : id === 's2' ? '#f59e0b' : '#3b82f6'

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '32px 28px',
        maxWidth: '1080px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {/* Page context */}
      <div style={{
        marginBottom: '0',
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
          Demo Flow → Step 3 of 4 → Campaign Setup
        </div>
        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Campaign Orchestration & Journey Builder
        </h1>
        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: 0,
          maxWidth: '640px',
          lineHeight: 1.6,
        }}>
          Campaign managers configure multi-step message sequences with A/B testing, frequency caps, culturally-aware scheduling windows, and clinical approval workflows. This is the missing deliverable the case study requires.
        </p>
      </div>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        className="animate-slide-up"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              marginBottom: '6px',
            }}
          >
            <IconSend />
            Campaign Studio
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            Campaign Setup
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}
          >
            Configure multi-step outreach journeys with adaptive nudge scheduling and A/B controls.
          </p>
        </div>

        {/* Current stage pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(202,138,4,0.10)',
            border: '1px solid rgba(202,138,4,0.25)',
            borderRadius: '8px',
            padding: '6px 12px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#ca8a04',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#ca8a04',
              letterSpacing: '0.04em',
            }}
          >
            Clinical Review
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — Campaign Details
      ═══════════════════════════════════════════════════════════════════ */}
      <Section
        title="Section 1 — Campaign Details"
        subtitle="Basic configuration for this outreach campaign"
        delay={60}
      >
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Campaign name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
              }}
            >
              Campaign Name
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--elevated)',
                border: '1px solid var(--border-mid)',
                borderRadius: '8px',
                padding: '0 14px',
                height: '42px',
                gap: '10px',
              }}
            >
              <span style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                Diabetes Screening — Riyadh Q2 2026
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  background: 'var(--accent-dim)',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  flexShrink: 0,
                }}
              >
                Pre-filled
              </span>
            </div>
          </div>

          {/* Target segment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
              }}
            >
              Target Segment
            </label>

            {/* Simulated select display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--elevated)',
                border: '1px solid var(--border-mid)',
                borderRadius: '8px',
                padding: '0 14px',
                height: '42px',
                gap: '10px',
                cursor: 'default',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: dotColor(selectedSegment),
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {selectedSeg.name}
              </span>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                {selectedSeg.count.toLocaleString()} users
              </span>
              <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
                <IconChevronDown />
              </span>
            </div>

            {/* Segment option list */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px',
              }}
            >
              {segments.map((seg) => {
                const isSelected = seg.id === selectedSegment
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? 'var(--accent-dim)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                      }
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: dotColor(seg.id),
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '0.8125rem',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {seg.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: isSelected ? 'var(--accent)' : 'var(--text-tertiary)',
                        fontWeight: 500,
                      }}
                    >
                      {seg.count.toLocaleString()}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          flexShrink: 0,
                        }}
                      >
                        <IconCheck />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Rule strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(37,99,235,0.05)',
                border: '1px solid rgba(37,99,235,0.12)',
                borderRadius: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  flexShrink: 0,
                }}
              >
                Rules
              </span>
              <code
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                  flex: 1,
                }}
              >
                {selectedSeg.rules}
              </code>
            </div>

            {/* User acquisition note */}
            <p style={{ margin: '12px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              Users opt in via QR codes in PHC waiting rooms, Sehhaty in-app prompts, or MOH SMS bridge — all PDPL-compliant consent pathways.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — Message Sequence
      ═══════════════════════════════════════════════════════════════════ */}
      <Section
        title="Section 2 — Message Sequence"
        subtitle="Two-touch adaptive journey — each step only activates if the user has not yet booked"
        delay={120}
      >
        <div style={{ padding: '28px 24px 20px' }}>

          {/* ── Journey flow ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: 0,
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {journeySteps.map((step, i) => (
              <div
                key={step.day}
                style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}
              >
                <StepCard step={step} index={i} />
                {i < journeySteps.length - 1 && <Connector />}
              </div>
            ))}
          </div>

          {/* Journey builder explanatory note */}
          <p style={{ margin: '20px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
            This 2-step sequence is evidence-based: research shows 2 reminders is the optimal dosage — a third message adds no incremental lift. If the user doesn't respond to the first touch, the system escalates to a different channel and framework after 3 days. Exit condition: user books at any point. Each step draws from the 120+ message library (8 COM-B segments x 15 variants per segment).
          </p>

          {/* Exit condition */}
          <div
            className="animate-fade-in delay-5"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px',
              padding: '10px 16px',
              background: 'rgba(22,163,74,0.06)',
              border: '1px solid rgba(22,163,74,0.18)',
              borderRadius: '8px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'rgba(22,163,74,0.2)',
                flexShrink: 0,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--success)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              Exit condition
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              User books a screening at any point — journey halts immediately, no further messages sent.
            </span>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-in delay-6"
            style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}
          >
            <StatBadge label="Total touches" value="Max 2 per user" />
            <StatBadge label="Span" value="3 days" />
            <StatBadge label="Channels" value="WhatsApp + SMS" />
            <StatBadge label="Frameworks applied" value="2 nudge frameworks" accent />
            <StatBadge label="Est. reach" value={`${selectedSeg.count.toLocaleString()} users`} accent />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — Schedule & Controls
      ═══════════════════════════════════════════════════════════════════ */}
      <Section
        title="Section 3 — Schedule & Controls"
        subtitle="Timing, frequency, cultural context, and adaptive dosage parameters"
        delay={180}
      >
        <div
          style={{
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
          }}
        >
          {/* ── LEFT column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Send window */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ color: '#ca8a04', display: 'flex' }}><IconClock /></span>
                Send Window
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--elevated)',
                  border: '1px solid var(--border-mid)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    letterSpacing: '0.02em',
                  }}
                >
                  7:00 PM — 9:00 PM
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                />
                Post-Maghrib optimal window — peak app activity in Saudi cohort
              </span>
            </div>

            {/* Active days */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: '#ca8a04', display: 'flex' }}><IconCalendar /></span>
                Active Days
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { label: 'Sun', on: true },
                  { label: 'Mon', on: true },
                  { label: 'Tue', on: true },
                  { label: 'Wed', on: true },
                  { label: 'Thu', on: true },
                  { label: 'Fri', on: false },
                  { label: 'Sat', on: false },
                ].map((d) => (
                  <span
                    key={d.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: d.on ? 'rgba(37,99,235,0.10)' : 'var(--elevated)',
                      border: d.on
                        ? '1px solid rgba(37,99,235,0.25)'
                        : '1px solid var(--border)',
                      fontSize: '0.75rem',
                      fontWeight: d.on ? 600 : 400,
                      color: d.on ? 'var(--accent)' : 'var(--text-tertiary)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    <Checkbox checked={d.on} label="" />
                    {d.label}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                Fri–Sat excluded — weekend, lower PHC booking rate
              </span>
            </div>

            {/* Culturally-aware scheduling */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.18)',
                borderRadius: '8px',
              }}
            >
              <Toggle on label="Culturally-aware scheduling" />
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.4,
                  borderLeft: '1px solid var(--border)',
                  paddingLeft: '12px',
                  marginTop: '1px',
                }}
              >
                Adjusts send windows around religious holidays, national events, and cultural observances
              </span>
            </div>

            {/* Culturally-aware scheduling note */}
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              Campaign timing adapts to cultural context — pausing during national holidays and adjusting send windows to align with daily routines and peak engagement periods in the Saudi cohort.
            </p>
          </div>

          {/* ── RIGHT column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Frequency cap */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: '#ef4444', display: 'flex' }}><IconShield /></span>
                Frequency Cap
              </div>
              <div
                style={{
                  background: 'var(--elevated)',
                  border: '1px solid var(--border-mid)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Max 2 messages per user
                </span>
                <span
                  style={{
                    background: 'rgba(239,68,68,0.10)',
                    border: '1px solid rgba(239,68,68,0.22)',
                    borderRadius: '5px',
                    padding: '2px 8px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#ef4444',
                    letterSpacing: '0.04em',
                    flexShrink: 0,
                  }}
                >
                  per 3 days
                </span>
              </div>
            </div>

            {/* A/B split */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                A/B Split
              </div>
              <div
                style={{
                  background: 'var(--elevated)',
                  border: '1px solid var(--border-mid)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    50 / 50 split
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                    }}
                  >
                    n = {Math.round(selectedSeg.count / 2).toLocaleString()} per arm
                  </span>
                </div>
                {/* Split colour bar */}
                <div style={{ display: 'flex', height: '5px' }}>
                  <div style={{ flex: 1, background: 'var(--accent)', opacity: 0.85 }} />
                  <div style={{ flex: 1, background: '#8b5cf6', opacity: 0.75 }} />
                </div>
                {/* Arm labels */}
                <div
                  style={{
                    display: 'flex',
                    padding: '8px 14px',
                    gap: '10px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '2px',
                        background: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Arm A — Behavioral nudge sequence
                    </span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '2px',
                        background: '#8b5cf6',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Arm B — Simple reminder
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* A/B split explanatory note */}
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              The control arm uses Milkman's 'ownership frame' — 'Your free screening is reserved for you' — which outperformed every creative alternative in a 680,000-person megastudy. If behavioral science can't beat this, we save the complexity.
            </p>

            {/* Go/no-go success criterion */}
            <p style={{
              margin: '12px 0 0',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              borderLeft: '2px solid var(--accent)',
              paddingLeft: '12px',
              maxWidth: '720px',
            }}>
              Phase 0 success gate: booking rate &gt; 8% among messaged cohort (N=1,000) at p&lt;0.05. If the behavioral variant cannot beat the Milkman control, Phase 1 investment is not justified.
            </p>

            {/* Dosage control */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Adaptive Dosage
              </div>
              <div
                style={{
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.18)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#a78bfa',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    HeartSteps λ = 0.95
                  </span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: '#8b5cf6',
                      background: 'rgba(139,92,246,0.12)',
                      borderRadius: '4px',
                      padding: '2px 7px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Fatigue prevention
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  Bandit-derived decay factor reduces message probability by 5% per ignored touch,
                  preserving engagement while avoiding notification fatigue. Resets on positive
                  interaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — Approval Pipeline
      ═══════════════════════════════════════════════════════════════════ */}
      <Section
        title="Section 4 — Approval Pipeline"
        subtitle="Multi-stage clinical and compliance review before any campaign goes live"
        delay={240}
      >
        <div style={{ padding: '28px 24px' }}>

          <ApprovalBar stages={approvalStages} />

          {/* Info strip */}
          <div
            className="animate-fade-in delay-4"
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '28px',
              padding: '14px 16px',
              background: 'rgba(202,138,4,0.06)',
              border: '1px solid rgba(202,138,4,0.16)',
              borderRadius: '8px',
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(202,138,4,0.15)',
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#ca8a04" strokeWidth="1.8"/>
                <path d="M12 8v5M12 16v.5" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#ca8a04',
                  marginBottom: '3px',
                }}
              >
                Awaiting Clinical Review
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                This campaign requires sign-off from a licensed clinician and a compliance officer before
                launch. Message content has been validated against MOH communication guidelines. Estimated
                review time: 24–48 hours.
              </p>
            </div>
          </div>

          {/* Review meta */}
          <div
            className="animate-fade-in delay-5"
            style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}
          >
            <StatBadge label="Submitted" value="30 Apr 2026, 09:14" />
            <StatBadge label="Reviewer assigned" value="Dr. Reem Al-Zahrani" />
            <StatBadge label="Compliance reference" value="MOH-COMM-2026-04" />
          </div>

          {/* Operational staffing note */}
          <p style={{
            margin: '16px 0 0',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
          }}>
            Day-to-day operations: 1 health informaticist (campaign management + monitoring), 1 Arabic content specialist (message review + cultural QA), 1 data analyst (A/B test evaluation + bandit tuning). Total: 3 FTE for MVP operations. Estimated platform cost: ~$2,650/month (infrastructure ~$150 on OCI Free Tier + messaging ~$2,500 via Unifonic).
          </p>

          {/* Footer CTA */}
          <div
            className="animate-fade-in delay-6"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              All changes are version-controlled. A full audit log is available for this campaign.
            </p>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'opacity 0.15s, transform 0.15s',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.opacity = '0.88'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.opacity = '1'
                el.style.transform = 'translateY(0)'
              }}
            >
              <IconSend />
              Submit for Review
              <span style={{ display: 'flex', marginLeft: '2px' }}>
                <IconArrowRight />
              </span>
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
