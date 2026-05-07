import { NavLink, useLocation } from 'react-router-dom'
import { Users, PenTool, Rocket, BarChart3, Route } from 'lucide-react'

type NavItem = {
  to: string
  icon: React.ElementType
  label: string
  description: string
  matchFn?: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    to: '/audience',
    icon: Users,
    label: '1. Audience',
    description: 'Segments & user profiling',
    matchFn: (p) => p === '/' || p === '/audience',
  },
  {
    to: '/compose/u1',
    icon: PenTool,
    label: '2. Compose',
    description: 'Framework & message generation',
    matchFn: (p) => p.startsWith('/compose'),
  },
  {
    to: '/campaign',
    icon: Rocket,
    label: '3. Campaign',
    description: 'Setup & journey builder',
    matchFn: (p) => p.startsWith('/campaign'),
  },
  {
    to: '/analytics',
    icon: BarChart3,
    label: '4. Analytics',
    description: 'Performance & optimization',
    matchFn: (p) => p.startsWith('/analytics'),
  },
  {
    to: '/journey',
    icon: Route,
    label: '5. Journey',
    description: 'End-to-end user flow',
    matchFn: (p) => p.startsWith('/journey'),
  },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '240px',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
      }}
    >
      {/* Wordmark */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '1rem', letterSpacing: '0.08em', lineHeight: 1, userSelect: 'none' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.12em' }}>
            BEHAV
          </span>
          <span style={{ fontWeight: 400, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
            SYNC
          </span>
          <span style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: '1px' }}>.</span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '0.6875rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
          Saudi Diabetes Screening Platform
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ to, icon: Icon, label, description, matchFn }) => {
          const active = matchFn ? matchFn(pathname) : pathname.startsWith(to)
          return (
            <NavLink
              key={label}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon
                size={18}
                style={{
                  flexShrink: 0,
                  color: active ? 'var(--accent)' : 'currentColor',
                  opacity: active ? 1 : 0.6,
                }}
              />
              <div>
                <div>{label}</div>
                <div style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                  fontWeight: 400,
                  marginTop: '1px',
                }}>
                  {description}
                </div>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Demo flow guide */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <p style={{
          margin: 0,
          fontSize: '0.6875rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
        }}>
          <span style={{ color: 'var(--accent)' }}>Demo flow:</span> Audience → Compose → Campaign → Analytics → Journey
        </p>
        <p style={{
          margin: '8px 0 0',
          fontSize: '0.625rem',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.03em',
        }}>
          v0.1 · Technical Assessment
        </p>
      </div>
    </aside>
  )
}
