const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * Thin wrapper around fetch that:
 * - prefixes every call with the backend base URL
 * - attaches the JWT (if present) as a Bearer token
 * - throws a readable Error when the response is not ok, using the
 *   backend's error message when available
 */
export async function apiFetch(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth) {
    const token = localStorage.getItem('finpilot_token')
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => null) : await response.text()

  if (!response.ok) {
    // Spring's default validation errors and our custom error responses
    // usually land in `message`, but fall back gracefully.
    const message =
      (data && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}
