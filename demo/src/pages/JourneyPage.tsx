import React from 'react'
import { sampleUsers } from '../data/users'
import { messageTemplates } from '../data/messages'
import {
  computeSADRISC,
  computeHES,
  classifyTTM,
  diagnoseCOMB,
  selectFramework,
  computePriority,
} from '../lib/scoring'

// ─── Ahmad Al-Qahtani — hardcoded ────────────────────────────────────────────
const ahmad = sampleUsers.find((u) => u.id === 'u1')!

function personalise(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

const vars: Record<string, string> = {
  name: ahmad.name_ar,
  area: ahmad.region_ar,
  clinic: ahmad.clinic_name_ar,
  link: 'sehhaty.sa/book',
  date: 'الأحد',
  time: '10:00 ص',
}

// Scoring
const sadrisc = computeSADRISC(ahmad)
const hes = computeHES(ahmad)
const ttm = classifyTTM(ahmad)
const comb = diagnoseCOMB(ahmad, ttm.stage)
const framework = selectFramework(ttm.stage, comb.barrier)
const priority = computePriority(sadrisc.score, hes.score)

// Messages
const whatsappMsg = messageTemplates.find((m) => m.ttm_stage === 'Precontemplation' && m.channel === 'whatsapp')!
const smsMsg = messageTemplates.find((m) => m.channel === 'sms')!
const pushMsg = messageTemplates.find((m) => m.channel === 'push')!

// Step accent colors
const STEP_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#10b981']

// ─── Shared primitives ────────────────────────────────────────────────────────

function StepCircle({ num, color }: { num: number; color: string }) {
  return (
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
        boxShadow: `0 4px 20px ${color}55`,
        letterSpacing: '-0.02em',
      }}
    >
      {num}
    </div>
  )
}

function StepHeader({
  num,
  title,
  subtitle,
  color,
}: {
  num: number
  title: string
  subtitle: string
  color: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
      <StepCircle num={num} color={color} />
      <div>
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '3px',
          }}
        >
          Step {num} of 5
        </div>
        <h2
          style={{
            margin: '0 0 4px',
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function SystemExplanation({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        marginTop: '28px',
        padding: '16px 20px',
        borderRadius: '10px',
        background: `${color}08`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '6px',
        }}
      >
        What the system does
      </div>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {children}
      </p>
    </div>
  )
}

function StepCard({
  num,
  delay,
  color,
  children,
}: {
  num: number
  delay: number
  color: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`animate-slide-up delay-${delay}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${color}`,
        borderRadius: '14px',
        padding: '36px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Faint step number watermark */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10px',
          right: '24px',
          fontSize: '8rem',
          fontWeight: 900,
          fontFamily: 'var(--font-mono)',
          color: color,
          opacity: 0.05,
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {num}
      </div>
      {children}
    </div>
  )
}

// ─── Connector between steps ──────────────────────────────────────────────────

function StepConnector({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 0',
      }}
    >
      <svg width="2" height="48" viewBox="0 0 2 48" fill="none">
        <defs>
          <linearGradient id={`grad-${fromColor}-${toColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={toColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <line x1="1" y1="0" x2="1" y2="48" stroke={`url(#grad-${fromColor}-${toColor})`} strokeWidth="2" strokeDasharray="4 3" />
      </svg>
    </div>
  )
}

// ─── SADRISC segmented bar ────────────────────────────────────────────────────

function SADRISCBar({ score, max = 15 }: { score: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '10px',
            borderRadius: '2px',
            background: i < score ? '#dc2626' : 'var(--elevated)',
            transition: 'background 300ms ease',
          }}
        />
      ))}
    </div>
  )
}

// ─── HES bar ─────────────────────────────────────────────────────────────────

function HESBar({ score }: { score: number }) {
  return (
    <div
      style={{
        height: '6px',
        borderRadius: '3px',
        background: 'var(--elevated)',
        overflow: 'hidden',
      }}
    >
      <div
        className="animate-fill-bar"
        style={{
          height: '100%',
          width: `${score}%`,
          background: 'var(--text-tertiary)',
          borderRadius: '3px',
        }}
      />
    </div>
  )
}

// ─── TTM Dot Stepper ──────────────────────────────────────────────────────────

const TTM_STAGES = ['Precontemplation', 'Contemplation', 'Preparation', 'Action', 'Maintenance'] as const
const TTM_SHORT = ['Pre', 'Contemplate', 'Prepare', 'Act', 'Maintain']

