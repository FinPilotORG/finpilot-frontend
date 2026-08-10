import { useState } from 'react'
import { EXPENSE_CATEGORIES, categoryLabel } from '../api/expenses'

const emptyForm = {
  title: '',
  description: '',
  amount: '',
  category: 'FOOD',
  expenseDate: new Date().toISOString().slice(0, 10),
}

export default function ExpenseFormModal({ initialExpense, onClose, onSubmit }) {
  const isEdit = !!initialExpense
  const [form, setForm] = useState(
    initialExpense
      ? {
          title: initialExpense.title || '',
          description: initialExpense.description || '',
          amount: initialExpense.amount ?? '',
          category: initialExpense.category || 'FOOD',
          expenseDate: initialExpense.expenseDate || emptyForm.expenseDate,
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

    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) {
      setError('Please add a title and an amount greater than 0.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ ...form, amount: Number(form.amount) })
    } catch (err) {
      setError(err.message || 'Something went wrong saving this expense.')
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2>{isEdit ? 'Edit expense' : 'Log an expense'}</h2>
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
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={update('title')}
              placeholder="e.g. Groceries"
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
              <label htmlFor="expenseDate">Date</label>
              <input
                id="expenseDate"
                type="date"
                value={form.expenseDate}
                onChange={update('expenseDate')}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={update('category')}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="description">Notes (optional)</label>
            <input
              id="description"
              value={form.description}
              onChange={update('description')}
              placeholder="Any detail worth remembering"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
