import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getExpenses } from '../api/expenses'
import { getBudgets, createBudget, updateBudget, deleteBudget, periodLabel } from '../api/budgets'
import BudgetFormModal from '../components/BudgetFormModal'
import '../styles/dashboard.css'
import '../styles/budgets.css'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function spentWithinRange(expenses, startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return expenses
    .filter((e) => {
      const d = new Date(e.expenseDate)
      return d >= start && d <= end
    })
    .reduce((sum, e) => sum + Number(e.amount), 0)
}

export default function Budgets() {
  const { user, logout } = useAuth()

  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const [budgetData, expenseData] = await Promise.all([getBudgets(), getExpenses()])
      setBudgets(budgetData)
      setExpenses(expenseData)
    } catch (err) {
      setError(err.message || 'Could not load your budgets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const budgetCards = useMemo(() => {
    return budgets
      .map((b) => {
        const spent = spentWithinRange(expenses, b.startDate, b.endDate)
        const pct = b.amount > 0 ? Math.min(999, Math.round((spent / b.amount) * 100)) : 0
        return { ...b, spent, pct }
      })
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
  }, [budgets, expenses])

  async function handleAddOrEdit(formValues) {
    if (editingBudget) {
      const updated = await updateBudget(editingBudget.id, formValues)
      setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    } else {
      const created = await createBudget(formValues)
      setBudgets((prev) => [created, ...prev])
    }
    setModalOpen(false)
    setEditingBudget(null)
  }

  async function handleDelete(id) {
    if (!confirm("Delete this budget? This can't be undone.")) return
    try {
      await deleteBudget(id)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      alert(err.message || 'Could not delete this budget.')
    }
  }

  function openEdit(budget) {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  function openAdd() {
    setEditingBudget(null)
    setModalOpen(true)
  }

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header__brand-row">
          <div className="dash-header__brand">FinPilot</div>
          <nav className="dash-header__nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/budgets" className="active">
              Budgets
            </Link>
          </nav>
        </div>
        <div className="dash-header__user">
          <span>{user ? `${user.firstName} ${user.lastName}` : '…'}</span>
          <button className="dash-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-title-row">
          <div>
            <p className="dash-eyebrow">Fuel limits</p>
            <h1 className="dash-title">Budgets</h1>
          </div>
          <button className="dash-add-btn" onClick={openAdd}>
            + Set budget
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading ? (
          <p className="dash-loading">Loading your budgets…</p>
        ) : budgetCards.length === 0 ? (
          <p className="dash-empty">
            No budgets yet — set one to track spending against a limit for a period.
          </p>
        ) : (
          <div className="budget-grid">
            {budgetCards.map((b) => (
              <div className="budget-card" key={b.id}>
                <div className="budget-card__top">
                  <div>
                    <p className="budget-card__name">{b.name}</p>
                    <p className="budget-card__period">
                      {periodLabel(b.period)} ·{' '}
                      {new Date(b.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      –{' '}
                      {new Date(b.endDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="budget-card__actions">
                    <button onClick={() => openEdit(b)} aria-label="Edit">
                      ✎
                    </button>
                    <button onClick={() => handleDelete(b.id)} aria-label="Delete">
                      ✕
                    </button>
                  </div>
                </div>

                <div className="budget-bar">
                  <div
                    className={`budget-bar__fill ${
                      b.pct >= 100 ? 'budget-bar__fill--over' : b.pct >= 80 ? 'budget-bar__fill--warn' : ''
                    }`}
                    style={{ width: `${Math.min(100, b.pct)}%` }}
                  />
                </div>

                <div className="budget-card__figures">
                  <span>
                    {currency.format(b.spent)} of {currency.format(b.amount)}
                  </span>
                  <span
                    className={
                      b.pct >= 100
                        ? 'budget-pct budget-pct--over'
                        : b.pct >= 80
                        ? 'budget-pct budget-pct--warn'
                        : 'budget-pct'
                    }
                  >
                    {b.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <BudgetFormModal
          initialBudget={editingBudget}
          onClose={() => {
            setModalOpen(false)
            setEditingBudget(null)
          }}
          onSubmit={handleAddOrEdit}
        />
      )}
    </div>
  )
}
