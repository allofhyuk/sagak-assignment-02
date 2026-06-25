import { useEffect, useState } from 'react'
import Button from '../components/Button'
import CheckupAuthModal from '../components/CheckupAuthModal'
import CheckupResult from '../components/CheckupResult'
import { parseCheckupResult } from '../api/nhis.model'
import { useAuthStore } from '../store/authStore'
import { useCheckupStore } from '../store/checkupStore'

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const phase = useCheckupStore((s) => s.phase)
  const result = useCheckupStore((s) => s.result)
  const resetFlow = useCheckupStore((s) => s.resetFlow)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (phase === 'done') setModalOpen(false)
  }, [phase])

  const parsed = result ? parseCheckupResult(result) : null

  const openAuth = () => {
    resetFlow()
    setModalOpen(true)
  }

  return (
    <section>
      <p className="text-lg">
        <span className="font-bold">{user ?? '회원'}</span> 님 안녕하세요!
      </p>

      <div className="mt-4 mb-3 flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800">건강검진 내역</h1>
        {parsed && (
          <button
            onClick={openAuth}
            className="rounded-md bg-[#3C5DA9] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#33508f]"
          >
            업데이트
          </button>
        )}
      </div>

      {parsed && (
        <div className="mb-6 text-sm text-slate-600">
          <p>*최근 10년 이력을 조회합니다.</p>
          <p>*우측의 상세 결과는 '일반' 검진 항목만 표시됩니다.</p>
        </div>
      )}

      {parsed ? (
        <CheckupResult data={parsed} />
      ) : (
        <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 shadow-sm">
          <LockIcon />
          <p className="mt-5 text-center text-slate-600">
            건강검진 내역을 확인하려면
            <br />
            2차 인증이 필요합니다.
          </p>
          <Button variant="basic" onClick={openAuth} className="mt-8 w-40">
            확인하기
          </Button>
        </div>
      )}

      {modalOpen && <CheckupAuthModal onClose={() => setModalOpen(false)} />}
    </section>
  )
}

function LockIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="#3C5DA9" aria-hidden>
      <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 0 1 6 0v3Zm-3 4a1.5 1.5 0 0 1 .75 2.8V18a.75.75 0 0 1-1.5 0v-2.2A1.5 1.5 0 0 1 12 13Z" />
    </svg>
  )
}
