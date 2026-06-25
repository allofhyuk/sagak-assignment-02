import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCheckupStore } from '../store/checkupStore'

export default function Layout() {
  const logoutAuth = useAuthStore((s) => s.logout)
  const resetCheckup = useCheckupStore((s) => s.reset)
  const logout = () => {
    resetCheckup()
    logoutAuth()
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col bg-[#3C5DA9] px-6 py-8 text-white">
        <span className="text-lg font-bold tracking-tight">Sagak-assignment</span>
        <nav className="mt-10 flex-1">
          <span className="block rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold">
            건강검진 내역
          </span>
        </nav>
        <button
          onClick={logout}
          className="text-left text-sm text-white/70 transition hover:text-white"
        >
          로그아웃
        </button>
      </aside>
      <main className="flex-1 bg-slate-50 px-10 py-8">
        <Outlet />
      </main>
    </div>
  )
}
