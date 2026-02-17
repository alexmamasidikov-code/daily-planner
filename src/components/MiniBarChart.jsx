import { memo } from 'react'

const MiniBarChart = memo(function MiniBarChart({ data, height = 60, color = '#46A6FF' }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1" style={{ height }} role="img" aria-label="Прогресс по дням недели">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%`, background: d.active ? color : '#252525', minHeight: 3 }} />
          <span className="text-[8px] text-[#6B7280]">{d.label}</span>
        </div>
      ))}
    </div>
  )
})

export default MiniBarChart
