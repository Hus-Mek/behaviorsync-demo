import { useParams } from 'react-router-dom'
import { sampleUsers } from '../data/users'
import { messageTemplates, type MessageTemplate } from '../data/messages'
import {
  computeSADRISC,
  computeHES,
  classifyTTM,
  diagnoseCOMB,
  computePriority,
  selectFramework,
} from '../lib/scoring'

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function personalise(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

const TTM_COLORS: Record<string, string> = {
  Precontemplation: '#dc2626',
  Contemplation:    '#ca8a04',
  Preparation:      '#3b82f6',
  Action:           '#16a34a',
  Maintenance:      '#22c55e',
}

const COMBB_COLORS: Record<string, string> = {
  'Capability':              '#8b5cf6',
  'Opportunity-Physical':    '#06b6d4',
  'Motivation-Reflective':   '#f59e0b',
  'Motivation-Automatic':    '#ef4444',
}

/* ─── Card wrapper ───────────────────────────────────────────────────────── */
function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Section heading ─────────────────────────────────────────────────────── */
function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </h2>
      {right}
    </div>
  )
}

/* ─── EAST pill ────────────────────────────────────────────────────────────── */
function EastPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 500,
        background: active ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.08)'}`,
        color: active ? '#10b981' : 'var(--text-secondary)',
        opacity: active ? 1 : 0.5,
      }}
    >
      <span style={{ fontSize: '0.6875rem' }}>{active ? '✓' : '✗'}</span>
      {label}
    </div>
  )
}

/* ─── Score chip ───────────────────────────────────────────────────────────── */
function ScoreChip({ label, value, ok = true }: { label: string; value: string; ok?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        color: ok ? '#10b981' : 'var(--text-secondary)',
      }}
    >
      <span style={{ opacity: 0.5 }}>{ok ? '✓' : '·'}</span>
      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{label}</span>{' '}
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </span>
  )
}

/* ─── Text button ──────────────────────────────────────────────────────────── */
function TextBtn({
  children,
  color = 'var(--accent)',
}: {
  children: React.ReactNode
  color?: string
}) {
  return (
    <button
      style={{
        background: 'none',
        border: 'none',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
        color,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'none'
      }}
    >
      {children}
    </button>
  )
}

