import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { registerUser } from '../api/auth'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  mobileNumber: '',
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await registerUser(form)
      // Backend doesn't log the user in on register, so send them to login
      // with a friendly note (handled via router state).
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.message || 'Unable to create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Set up FinPilot in under a minute."
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <div className="auth-field-row">
          <div className="auth-field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              value={form.firstName}
              onChange={update('firstName')}
              autoComplete="given-name"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              value={form.lastName}
              onChange={update('lastName')}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="mobileNumber">Mobile number</label>
          <input
            id="mobileNumber"
            value={form.mobileNumber}
            onChange={update('mobileNumber')}
            autoComplete="tel"
            placeholder="10 digit number"
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
