
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import EmployeeDashboard from './pages/EmployeeDashboard'
import MySchedule from './pages/MySchedule'
import OpenShifts from './pages/OpenShifts'
import Notifications from './pages/Notifications'
import ProfileSettings from './pages/ProfileSettings'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployeeManagement from './pages/EmployeeManagement'
import DashboardLayout from './components/DashboardLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages With Shared Navigation */}
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
            path="/schedule"
            element={<MySchedule />}
          />

          <Route
            path="/open-shifts"
            element={<OpenShifts />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/profile"
            element={<ProfileSettings />}
          />

          <Route
            path="/employer"
            element={<EmployerDashboard />}
          />

          <Route
            path="/employees"
            element={<EmployeeManagement />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
