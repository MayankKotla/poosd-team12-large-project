// Server-side partial-match search across every group you belong to.
// Each keystroke (after a short pause) calls GET /api/shifts/search?q=...&day=...
import { useEffect, useState } from 'react'
import Alert from '../components/Alert'
import { DAYS, formatRange, fullName, searchShifts, sortByDay } from '../lib/api'
import type { Shift } from '../lib/api'
import { useGroups } from '../lib/useGroups'

function SearchShifts() {
  const { groups } = useGroups()
  const [q, setQ] = useState('')
  const [day, setDay] = useState('')
  const [results, setResults] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      searchShifts(q.trim(), day)
        .then((r) => {
          setResults(sortByDay(r))
          setError('')
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false))
    }, 300) // debounce so we don't call the API on every single keystroke
    return () => clearTimeout(timer)
  }, [q, day])

  const groupName = (s: Shift) =>
    typeof s.group === 'object' ? s.group.groupName : groups.find((g) => g._id === s.group)?.groupName
  const person = (s: Shift) => (typeof s.user === 'object' ? fullName(s.user) : '')

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Search Shifts</h1>
          <p className="text-slate-500 mt-2">Find shifts in your groups by title. Partial words work, e.g. "bar".</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-wrap gap-4">
          <input
            type="search"
            aria-label="Search shift titles"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shift titles…"
            className="flex-1 min-w-56 border rounded-lg p-3"
          />
          <select
            aria-label="Filter by day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="border rounded-lg p-3"
          >
            <option value="">Any day</option>
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500 mb-4">
            {loading ? 'Searching…' : `${results.length} shift${results.length === 1 ? '' : 's'} found`}
          </p>
          <div className="space-y-3">
            {results.map((s) => (
              <div
                key={s._id}
                className="border border-slate-200 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {s.title} · {s.dayOfWeek}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatRange(s)}
                    {person(s) && ` · ${person(s)}`}
                    {groupName(s) && ` · ${groupName(s)}`}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    s.status === 'up_for_grabs' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {s.status === 'up_for_grabs' ? 'Open' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchShifts
