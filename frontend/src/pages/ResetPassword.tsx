// Opened from the emailed link: <APP_URL>/reset-password/<token>
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthLayout, { inputClass, labelClass, primaryButton } from '../components/AuthLayout'
import Alert from '../components/Alert'
import { resetPassword } from '../lib/api'

function ResetPassword() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match!')
      return
    }
    setBusy(true)
    try {
      await resetPassword(token, password) // POST /api/auth/reset-password
      navigate('/login?reset=1')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout heading="ShiftFlow" tagline="Simplify scheduling. Empower your team.">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose a new password</h2>
      <p className="text-slate-500">Reset links expire after one hour and work once.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="newPassword" className={labelClass}>New Password</label>
          <input type="password" id="newPassword" placeholder="At least 8 characters" autoComplete="new-password"
            required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="confirmNew" className={labelClass}>Confirm New Password</label>
          <input type="password" id="confirmNew" placeholder="Confirm your password" autoComplete="new-password"
            required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'Saving…' : 'Update Password'}
        </button>
        <p className="text-center text-sm text-slate-500">
          <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700">
            Need a new link?
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

export default ResetPassword
