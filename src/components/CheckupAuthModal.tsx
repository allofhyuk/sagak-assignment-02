import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'
import { getSessionId } from '../lib/session'
import { useCheckupStore } from '../store/checkupStore'
import { LOGIN_TYPE_OPTIONS, TELECOM_OPTIONS, type CheckupRequest } from '../api/nhis.model'

const thisYear = new Date().getFullYear()
type FormState = Omit<CheckupRequest, 'id'>

const initialForm: FormState = {
  loginTypeLevel: '1',
  legalName: '',
  birthdate: '',
  phoneNo: '',
  telecom: '0',
  // 조회기간(최근 10년), 조회구분(일반조회)은 고정
  startDate: String(thisYear - 9),
  endDate: String(thisYear),
  inquiryType: '0',
}

const rowCls = 'flex items-center gap-4'
const labelCls = 'w-24 shrink-0 text-sm text-slate-600'
const fieldCls =
  'flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'

export default function CheckupAuthModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormState>(initialForm)
  const { phase, loading, error, requestAuth, confirmAuth, cancel } = useCheckupStore()

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canSubmit =
    form.legalName.trim() !== '' && form.birthdate.length === 8 && form.phoneNo.length >= 10

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    requestAuth({ id: getSessionId(), ...form })
  }

  const close = () => {
    if (phase === 'pending') cancel()
    onClose()
  }

  return (
    <Modal onClose={close}>
      <h2 className="mb-1 text-center text-lg font-bold tracking-tight">간편인증</h2>
      <p className="mb-8 text-center text-sm text-slate-500">
        간편 인증 요청을 위해 아래 정보를 입력해주세요.
      </p>

      {phase === 'pending' ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-sm font-medium text-amber-800">📱 휴대폰에서 간편인증을 완료해주세요</p>
            <p className="mt-1 text-xs text-amber-700">
              인증을 마친 뒤 아래 '인증 완료' 버튼을 눌러주세요. (간편인증은 4분 30초 내 완료)
            </p>
          </div>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <div className="flex justify-center">
            <Button variant={loading ? 'loading' : 'basic'} onClick={confirmAuth}>
              인증 완료
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className={rowCls}>
            <label htmlFor="auth-type" className={labelCls}>
              인증수단
            </label>
            <select
              id="auth-type"
              className={fieldCls}
              value={form.loginTypeLevel}
              onChange={(e) => update('loginTypeLevel', e.target.value as FormState['loginTypeLevel'])}
            >
              {LOGIN_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className={rowCls}>
            <label htmlFor="auth-name" className={labelCls}>
              이름
            </label>
            <input
              id="auth-name"
              className={fieldCls}
              value={form.legalName}
              onChange={(e) => update('legalName', e.target.value)}
            />
          </div>

          <div className={rowCls}>
            <label htmlFor="auth-birth" className={labelCls}>
              생년월일
            </label>
            <input
              id="auth-birth"
              className={fieldCls}
              value={form.birthdate}
              onChange={(e) => update('birthdate', e.target.value.replace(/\D/g, '').slice(0, 8))}
              inputMode="numeric"
              placeholder="19900101"
            />
          </div>

          <div className={rowCls}>
            <label htmlFor="auth-phone" className={labelCls}>
              휴대폰 번호
            </label>
            <input
              id="auth-phone"
              className={fieldCls}
              value={form.phoneNo}
              onChange={(e) => update('phoneNo', e.target.value.replace(/\D/g, '').slice(0, 11))}
              inputMode="numeric"
              placeholder="01012345678"
            />
          </div>

          <div className={rowCls}>
            <label htmlFor="auth-telecom" className={labelCls}>
              통신사
            </label>
            <select
              id="auth-telecom"
              className={fieldCls}
              value={form.telecom}
              onChange={(e) => update('telecom', e.target.value as FormState['telecom'])}
            >
              {TELECOM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              variant={loading ? 'loading' : canSubmit ? 'basic' : 'disabled'}
              className="w-72"
            >
              인증하기
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