/* ─── Message Card ─────────────────────────────────────────────────────────── */
function MessageCard({
  msg,
  vars,
  index,
}: {
  msg: MessageTemplate
  vars: Record<string, string>
  index: number
}) {
  const ar = personalise(msg.content_ar, vars)
  const en = personalise(msg.content_en, vars)

  const channelBadgeColor: Record<string, string> = {
    whatsapp: '#25d366',
    sms:      '#06b6d4',
    push:     '#8b5cf6',
  }

  return (
    <div
      className={`animate-slide-up delay-${Math.min(index + 2, 6)}`}
      style={{
        background: 'var(--elevated)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {msg.framework}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
            — {msg.technique}
          </span>
          <span
            style={{
              padding: '1px 7px',
              borderRadius: '20px',
              fontSize: '0.625rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: channelBadgeColor[msg.channel],
              background: `${channelBadgeColor[msg.channel]}18`,
              border: `1px solid ${channelBadgeColor[msg.channel]}30`,
              textTransform: 'uppercase',
            }}
          >
            {msg.channel}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <TextBtn color="#10b981">Approve</TextBtn>
          <TextBtn color="var(--text-secondary)">Edit</TextBtn>
          <TextBtn color="var(--text-secondary)">Regenerate</TextBtn>
        </div>
      </div>

      {/* Arabic text block */}
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--elevated)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <p
          dir="rtl"
          lang="ar"
          style={{
            margin: 0,
            fontFamily: "'Noto Sans Arabic', sans-serif",
            fontSize: '0.9375rem',
            lineHeight: 1.8,
            color: 'var(--text-primary)',
            textAlign: 'right',
          }}
        >
          {ar}
        </p>
      </div>

      {/* English translation */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            fontStyle: 'italic',
          }}
        >
          {en}
        </p>
      </div>

      {/* validation scores */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <ScoreChip label="OSMAN" value={String(msg.osman_score)} ok={msg.osman_score >= 70} />
        <ScoreChip label="Arabic" value={`${Math.round(msg.arabic_ratio * 100)}%`} ok={msg.arabic_ratio >= 0.9} />
        <ScoreChip label="chars" value={String(msg.char_count)} ok={msg.char_count <= 160} />
        <ScoreChip label="PII" value="None" ok />
      </div>
    </div>
  )
}

/* ─── WhatsApp Preview ─────────────────────────────────────────────────────── */
function WhatsAppPreview({ text }: { text: string }) {
  return (
    <div
      style={{
        background: '#0b141a',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '340px',
      }}
    >
      {/* header */}
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
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            fontFamily: "'Noto Sans Arabic', sans-serif",
          }}
        >
          وز
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#e9edef',
              fontFamily: "'Noto Sans Arabic', sans-serif",
              direction: 'rtl',
            }}
          >
            وزارة الصحة
          </p>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: '#8696a0' }}>MOH Saudi Arabia</p>
        </div>
      </div>

      {/* chat area */}
      <div
        style={{
          flex: 1,
          padding: '12px',
          background: '#0b141a',
        }}
      >
        {/* message bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <div
            style={{
              background: '#005c4b',
              borderRadius: '10px 2px 10px 10px',
              padding: '8px 12px',
              maxWidth: '90%',
              position: 'relative',
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
              {text}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px',
              }}
            >
              <span style={{ fontSize: '0.625rem', color: '#8696a0' }}>09:14</span>
              <span style={{ color: '#53bdeb', fontSize: '0.75rem' }}>✓✓</span>
            </div>
          </div>
        </div>

        {/* quick-reply buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {['إلغاء الموعد', 'تغيير الموعد', 'تفاصيل أكثر'].map((label) => (
            <button
              key={label}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                color: '#53bdeb',
                fontFamily: "'Noto Sans Arabic', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                direction: 'rtl',
                textAlign: 'center',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* channel stats */}
      <div
        style={{
          padding: '10px 14px',
          background: '#1f2c34',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.6875rem', color: '#8696a0' }}>
          <span style={{ color: '#25d366', fontWeight: 600 }}>98%</span> open rate
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
        <span style={{ fontSize: '0.6875rem', color: '#8696a0' }}>
          <span style={{ color: '#25d366', fontWeight: 600 }}>83%</span> KSA daily usage
        </span>
      </div>
    </div>
  )
}

/* ─── SMS Preview ──────────────────────────────────────────────────────────── */
function SMSPreview({ text }: { text: string }) {
  const charCount = text.length
  const maxChars = 70
  const pct = Math.min(100, (charCount / maxChars) * 100)
  const barColor = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#10b981'

  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '340px',
      }}
    >
      {/* header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(6,182,212,0.15)',
            border: '1px solid rgba(6,182,212,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.02em' }}>SMS</span>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
            }}
          >
            MOH-SEHHATY
          </p>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
            Official sender ID
          </p>
        </div>
      </div>

      {/* message body */}
      <div style={{ flex: 1, padding: '14px' }}>
        <div
          style={{
            background: 'var(--elevated)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '12px',
          }}
        >
          <p
            dir="rtl"
            lang="ar"
            style={{
              margin: 0,
              fontFamily: "'Noto Sans Arabic', sans-serif",
              fontSize: '0.875rem',
              lineHeight: 1.75,
              color: 'var(--text-primary)',
              textAlign: 'right',
            }}
          >
            {text}
          </p>
        </div>

        {/* char count bar */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {charCount}/{maxChars} UCS-2
            </span>
            <span style={{ color: barColor, fontWeight: 600 }}>
              {pct <= 100 ? `${Math.round(pct)}%` : 'Over limit'}
            </span>
          </div>
          <div
            style={{
              height: '4px',
              background: 'var(--elevated)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: barColor,
                borderRadius: '2px',
                transition: 'width 0.5s var(--ease-out-expo)',
              }}
            />
          </div>
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--elevated)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Send window:</span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            9 AM – 8 PM AST
          </span>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
          CITC-compliant · OPT-OUT via 700088
        </span>
      </div>
    </div>
  )
}

