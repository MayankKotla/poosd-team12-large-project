// Wraps the logged-in pages: if there is no saved token, go to /login.
import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../lib/api'

function RequireAuth() {
  return getToken() ? <Outlet /> : <Navigate to="/login" replace />
}

export default RequireAuth
