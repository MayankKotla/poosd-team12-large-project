import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/Alert'
import { DAYS, formatRange, myShifts, releaseShift, sortByDay } from '../lib/api'
import type { Shift } from '../lib/api'

const groupName = (s: Shift) => (typeof s.group === 'object' ? s.group.groupName : '')

function MySchedule() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [view, setView] = useState<'list' | 'week'>('list')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    myShifts()
      .then((s) => setShifts(sortByDay(s)))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  // POST /api/shifts/:id/release puts the shift up for grabs for coworkers
  const offerShift = async (shift: Shift) => {
    setError('')
    setMessage('')
    try {
      await releaseShift(shift._id)
      setMessage(`${shift.dayOfWeek} ${shift.title} is now offered to your coworkers.`)
      load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const offered = (s: Shift) => s.status === 'up_for_grabs'

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Schedule</h1>
        <p className="text-slate-500 mt-2">View your weekly shifts and offer ones you can't work.</p>
      </div>

      <div className="flex gap-3 mb-6">
        {(['list', 'week'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-5 py-2 rounded-lg font-medium ${
              view === v ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            {v === 'list' ? 'List View' : 'Week View'}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {message && <Alert kind="success">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}
      </div>

      {!loading && shifts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-700">No shifts yet</h3>
          <p className="text-slate-500 mt-2">When a group admin assigns you a shift, it shows up here.</p>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <div key={shift._id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {shift.dayOfWeek} · {shift.title}
                  </h3>
                  <p className="text-slate-500 mt-2">
                    {formatRange(shift)}
                    {groupName(shift) && ` · ${groupName(shift)}`}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    offered(shift) ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {offered(shift) ? 'Offered' : 'Scheduled'}
                </span>
              </div>

              <div className="flex justify-end mt-5">
                {offered(shift) ? (
                  <p className="text-sm text-slate-500">Waiting for a coworker to claim it</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => offerShift(shift)}
                    className="text-white text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                  >
                    Offer Shift
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'week' && shifts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {DAYS.map((day) => (
              <div key={day} className="border border-slate-200 rounded-lg p-3 min-h-32">
                <p className="text-center font-semibold text-slate-600 mb-2">{day.slice(0, 3)}</p>
                {shifts
                  .filter((s) => s.dayOfWeek === day)
                  .map((s) => (
                    <div
                      key={s._id}
                      className={`mt-2 p-2 rounded-md text-xs font-medium ${
                        offered(s) ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <p>{s.title}</p>
                      <p className="mt-1">{formatRange(s)}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-5 mt-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
              <span>Scheduled Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
              <span>Offered Shift</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MySchedule
