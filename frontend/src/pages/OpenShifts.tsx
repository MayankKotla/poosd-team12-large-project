import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/Alert'
import { claimShift, formatRange, fullName, getUser, idOf, openShifts, sortByDay } from '../lib/api'
import type { Shift } from '../lib/api'
import { useGroups } from '../lib/useGroups'

function OpenShifts() {
  const me = getUser()
  const { users, groups } = useGroups() // to show names instead of ids
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    openShifts()
      // hide my own offered shifts; those are on My Schedule
      .then((list) => setShifts(sortByDay(list.filter((s) => idOf(s.user) !== me?.id))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [me?.id])

  useEffect(load, [load])

  // POST /api/shifts/:id/claim; the server makes sure only one person can win it
  const claim = async (shift: Shift) => {
    setError('')
    setMessage('')
    try {
      await claimShift(shift._id)
      setMessage(`${shift.dayOfWeek} ${shift.title} (${formatRange(shift)}) is now yours!`)
    } catch (e) {
      setError((e as Error).message)
    }
    load()
  }

  const groupName = (s: Shift) =>
    typeof s.group === 'object' ? s.group.groupName : groups.find((g) => g._id === s.group)?.groupName

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Open Shifts</h1>
        <p className="text-slate-500 mt-2">Browse and claim available shifts from your coworkers.</p>
      </div>

      <div className="space-y-3 mb-6">
        {message && <Alert kind="success">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Available Shifts</h2>

        {!loading && shifts.length === 0 && (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold text-slate-700">No Available Shifts</h3>
            <p className="text-slate-500 mt-2">When a coworker offers a shift, it will show up here.</p>
          </div>
        )}

        <div className="space-y-4">
          {shifts.map((shift) => (
            <div key={shift._id} className="border border-slate-200 rounded-lg p-5">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {shift.dayOfWeek} · {shift.title}
                  </h3>
                  <p className="text-slate-500 mt-1">
                    {formatRange(shift)}
                    {groupName(shift) && ` · ${groupName(shift)}`}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Offered by: {fullName(users[idOf(shift.user)])}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => claim(shift)}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Claim Shift
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OpenShifts
