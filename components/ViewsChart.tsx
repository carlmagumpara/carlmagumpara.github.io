import type { DailyPoint } from '../lib/analytics-client'

const GRID_LINES = [1, 0.5, 0]

/** Lightweight CSS bar chart — no chart dependency, theme-aware via CSS vars. */
export function ViewsChart({ daily }: { daily: DailyPoint[] }) {
  const maxViews = Math.max(1, ...daily.map((point) => point.views))
  const total = daily.reduce((sum, point) => sum + point.views, 0)
  const labelEvery = Math.max(1, Math.ceil(daily.length / 6))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-faint">{daily.length} days · {total} views · peak {maxViews}/day</span>
        <span className="text-muted">Hover a bar for details</span>
      </div>

      <div className="relative h-44 pl-9">
        {GRID_LINES.map((fraction) => (
          <div
            key={fraction}
            className="pointer-events-none absolute right-0 left-9 border-t border-dashed border-base-content/10"
            style={{ bottom: `${fraction * 100}%` }}
          >
            <span className="absolute -top-2 right-full pr-2 text-[10px] text-faint">
              {Math.round(maxViews * fraction)}
            </span>
          </div>
        ))}

        <div className="relative z-10 flex h-full items-end gap-1">
          {daily.map((point) => (
            <div
              key={point.date}
              className="group relative flex h-full flex-1 items-end justify-center"
              title={`${point.date}: ${point.views} views, ${point.clicks} clicks`}
            >
              <div
                className={`w-full max-w-[22px] rounded-t transition-opacity group-hover:opacity-80 ${
                  point.views ? 'brand-gradient' : 'bg-base-200'
                }`}
                style={{ height: `${point.views ? Math.max(3, (point.views / maxViews) * 100) : 1}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 rounded-lg bg-base-200 px-2 py-1 text-[11px] whitespace-nowrap shadow-md group-hover:block">
                <strong>{point.views}</strong> views · {point.clicks} clicks
                <span className="text-faint"> · {point.date.slice(5)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-1 pl-9">
        {daily.map((point, index) => (
          <span key={point.date} className="flex-1 text-center text-[10px] text-faint">
            {index % labelEvery === 0 || index === daily.length - 1 ? point.date.slice(5) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
