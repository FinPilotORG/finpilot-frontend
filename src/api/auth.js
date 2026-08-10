import { apiFetch } from './client'

// Matches AuthController: POST /api/auth/register -> RegisterResponse
export function registerUser({ firstName, lastName, email, password, mobileNumber }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: { firstName, lastName, email, password, mobileNumber },
  })
}

// Matches AuthController: POST /api/auth/login -> LoginResponse { token, refreshToken, message }
export function loginUser({ email, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

// Matches AuthController: POST /api/auth/refresh -> RefreshTokenResponse
export function refreshToken(refreshToken) {
  return apiFetch('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
}

// Matches AuthController: POST /api/auth/logout
export function logoutUser(refreshToken) {
  return apiFetch('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  })
}

// Matches AuthController: POST /api/auth/forgot-password
// NOTE: assumed path — your AuthController snippet didn't show this mapping.
// If it's different (e.g. /api/auth/forgotPassword), update this path.
export function forgotPassword(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

// Matches AuthController: POST /api/auth/reset-password
// NOTE: assumed path — same caveat as above.
export function resetPassword({ token, newPassword }) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
  })
}

// Matches UserController: GET /api/users/me -> UserResponse (requires Bearer token)
export function getCurrentUser() {
  return apiFetch('/users/me', { method: 'GET', auth: true })
}
