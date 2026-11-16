import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthLayout, { inputClass, labelClass, primaryButton } from '../components/AuthLayout'
import Alert from '../components/Alert'
import { forgotPassword } from '../lib/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      // POST /api/auth/forgot-password: emails a reset link (same reply whether or not the email exists)
      const res = await forgotPassword(email.trim())
      setMessage(res.message)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout heading="ShiftFlow" tagline="Simplify scheduling. Empower your team.">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Reset your password</h2>
      <p className="text-slate-500">Enter your account email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>Email Address</label>
          <input type="email" id="email" placeholder="you@example.com" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'Sending…' : 'Send Reset Link'}
        </button>
        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Back to Sign In</Link>
        </p>
      </form>

      <div className="mt-4 space-y-2">
        {message && <Alert kind="success">{message} Check your spam folder too.</Alert>}
        {error && <Alert kind="error">{error}</Alert>}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
