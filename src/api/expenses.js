import { apiFetch } from './client'

// GET /api/expenses -> ExpenseResponse[] (own expenses, or all if admin)
export function getExpenses() {
  return apiFetch('/expenses', { method: 'GET', auth: true })
}

// POST /api/expenses -> ExpenseResponse
export function createExpense({ title, description, amount, category, expenseDate }) {
  return apiFetch('/expenses', {
    method: 'POST',
    auth: true,
    body: { title, description, amount, category, expenseDate },
  })
}

// PUT /api/expenses/{id} -> ExpenseResponse
export function updateExpense(id, { title, description, amount, category, expenseDate }) {
  return apiFetch(`/expenses/${id}`, {
    method: 'PUT',
    auth: true,
    body: { title, description, amount, category, expenseDate },
  })
}

// DELETE /api/expenses/{id}
export function deleteExpense(id) {
  return apiFetch(`/expenses/${id}`, { method: 'DELETE', auth: true })
}

export const EXPENSE_CATEGORIES = [
  'FOOD',
  'TRAVEL',
  'SHOPPING',
  'HEALTH',
  'EDUCATION',
  'ENTERTAINMENT',
  'BILLS',
  'OTHER',
]

export const CATEGORY_COLORS = {
  FOOD: '#c89b3c',
  TRAVEL: '#3fa796',
  SHOPPING: '#7c6fbe',
  HEALTH: '#c1443c',
  EDUCATION: '#4c7a92',
  ENTERTAINMENT: '#b5722e',
  BILLS: '#5b6b60',
  OTHER: '#8c8c7a',
}

export function categoryLabel(category) {
  if (!category) return 'Other'
  return category.charAt(0) + category.slice(1).toLowerCase()
}
