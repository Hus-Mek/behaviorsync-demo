import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sampleUsers, segments } from '../data/users'
import {
  computeSADRISC,
  computeHES,
  classifyTTM,
  diagnoseCOMB,
  selectFramework,
  computePriority,
} from '../lib/scoring'
// ─── Helpers ─────────────────────────────────────────────────────────────────

function bool(v: boolean) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: v ? 'var(--success)' : 'var(--text-tertiary)',
      }}
    >
      {v ? 'Yes' : 'No'}
    </span>
  )
}

function DL({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: '5px', columnGap: '12px' }}>
      {rows.map(([label, val]) => (
        <>
          <dt
            key={label + '-dt'}
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              lineHeight: '1.6',
              alignSelf: 'center',
            }}
          >
            {label}
          </dt>
          <dd
            key={label + '-dd'}
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
              fontFamily: typeof val === 'string' || typeof val === 'number' ? 'inherit' : undefined,
              lineHeight: '1.6',
              alignSelf: 'center',
            }}
          >
            {val}
          </dd>
        </>
      ))}
    </dl>
  )
}

// ─── SADRISC segmented bar ────────────────────────────────────────────────────

function SADRISCBar({ score, max = 15 }: { score: number; max?: number }) {
  const riskColor = score >= 6 ? 'var(--danger)' : score >= 5 ? 'var(--warning)' : 'var(--success)'
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginTop: '6px' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '8px',
            borderRadius: '2px',
            background: i < score ? riskColor : 'var(--elevated)',
            transition: 'background 300ms ease',
          }}
        />
      ))}
    </div>
  )
}

// ─── HES bar ─────────────────────────────────────────────────────────────────

function HESBar({ score }: { score: number }) {
  const levelColor =
    score > 75 ? 'var(--success)' :
    score > 55 ? 'var(--accent)' :
    score > 35 ? 'var(--warning)' :
    score > 15 ? '#8b5cf6' :
    'var(--text-tertiary)'
  return (
    <div
      style={{
        height: '4px',
        borderRadius: '2px',
        background: 'var(--elevated)',
        overflow: 'hidden',
        marginTop: '6px',
      }}
    >
      <div
        className="animate-fill-bar"
        style={{
          height: '100%',
          width: `${score}%`,
          background: levelColor,
          borderRadius: '2px',
        }}
      />
    </div>
  )
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const [bg, color] =
    level === 'Champion' ? ['rgba(22,163,74,0.15)', 'var(--success)'] :
    level === 'Active'   ? ['rgba(37,99,235,0.12)', 'var(--accent)'] :
    level === 'Moderate' ? ['rgba(202,138,4,0.12)', 'var(--warning)'] :
    level === 'Low'      ? ['rgba(139,92,246,0.12)', '#8b5cf6'] :
    ['rgba(75,85,99,0.15)', 'var(--text-secondary)']
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 8px',
        borderRadius: '4px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        background: bg,
        color,
      }}
    >
      {level}
    </span>
  )
}

// ─── TTM Dot Stepper ──────────────────────────────────────────────────────────

const TTM_STAGES = ['Precontemplation', 'Contemplation', 'Preparation', 'Action', 'Maintenance'] as const
const TTM_LABELS = ['Pre', 'Contemplate', 'Prepare', 'Act', 'Maintain']

