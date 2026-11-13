
import { useState } from 'react'

function ProfileSettings() {
  const [firstName, setFirstName] = useState('Alex')
  const [lastName, setLastName] = useState('Morgan')
  const [email, setEmail] = useState('alex@example.com')
  const [phone, setPhone] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [shiftAlerts, setShiftAlerts] = useState(true)
  const [scheduleUpdates, setScheduleUpdates] = useState(true)
  const [claimAlerts, setClaimAlerts] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)

  const [message, setMessage] = useState('')

  const saveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('Profile changes saved in this demo!')
  }

  const changePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please complete all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.')
      return
    }

    setMessage('Password form validated! Backend not connected yet.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const savePreferences = () => {
    setMessage('Notification preferences saved in this demo!')
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Profile & Settings
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your account and notification preferences.
          </p>
        </div>

        {message && (
          <div className="bg-blue-100 border border-blue-200 text-blue-800 p-4 rounded-lg">
            {message}
          </div>
        )}

        {/* Personal Information */}
        <form
          onSubmit={saveProfile}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-slate-800">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Save Profile
          </button>
        </form>

        {/* Security */}
        <form
          onSubmit={changePassword}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-slate-800">
            Security
          </h2>

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Change Password
          </button>
        </form>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Notification Preferences
          </h2>

          {[
            {
              label: 'New Available Shifts',
              checked: shiftAlerts,
              setter: setShiftAlerts,
            },
            {
              label: 'Schedule Updates',
              checked: scheduleUpdates,
              setter: setScheduleUpdates,
            },
            {
              label: 'Shift Claim Notifications',
              checked: claimAlerts,
              setter: setClaimAlerts,
            },
            {
              label: 'Email Notifications',
              checked: emailNotifications,
              setter: setEmailNotifications,
            },
          ].map((preference) => (
            <label
              key={preference.label}
              className="flex justify-between items-center border-b pb-3"
            >
              <span className="text-slate-700">
                {preference.label}
              </span>

              <input
                type="checkbox"
                checked={preference.checked}
                onChange={(e) =>
                  preference.setter(e.target.checked)
                }
                className="w-5 h-5 accent-blue-600"
              />
            </label>
          ))}

          <button
            onClick={savePreferences}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Save Preferences
          </button>
        </div>

        {/* Workplace Memberships */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Workplace Memberships
          </h2>

          <div className="flex justify-between items-center border rounded-lg p-4">
            <div>
              <h3 className="font-semibold text-slate-800">
                Demo Workplace
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Role: Employee
              </p>
            </div>

            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Active
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProfileSettings
