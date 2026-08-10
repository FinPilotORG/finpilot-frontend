import { Link } from 'react-router-dom'
import '../styles/landing.css'

const FEATURES = [
  {
    title: 'Log in seconds',
    body: 'One field for the amount, one tap for the category. FinPilot gets out of your way so tracking becomes a habit, not a chore.',
  },
  {
    title: 'See where it goes',
    body: 'A live category breakdown for the month, so "where did my money go" has an answer before you even ask it.',
  },
  {
    title: 'Spot the trend',
    body: "Month-over-month view of your spending, so a bad month doesn't sneak up on you three months late.",
  },
  {
    title: 'Built on real auth',
    body: 'JWT-secured accounts, so your ledger is yours — encrypted passwords, token-based sessions, nothing stored in plain text.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create your account',
    body: 'Sign up with your email in under a minute. No credit card, no fine print.',
  },
  {
    n: '02',
    title: 'Log as you spend',
    body: 'Add an expense the moment it happens — title, amount, category, date. Takes seconds.',
  },
  {
    n: '03',
    title: 'Read your instruments',
    body: 'Your dashboard turns raw entries into totals, trends, and a category breakdown — automatically.',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav__brand">FinPilot</div>
        <nav className="landing-nav__links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <Link to="/login" className="landing-nav__login">
            Log in
          </Link>
          <Link to="/register" className="landing-nav__cta">
            Get started
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Personal finance, instrumented</p>
          <h1 className="hero__title">
            Fly your finances with a clear instrument panel, not a guessing game.
          </h1>
          <p className="hero__subtitle">
            FinPilot is a straightforward expense tracker: log what you spend, and get an
            honest read on where it's going — by category, by month, no spreadsheets required.
          </p>
          <div className="hero__actions">
            <Link to="/register" className="btn btn--primary">
              Create your account
            </Link>
            <Link to="/login" className="btn btn--ghost">
              I already have one
            </Link>
          </div>
        </div>

        <div className="hero__gauge" aria-hidden="true">
          <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
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
            <path d="M 90 210 L 140 170 L 175 195 L 240 120" className="gauge-trend" fill="none" />
          </svg>
        </div>
      </section>

      <section className="strip">
        <div className="strip__item">
          <p className="strip__value">2 min</p>
          <p className="strip__label">to set up</p>
        </div>
        <div className="strip__item">
          <p className="strip__value">8</p>
          <p className="strip__label">spending categories</p>
        </div>
        <div className="strip__item">
          <p className="strip__value">100%</p>
          <p className="strip__label">your data, your account</p>
        </div>
      </section>

      <section className="features" id="features">
        <p className="section-eyebrow">What you get</p>
        <h2 className="section-title">Everything a ledger should do, nothing it shouldn't.</h2>
        <div className="features__grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <p className="section-eyebrow">How it works</p>
        <h2 className="section-title">Three steps. That's the whole flow.</h2>
        <div className="how__steps">
          {STEPS.map((s) => (
            <div className="how-step" key={s.n}>
              <span className="how-step__n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="quote-band">
        <p className="quote-band__text">
          "Every rupee logged is altitude gained. Climb steadily, land on budget."
        </p>
      </section>

      <section className="final-cta">
        <h2>Start logging today's expenses in under a minute.</h2>
        <Link to="/register" className="btn btn--primary btn--lg">
          Create your free account
        </Link>
      </section>

      <footer className="landing-footer">
        <span>FinPilot</span>
        <span>Built by Shivam &amp; Vaishnavi</span>
      </footer>
    </div>
  )
}