/* ─── Push Preview ─────────────────────────────────────────────────────────── */
function PushPreview({ text }: { text: string }) {
  // Split into title + body on em-dash or first full stop
  const dashIdx = text.indexOf(' — ')
  const dotIdx  = text.indexOf('.')
  let title: string
  let body: string
  if (dashIdx > 0) {
    title = text.slice(0, dashIdx).trim()
    body  = text.slice(dashIdx + 3).trim()
  } else if (dotIdx > 0 && dotIdx < text.length - 1) {
    title = text.slice(0, dotIdx + 1).trim()
    body  = text.slice(dotIdx + 1).trim()
  } else {
    title = text
    body  = ''
  }

  return (
    <div
      style={{
        background: 'var(--elevated)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '340px',
        position: 'relative',
      }}
    >
      {/* blurred bg accent */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'rgba(139,92,246,0.12)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* "device" label */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>iOS Notification Preview</span>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
            <div
              key={c}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.6 }}
            />
          ))}
        </div>
      </div>

      {/* notification card */}
      <div style={{ flex: 1, padding: '20px 14px', display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        <div
          style={{
            width: '100%',
            background: 'var(--card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '14px',
            padding: '14px',
            border: '1px solid var(--border)',
          }}
        >
          {/* app row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                }}
              >
                صح
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sehhaty</span>
              <span
                style={{
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                  fontSize: '0.6875rem',
                  color: 'var(--text-secondary)',
                }}
              >
                صحتي
              </span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--text-secondary)' }}>now</span>
          </div>

          {/* title */}
          <p
            dir="rtl"
            lang="ar"
            style={{
              margin: '0 0 4px',
              fontFamily: "'Noto Sans Arabic', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textAlign: 'right',
              lineHeight: 1.5,
            }}
          >
            {title}
          </p>

          {/* body */}
          {body && (
            <p
              dir="rtl"
              lang="ar"
              style={{
                margin: 0,
                fontFamily: "'Noto Sans Arabic', sans-serif",
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                textAlign: 'right',
                lineHeight: 1.55,
              }}
            >
              {body}
            </p>
          )}

          {/* action button */}
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <button
              style={{
                display: 'block',
                width: '100%',
                padding: '7px',
                background: 'rgba(37,99,235,0.15)',
                border: '1px solid rgba(37,99,235,0.25)',
                borderRadius: '8px',
                color: '#3b82f6',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              View Appointment · تفاصيل الموعد
            </button>
          </div>
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
          Sehhaty app · Push notification
        </span>
        <span style={{ fontSize: '0.6875rem', color: '#8b5cf6', fontWeight: 600 }}>
          APNs / FCM
        </span>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ComposePage() {
  const { id } = useParams<{ id: string }>()

  const user = sampleUsers.find((u) => u.id === id)
  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '24rem',
        }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>User not found: {id}</p>
      </div>
    )
  }

  /* ── Computed values ── */
  const sadrisc  = computeSADRISC(user)
  const hes      = computeHES(user)
  const ttm      = classifyTTM(user)
  const comb     = diagnoseCOMB(user, ttm.stage)
  const priority = computePriority(sadrisc.score, hes.score)
  const fw       = selectFramework(ttm.stage, comb.barrier)

  const ttmColor  = TTM_COLORS[ttm.stage] || 'var(--accent)'
  const combColor = COMBB_COLORS[comb.barrier] || 'var(--accent)'

  /* ── Personalisation vars ── */
  const vars: Record<string, string> = {
    name:   user.name_ar,
    area:   user.region_ar,
    clinic: user.clinic_name_ar,
    link:   'sehhaty.sa/book',
    date:   'الأحد',
    time:   '10:00 ص',
  }

  /* ── Filter messages by TTM stage, max 3 ── */
  const stageMessages = messageTemplates
    .filter((m) => m.ttm_stage === ttm.stage)
    .slice(0, 3)

  const displayMessages = stageMessages.length > 0 ? stageMessages : messageTemplates.slice(0, 2)

  /* ── Primary WhatsApp message for channel previews ── */
  const primaryMsg =
    displayMessages.find((m) => m.channel === 'whatsapp') ?? displayMessages[0]
  const primaryAr = personalise(primaryMsg.content_ar, vars)

  const smsMsgRaw =
    messageTemplates.find((m) => m.channel === 'sms' && m.ttm_stage === ttm.stage) ??
    messageTemplates.find((m) => m.channel === 'sms') ??
    primaryMsg
  const smsAr = personalise(smsMsgRaw.content_ar, vars)

  const pushMsgRaw =
    messageTemplates.find((m) => m.channel === 'push' && m.ttm_stage === ttm.stage) ??
    messageTemplates.find((m) => m.channel === 'push') ??
    primaryMsg
  const pushAr = personalise(pushMsgRaw.content_ar, vars)

  /* ── EAST overlay ── */
  const eastItems: { label: string; key: string }[] = [
    { label: 'Easy',       key: 'Easy' },
    { label: 'Attractive', key: 'Attractive' },
    { label: 'Social',     key: 'Social' },
    { label: 'Timely',     key: 'Timely' },
  ]

  /* ── Framework evidence citations ── */
  const evidenceMap: Record<string, string> = {
    'Authority Endorsement':     'Cialdini 2001 (authority principle) · KSA MOH credibility research',
    'Loss Aversion':             'Kahneman & Tversky 1979 · Thaler & Sunstein 2008',
    'Implementation Intentions': 'Sheeran & Orbell 2000 (+23pp RCT)',
    'Commitment Devices':        'Ariely & Wertenbroch 2002',
    'Identity Norms':            'Cialdini 2003 · Bryan et al. 2011',
    'Education (COM-B)':         'Michie et al. 2011 COM-B model',
    'EAST (Attractive)':         'BIT EAST Framework 2014',
    'EAST (Easy)':               'BIT EAST Framework 2014',
    'EAST (Timely)':             'BIT EAST Framework 2014',
  }
  const citation = evidenceMap[fw.primary] ?? 'BIT / COM-B / EAST evidence synthesis'

  return (
    <main
      className="animate-fade-in"
      style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '64px' }}
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
          Demo Flow → Step 2 of 4 → Message Composition
        </div>
        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Framework Selection & Message Generation
        </h1>
        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: 0,
          maxWidth: '640px',
          lineHeight: 1.6,
        }}>
          Based on the user's behavioral stage and diagnosed barrier, the system selects the optimal behavioral science framework and generates personalized messages in Arabic. All three channel previews shown side-by-side.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════════ */}
      <div
        className="animate-slide-up delay-1"
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                Compose
              </h1>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'var(--accent)',
                  background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  textTransform: 'uppercase',
                }}
              >
                AI-Assisted
              </span>
            </div>

            {/* one-liner context bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name_en}</span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: "'Noto Sans Arabic', sans-serif" }}>{user.name_ar}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span style={{ color: ttmColor, fontWeight: 500 }}>{ttm.stage}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span style={{ color: combColor, fontWeight: 500 }}>{comb.barrier}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Priority{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{priority}</span>
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                }}
              >
                HES{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{hes.score}</span>
              </span>
            </div>
          </div>

          {/* SADRISC badge */}
          <div
            style={{
              padding: '12px 20px',
              background: sadrisc.risk === 'High' ? 'rgba(220,38,38,0.08)' : 'rgba(202,138,4,0.08)',
              border: `1px solid ${sadrisc.risk === 'High' ? 'rgba(220,38,38,0.2)' : 'rgba(202,138,4,0.2)'}`,
              borderRadius: '10px',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>SADRISC</p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '1.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: sadrisc.risk === 'High' ? '#dc2626' : '#ca8a04',
                lineHeight: 1,
              }}
            >
              {sadrisc.score}
            </p>
            <p
              style={{
                margin: '3px 0 0',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: sadrisc.risk === 'High' ? '#dc2626' : '#ca8a04',
              }}
            >
              {sadrisc.risk} Risk
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — FRAMEWORK SELECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        className="animate-slide-up delay-2"
        style={{ marginBottom: '24px' }}
      >
        <Card>
          <SectionLabel
            right={
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Decision matrix: TTM stage × COM-B barrier → framework
              </span>
            }
          >
            § 1 — Framework Selection
          </SectionLabel>

          {/* Decision path — horizontal flow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            {/* Node: TTM */}
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: `${ttmColor}18`,
                border: `1px solid ${ttmColor}35`,
              }}
            >
              <p style={{ margin: 0, fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>TTM Stage</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', fontWeight: 700, color: ttmColor }}>{ttm.stage}</p>
            </div>

            <div style={{ padding: '0 8px', color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>→</div>

            {/* Node: COM-B */}
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: `${combColor}18`,
                border: `1px solid ${combColor}35`,
              }}
            >
              <p style={{ margin: 0, fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>COM-B Barrier</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', fontWeight: 700, color: combColor }}>{comb.barrier}</p>
            </div>

            <div style={{ padding: '0 8px', color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>→</div>

            {/* Node: Primary Framework (active, highlighted) */}
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(37,99,235,0.12)',
                border: '2px solid rgba(37,99,235,0.4)',
                boxShadow: '0 0 0 3px rgba(37,99,235,0.06)',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Selected Framework</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)' }}>{fw.primary}</p>
            </div>

            {/* Dimmed secondary */}
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--elevated)',
                border: '1px dashed rgba(0,0,0,0.12)',
                marginLeft: '8px',
                opacity: 0.5,
              }}
            >
              <p style={{ margin: 0, fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Secondary</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{fw.secondary}</p>
            </div>
          </div>

          {/* Framework detail row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '24px',
              alignItems: 'start',
              marginBottom: '16px',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {fw.primary}
              </p>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {fw.reason}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  opacity: 0.7,
                }}
              >
                Evidence: {citation}
              </p>
            </div>

            {/* EAST checklist */}
            <div style={{ flexShrink: 0 }}>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                EAST Overlay
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {eastItems.map(({ label, key }) => (
                  <EastPill key={key} label={label} active={fw.east_overlay.includes(key)} />
                ))}
              </div>
            </div>
          </div>

          {/* Framework selection explanatory note */}
          <p style={{ margin: '0 0 16px', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
            The system doesn't just pick a random message — it maps the user's diagnosed barrier to an evidence-based intervention. Authority Endorsement is selected for Precontemplation users where MOH credibility and family-duty framing activate reflective motivation. Implementation Intentions (+23pp in Sheeran &amp; Orbell 2000) are reserved for Preparation-stage users who are ready to act.
          </p>

          {/* COM-B context bar */}
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--elevated)',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Barrier Diagnosis
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {comb.reason}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Intervention Target
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {comb.intervention}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — GENERATED MESSAGES
      ══════════════════════════════════════════════════════════ */}
      <section
        className="animate-slide-up delay-3"
        style={{ marginBottom: '24px' }}
      >
        <Card>
          <SectionLabel
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: ttmColor,
                    background: `${ttmColor}15`,
                    border: `1px solid ${ttmColor}30`,
                  }}
                >
                  {ttm.stage}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  {displayMessages.length} variant{displayMessages.length !== 1 ? 's' : ''}
                </span>
              </div>
            }
          >
            § 2 — Generated Messages
          </SectionLabel>

          {/* Personalisation callout */}
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'rgba(37,99,235,0.05)',
              border: '1px solid rgba(37,99,235,0.12)',
              borderRadius: '8px',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', flexShrink: 0, marginTop: '2px' }}>✦</span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Template variables resolved:{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.6875rem' }}>{'{{name}}'}</span>
              {' '}→{' '}
              <span style={{ fontFamily: "'Noto Sans Arabic', sans-serif", color: 'var(--text-primary)' }}>{user.name_ar}</span>
              {' · '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.6875rem' }}>{'{{area}}'}</span>
              {' '}→{' '}
              <span style={{ fontFamily: "'Noto Sans Arabic', sans-serif", color: 'var(--text-primary)' }}>{user.region_ar}</span>
              {' · '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.6875rem' }}>{'{{clinic}}'}</span>
              {' '}→{' '}
              <span style={{ fontFamily: "'Noto Sans Arabic', sans-serif", color: 'var(--text-primary)' }}>{user.clinic_name_ar}</span>
              {' · '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.6875rem' }}>{'{{link}}'}</span>
              {' '}→{' '}
              <span style={{ color: 'var(--accent)' }}>sehhaty.sa/book</span>
            </p>
          </div>

          {/* Arabic message explanatory note */}
          <p style={{ margin: '0 0 16px', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
            Messages are pre-generated by Claude API in batch, then curated by Arabic content specialists and clinical reviewers. The system selects from this approved library at send time — never real-time generation for health messaging.
          </p>

          {/* Message cards stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayMessages.map((msg, i) => (
              <MessageCard key={msg.id} msg={msg} vars={vars} index={i} />
            ))}
          </div>
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — CHANNEL PREVIEWS
      ══════════════════════════════════════════════════════════ */}
      <section className="animate-slide-up delay-4">
        <Card>
          <SectionLabel
            right={
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Same message adapted per channel constraints
              </span>
            }
          >
            § 3 — Channel Previews
          </SectionLabel>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            {/* ── Column 1: WhatsApp ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#25d366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>WhatsApp</span>
              </div>
              <WhatsAppPreview text={primaryAr} />
            </div>

            {/* ── Column 2: SMS ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#06b6d4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>SMS</span>
              </div>
              <SMSPreview text={smsAr} />
            </div>

            {/* ── Column 3: Push ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Push Notification</span>
              </div>
              <PushPreview text={pushAr} />
            </div>

            {/* Email */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email</span>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Subject: موعد فحص السكري — Screening Appointment</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', sans-serif", marginBottom: '12px' }}>
                  {primaryMsg.content_ar.slice(0, 120)}...
                </div>
                <div style={{ display: 'inline-block', background: 'var(--accent)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                  View Appointment Details
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Rich HTML · Embedded booking link · Longer copy</div>
              </div>
            </div>
          </div>

          {/* Channel previews explanatory note */}
          <p style={{ margin: '20px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
            WhatsApp reaches 83% of Saudis daily (GMI 2024). SMS is the official fallback within CST (CITC)-mandated 9AM-8PM window. Email provides rich HTML with embedded booking links for users who prefer longer-form communication. Push notifications deep-link directly to Sehhaty's booking flow.
          </p>

          {/* Channel adaptation table */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              background: 'var(--elevated)',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {[
              {
                channel: 'WhatsApp',
                color: '#25d366',
                notes: [
                  'Rich RTL Arabic text',
                  'Quick-reply CTA buttons',
                  'Up to 1600 chars',
                  '98% open rate KSA',
                ],
              },
              {
                channel: 'SMS',
                color: '#06b6d4',
                notes: [
                  '≤70 chars UCS-2 (Arabic)',
                  'MOH-SEHHATY sender ID',
                  '9 AM – 8 PM CST window',
                  'CITC-compliant opt-out',
                ],
              },
              {
                channel: 'Push',
                color: '#8b5cf6',
                notes: [
                  'iOS APNs / Android FCM',
                  'Title + body split',
                  'Sehhaty app deep-link',
                  'Opt-in required',
                ],
              },
            ].map(({ channel, color, notes }) => (
              <div key={channel}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {channel}
                </p>
                <ul
                  style={{
                    margin: 0,
                    padding: '0 0 0 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                  }}
                >
                  {notes.map((n) => (
                    <li key={n} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  )
}
