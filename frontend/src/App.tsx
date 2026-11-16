import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmployeeDashboard from './pages/EmployeeDashboard'
import MySchedule from './pages/MySchedule'
import OpenShifts from './pages/OpenShifts'
import SearchShifts from './pages/SearchShifts'
import Notifications from './pages/Notifications'
import ProfileSettings from './pages/ProfileSettings'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployeeManagement from './pages/EmployeeManagement'
import DashboardLayout from './components/DashboardLayout'
import RequireAuth from './components/RequireAuth'
import { getToken } from './lib/api'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages: the app opens on login/register */}
        <Route path="/" element={<Navigate to={getToken() ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* the emailed reset link points here */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Logged-in pages (JWT required) with the shared sidebar */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/schedule" element={<MySchedule />} />
            <Route path="/open-shifts" element={<OpenShifts />} />
            <Route path="/search" element={<SearchShifts />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
