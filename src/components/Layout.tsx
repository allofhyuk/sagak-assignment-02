import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/** 보호 영역 레이아웃 (헤더 + 본문) */
export default function Layout() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="font-bold tracking-tight">sagak-assignment</span>
          <button
            onClick={logout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            로그아웃
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