function TTMStepper({ stage }: { stage: string }) {
  const activeIdx = TTM_STAGES.indexOf(stage as (typeof TTM_STAGES)[number])
  return (
    <div style={{ marginTop: '6px' }}>
      {/* connector track + dots */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {TTM_STAGES.map((s, i) => {
          const isActive = i === activeIdx
          const isPast = i < activeIdx
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < TTM_STAGES.length - 1 ? 1 : 'none' }}>
              <div
                style={{
                  width: isActive ? '14px' : '10px',
                  height: isActive ? '14px' : '10px',
                  borderRadius: '50%',
                  background: isActive
                    ? 'var(--accent)'
                    : isPast
                    ? 'rgba(37,99,235,0.35)'
                    : 'var(--elevated)',
                  border: isActive ? '2px solid rgba(37,99,235,0.5)' : 'none',
                  flexShrink: 0,
                  transition: 'all 200ms ease',
                  boxShadow: isActive ? '0 0 8px rgba(37,99,235,0.5)' : 'none',
                }}
              />
              {i < TTM_STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: i < activeIdx ? 'rgba(37,99,235,0.35)' : 'var(--elevated)',
                    marginLeft: '1px',
                    marginRight: '1px',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      {/* labels */}
      <div style={{ display: 'flex', marginTop: '5px' }}>
        {TTM_LABELS.map((label, i) => {
          const isActive = i === activeIdx
          return (
            <div
              key={label}
              style={{
                flex: i < TTM_STAGES.length - 1 ? 1 : 'none',
                fontSize: '0.625rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                textAlign: i === TTM_STAGES.length - 1 ? 'right' : 'left',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Priority bar ─────────────────────────────────────────────────────────────

function PriorityBar({ score }: { score: number }) {
  const color =
    score >= 70 ? 'var(--danger)' :
    score >= 45 ? 'var(--warning)' :
    'var(--success)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
      <div
        style={{
          flex: 1,
          height: '4px',
          borderRadius: '2px',
          background: 'var(--elevated)',
          overflow: 'hidden',
        }}
      >
        <div
          className="animate-fill-bar"
          style={{
            height: '100%',
            width: `${score}%`,
            background: color,
            borderRadius: '2px',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          color: 'var(--text-primary)',
          flexShrink: 0,
        }}
      >
        {score}/100
      </span>
    </div>
  )
}

// ─── COM-B barrier chip ───────────────────────────────────────────────────────

function COMBChip({ barrier }: { barrier: string }) {
  const [bg, color] =
    barrier === 'Capability'             ? ['rgba(6,182,212,0.1)', '#06b6d4'] :
    barrier === 'Opportunity-Physical'   ? ['rgba(139,92,246,0.12)', '#8b5cf6'] :
    barrier === 'Motivation-Reflective'  ? ['rgba(202,138,4,0.12)', 'var(--warning)'] :
    /* Motivation-Automatic */             ['rgba(220,38,38,0.1)', 'var(--danger)']
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: bg,
        color,
      }}
    >
      {barrier}
    </span>
  )
}

// ─── Rule Builder (visual condition pills) ────────────────────────────────────

function RuleBuilder() {
  const conditions = [
    { label: 'age', op: '≥', value: '40' },
    { label: 'BMI', op: '≥', value: '30' },
    { label: 'HES', op: '<', value: '30' },
  ]
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        {conditions.map((c, i) => (
          <React.Fragment key={c.label}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'var(--accent-subtle)',
                border: '1px solid rgba(37,99,235,0.25)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
              }}
            >
              {c.label} {c.op} {c.value}
            </span>
            {i < conditions.length - 1 && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                AND
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>
        12,847 users matched
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SegmentsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>(sampleUsers[0].id)
  const navigate = useNavigate()

  const user = sampleUsers.find((u) => u.id === selectedUserId)!
  const sadrisc = computeSADRISC(user)
  const hes = computeHES(user)
  const ttm = classifyTTM(user)
  const comb = diagnoseCOMB(user, ttm.stage)
  const framework = selectFramework(ttm.stage, comb.barrier)
  const priority = computePriority(sadrisc.score, hes.score)

  return (
    <div
      className="animate-fade-in"
      style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '56px', fontFamily: 'var(--font-body)' }}
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
          Demo Flow → Step 1 of 4 → Audience Segmentation
        </div>
        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Audience Segmentation & Risk Classification
        </h1>
        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: 0,
          maxWidth: '640px',
          lineHeight: 1.6,
        }}>
          The segmentation engine identifies at-risk users using SADRISC (Saudi diabetes risk quiz), health engagement scoring, and behavioral stage classification. Select a user below to see their full risk profile computed in real-time. This platform complements Saudi Arabia's existing Taakkad ({'تأكد'}) national screening initiative by adding behavioral targeting to drive higher screening uptake.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TOP SECTION — Segments
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="animate-slide-up delay-2" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            Segments
          </h2>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
            {segments.reduce((a, s) => a + s.count, 0).toLocaleString()} users total
          </span>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
          These segments use rule-based conditions (JsonLogic) — transparent, auditable, and PDPL-compliant. ML clustering deferred to Phase 2 when we have enough behavioral data.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {segments.map((seg, idx) => {
            const isPrimary = idx === 0
            return (
              <div
                key={seg.id}
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${isPrimary ? 'rgba(37,99,235,0.25)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  transition: 'border-color 180ms ease, background 180ms ease, box-shadow 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.14)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--elevated)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = isPrimary ? 'rgba(37,99,235,0.25)' : 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--card)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                {/* count */}
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {seg.count.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '1px' }}>users</div>

                {/* names */}
                <div style={{ marginTop: '10px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {seg.name}
                </div>
                <div
                  lang="ar"
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', var(--font-body)", marginTop: '2px' }}
                >
                  {seg.name_ar}
                </div>

                {/* rule expression */}
                <div style={{ marginTop: '10px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {seg.rules}
                </div>

                {/* expanded rule builder only for first segment */}
                {isPrimary && <RuleBuilder />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          BOTTOM SECTION — User Classification
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="animate-slide-up delay-3">
        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            User Classification
          </h2>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
            {sampleUsers.length} sample profiles
          </span>
        </div>

        {/* User selector tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          {sampleUsers.map((u) => {
            const isActive = u.id === selectedUserId
            const uSadrisc = computeSADRISC(u)
            const uHes = computeHES(u)
            return (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                style={{
                  background: isActive ? 'var(--elevated)' : 'var(--card)',
                  border: `1px solid ${isActive ? 'rgba(37,99,235,0.35)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 150ms ease, background 150ms ease, box-shadow 0.2s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.14)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--elevated)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--card)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.name_en}
                </div>
                <div
                  lang="ar"
                  style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', var(--font-body)", marginTop: '2px' }}
                >
                  {u.name_ar}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '7px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: uSadrisc.risk === 'High' ? 'var(--danger)' : uSadrisc.risk === 'Elevated' ? 'var(--warning)' : 'var(--success)' }}>
                    SADR {uSadrisc.score}
                  </span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)' }}>·</span>
                  <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                    HES {uHes.score}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Classification panel — 2-column layout */}
        <div
          key={selectedUserId}
          className="animate-slide-up"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {/* ── LEFT COLUMN: Demographics + Engagement ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Demographics */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Demographics
              </div>
              <DL
                rows={[
                  ['English', <span style={{ fontWeight: 500 }}>{user.name_en}</span>],
                  ['Arabic', <span lang="ar" style={{ fontFamily: "'Noto Sans Arabic', var(--font-body)", direction: 'rtl' }}>{user.name_ar}</span>],
                  ['Age', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.age}</span>],
                  ['Gender', <span style={{ textTransform: 'capitalize' }}>{user.gender}</span>],
                  ['Region', <>{user.region} <span lang="ar" style={{ fontFamily: "'Noto Sans Arabic', var(--font-body)", color: 'var(--text-secondary)', marginLeft: '6px' }}>{user.region_ar}</span></>],
                  ['BMI', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.bmi} kg/m²</span>],
                  ['Waist', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.waist_cm} cm</span>],
                  ['Family DM', bool(user.family_diabetes)],
                  ['Prior Hyperglycemia', bool(user.hyperglycemia_history)],
                ]}
              />
            </div>

            {/* Engagement */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Engagement
              </div>
              <DL
                rows={[
                  ['Logins (90d)', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.logins_90d}</span>],
                  ['Articles read', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.articles_read}</span>],
                  ['Screening views', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.screening_views}</span>],
                  ['Booking attempts', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.booking_attempts}</span>],
                  ['Screenings done', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.screenings_completed}</span>],
                  ['Last login', <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user.last_login_days_ago}d ago</span>],
                  ['Clinic', <>{user.clinic_name} <span lang="ar" style={{ fontFamily: "'Noto Sans Arabic', var(--font-body)", color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>{user.clinic_name_ar}</span></>],
                ]}
              />
            </div>
          </div>

          {/* ── RIGHT COLUMN: Scoring ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '80vh', overflowY: 'auto', paddingRight: '4px' }}>

            {/* SADRISC */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  SADRISC Risk Score
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: '4px',
                    background: sadrisc.risk === 'High' ? 'rgba(220,38,38,0.12)' : sadrisc.risk === 'Elevated' ? 'rgba(202,138,4,0.12)' : 'rgba(22,163,74,0.12)',
                    color: sadrisc.risk === 'High' ? 'var(--danger)' : sadrisc.risk === 'Elevated' ? 'var(--warning)' : 'var(--success)',
                  }}
                >
                  {sadrisc.risk}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {sadrisc.score}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>/15</span>
              </div>
              <SADRISCBar score={sadrisc.score} />
              <div style={{ marginTop: '10px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Sex +{sadrisc.breakdown.sex} · Age +{sadrisc.breakdown.age} · Waist +{sadrisc.breakdown.waist} · Hyperglycemia +{sadrisc.breakdown.hyperglycemia} · Family +{sadrisc.breakdown.family}
              </div>
            </div>

            {/* SADRISC explanatory note */}
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              SADRISC is a Saudi-validated risk tool (Al-Rubeaan et al., 2020). We chose it over the European FINDRISC because it achieves higher accuracy (AUC 0.76 vs 0.71) with fewer variables — and all 5 can be collected via WhatsApp. SADRISC determines WHO gets messaged first in a resource-constrained rollout — high-risk users are prioritized. Message content is driven by COM-B (Capability, Opportunity, Motivation) barrier diagnosis, not risk score. SADRISC is a prioritization tool, not a persuasion tool.
            </p>

            {/* SADRISC computation location note */}
            <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              SADRISC scoring runs as a Python function in the FastAPI backend — triggered when a user completes the WhatsApp Flows assessment. The score is stored in user_profiles.sadrisc_score and drives segment membership evaluation.
            </p>

            {/* HES */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Health Engagement Score
                </div>
                <LevelBadge level={hes.level} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {hes.score}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>/100</span>
              </div>
              <HESBar score={hes.score} />
              <div style={{ marginTop: '10px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Login {hes.components.loginScore} · Feature {hes.components.featureScore} · Content {hes.components.contentScore} · Action {hes.components.actionScore}
              </div>
            </div>

            {/* TTM Stage */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  TTM Stage
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)' }}>
                  {ttm.stage}
                </span>
              </div>
              <TTMStepper stage={ttm.stage} />
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {ttm.reason}
              </div>
            </div>

            {/* TTM explanatory note */}
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              The Transtheoretical Model (Prochaska &amp; DiClemente, 1983) classifies users by readiness to change. Someone who has never heard of screening (Precontemplation) needs a very different message than someone who started booking but abandoned (Preparation). <em>Note: TTM is used as a practical segmentation heuristic, not a causal model. COM-B provides the causal diagnosis.</em>
            </p>

            {/* COM-B Barrier */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                COM-B Barrier
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <COMBChip barrier={comb.barrier} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                {comb.reason}
              </div>
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'var(--elevated)',
                  border: '1px solid var(--border)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '3px' }}>
                  Intervention
                </span>
                {comb.intervention}
              </div>
            </div>

            {/* COM-B explanatory note */}
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              COM-B (Michie et al., 2011) diagnoses WHY someone isn't acting: do they lack knowledge (Capability), access (Opportunity), or motivation? This determines which behavioral framework we select. Evidence: barrier-matched interventions are ~56% more likely to improve outcomes (Baker et al. 2015 Cochrane review, OR=1.56). Dynamic tailoring — which our contextual bandit provides — further amplifies this effect (Noar et al., 88 studies, OR=1.36).
            </p>

            {/* Priority Score */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Composite Priority Score
              </div>
              <PriorityBar score={priority} />
              <div style={{ marginTop: '6px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                0.4 × risk + 0.25 × (1−engagement) + 0.35 × propensity
              </div>
            </div>

            {/* Framework selected + CTA */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                Selected Framework
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 600, background: 'rgba(37,99,235,0.12)', color: 'var(--accent)' }}>
                  {framework.primary}
                </span>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 500, background: 'var(--elevated)', color: 'var(--text-secondary)' }}>
                  {framework.secondary}
                </span>
                {framework.east_overlay.map((e) => (
                  <span key={e} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 500, background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>
                    EAST:{e}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                {framework.reason}
              </div>
              <button
                onClick={() => navigate(`/compose/${user.id}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'opacity 150ms ease',
                  width: '100%',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                View Framework →
              </button>
            </div>

          </div>
          {/* end RIGHT COLUMN */}
        </div>
        {/* end 2-col grid */}
      </div>
      {/* end BOTTOM SECTION */}
    </div>
  )
}

