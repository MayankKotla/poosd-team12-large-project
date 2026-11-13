
import { useState } from 'react'
import { Link } from 'react-router-dom'

type Shift = {
  id: number
  employee: string
  date: string
  time: string
  status: string
}

const initialShifts: Shift[] = [
  {
    id: 1,
    employee: 'Jordan Smith',
    date: 'November 16',
    time: '9:00 AM - 5:00 PM',
    status: 'Scheduled',
  },
  {
    id: 2,
    employee: 'Taylor Johnson',
    date: 'November 18',
    time: '12:00 PM - 8:00 PM',
    status: 'Scheduled',
  },
  {
    id: 3,
    employee: 'Alex Brown',
    date: 'November 20',
    time: '8:00 AM - 4:00 PM',
    status: 'Open',
  },
]

function EmployerDashboard() {
  const [shifts, setShifts] = useState(initialShifts)
  const [employee, setEmployee] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [message, setMessage] = useState('')

  const addShift = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!employee || !date || !startTime || !endTime) {
      setMessage('Please complete all shift fields.')
      return
    }

    if (endTime <= startTime) {
      setMessage('End time must be after start time.')
      return
    }

    const newShift: Shift = {
      id: Date.now(),
      employee,
      date,
      time: `${startTime} - ${endTime}`,
      status: 'Scheduled',
    }

    setShifts((previous) => [...previous, newShift])
    setMessage('Shift created successfully! (Demo only)')
    setEmployee('')
    setDate('')
    setStartTime('')
    setEndTime('')
  }

  const removeShift = (id: number) => {
    setShifts((previous) =>
      previous.filter((shift) => shift.id !== id)
    )
    setMessage('Shift removed successfully! (Demo only)')
  }

  const openShifts = shifts.filter(
    (shift) => shift.status === 'Open'
  ).length

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Employer Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Manage employee schedules and workplace shifts.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Total Shifts</p>
            <h2 className="text-3xl font-bold mt-2">
              {shifts.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Open Shifts</p>
            <h2 className="text-3xl font-bold mt-2">
              {openShifts}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Employees</p>
            <h2 className="text-3xl font-bold mt-2">
              3
            </h2>
          </div>
        </div>

        {/* Confirmation Message */}
        {message && (
          <div className="bg-blue-100 text-blue-800 border border-blue-200 p-4 rounded-lg">
            {message}
          </div>
        )}

        {/* Create Shift */}
        <form
          onSubmit={addShift}
          className="bg-white p-6 rounded-xl shadow-sm space-y-4"
        >
          <h2 className="text-xl font-semibold text-slate-800">
            Create New Shift
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="border rounded-lg p-3"
              required
            >
              <option value="">Select Employee</option>
              <option>Jordan Smith</option>
              <option>Taylor Johnson</option>
              <option>Alex Brown</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg p-3"
              required
            />

            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded-lg p-3"
              required
            />

            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded-lg p-3"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Create Shift
          </button>
        </form>

        {/* Shift Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-slate-800">
              Shift Management
            </h2>

            <Link
              to="/employees"
              className="text-blue-600 hover:underline"
            >
              Manage Employees
            </Link>
          </div>

          <div className="space-y-3">
            {shifts.length === 0 ? (
              <p className="text-slate-500">
                No shifts have been created.
              </p>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="border border-slate-200 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {shift.employee}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {shift.date} | {shift.time}
                    </p>

                    <span
                      className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                        shift.status === 'Open'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {shift.status}
                    </span>
                  </div>

                  <button
                    onClick={() => removeShift(shift.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default EmployerDashboard
