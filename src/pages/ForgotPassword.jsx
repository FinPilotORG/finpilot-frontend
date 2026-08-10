import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { forgotPassword } from '../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout eyebrow="Check your token" title="Reset link generated">
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Your backend doesn't send real emails yet — it prints the reset token straight to
          the <strong>IntelliJ console</strong> (look for a line starting with{' '}
          <code>PASSWORD RESET TOKEN:</code>). Copy that token and paste it on the next screen.
        </p>
        <Link to="/reset-password" className="auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          I have my token
        </Link>
        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Forgot password"
      title="Reset your password"
      subtitle="Enter your account email and we'll generate a reset token."
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset token'}
        </button>
      </form>

      <p className="auth-switch">
        Remembered it? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
