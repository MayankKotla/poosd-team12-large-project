import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import AuthLayout, { inputClass, labelClass, primaryButton } from '../components/AuthLayout'
import Alert from '../components/Alert'
import { register } from '../lib/api'

function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setBusy(true)
    try {
      // POST /api/auth/register: creates an unverified account and emails a verify link
      await register(firstName.trim(), lastName.trim(), email.trim(), password)
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthLayout heading="Join ShiftFlow" tagline="Smarter scheduling starts here.">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Check your email</h2>
        <p className="text-slate-600">
          We sent a verification link to <span className="font-semibold">{email}</span>. Click it to activate your
          account, then sign in. If you don't see it, check your spam folder.
        </p>
        <Link to="/login" className={`${primaryButton} mt-8 text-center block`}>
          Go to Sign In
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout heading="Join ShiftFlow" tagline="Smarter scheduling starts here.">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Create Account</h2>
      <p className="text-slate-500 mb-6">Enter your information to get started.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name</label>
          <input id="firstName" placeholder="Enter your first name" autoComplete="given-name" required
            value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name</label>
          <input id="lastName" placeholder="Enter your last name" autoComplete="family-name" required
            value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="registerEmail" className={labelClass}>Email Address</label>
          <input type="email" id="registerEmail" placeholder="you@example.com" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="registerPassword" className={labelClass}>Password</label>
          <input type="password" id="registerPassword" placeholder="At least 8 characters" autoComplete="new-password"
            required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
          <input type="password" id="confirmPassword" placeholder="Confirm your password" autoComplete="new-password"
            required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
        </div>

        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign In</Link>
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

export default Register
