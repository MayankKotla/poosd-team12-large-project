import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import GroupPicker from '../components/GroupPicker'
import { DAYS, createShift, deleteShift, formatRange, fullName, idOf, searchShifts, sortByDay, updateShift } from '../lib/api'
import type { Shift, ShiftInput } from '../lib/api'
import { useGroups } from '../lib/useGroups'

const emptyForm: ShiftInput = { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', title: '' }

function EmployerDashboard() {
  const { groups, users, selected, selectedId, setSelectedId, isAdmin, reload, error: groupError } = useGroups()
  const admin = isAdmin(selected)

  const [shifts, setShifts] = useState<Shift[]>([])
  const [employee, setEmployee] = useState('')
  const [form, setForm] = useState<ShiftInput>(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [edit, setEdit] = useState<ShiftInput>(emptyForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Every shift in the selected group (search with an empty query = all shifts in my groups)
  const loadShifts = useCallback(async () => {
    if (!selectedId) return setShifts([])
    try {
      const all = await searchShifts('')
      setShifts(sortByDay(all.filter((s) => idOf(s.group) === selectedId)))
    } catch (e) {
      setError((e as Error).message)
    }
  }, [selectedId])

  useEffect(() => {
    loadShifts()
  }, [loadShifts])

  const done = (text: string) => {
    setError('')
    setMessage(text)
  }
  const fail = (e: unknown) => {
    setMessage('')
    setError((e as Error).message)
  }

  const addShift = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (form.endTime <= form.startTime) return fail(new Error('End time must be after start time.'))
    try {
      await createShift(selectedId, employee, { ...form, title: form.title.trim() || 'Shift' })
      done(`Shift created for ${fullName(users[employee])}.`)
      setForm(emptyForm)
      setEmployee('')
      loadShifts()
    } catch (err) {
      fail(err)
    }
  }

  const saveEdit = async (id: string) => {
    try {
      await updateShift(id, edit) // PUT /api/shifts/:id (admins only)
      setEditingId('')
      done('Shift updated.')
      loadShifts()
    } catch (err) {
      fail(err)
    }
  }

  const removeShift = async (s: Shift) => {
    if (!window.confirm(`Delete ${s.dayOfWeek} ${s.title}?`)) return
    try {
      await deleteShift(s._id) // DELETE /api/shifts/:id (admins only)
      done('Shift deleted.')
      loadShifts()
    } catch (err) {
      fail(err)
    }
  }

  const memberName = (s: Shift) =>
    typeof s.user === 'object' ? fullName(s.user) : fullName(users[s.user])

  const shiftFields = (value: ShiftInput, onChange: (v: ShiftInput) => void, prefix: string) => (
    <>
      <select
        aria-label="Day of week"
        id={`${prefix}Day`}
        value={value.dayOfWeek}
        onChange={(e) => onChange({ ...value, dayOfWeek: e.target.value })}
        className="border rounded-lg p-3"
      >
        {DAYS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <input
        aria-label="Shift title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Title, e.g. Morning Barista"
        className="border rounded-lg p-3"
      />
      <input
        aria-label="Start time"
        type="time"
        value={value.startTime}
        onChange={(e) => onChange({ ...value, startTime: e.target.value })}
        className="border rounded-lg p-3"
        required
      />
      <input
        aria-label="End time"
        type="time"
        value={value.endTime}
        onChange={(e) => onChange({ ...value, endTime: e.target.value })}
        className="border rounded-lg p-3"
        required
      />
    </>
  )

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Employer Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage employee schedules and workplace shifts.</p>
        </div>

        <GroupPicker
          groups={groups}
          selectedId={selectedId}
          onSelect={setSelectedId}
          isAdmin={admin}
          onCreated={(g) => {
            setSelectedId(g._id)
            reload()
            done(`Group "${g.groupName}" created. You're its admin.`)
          }}
        />

        {groupError && <Alert kind="error">{groupError}</Alert>}
        {message && <Alert kind="success">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        {selected && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-slate-500">Total Shifts</p>
                <h2 className="text-3xl font-bold mt-2">{shifts.length}</h2>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-slate-500">Open Shifts</p>
                <h2 className="text-3xl font-bold mt-2">
                  {shifts.filter((s) => s.status === 'up_for_grabs').length}
                </h2>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-slate-500">Members</p>
                <h2 className="text-3xl font-bold mt-2">{selected.members.length}</h2>
              </div>
            </div>

            {admin ? (
              <form onSubmit={addShift} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                <h2 className="text-xl font-semibold text-slate-800">Create New Shift</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    aria-label="Employee"
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                    className="border rounded-lg p-3 md:col-span-2"
                    required
                  >
                    <option value="">Select Employee</option>
                    {selected.members.map((m) => (
                      <option key={m.user} value={m.user}>
                        {fullName(users[m.user])}
                      </option>
                    ))}
                  </select>
                  {shiftFields(form, setForm, 'new')}
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
                  Create Shift
                </button>
              </form>
            ) : (
              <Alert kind="info">Only group admins can create, edit or delete shifts.</Alert>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-slate-800">Shift Management</h2>
                <Link to="/employees" className="text-blue-600 hover:underline">
                  Manage Employees
                </Link>
              </div>

              <div className="space-y-3">
                {shifts.length === 0 ? (
                  <p className="text-slate-500">No shifts have been created.</p>
                ) : (
                  shifts.map((shift) => (
                    <div
                      key={shift._id}
                      className="border border-slate-200 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4"
                    >
                      {editingId === shift._id ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                          {shiftFields(edit, setEdit, `edit${shift._id}`)}
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {memberName(shift)} · {shift.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {shift.dayOfWeek} | {formatRange(shift)}
                          </p>
                          <span
                            className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                              shift.status === 'up_for_grabs'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {shift.status === 'up_for_grabs' ? 'Open' : 'Scheduled'}
                          </span>
                        </div>
                      )}

                      {admin && (
                        <div className="flex gap-2">
                          {editingId === shift._id ? (
                            <>
                              <button
                                onClick={() => saveEdit(shift._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId('')}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(shift._id)
                                  setEdit({
                                    dayOfWeek: shift.dayOfWeek,
                                    startTime: shift.startTime,
                                    endTime: shift.endTime,
                                    title: shift.title,
                                  })
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeShift(shift)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EmployerDashboard
