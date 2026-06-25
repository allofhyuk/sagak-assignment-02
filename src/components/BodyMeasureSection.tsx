import { useMemo, useState } from 'react'
import LineChart from './LineChart'
import {
  BODY_METRICS,
  evaluateMetricStatus,
  type CheckupOverview,
  type CheckupReference,
  type HealthStatus,
} from '../api/nhis.model'

const STATUS_STYLE: Record<HealthStatus, { label: string; text: string; dot: string; border: string }> = {
  normal: { label: '정상', text: 'text-green-600', dot: 'bg-green-500', border: 'border-green-400' },
  caution: { label: '주의', text: 'text-orange-600', dot: 'bg-orange-500', border: 'border-orange-400' },
  danger: { label: '위험', text: 'text-red-600', dot: 'bg-red-500', border: 'border-red-400' },
}

const num = (v?: string): number | null => {
  const n = parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : null
}

export default function BodyMeasureSection({
  current,
  history,
  referenceList,
}: {
  current: CheckupOverview
  history: CheckupOverview[]
  referenceList: CheckupReference[]
}) {
  const [selected, setSelected] = useState<keyof CheckupOverview>('BMI')

  const sorted = useMemo(
    () => [...history].sort((a, b) => (a.checkupDate ?? '').localeCompare(b.checkupDate ?? '')),
    [history],
  )

  const refMap = useMemo(
    () => new Map(referenceList.map((r) => [r.refType, r])),
    [referenceList],
  )
  const unitOf = (key: keyof CheckupOverview) => refMap.get('단위')?.[key]

  const labels = useMemo(() => sorted.map((o) => (o.checkupDate ?? '').slice(0, 4)), [sorted])
  const values = useMemo(() => sorted.map((o) => num(o[selected])), [sorted, selected])

  return (
    <section>
      <h3 className="mb-3 text-base font-bold text-slate-800">신체 측정</h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {BODY_METRICS.map(({ key, label }) => {
          const value = current[key]
          const hasValue = num(value) != null
          const status = evaluateMetricStatus(value, refMap.get('정상(A)')?.[key], refMap.get('질환의심')?.[key])
          const st = STATUS_STYLE[status]
          const active = selected === key
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`flex flex-col gap-2 rounded-xl border px-4 py-3 text-left transition ${
                active ? 'border-[#3C5DA9] ring-1 ring-[#3C5DA9]' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{label}</span>
                {hasValue && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${st.border} ${st.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                )}
              </div>
              <span className="text-base font-bold text-slate-900">
                {hasValue ? `${value}${unitOf(key) ? ` ${unitOf(key)}` : ''}` : '-'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <LineChart labels={labels} values={values} unit={unitOf(selected)} />
      </div>
    </section>
  )
}
