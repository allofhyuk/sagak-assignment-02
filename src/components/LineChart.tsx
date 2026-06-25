import { memo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

interface LineChartProps {
  labels: string[]
  values: (number | null)[]
  unit?: string
}

function LineChartBase({ labels, values, unit }: LineChartProps) {
  const finite = values.filter((v): v is number => v != null)

  if (finite.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        표시할 이력이 없습니다.
      </div>
    )
  }

  // Y축 범위는 데이터 min/max 기준으로
  const min = Math.min(...finite)
  const max = Math.max(...finite)
  const pad = Math.max((max - min) * 0.5, Math.max(max * 0.1, 3))

  return (
    <div className="h-64">
      <Line
        data={{
          labels,
          datasets: [
            {
              data: values,
              borderColor: '#cbd5e1',
              borderDash: [4, 4],
              borderWidth: 1.5,
              pointBackgroundColor: '#94a3b8',
              pointBorderColor: '#94a3b8',
              pointRadius: 5,
              tension: 0,
              spanGaps: true,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => `${c.parsed.y}${unit ? ` ${unit}` : ''}` } },
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              min: Math.floor(min - pad),
              max: Math.ceil(max + pad),
              ticks: { maxTicksLimit: 3 },
              grid: { color: '#f1f5f9' },
            },
          },
        }}
      />
    </div>
  )
}

export default memo(LineChartBase)
