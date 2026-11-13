import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMessage('Login form submitted successfully! Backend not connected yet.')
    }



    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

        <div className="w-full max-w-6xl min-h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

            {/* Left branding panel */}
            <div className="bg-blue-600 text-white flex flex-col justify-center p-10 md:p-16">

            <h1 className="text-5xl font-bold mb-6">
                ShiftFlow
            </h1>

            <p className="text-xl text-blue-100">
                Simplify scheduling. Empower your team.
            </p>

            </div>

            {/* Right login panel */}
            <div className="flex flex-col justify-center p-10 md:p-16">

            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome Back
            </h2>

            <p className="text-slate-500">
                Sign in to manage your schedule.
            </p>

            
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                {/* Email field */}
                <div>
                    <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                    >
                    Email Address
                    </label>

                    <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Password field */}
                <div>
                    <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-2"
                    >
                    Password
                    </label>

                    <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                
                {/* Forgot password */}
                <div className="flex justify-end">
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    Forgot Password?
                </a>
                </div>

                {/* Sign In button */}
                <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                Sign In
                </button>

                {/* Registration link */}
                <p className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register"className="font-semibold text-blue-600 hover:text-blue-700">
                    Create Account
                </Link>
                </p>

            </form>

            
               
            {message && (
            <p className="mt-4 text-sm text-blue-600 text-center">
                {message}
            </p>
            )}


            </div>

        </div>

        </div>
    )
}

export default Login
