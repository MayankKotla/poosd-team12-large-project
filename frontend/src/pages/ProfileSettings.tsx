// Shows the logged-in account. Password changes use the same secure
// email reset flow as "Forgot Password" (the API has no change-password route).
import { useState } from 'react'
import Alert from '../components/Alert'
import { forgotPassword, getUser } from '../lib/api'

function ProfileSettings() {
  const me = getUser()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const sendReset = async () => {
    if (!me) return
    setBusy(true)
    setError('')
    try {
      await forgotPassword(me.email)
      setMessage(`A password reset link was sent to ${me.email}.`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const field = (label: string, value: string) => (
    <div>
      <p className="block text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-slate-800 font-medium border rounded-lg p-3 bg-slate-50">{value}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profile & Settings</h1>
          <p className="text-slate-500 mt-2">Your account details.</p>
        </div>

        {message && <Alert kind="success">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('First Name', me?.firstName ?? '')}
            {field('Last Name', me?.lastName ?? '')}
            {field('Email', me?.email ?? '')}
            {field('Account Status', 'Verified')}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Password</h2>
          <p className="text-slate-500">We'll email you a secure link to choose a new password.</p>
          <button
            type="button"
            onClick={sendReset}
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg"
          >
            {busy ? 'Sending…' : 'Send Password Reset Email'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
