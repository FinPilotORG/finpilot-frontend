import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword({ token, newPassword })
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(err.message || 'Could not reset your password. The token may be invalid or expired.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Set a new password"
      subtitle="Paste the token from your backend console, then choose a new password."
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="token">Reset token</label>
          <input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste the token from the console"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  )
}
