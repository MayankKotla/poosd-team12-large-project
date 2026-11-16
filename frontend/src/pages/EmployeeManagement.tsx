import { useState } from 'react'
import type { FormEvent } from 'react'
import Alert from '../components/Alert'
import GroupPicker from '../components/GroupPicker'
import { addMember, fullName, removeMember } from '../lib/api'
import { useGroups } from '../lib/useGroups'

function EmployeeManagement() {
  const { me, groups, users, selected, selectedId, setSelectedId, isAdmin, reload, error: groupError } = useGroups()
  const admin = isAdmin(selected)

  const [search, setSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const done = (text: string) => {
    setError('')
    setMessage(text)
  }
  const fail = (e: unknown) => {
    setMessage('')
    setError((e as Error).message)
  }

  // POST /api/groups/:id/members: the person must already have a ShiftFlow account
  const invite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await addMember(selectedId, inviteEmail.trim(), inviteRole)
      done(`${inviteEmail.trim()} was added to ${selected?.groupName}.`)
      setInviteEmail('')
      reload()
    } catch (err) {
      fail(err)
    }
  }

  const remove = async (userId: string) => {
    const name = fullName(users[userId])
    if (!window.confirm(`Remove ${name} from ${selected?.groupName}?`)) return
    try {
      await removeMember(selectedId, userId) // DELETE /api/groups/:id/members/:userId
      done(`${name} was removed.`)
      reload()
    } catch (err) {
      fail(err)
    }
  }

  const members = (selected?.members ?? []).filter((m) => {
    const u = users[m.user]
    return `${fullName(u)} ${u?.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Employee Management</h1>
          <p className="text-slate-500 mt-2">Manage workplace members and roles.</p>
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
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-slate-500">Total Members</p>
                <h2 className="text-3xl font-bold mt-2">{selected.members.length}</h2>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-slate-500">Admins</p>
                <h2 className="text-3xl font-bold mt-2">
                  {selected.members.filter((m) => m.role === 'admin').length}
                </h2>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-slate-500">Employees</p>
                <h2 className="text-3xl font-bold mt-2">
                  {selected.members.filter((m) => m.role === 'member').length}
                </h2>
              </div>
            </div>

            {admin && (
              <form onSubmit={invite} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <h2 className="text-xl font-semibold text-slate-800">Add Employee</h2>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="email"
                    aria-label="Employee email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter employee email"
                    className="flex-1 min-w-48 border rounded-lg p-3"
                    required
                  />
                  <select
                    aria-label="Role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                    className="border rounded-lg p-3"
                  >
                    <option value="member">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
                    Add to Group
                  </button>
                </div>
                <p className="text-sm text-slate-500">They need a verified ShiftFlow account with this email first.</p>
              </form>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                <h2 className="text-xl font-semibold text-slate-800">Workplace Members</h2>
                <input
                  type="text"
                  aria-label="Search members"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees..."
                  className="border rounded-lg p-3"
                />
              </div>

              <div className="space-y-3">
                {members.length === 0 ? (
                  <p className="text-slate-500">No employees found.</p>
                ) : (
                  members.map((m) => {
                    const u = users[m.user]
                    const isOwner = selected.owner === m.user
                    return (
                      <div
                        key={m.user}
                        className="border border-slate-200 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4"
                      >
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {fullName(u)}
                            {m.user === me?.id && <span className="text-slate-400 font-normal"> (you)</span>}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">{u?.email}</p>
                          <span
                            className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                              m.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {isOwner ? 'Owner' : m.role === 'admin' ? 'Admin' : 'Employee'}
                          </span>
                        </div>

                        {admin && !isOwner && (
                          <button
                            onClick={() => remove(m.user)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EmployeeManagement
