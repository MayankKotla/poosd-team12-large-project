// Shared two-panel layout for the login / register / password pages
import type { ReactNode } from 'react'
// (same blue branding panel Kam designed for Login and Register).
type Props = { heading: string; tagline: string; children: ReactNode }

function AuthLayout({ heading, tagline, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl min-h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="bg-blue-600 text-white flex flex-col justify-center p-10 md:p-16">
          <h1 className="text-5xl font-bold mb-6">{heading}</h1>
          <p className="text-xl text-blue-100">{tagline}</p>
        </div>
        <div className="flex flex-col justify-center p-10 md:p-16">{children}</div>
      </div>
    </div>
  )
}

export const inputClass =
  'w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
export const labelClass = 'block text-sm font-medium text-slate-700 mb-2'
export const primaryButton =
  'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors'

export default AuthLayout
