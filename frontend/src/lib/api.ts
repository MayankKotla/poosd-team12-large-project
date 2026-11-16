// src/lib/api.ts
// Every call from the website to the Express API goes through here.
//
// - Requests go to "/api/..." on the same domain. In production nginx forwards
//   /api to Express; in development Vite's proxy does it (see vite.config.ts).
// - After login the JWT is kept in localStorage and sent as
//   "Authorization: Bearer <token>" on every request.
// - If the server answers 401 (missing/expired token) we log out and go to /login.

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
}

export type Member = { user: string; role: 'admin' | 'member' }

export type Group = {
  _id: string
  groupName: string
  owner: string
  members: Member[]
}

export type Shift = {
  _id: string
  // populated by some endpoints (object), plain id in others (string)
  group: string | { _id: string; groupName: string }
  user: string | { _id: string; firstName: string; lastName: string }
  dayOfWeek: string
  startTime: string // "09:00"
  endTime: string // "17:00"
  title: string
  status: 'assigned' | 'up_for_grabs'
}

const API_BASE = (import.meta.env.VITE_API_URL ?? '') + '/api'
const TOKEN_KEY = 'shiftflow_token'
const USER_KEY = 'shiftflow_user'

// ---------- session (token + logged-in user) ----------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ---------- core request helper (AJAX via fetch) ----------

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  const data = await res.json().catch(() => ({}))

  if (res.status === 401 && token) {
    // token expired or invalid: send the user back to the login page
    logout()
    window.location.assign('/login?expired=1')
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data as T
}

// ---------- auth ----------

export async function login(email: string, password: string): Promise<User> {
  const data = await request<{ token: string; user: User }>('POST', '/auth/login', { email, password })
  saveSession(data.token, data.user)
  return data.user
}

export const register = (firstName: string, lastName: string, email: string, password: string) =>
  request<{ message: string }>('POST', '/auth/register', { firstName, lastName, email, password })

export const forgotPassword = (email: string) =>
  request<{ message: string }>('POST', '/auth/forgot-password', { email })

export const resetPassword = (token: string, password: string) =>
  request<{ message: string }>('POST', '/auth/reset-password', { token, password })

// ---------- users & groups ----------

type RawUser = { _id: string; firstName: string; lastName: string; email: string }

export async function listUsers(): Promise<User[]> {
  const raw = await request<RawUser[]>('GET', '/users')
  return raw.map((u) => ({ id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email }))
}

export const listGroups = () => request<Group[]>('GET', '/groups')
export const createGroup = (groupName: string) => request<Group>('POST', '/groups', { groupName })
export const addMember = (groupId: string, email: string, role: 'admin' | 'member') =>
  request<{ message: string }>('POST', `/groups/${groupId}/members`, { email, role })
export const removeMember = (groupId: string, userId: string) =>
  request<{ message: string }>('DELETE', `/groups/${groupId}/members/${userId}`)

// ---------- shifts ----------

export const myShifts = () => request<Shift[]>('GET', '/shifts/mine')
export const openShifts = () => request<Shift[]>('GET', '/shifts/open')

// Server-side partial-match search: GET /api/shifts/search?q=bar&day=Monday
export function searchShifts(q: string, day = '') {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (day) params.set('day', day)
  return request<Shift[]>('GET', `/shifts/search?${params.toString()}`)
}

export type ShiftInput = {
  dayOfWeek: string
  startTime: string
  endTime: string
  title: string
}

export const createShift = (groupId: string, userId: string, shift: ShiftInput) =>
  request<Shift>('POST', '/shifts', { groupId, userId, ...shift })
export const updateShift = (id: string, changes: Partial<ShiftInput>) =>
  request<Shift>('PUT', `/shifts/${id}`, changes)
export const deleteShift = (id: string) => request<{ message: string }>('DELETE', `/shifts/${id}`)
export const releaseShift = (id: string) => request<{ message: string }>('POST', `/shifts/${id}/release`)
export const claimShift = (id: string) => request<Shift>('POST', `/shifts/${id}/claim`)

// ---------- display helpers ----------

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// "13:30" -> "1:30 PM"
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  if (Number.isNaN(h)) return t
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

export const formatRange = (s: Pick<Shift, 'startTime' | 'endTime'>) =>
  `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`

export function shiftHours(s: Pick<Shift, 'startTime' | 'endTime'>): number {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m || 0)
  }
  let mins = toMin(s.endTime) - toMin(s.startTime)
  if (mins < 0) mins += 24 * 60 // overnight shift
  return mins / 60
}

// Sort shifts Monday -> Sunday, then by start time
export function sortByDay<T extends Pick<Shift, 'dayOfWeek' | 'startTime'>>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
  )
}

export const idOf = (v: string | { _id: string }) => (typeof v === 'string' ? v : v._id)

export const fullName = (u?: { firstName: string; lastName: string } | null) =>
  u ? `${u.firstName} ${u.lastName}` : 'Unknown'
