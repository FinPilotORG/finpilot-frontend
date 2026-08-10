import '../styles/auth.css'
import { Link } from 'react-router-dom'

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__brand">
          <Link to="/" className="auth-panel__brand-link">
            FinPilot
          </Link>
        </div>

        <svg
          className="auth-panel__gauge"
          viewBox="0 0 320 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="160" cy="160" r="128" className="gauge-ring gauge-ring--outer" />
          <circle cx="160" cy="160" r="96" className="gauge-ring gauge-ring--inner" />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI
            const long = i % 6 === 0
            const r1 = long ? 96 : 106
            const r2 = 116
            const x1 = 160 + r1 * Math.cos(angle)
            const y1 = 160 + r1 * Math.sin(angle)
            const x2 = 160 + r2 * Math.cos(angle)
            const y2 = 160 + r2 * Math.sin(angle)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={long ? 'gauge-tick gauge-tick--long' : 'gauge-tick'}
              />
            )
          })}
          <line x1="160" y1="160" x2="160" y2="70" className="gauge-needle" />
          <circle cx="160" cy="160" r="6" className="gauge-pivot" />
          <path
            d="M 90 210 L 140 170 L 175 195 L 240 120"
            className="gauge-trend"
            fill="none"
          />
        </svg>

        <div className="auth-panel__copy">
          <p className="auth-panel__eyebrow">Flight instrument</p>
          <p className="auth-panel__quote">
            Every rupee logged is altitude gained. Climb steadily, land on budget.
          </p>
        </div>
      </aside>

      <main className="auth-form-side">
        <div className="auth-form-card">
          <p className="auth-form-card__eyebrow">{eyebrow}</p>
          <h1 className="auth-form-card__title">{title}</h1>
          {subtitle && <p className="auth-form-card__subtitle">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  )
}
