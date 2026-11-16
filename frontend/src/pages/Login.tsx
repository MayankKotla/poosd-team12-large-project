import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthLayout, { inputClass, labelClass, primaryButton } from '../components/AuthLayout'
import Alert from '../components/Alert'
import { login } from '../lib/api'

function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Banners for arriving from the verify-email link, a password reset, or an expired session
  const notice = params.get('verified')
    ? 'Email verified! You can sign in now.'
    : params.get('reset')
      ? 'Password updated. Sign in with your new password.'
      : params.get('expired')
        ? 'Your session expired. Please sign in again.'
        : ''

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password) // POST /api/auth/login, saves the JWT
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout heading="ShiftFlow" tagline="Simplify scheduling. Empower your team.">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome Back</h2>
      <p className="text-slate-500">Sign in to manage your schedule.</p>

      {notice && (
        <div className="mt-6">
          <Alert kind="success">{notice}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create Account
          </Link>
        </p>
      </form>

      {error && (
        <div className="mt-4">
          <Alert kind="error">{error}</Alert>
        </div>
      )}
    </AuthLayout>
  )
}

export default Login
