// Notifications are built from live data: shifts coworkers have offered,
// and shifts you've offered that are still waiting to be claimed.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import { formatRange, getUser, idOf, myShifts, openShifts, sortByDay } from '../lib/api'
import type { Shift } from '../lib/api'

type Note = { id: string; title: string; message: string; link: string }

function Notifications() {
  const me = getUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([openShifts(), myShifts()])
      .then(([open, mine]) => {
        const fromCoworkers = sortByDay(open.filter((s) => idOf(s.user) !== me?.id)).map((s: Shift) => ({
          id: `open-${s._id}`,
          title: 'New Shift Available',
          message: `${s.title} on ${s.dayOfWeek}, ${formatRange(s)} is up for grabs.`,
          link: '/open-shifts',
        }))
        const myOffers = sortByDay(mine.filter((s) => s.status === 'up_for_grabs')).map((s: Shift) => ({
          id: `mine-${s._id}`,
          title: 'Your Offered Shift',
          message: `Your ${s.dayOfWeek} ${s.title} shift is waiting for a coworker to claim it.`,
          link: '/schedule',
        }))
        setNotes([...fromCoworkers, ...myOffers])
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [me?.id])

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 mt-2">
            {loading ? 'Loading…' : `${notes.length} item${notes.length === 1 ? '' : 's'} need your attention`}
          </p>
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {!loading && notes.length === 0 && <p className="text-slate-500">You're all caught up.</p>}
          {notes.map((n) => (
            <Link
              key={n.id}
              to={n.link}
              className="block border border-slate-200 rounded-lg p-4 hover:bg-slate-50 border-l-4 border-l-blue-600"
            >
              <h3 className="font-semibold text-slate-800">{n.title}</h3>
              <p className="text-slate-600 mt-1">{n.message}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Notifications
