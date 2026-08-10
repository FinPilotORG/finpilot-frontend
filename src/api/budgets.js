import { apiFetch } from './client'

// GET /api/budgets -> BudgetResponse[]
export function getBudgets() {
  return apiFetch('/budgets', { method: 'GET', auth: true })
}

// POST /api/budgets -> BudgetResponse
export function createBudget({ name, amount, period, startDate, endDate }) {
  return apiFetch('/budgets', {
    method: 'POST',
    auth: true,
    body: { name, amount, period, startDate, endDate },
  })
}

// PUT /api/budgets/{id} -> BudgetResponse
export function updateBudget(id, { name, amount, period, startDate, endDate }) {
  return apiFetch(`/budgets/${id}`, {
    method: 'PUT',
    auth: true,
    body: { name, amount, period, startDate, endDate },
  })
}

// DELETE /api/budgets/{id} -> 204 No Content
export function deleteBudget(id) {
  return apiFetch(`/budgets/${id}`, { method: 'DELETE', auth: true })
}

// ASSUMPTION: your BudgetPeriod.java enum wasn't shared, so these are a best guess.
// If your backend rejects a period value with a 400, open BudgetPeriod.java and
// update this array to match the exact constant names (case-sensitive).
export const BUDGET_PERIODS = ['WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']

export function periodLabel(period) {
  if (!period) return ''
  return period.charAt(0) + period.slice(1).toLowerCase()
}
