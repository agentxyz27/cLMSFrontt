/**
 * api.ts
 *
 * Centralized HTTP client for cLMS frontend.
 * All communication with the Express backend goes through here.
 *
 * Usage in any component:
 *   const { token } = useAuth()
 *   const data = await api.get('/courses', token)
 *
 * 401 Handling:
 *   If the backend returns 401 (token expired or invalid),
 *   api.ts fires a custom 'auth:unauthorized' event.
 *   AuthProvider listens for this event and forces logout.
 *   This keeps api.ts decoupled from React — no hooks needed here.
 */

const BASE_URL = '/api'

/**
 * Core request function. All api methods call this internally.
 *
 * @param endpoint - The API route e.g. '/courses', '/auth/login'
 * @param options  - Native fetch options (method, body, etc.)
 * @param token    - JWT from AuthContext. If provided, attached as Bearer token in header.
 *
 * Throws an error if the response is not ok (4xx, 5xx).
 * Returns the parsed JSON response.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Only attach Authorization header if token exists
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Token expired or invalid — fire event so AuthProvider can force logout
  // AuthProvider listens for this via window.addEventListener('auth:unauthorized')
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  if (!res.ok) {
    // Try to extract error message from backend response, fallback to generic
    const error = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

/**
 * Public api object used throughout the app.
 * Token is optional — public endpoints (guest routes) don't need it.
 * Protected endpoints will reject requests without a valid token on the backend.
 */
export const api = {
  /** Fetch data from an endpoint */
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, {}, token),

  /** Send data to create a resource */
  post: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }, token),

  /** Send data to update a resource */
  put: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }, token),

  /** Delete a resource */
  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'DELETE' }, token),
}