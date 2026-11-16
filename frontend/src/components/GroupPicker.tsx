// Group selector + "create a group" form, shown at the top of the
// management pages. Whoever creates a group becomes its owner and admin.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { createGroup } from '../lib/api'
import type { Group } from '../lib/api'

type Props = {
  groups: Group[]
  selectedId: string
  onSelect: (id: string) => void
  onCreated: (group: Group) => void
  isAdmin: boolean
}

function GroupPicker({ groups, selectedId, onSelect, onCreated, isAdmin }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const group = await createGroup(name.trim())
      setName('')
      onCreated(group)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-wrap items-end gap-6">
      <div className="flex-1 min-w-56">
        <label htmlFor="groupSelect" className="block text-sm font-medium text-slate-700 mb-2">
          Workplace group
        </label>
        {groups.length === 0 ? (
          <p className="text-slate-500">You are not in any groups yet. Create one to get started.</p>
        ) : (
          <div className="flex items-center gap-3">
            <select
              id="groupSelect"
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className="border rounded-lg p-3 min-w-56"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.groupName}
                </option>
              ))}
            </select>
            <span
              className={`text-xs px-3 py-1 rounded-full ${
                isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="newGroup" className="block text-sm font-medium text-slate-700 mb-2">
            New group
          </label>
          <input
            id="newGroup"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Downtown Cafe"
            required
            className="border rounded-lg p-3"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg"
        >
          Create Group
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}

export default GroupPicker
