import { useMemo, useState } from 'react'
import BodyMeasureSection from './BodyMeasureSection'
import type { CheckupResultData } from '../api/nhis.model'

const dots = (d?: string) => (d ?? '').replace(/-/g, '.')

const korean = (d?: string) => {
  const m = (d ?? '').match(/(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일` : (d ?? '-')
}

export default function CheckupResult({ data }: { data: CheckupResultData }) {
  // 전체 노출하되 신체측정값은 일반검진에만 있어 일반 회차만 매칭
  const records = useMemo(
    () =>
      [...data.resultList]
        .sort((a, b) => (b.checkupDate ?? '').localeCompare(a.checkupDate ?? ''))
        .map((r) => ({
          result: r,
          overview:
            r.checkupType === '일반'
              ? data.overviewList.find((o) => o.checkupDate === r.checkupDate)
              : undefined,
        })),
    [data],
  )

  // 기본 선택은 첫 일반검진
  const [idx, setIdx] = useState(() => {
    const i = records.findIndex((r) => r.result.checkupType === '일반')
    return i < 0 ? 0 : i
  })
  const selected = records[idx] ?? records[0]

  if (!selected) {
    return <p className="text-sm text-slate-500">검진 기록이 없습니다.</p>
  }

  return (
    <div className="flex gap-6">
      <aside className="w-56 shrink-0 space-y-3">
        {records.map((rec, i) => {
          const isGeneral = rec.result.checkupType === '일반'
          const active = isGeneral && i === idx
          return (
            <button
              key={i}
              onClick={() => isGeneral && setIdx(i)}
              disabled={!isGeneral}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-[#3C5DA9] ring-1 ring-[#3C5DA9]'
                  : isGeneral
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-slate-200 cursor-default'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-800">{dots(rec.result.checkupDate)}</span>
                <span className="shrink-0 text-xs text-slate-400">{rec.result.checkupType}</span>
              </div>
              <div className="mt-0.5 text-sm text-slate-400">{rec.result.organizationName ?? '-'}</div>
            </button>
          )
        })}
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        <div className="rounded-2xl bg-white p-6">
          <h2 className="text-2xl font-bold tracking-tight">{korean(selected.result.checkupDate)}</h2>
          <p className="mt-1 text-slate-600">건강검진 결과</p>

          {selected.overview ? (
            <>
              <p className="mt-6 text-sm text-slate-500">전체소견</p>
              <p className="text-2xl font-bold">{selected.overview.evaluation ?? '-'}</p>
            </>
          ) : (
            <p className="mt-6 text-sm text-slate-500">신체측정 정보가 제공되지 않는 검진입니다.</p>
          )}
        </div>

        {selected.overview && (
          <div className="rounded-2xl bg-white p-6">
            <BodyMeasureSection
              current={selected.overview}
              history={data.overviewList}
              referenceList={data.referenceList}
            />
          </div>
        )}
      </div>
    </div>
  )
}
