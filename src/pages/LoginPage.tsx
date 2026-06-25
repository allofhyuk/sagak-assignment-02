import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Button from '../components/Button'

const rowCls = 'flex items-center gap-4'
const labelCls = 'w-16 shrink-0 text-sm text-slate-600'
const inputCls =
  'flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'

export default function LoginPage() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const canSubmit = id.trim() !== '' && password.trim() !== ''

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    login(id.trim())
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-10 py-12 shadow-sm"
      >
        <h1 className="mb-10 text-center text-lg font-bold tracking-tight">로그인</h1>

        <div className={`mb-4 ${rowCls}`}>
          <label htmlFor="login-id" className={labelCls}>
            아이디
          </label>
          <input id="login-id" className={inputCls} value={id} onChange={(e) => setId(e.target.value)} autoFocus />
        </div>

        <div className={`mb-10 ${rowCls}`}>
          <label htmlFor="login-pw" className={labelCls}>
            패스워드
          </label>
          <input
            id="login-pw"
            type="password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <Button type="submit" variant={canSubmit ? 'basic' : 'disabled'}>
            로그인
          </Button>
        </div>
      </form>
    </div>
  )
}
