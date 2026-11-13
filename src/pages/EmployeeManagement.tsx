
import { useState } from 'react'

type Employee = {
  id: number
  name: string
  email: string
  role: 'Employee' | 'Manager'
  status: 'Active' | 'Invited'
}

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: 'Jordan Smith',
    email: 'jordan@example.com',
    role: 'Employee',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Taylor Johnson',
    email: 'taylor@example.com',
    role: 'Employee',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Alex Brown',
    email: 'alex.brown@example.com',
    role: 'Manager',
    status: 'Active',
  },
]

function EmployeeManagement() {
  const [employees, setEmployees] = useState(initialEmployees)
  const [search, setSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [message, setMessage] = useState('')

  const inviteEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const email = inviteEmail.trim().toLowerCase()

    if (employees.some((employee) => employee.email.toLowerCase() === email)) {
      setMessage('This employee is already listed.')
      return
    }

    const newEmployee: Employee = {
      id: Date.now(),
      name: email.split('@')[0],
      email,
      role: 'Employee',
      status: 'Invited',
    }

    setEmployees((previous) => [...previous, newEmployee])
    setInviteEmail('')
    setMessage('Invitation added to the demo list. No email was sent.')
  }

  const updateRole = (id: number, role: Employee['role']) => {
    setEmployees((previous) =>
      previous.map((employee) =>
        employee.id === id ? { ...employee, role } : employee
      )
    )
    setMessage('Employee role updated! (Demo only)')
  }

  const removeEmployee = (id: number) => {
    setEmployees((previous) =>
      previous.filter((employee) => employee.id !== id)
    )
    setMessage('Employee removed! (Demo only)')
  }

  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Employee Management
          </h1>
          <p className="text-slate-500 mt-2">
            Manage workplace members, invitations, and roles.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-slate-500">Total Members</p>
            <h2 className="text-3xl font-bold mt-2">
              {employees.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-slate-500">Active Employees</p>
            <h2 className="text-3xl font-bold mt-2">
              {employees.filter((e) => e.status === 'Active').length}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-slate-500">Pending Invitations</p>
            <h2 className="text-3xl font-bold mt-2">
              {employees.filter((e) => e.status === 'Invited').length}
            </h2>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-blue-100 border border-blue-200 text-blue-800 p-4 rounded-lg">
            {message}
          </div>
        )}

        {/* Invite Employee */}
        <form
          onSubmit={inviteEmployee}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-slate-800">
            Invite Employee
          </h2>

          <div className="flex flex-wrap gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter employee email"
              className="flex-1 min-w-48 border rounded-lg p-3"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Send Invitation
            </button>
          </div>
          <p className="text-sm text-slate-500">
            Demo only — invitations are not emailed yet.
          </p>
        </form>

        {/* Employee List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
            <h2 className="text-xl font-semibold text-slate-800">
              Workplace Members
            </h2>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="border rounded-lg p-3"
            />
          </div>

          <div className="space-y-3">
            {filteredEmployees.length === 0 ? (
              <p className="text-slate-500">
                No employees found.
              </p>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="border border-slate-200 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {employee.email}
                    </p>
                    <span
                      className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                        employee.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={employee.role}
                      onChange={(e) =>
                        updateRole(
                          employee.id,
                          e.target.value as Employee['role']
                        )
                      }
                      className="border rounded-lg p-2"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                    </select>

                    <button
                      onClick={() => removeEmployee(employee.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default EmployeeManagement
