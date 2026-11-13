import { Link } from 'react-router-dom'

import { useState } from 'react'
import type { FormEvent } from 'react'



function Register() {
    
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password !== confirmPassword) {
        setMessage("Passwords do not match!")
        return
    }

    setMessage("Registration form submitted successfully! Backend not connected yet.")
  }



  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-6xl min-h-[650px] bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left branding panel */}
        <div className="bg-blue-600 text-white flex flex-col justify-center p-10 md:p-16">

          <h1 className="text-5xl font-bold mb-6">
            Join ShiftFlow
          </h1>

          <p className="text-xl text-blue-100">
            Smarter scheduling starts here.
          </p>

        </div>

        {/* Right registration panel */}
        <div className="flex flex-col justify-center p-10 md:p-16">

          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Create Account
          </h2>

          <p className="text-slate-500 mb-6">
            Enter your information to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="registerEmail" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="registerEmail"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="registerPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                placeholder="Create a password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create Account
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              
                <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
                >
                Sign In
                </Link>

            </p>

          </form>

          {message && (
            <p className="mt-4 text-sm text-center" 
            style={{
                color: message.toLowerCase().includes('do not match')
                    ? 'red'
                    : 'green'
            }}>
                {message}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}

export default Register
