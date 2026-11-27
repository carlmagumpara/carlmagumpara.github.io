import { GRID_COLS, GRID_ROWS, type HeatCell } from '../lib/analytics-client'

/** Viewport-normalized click density: every screen size lands in the same cell. */
export function ClickHeatmap({
  cells,
  total,
  days
}: {
  cells: HeatCell[]
  total: number
  days: number
}) {
  const counts = new Map<number, number>()
  for (const cell of cells) {
    const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(cell.x * GRID_COLS)))
    const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(cell.y * GRID_ROWS)))
    const key = row * GRID_COLS + col
    counts.set(key, (counts.get(key) ?? 0) + cell.clicks)
  }
  const max = Math.max(1, ...counts.values())

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0">
        <div
          className="heatmap-grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, index) => {
            const col = index % GRID_COLS
            const row = Math.floor(index / GRID_COLS)
            const count = counts.get(index) ?? 0
            const intensity = count ? 0.12 + (count / max) * 0.88 : 0
            const background = intensity
              ? `color-mix(in oklab, var(--brand-start) ${Math.round(intensity * 100)}%, var(--base-200))`
              : 'var(--base-200)'
            const label = count
              ? `${count} clicks · x ${Math.round(((col + 0.5) / GRID_COLS) * 100)}%, y ${Math.round(((row + 0.5) / GRID_ROWS) * 100)}%`
              : 'No clicks in this area'

            return <div key={index} className="heatmap-cell" style={{ background }} title={label} />
          })}
        </div>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-faint">
          <span>Low</span>
          <span
            className="h-2 flex-1 rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--base-200), var(--brand-start))' }}
          />
          <span>High ({max})</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-base-200 p-4">
          <p className="label-eyebrow text-faint text-[10px]">Clicks mapped</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{total.toLocaleString()}</p>
          <p className="text-muted mt-1 text-xs">Last {days} days</p>
        </div>

        <div>
          <p className="label-eyebrow text-faint mb-2 text-[10px]">Hottest spots</p>
          {cells.length ? (
            <ol className="space-y-2 text-xs">
              {cells.slice(0, 4).map((cell, index) => (
                <li key={`${cell.x}:${cell.y}:${index}`} className="flex items-center gap-2">
                  <span className="text-faint">#{index + 1}</span>
                  <span className="text-muted">
                    {Math.round(cell.x * 100)}% × {Math.round(cell.y * 100)}%
                  </span>
                  <span className="ml-auto font-semibold tabular-nums">{cell.clicks}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-faint text-xs">No clicks recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
