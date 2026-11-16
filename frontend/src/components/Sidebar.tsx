import { NavLink, useNavigate } from 'react-router-dom'
import { fullName, getUser, logout } from '../lib/api'

const employeeLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'My Schedule', path: '/schedule' },
  { label: 'Open Shifts', path: '/open-shifts' },
  { label: 'Search Shifts', path: '/search' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Profile & Settings', path: '/profile' },
]

const employerLinks = [
  { label: 'Employer Dashboard', path: '/employer' },
  { label: 'Employee Management', path: '/employees' },
]

function Sidebar() {
  const navigate = useNavigate()
  const me = getUser()

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-white text-blue-700 font-semibold' : 'text-blue-100 hover:bg-blue-600'
    }`

  const signOut = () => {
    logout() // forget the JWT
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-blue-700 text-white p-5 flex flex-col shrink-0">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">ShiftFlow</h1>
        <p className="text-blue-200 text-sm mt-1">Workforce Scheduling</p>
      </div>

      <nav className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-blue-200 mb-3">Employee</p>
        {employeeLinks.map((link) => (
          <NavLink key={link.path} to={link.path} className={linkStyle}>
            {link.label}
          </NavLink>
        ))}

        <p className="text-xs uppercase tracking-wider text-blue-200 pt-6 mb-3">Management</p>
        {employerLinks.map((link) => (
          <NavLink key={link.path} to={link.path} className={linkStyle}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        {me && (
          <p className="px-4 pb-2 text-sm text-blue-200">
            Signed in as <span className="text-white font-medium">{fullName(me)}</span>
          </p>
        )}
        <button
          type="button"
          onClick={signOut}
          className="w-full text-left px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
