import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * 라우팅 가드
 */
export default function ProtectedRoute() {
  const isAuthed = useAuthStore((s) => !!s.token)

  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
