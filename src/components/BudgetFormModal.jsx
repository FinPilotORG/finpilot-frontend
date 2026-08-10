import { useState } from 'react'
import { BUDGET_PERIODS, periodLabel } from '../api/budgets'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = {
  name: '',
  amount: '',
  period: 'MONTHLY',
  startDate: todayStr(),
  endDate: todayStr(),
}

export default function BudgetFormModal({ initialBudget, onClose, onSubmit }) {
  const isEdit = !!initialBudget
  const [form, setForm] = useState(
    initialBudget
      ? {
          name: initialBudget.name || '',
          amount: initialBudget.amount ?? '',
          period: initialBudget.period || 'MONTHLY',
          startDate: initialBudget.startDate || todayStr(),
          endDate: initialBudget.endDate || todayStr(),
        }
      : emptyForm
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.amount || Number(form.amount) <= 0) {
      setError('Please add a name and an amount greater than 0.')
      return
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be on or after the start date.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ ...form, amount: Number(form.amount) })
    } catch (err) {
      setError(err.message || 'Something went wrong saving this budget.')
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2>{isEdit ? 'Edit budget' : 'Set a budget'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. August groceries"
              required
            />
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={update('amount')}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="period">Period</label>
              <select id="period" value={form.period} onChange={update('period')}>
                {BUDGET_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {periodLabel(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="startDate">Start date</label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={update('startDate')}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="endDate">End date</label>
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={update('endDate')}
                required
              />
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create budget'}
          </button>
        </form>
      </div>
    </div>
  )
}
