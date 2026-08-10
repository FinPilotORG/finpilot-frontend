import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  CATEGORY_COLORS,
  categoryLabel,
  EXPENSE_CATEGORIES,
} from '../api/expenses'
import ExpenseFormModal from '../components/ExpenseFormModal'
import '../styles/dashboard.css'
import '../styles/budgets.css'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const PAGE_SIZE = 8

function isSameMonth(dateStr, ref) {
  const d = new Date(dateStr)
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
}

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function lastSixMonths(ref) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-IN', { month: 'short' }),
    })
  }
  return months
}

export default function Dashboard() {
  const { user, logout } = useAuth()

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  async function loadExpenses() {
    setLoading(true)
    setError('')
    try {
      const data = await getExpenses()
      setExpenses(data)
    } catch (err) {
      setError(err.message || 'Could not load your expenses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const now = new Date()

  const stats = useMemo(() => {
    const thisMonth = expenses.filter((e) => isSameMonth(e.expenseDate, now))
    const totalAllTime = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const totalThisMonth = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0)

    const byCategory = {}
    for (const e of thisMonth) {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount)
    }
    const chartData = Object.entries(byCategory)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)

    const topCategory = chartData[0]?.category

    const months = lastSixMonths(now)
    const byMonth = {}
    for (const e of expenses) {
      const key = monthKey(e.expenseDate)
      byMonth[key] = (byMonth[key] || 0) + Number(e.amount)
    }
    const trendData = months.map((m) => ({ label: m.label, value: byMonth[m.key] || 0 }))

    return {
      totalAllTime,
      totalThisMonth,
      chartData,
      topCategory,
      trendData,
      count: expenses.length,
    }
  }, [expenses])

  const filtered = useMemo(() => {
    return [...expenses]
      .filter((e) => (categoryFilter === 'ALL' ? true : e.category === categoryFilter))
      .filter((e) =>
        search.trim() ? e.title.toLowerCase().includes(search.trim().toLowerCase()) : true
      )
      .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
  }, [expenses, categoryFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter])

  async function handleAddOrEdit(formValues) {
    if (editingExpense) {
      const updated = await updateExpense(editingExpense.id, formValues)
      setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    } else {
      const created = await createExpense(formValues)
      setExpenses((prev) => [created, ...prev])
    }
    setModalOpen(false)
    setEditingExpense(null)
  }

  async function handleDelete(id) {
    if (!confirm("Delete this expense? This can't be undone.")) return
    try {
      await deleteExpense(id)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      alert(err.message || 'Could not delete this expense.')
    }
  }

  function openEdit(expense) {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  function openAdd() {
    setEditingExpense(null)
    setModalOpen(true)
  }

  const maxTrend = Math.max(1, ...stats.trendData.map((d) => d.value))

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header__brand-row">
          <div className="dash-header__brand">FinPilot</div>
          <nav className="dash-header__nav">
            <Link to="/dashboard" className="active">
              Dashboard
            </Link>
            <Link to="/budgets">Budgets</Link>
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
            <p className="dash-eyebrow">Flight log</p>
            <h1 className="dash-title">
              {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </h1>
          </div>
          <button className="dash-add-btn" onClick={openAdd}>
            + Log expense
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading ? (
          <p className="dash-loading">Loading your expenses…</p>
        ) : (
          <>
            <section className="summary-grid">
              <div className="summary-card">
                <p className="summary-card__label">This month</p>
                <p className="summary-card__value">{currency.format(stats.totalThisMonth)}</p>
              </div>
              <div className="summary-card">
                <p className="summary-card__label">All-time logged</p>
                <p className="summary-card__value">{currency.format(stats.totalAllTime)}</p>
              </div>
              <div className="summary-card">
                <p className="summary-card__label">Top category</p>
                <p className="summary-card__value summary-card__value--text">
                  {stats.topCategory ? categoryLabel(stats.topCategory) : '—'}
                </p>
              </div>
              <div className="summary-card">
                <p className="summary-card__label">Transactions</p>
                <p className="summary-card__value">{stats.count}</p>
              </div>
            </section>

            <section className="dash-columns">
              <div className="panel">
                <h2 className="panel__title">Where it went this month</h2>
                {stats.chartData.length === 0 ? (
                  <p className="dash-empty">No expenses logged this month yet.</p>
                ) : (
                  <div className="chart-row">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={stats.chartData}
                          dataKey="value"
                          nameKey="category"
                          innerRadius={52}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {stats.chartData.map((entry) => (
                            <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [currency.format(value), categoryLabel(name)]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="legend">
                      {stats.chartData.map((entry) => (
                        <li key={entry.category} className="legend__item">
                          <span
                            className="legend__swatch"
                            style={{ background: CATEGORY_COLORS[entry.category] }}
                          />
                          <span className="legend__label">{categoryLabel(entry.category)}</span>
                          <span className="legend__value">{currency.format(entry.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="panel">
                <h2 className="panel__title">Last 6 months</h2>
                {maxTrend <= 1 && stats.trendData.every((d) => d.value === 0) ? (
                  <p className="dash-empty">Not enough history yet to show a trend.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(16,35,26,0.08)" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: '#5b6b60' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#5b6b60' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => currency.format(value)} />
                      <Bar dataKey="value" fill="#3fa796" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="panel panel--wide">
              <div className="txn-toolbar">
                <h2 className="panel__title">All transactions</h2>
                <div className="txn-toolbar__controls">
                  <input
                    className="txn-search"
                    type="text"
                    placeholder="Search by title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="txn-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">All categories</option>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="dash-empty">
                  {expenses.length === 0
                    ? 'Nothing logged yet — hit "Log expense" to add your first one.'
                    : 'No transactions match your search/filter.'}
                </p>
              ) : (
                <>
                  <ul className="txn-list">
                    {pageItems.map((e) => (
                      <li className="txn-row" key={e.id}>
                        <span
                          className="txn-dot"
                          style={{ background: CATEGORY_COLORS[e.category] }}
                        />
                        <div className="txn-main">
                          <p className="txn-title">{e.title}</p>
                          <p className="txn-meta">
                            {categoryLabel(e.category)} ·{' '}
                            {new Date(e.expenseDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className="txn-amount">{currency.format(e.amount)}</span>
                        <div className="txn-actions">
                          <button onClick={() => openEdit(e)} aria-label="Edit">
                            ✎
                          </button>
                          <button onClick={() => handleDelete(e.id)} aria-label="Delete">
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        ← Prev
                      </button>
                      <span>
                        Page {page} of {totalPages}
                      </span>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>

      {modalOpen && (
        <ExpenseFormModal
          initialExpense={editingExpense}
          onClose={() => {
            setModalOpen(false)
            setEditingExpense(null)
          }}
          onSubmit={handleAddOrEdit}
        />
      )}
    </div>
  )
}