function TTMStepper({ stage, color }: { stage: string; color: string }) {
  const activeIdx = TTM_STAGES.indexOf(stage as (typeof TTM_STAGES)[number])
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {TTM_STAGES.map((s, i) => {
          const isActive = i === activeIdx
          const isPast = i < activeIdx
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < TTM_STAGES.length - 1 ? 1 : 'none' }}>
              <div
                style={{
                  width: isActive ? '18px' : '12px',
                  height: isActive ? '18px' : '12px',
                  borderRadius: '50%',
                  background: isActive ? color : isPast ? `${color}55` : 'var(--elevated)',
                  border: isActive ? `3px solid ${color}66` : 'none',
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 12px ${color}88` : 'none',
                  transition: 'all 200ms ease',
                }}
              />
              {i < TTM_STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: i < activeIdx ? `${color}55` : 'var(--elevated)',
                    margin: '0 2px',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', marginTop: '6px' }}>
        {TTM_SHORT.map((label, i) => (
          <div
            key={label}
            style={{
              flex: i < TTM_STAGES.length - 1 ? 1 : 'none',
              fontSize: '0.625rem',
              fontWeight: i === activeIdx ? 700 : 400,
              color: i === activeIdx ? color : 'var(--text-tertiary)',
              textAlign: i === TTM_STAGES.length - 1 ? 'right' : 'left',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 1: Risk Assessment via WhatsApp ─────────────────────────────────────

function Step1() {
  const color = STEP_COLORS[0]

  const questions = [
    { q: 'ما جنسك؟', a: 'ذكر', score: '+2' },
    { q: 'كم عمرك؟', a: '45 سنة', score: '+4' },
    { q: 'ما محيط خصرك؟', a: '105 سم', score: '+3' },
    { q: 'هل سبق تشخيصك بارتفاع السكر؟', a: 'لا', score: '+0' },
    { q: 'هل لديك تاريخ عائلي للسكري؟', a: 'نعم', score: '+2' },
  ]

  return (
    <StepCard num={1} delay={1} color={color}>
      <StepHeader
        num={1}
        title="Risk Assessment via WhatsApp"
        subtitle="Ahmad completes a 5-question SADRISC assessment via WhatsApp Flows — 60 seconds, fully Arabic"
        color={color}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left: WhatsApp conversation */}
        <div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '14px',
            }}
          >
            WhatsApp Flows — Conversation
          </div>
          <div
            style={{
              background: '#0b141a',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* WA header */}
            <div
              style={{
                background: '#1f2c34',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #25d366, #128c7e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                  flexShrink: 0,
                }}
              >
                وز
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#e9edef', fontFamily: "'Noto Sans Arabic', sans-serif", direction: 'rtl' }}>
                  وزارة الصحة
                </p>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: '#8696a0' }}>فحص السكري المجاني</p>
              </div>
            </div>
            {/* bubbles */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {questions.map((item, i) => (
                <React.Fragment key={i}>
                  {/* Question from MOH (left/incoming) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        background: '#202c33',
                        borderRadius: '2px 10px 10px 10px',
                        padding: '7px 12px',
                        maxWidth: '82%',
                      }}
                    >
                      <p
                        dir="rtl"
                        lang="ar"
                        style={{
                          margin: 0,
                          fontFamily: "'Noto Sans Arabic', sans-serif",
                          fontSize: '0.8125rem',
                          color: '#e9edef',
                          lineHeight: 1.5,
                          textAlign: 'right',
                        }}
                      >
                        {item.q}
                      </p>
                    </div>
                  </div>
                  {/* Answer from Ahmad (right/outgoing) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        background: '#005c4b',
                        borderRadius: '10px 2px 10px 10px',
                        padding: '6px 12px',
                        maxWidth: '60%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'space-between',
                      }}
                    >
                      <p
                        dir="rtl"
                        lang="ar"
                        style={{
                          margin: 0,
                          fontFamily: "'Noto Sans Arabic', sans-serif",
                          fontSize: '0.8125rem',
                          color: '#e9edef',
                          textAlign: 'right',
                        }}
                      >
                        {item.a}
                      </p>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#25d366',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {item.score}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Score computation */}
        <div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '14px',
            }}
          >
            Score Computation — SADRISC
          </div>

          {/* score breakdown */}
          <div
            style={{
              background: 'var(--elevated)',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid var(--border)',
              marginBottom: '16px',
            }}
          >
            {[
              { label: 'Sex (male)', pts: sadrisc.breakdown.sex, max: 2 },
              { label: 'Age (45 yrs)', pts: sadrisc.breakdown.age, max: 6 },
              { label: 'Waist (105 cm)', pts: sadrisc.breakdown.waist, max: 3 },
              { label: 'Hyperglycemia history', pts: sadrisc.breakdown.hyperglycemia, max: 2 },
              { label: 'Family history', pts: sadrisc.breakdown.family, max: 2 },
            ].map(({ label, pts, max }) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{label}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: pts > 0 ? '#dc2626' : 'var(--text-tertiary)',
                    }}
                  >
                    +{pts}
                  </span>
                </div>
                <div
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: 'var(--card)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(pts / max) * 100}%`,
                      background: pts > 0 ? '#dc2626' : 'var(--text-tertiary)',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            style={{
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                SADRISC Total
              </div>
              <SADRISCBar score={sadrisc.score} />
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '24px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#dc2626',
                  lineHeight: 1,
                }}
              >
                {sadrisc.score}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>/15</span>
              </div>
              <div
                style={{
                  marginTop: '4px',
                  padding: '2px 10px',
                  borderRadius: '4px',
                  background: 'rgba(220,38,38,0.15)',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  display: 'inline-block',
                }}
              >
                HIGH RISK
              </div>
            </div>
          </div>
        </div>
      </div>

      <SystemExplanation color={color}>
        WhatsApp Flows presents five validated SADRISC questions as an interactive native form — no app install required. Responses are captured in real-time and scored server-side using the Saudi-validated diabetes risk algorithm (PMC7378422). Ahmad scores 11/15, placing him in the High Risk tier (cutoff ≥6) and triggering immediate enrollment in the priority intervention queue.
      </SystemExplanation>
    </StepCard>
  )
}

// ─── Step 2: Behavioral Classification ────────────────────────────────────────

function Step2() {
  const color = STEP_COLORS[1]

  return (
    <StepCard num={2} delay={2} color={color}>
      <StepHeader
        num={2}
        title="Behavioral Classification"
        subtitle="Three computed scores build a complete behavioral profile — risk, engagement, and readiness to change"
        color={color}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left: three score panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* SADRISC score */}
          <div
            style={{
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                SADRISC
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(220,38,38,0.12)',
                  color: '#dc2626',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                High Risk
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#dc2626', lineHeight: 1, marginBottom: '8px' }}>
              {sadrisc.score}
              <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>/15</span>
            </div>
            <SADRISCBar score={sadrisc.score} />
            <div style={{ marginTop: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Sex +{sadrisc.breakdown.sex} · Age +{sadrisc.breakdown.age} · Waist +{sadrisc.breakdown.waist} · Hyper +{sadrisc.breakdown.hyperglycemia} · Family +{sadrisc.breakdown.family}
            </div>
          </div>

          {/* HES score */}
          <div
            style={{
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Health Engagement Score
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(75,85,99,0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                Dormant
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-tertiary)', lineHeight: 1, marginBottom: '8px' }}>
              {hes.score}
              <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>/100</span>
            </div>
            <HESBar score={hes.score} />
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              No articles read, 2 logins in 90 days — almost no platform activity
            </div>
          </div>

          {/* TTM Stage */}
          <div
            style={{
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                TTM Stage
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color }}>{ttm.stage}</span>
            </div>
            <TTMStepper stage={ttm.stage} color={color} />
            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {ttm.reason}
            </div>
          </div>
        </div>

        {/* Right: derived outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* COM-B Barrier */}
          <div
            style={{
              background: 'rgba(6,182,212,0.06)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              COM-B Barrier Diagnosed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span
                style={{
                  padding: '4px 14px',
                  borderRadius: '6px',
                  background: 'rgba(6,182,212,0.15)',
                  color: '#06b6d4',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {comb.barrier}
              </span>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {comb.reason}
            </p>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'var(--elevated)',
                border: '1px solid var(--border)',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '3px' }}>
                Intervention target
              </span>
              {comb.intervention}
            </div>
          </div>

          {/* Priority Score */}
          <div
            style={{
              background: 'rgba(220,38,38,0.05)',
              border: '1px solid rgba(220,38,38,0.15)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Composite Priority Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: '#dc2626',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {priority}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>/100</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: '8px', borderRadius: '4px', background: 'var(--elevated)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${priority}%`,
                      background: '#dc2626',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              0.4 × risk({sadrisc.score}/15) + 0.25 × (1−engagement) + 0.35 × propensity
            </div>
          </div>

          {/* Classification summary */}
          <div
            style={{
              background: `${color}08`,
              border: `1px solid ${color}25`,
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '12px' }}>
              Classification Summary
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Risk', 'High (11/15)'],
                ['Engagement', 'Dormant (3/100)'],
                ['TTM Stage', 'Precontemplation'],
                ['COM-B', 'Capability barrier'],
                ['Priority', `${priority}/100`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SystemExplanation color={color}>
        The classification engine runs three parallel pipelines: SADRISC for clinical risk (validated against 4,000 Saudi patients), Health Engagement Score (HES) for platform behavior using a recency-decay function, and TTM stage classification based on screening intent signals. COM-B barrier diagnosis is determined by the combination of content consumption and action history. Ahmad's profile — high risk, dormant engagement, no prior action — places him in the top 8% priority tier.
      </SystemExplanation>
    </StepCard>
  )
}

// ─── Step 3: Framework Selection ─────────────────────────────────────────────

function Step3() {
  const color = STEP_COLORS[2]

  const eastItems = [
    { key: 'Easy', active: framework.east_overlay.includes('Easy') },
    { key: 'Attractive', active: framework.east_overlay.includes('Attractive') },
    { key: 'Social', active: framework.east_overlay.includes('Social') },
    { key: 'Timely', active: framework.east_overlay.includes('Timely') },
  ]

  return (
    <StepCard num={3} delay={3} color={color}>
      <StepHeader
        num={3}
        title="Framework Selection"
        subtitle="The behavioral engine maps TTM stage + COM-B barrier to the optimal intervention framework"
        color={color}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left: decision tree */}
        <div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '16px',
            }}
          >
            Decision Path
          </div>

          {/* Node chain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* TTM node */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '10px 10px 0 0',
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.2)',
                borderBottom: 'none',
              }}
            >
              <div style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                TTM Stage
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626' }}>Precontemplation</div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', background: 'var(--elevated)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}>↓</span>
            </div>

            {/* COM-B node */}
            <div
              style={{
                padding: '14px 18px',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.2)',
                borderTop: 'none',
                borderBottom: 'none',
              }}
            >
              <div style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                COM-B Barrier
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4' }}>Capability</div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', background: 'var(--elevated)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}>↓</span>
            </div>

            {/* Framework result — highlighted */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: '0 0 10px 10px',
                background: `${color}12`,
                border: `2px solid ${color}55`,
                boxShadow: `0 0 0 4px ${color}08`,
              }}
            >
              <div style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                Selected Framework
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color }}>
                {framework.primary}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                + {framework.secondary}
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              fontStyle: 'italic',
            }}
          >
            <span style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--text-primary)' }}>Evidence:</span> Cialdini 2001 (authority principle) — MOH endorsement activates reflective motivation in unaware populations. Family-duty framing leverages Saudi collectivist values to reinforce personal health as a social responsibility.
          </div>
        </div>

        {/* Right: EAST checklist + reason */}
        <div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '16px',
            }}
          >
            EAST Overlay
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {eastItems.map(({ key, active }) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: active ? `${color}0c` : 'var(--elevated)',
                  border: `1px solid ${active ? `${color}30` : 'var(--border)'}`,
                  opacity: active ? 1 : 0.45,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: active ? `${color}20` : 'var(--card)',
                    border: `1.5px solid ${active ? color : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', color: active ? color : 'var(--text-tertiary)', fontWeight: 700 }}>
                    {active ? '✓' : '✗'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {key}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    {key === 'Easy' && 'Remove friction — simplify booking'}
                    {key === 'Attractive' && 'Social proof makes action appealing'}
                    {key === 'Social' && 'Peer comparison activates norms'}
                    {key === 'Timely' && 'Not yet — no actionable trigger available'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Framework rationale */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: `${color}08`,
              border: `1px solid ${color}20`,
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '8px' }}>
              Rationale
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {framework.reason}
            </p>
          </div>
        </div>
      </div>

      <SystemExplanation color={color}>
        The framework selection engine uses a lookup matrix of 25 TTM × COM-B combinations, each mapped to a primary behavioral science framework with evidence weighting from meta-analyses. For Ahmad's Precontemplation + Capability profile, Authority Endorsement is selected as primary — MOH credibility activates reflective motivation in unaware populations, and family-duty framing leverages Saudi collectivist values. Family Duty is applied as secondary. The EAST overlay checks which attributes the selected framework satisfies — Attractive (authority endorsement is attention-grabbing) and Timely (message sent at optimal engagement window) are active. Easy and Social require additional actions (booking simplification, family involvement) activated in later sequence steps.
      </SystemExplanation>
    </StepCard>
  )
}

// ─── Step 4: Message Delivery ─────────────────────────────────────────────────

function Step4() {
  const color = STEP_COLORS[3]

  const waText = personalise(whatsappMsg.content_ar, vars)
  const smsText = personalise(smsMsg.content_ar, vars)
  const pushText = personalise(pushMsg.content_ar, vars)

  return (
    <StepCard num={4} delay={4} color={color}>
      <StepHeader
        num={4}
        title="Message Delivery"
        subtitle="The same personalized message adapted for three channels — WhatsApp, SMS, and push notification"
        color={color}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* WhatsApp */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>WhatsApp</span>
          </div>
          {/* WA bubble mock */}
          <div
            style={{
              background: '#0b141a',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ background: '#1f2c34', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#e9edef', fontFamily: "'Noto Sans Arabic', sans-serif", direction: 'rtl' }}>
                وزارة الصحة
              </p>
            </div>
            <div style={{ padding: '12px' }}>
              <div
                style={{
                  background: '#005c4b',
                  borderRadius: '2px 10px 10px 10px',
                  padding: '10px 14px',
                }}
              >
                <p
                  dir="rtl"
                  lang="ar"
                  style={{
                    margin: 0,
                    fontFamily: "'Noto Sans Arabic', sans-serif",
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    color: '#e9edef',
                    textAlign: 'right',
                  }}
                >
                  {waText}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  {['إلغاء', 'تغيير الموعد'].map((btn) => (
                    <span
                      key={btn}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        fontFamily: "'Noto Sans Arabic', sans-serif",
                        border: '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                      }}
                    >
                      {btn}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.625rem', color: '#8696a0' }}>09:14</span>
                  <span style={{ color: '#53bdeb', fontSize: '0.75rem' }}>✓✓</span>
                </div>
              </div>
            </div>
          </div>
          {/* Validation scores */}
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { label: 'OSMAN', value: String(whatsappMsg.osman_score), ok: whatsappMsg.osman_score >= 70 },
              { label: 'Arabic', value: `${Math.round(whatsappMsg.arabic_ratio * 100)}%`, ok: true },
              { label: 'PII', value: 'None', ok: true },
            ].map(({ label, value, ok }) => (
              <span
                key={label}
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: ok ? '#10b981' : 'var(--text-tertiary)',
                }}
              >
                {ok ? '✓' : '·'} {label} <strong style={{ color: 'var(--text-primary)' }}>{value}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* SMS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#06b6d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>SMS</span>
          </div>
          <div
            style={{
              background: 'var(--elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>MOH-SEHHATY</span>
            </div>
            <div style={{ padding: '14px' }}>
              <p
                dir="rtl"
                lang="ar"
                style={{
                  margin: 0,
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                  fontSize: '0.9375rem',
                  lineHeight: 1.75,
                  color: 'var(--text-primary)',
                  textAlign: 'right',
                }}
              >
                {smsText}
              </p>
            </div>
            {/* char bar */}
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{smsMsg.char_count}/70 chars</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>
                  {smsMsg.char_count}/70
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--card)', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(smsMsg.char_count / 70) * 100}%`,
                    background: '#10b981',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { label: 'OSMAN', value: String(smsMsg.osman_score), ok: smsMsg.osman_score >= 70 },
              { label: 'Arabic', value: `${Math.round(smsMsg.arabic_ratio * 100)}%`, ok: true },
              { label: 'PII', value: 'None', ok: true },
            ].map(({ label, value, ok }) => (
              <span
                key={label}
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: ok ? '#10b981' : 'var(--text-tertiary)',
                }}
              >
                {ok ? '✓' : '·'} {label} <strong style={{ color: 'var(--text-primary)' }}>{value}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Push */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Push Notification</span>
          </div>
          <div
            style={{
              background: 'var(--elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--card)', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
              iOS Notification Preview
            </div>
            <div style={{ padding: '14px' }}>
              <div
                style={{
                  background: 'var(--card)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '7px',
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#fff', fontFamily: "'Noto Sans Arabic', sans-serif" }}>صح</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sehhaty</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--text-secondary)' }}>now</span>
                </div>
                <p
                  dir="rtl"
                  lang="ar"
                  style={{
                    margin: '0 0 8px',
                    fontFamily: "'Noto Sans Arabic', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textAlign: 'right',
                    lineHeight: 1.5,
                  }}
                >
                  {pushText}
                </p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  <button
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '6px',
                      background: 'rgba(37,99,235,0.12)',
                      border: '1px solid rgba(37,99,235,0.2)',
                      borderRadius: '7px',
                      color: '#3b82f6',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    إلغاء الموعد · Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { label: 'OSMAN', value: String(pushMsg.osman_score), ok: pushMsg.osman_score >= 70 },
              { label: 'Arabic', value: `${Math.round(pushMsg.arabic_ratio * 100)}%`, ok: true },
              { label: 'PII', value: 'None', ok: true },
            ].map(({ label, value, ok }) => (
              <span
                key={label}
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: ok ? '#10b981' : 'var(--text-tertiary)',
                }}
              >
                {ok ? '✓' : '·'} {label} <strong style={{ color: 'var(--text-primary)' }}>{value}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      <SystemExplanation color={color}>
        Each message is personalized with Ahmad's Arabic name, region, and nearest clinic before dispatch. The multi-channel engine selects the optimal delivery window (WhatsApp first, SMS fallback, push if app-installed) and validates each variant against three quality gates: OSMAN readability score (≥70 required), Arabic character ratio (≥90%), and PII scan. Ahmad's WhatsApp message scores OSMAN {whatsappMsg.osman_score} with {Math.round(whatsappMsg.arabic_ratio * 100)}% Arabic and zero PII tokens.
      </SystemExplanation>
    </StepCard>
  )
}

// ─── Step 5: Outcome & Learning ───────────────────────────────────────────────

function Step5() {
  const color = STEP_COLORS[4]

  // Bandit: Authority Endorsement arm — alpha goes 30 → 31
  const armBefore = { alpha: 30, beta: 55, name: 'Authority Endorsement' }
  const armAfter = { alpha: 31, beta: 55, name: 'Authority Endorsement' }
  const totalBefore = armBefore.alpha + armBefore.beta
  const totalAfter = armAfter.alpha + armAfter.beta
  const pctBefore = Math.round((armBefore.alpha / totalBefore) * 100)
  const pctAfter = Math.round((armAfter.alpha / totalAfter) * 100)

  return (
    <StepCard num={5} delay={5} color={color}>
      <StepHeader
        num={5}
        title="Outcome & Learning"
        subtitle="Ahmad's screening is pre-reserved at Al-Suwaidi PHC — he doesn't cancel, and the bandit learns"
        color={color}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left: Booking outcome */}
        <div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '16px',
            }}
          >
            Booking Flow
          </div>

          {/* Tap → Sehhaty → Booked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                icon: '👆',
                title: 'Ahmad keeps his pre-reserved appointment',
                sub: 'WhatsApp quick-reply button',
                color: '#d97706',
              },
              {
                icon: null,
                arrow: true,
              },
              {
                icon: '📱',
                title: 'Sehhaty app opens',
                sub: 'Deep-link pre-fills Al-Suwaidi PHC',
                color,
              },
              {
                icon: null,
                arrow: true,
              },
              {
                icon: '✓',
                title: 'Screening booked',
                sub: 'Al-Suwaidi Primary Health Care Centre',
                color,
                success: true,
              },
            ].map((item, i) => {
              if ('arrow' in item && item.arrow) {
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '19px', paddingTop: '2px', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '1.2rem', lineHeight: 1 }}>↓</span>
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: item.success ? `${color}10` : 'var(--elevated)',
                    border: `1px solid ${item.success ? `${color}30` : 'var(--border)'}`,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.success ? `${color}20` : 'var(--card)',
                      border: `1.5px solid ${item.success ? color : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: item.icon === '✓' ? '1rem' : '1.25rem',
                      color: item.icon === '✓' ? color : 'inherit',
                      fontWeight: 700,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Campaign stat */}
          <div
            style={{
              marginTop: '16px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: `${color}08`,
              border: `1px solid ${color}20`,
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color }}>1</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              of <strong style={{ color: 'var(--text-primary)' }}>1,192</strong> bookings this month from this campaign
            </span>
          </div>
        </div>

        {/* Right: Bandit update + NNT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
            }}
          >
            Bandit Posterior Update
          </div>

          {/* Before/after */}
          <div
            style={{
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Authority Endorsement arm — Beta({armBefore.alpha}, {armBefore.beta}) → Beta({armAfter.alpha}, {armAfter.beta})
            </div>

            {/* Before */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                <span>Before (α=30)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{pctBefore}% conversion estimate</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--card)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pctBefore * 2}%`,
                    background: 'rgba(16,185,129,0.35)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* After */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                <span style={{ color }}>After (α=31) ← Ahmad booked</span>
                <span style={{ fontFamily: 'var(--font-mono)', color }}>{pctAfter}% conversion estimate</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'var(--card)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pctAfter * 2}%`,
                    background: color,
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: `${color}08`,
                border: `1px solid ${color}20`,
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              Alpha incremented by 1 (success event). Thompson Sampling will now sample this arm slightly more often in future explorations.
            </div>
          </div>

          {/* NNT improvement */}
          <div
            style={{
              background: `${color}08`,
              border: `1px solid ${color}25`,
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '12px' }}>
              Number Needed to Treat
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-tertiary)', lineHeight: 1, textDecoration: 'line-through' }}>
                  18.3
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>campaign start</div>
              </div>
              <div style={{ fontSize: '1.5rem', color }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>
                  12.5
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '3px' }}>current NNT</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              32% fewer messages needed per booking as bandit optimizes arm selection over time.
            </div>
          </div>
        </div>
      </div>

      <SystemExplanation color={color}>
        When Ahmad taps the booking button, a deep-link opens the Sehhaty app pre-filled with Al-Suwaidi PHC and available slots. On confirmation, a success event is posted to the bandit service, incrementing the Authority Endorsement arm's alpha parameter from 30 to 31. Thompson Sampling then updates the arm's posterior — the system has one more data point that Authority Endorsement works for this user cohort. Across 1,192 bookings this month, the NNT has improved from 18.3 to 12.5, representing a 32% efficiency gain in message spend. Using the default effect principle (Mehta et al. 2018: opt-out screening 29.1% vs opt-in 9.6%), Ahmad's screening was pre-reserved — the messaging prevents cancellation rather than generating a booking.
      </SystemExplanation>
    </StepCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JourneyPage() {
  return (
    <div
      className="animate-fade-in"
      style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '72px', fontFamily: 'var(--font-body)' }}
    >
      {/* Page header */}
      <div
        style={{
          marginBottom: '2.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: '0.6875rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Demo Flow → Step 5 of 5 → End-to-End Journey
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Ahmad Al-Qahtani — End-to-End Journey
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            margin: 0,
            maxWidth: '680px',
            lineHeight: 1.6,
          }}
        >
          One user. Five stages. From first risk signal to confirmed booking — every score computed in real-time from real data. This is what the platform does for each of the{' '}
          <strong style={{ color: 'var(--text-primary)' }}>12,847</strong> high-risk users in the priority segment.
        </p>

        {/* User identity strip */}
        <div
          style={{
            marginTop: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
              fontFamily: "'Noto Sans Arabic', sans-serif",
            }}
          >
            أح
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Ahmad Al-Qahtani
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
              <span lang="ar" style={{ fontFamily: "'Noto Sans Arabic', sans-serif", fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                أحمد القحطاني
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>·</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>45 yrs · Male · Riyadh</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>·</span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#dc2626', fontWeight: 600 }}>
                SADRISC {sadrisc.score}/15
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <Step1 />
        <StepConnector fromColor={STEP_COLORS[0]} toColor={STEP_COLORS[1]} />
        <Step2 />
        <StepConnector fromColor={STEP_COLORS[1]} toColor={STEP_COLORS[2]} />
        <Step3 />
        <StepConnector fromColor={STEP_COLORS[2]} toColor={STEP_COLORS[3]} />
        <Step4 />
        <StepConnector fromColor={STEP_COLORS[3]} toColor={STEP_COLORS[4]} />
        <Step5 />
      </div>
    </div>
  )
}
