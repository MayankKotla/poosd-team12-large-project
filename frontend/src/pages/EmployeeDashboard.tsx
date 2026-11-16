import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Alert from '../components/Alert'
import { DAYS, formatRange, getUser, myShifts, shiftHours, sortByDay } from '../lib/api'
import type { Shift } from '../lib/api'

// Shifts repeat weekly by day name, so "upcoming" = starting from today's weekday
function upcomingFirst(shifts: Shift[]): Shift[] {
  const today = (new Date().getDay() + 6) % 7 // Monday = 0
  const rank = (s: Shift) => (DAYS.indexOf(s.dayOfWeek) - today + 7) % 7
  return [...sortByDay(shifts)].sort((a, b) => rank(a) - rank(b))
}

function EmployeeDashboard() {
  const me = getUser()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    myShifts()
      .then(setShifts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const assigned = shifts.filter((s) => s.status === 'assigned')
  const hours = assigned.reduce((sum, s) => sum + shiftHours(s), 0)
  const next = upcomingFirst(assigned).slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-slate-900">Employee Dashboard</h2>
        <p className="text-slate-500 mt-2">
          Welcome back{me ? `, ${me.firstName}` : ''}! Here's your schedule overview.
        </p>

        {error && <div className="mt-6"><Alert kind="error">{error}</Alert></div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Weekly Shifts</h3>
            <p className="text-4xl font-bold text-blue-700 mt-3">{loading ? '–' : assigned.length}</p>
            <p className="text-sm text-slate-400 mt-2">Scheduled shifts</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Hours This Week</h3>
            <p className="text-4xl font-bold text-blue-700 mt-3">{loading ? '–' : Math.round(hours * 10) / 10}</p>
            <p className="text-sm text-slate-400 mt-2">Total scheduled hours</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-8 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Shifts</h3>

          <div className="space-y-4">
            {!loading && next.length === 0 && (
              <p className="text-slate-500">No shifts yet. Your group admin will assign them here.</p>
            )}

            {next.map((shift) => (
              <div key={shift._id} className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <p className="font-semibold text-slate-800">
                    {shift.dayOfWeek} · {shift.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatRange(shift)}
                    {typeof shift.group === 'object' && ` · ${shift.group.groupName}`}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  Scheduled
                </span>
              </div>
            ))}

            <div className="mt-6">
              <Link
                to="/schedule"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                View Full Schedule
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeDashboard
