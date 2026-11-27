import { useCallback, useEffect, useState } from 'react'
import { FaSync } from 'react-icons/fa'
import { apiUrl } from '../lib/api'
import type { AnalyticsStats } from '../lib/analytics-client'
import { Card } from './Card'
import { ClickHeatmap } from './ClickHeatmap'
import { CountUp } from './CountUp'
import { usePresence } from './LivePresence'
import { ViewsChart } from './ViewsChart'

const REFRESH_MS = 120_000

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/projects': 'Projects',
  '/work-experience': 'Work experience',
  '/get-in-touch': 'Get in touch',
  '/analytics': 'Analytics'
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card className="min-w-0">
      <p className="label-eyebrow text-faint text-[11px]">{label}</p>
      <p className="brand-text mt-2 text-3xl font-bold tabular-nums">
        <CountUp value={value} />
      </p>
      {hint && <p className="text-muted mt-1 truncate text-xs">{hint}</p>}
    </Card>
  )
}

function BarRow({
  label,
  value,
  max,
  title
}: {
  label: string
  value: number
  max: number
  title?: string
}) {
  return (
    <li className="flex items-center gap-3 text-sm" title={title}>
      <span className="text-muted w-24 shrink-0 truncate sm:w-32">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-base-200">
        <span
          className="brand-gradient block h-full rounded-full"
          style={{ width: `${Math.max(2, Math.round((value / max) * 100))}%` }}
        />
      </span>
      <span className="w-10 shrink-0 text-right font-semibold tabular-nums">{value}</span>
    </li>
  )
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [range, setRange] = useState(14)
  const { visitorStats } = usePresence()

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await fetch(apiUrl('/api/analytics'), { cache: 'no-store' })
      if (!response.ok) throw new Error(`Analytics API returned ${response.status}`)
      const data = (await response.json()) as AnalyticsStats
      if (!data || !data.totals || !Array.isArray(data.daily)) throw new Error('Unexpected analytics payload')
      setStats(data)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = setInterval(() => void load(), REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  if (loading && !stats) {
    return (
      <Card>
        <p className="text-muted animate-pulse text-sm">Loading analytics…</p>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <p className="label-eyebrow text-label mb-4 text-xs">Unavailable</p>
        <p className="text-muted text-sm">
          Analytics could not be loaded. Check that the Vercel API is reachable and Upstash Redis is
          configured.
        </p>
        <button type="button" onClick={() => void load()} className="link-brand mt-4 text-sm font-semibold">
          Try again →
        </button>
      </Card>
    )
  }

  const maxPageViews = Math.max(1, ...stats.pages.map((page) => page.views))
  const maxTargetClicks = Math.max(1, ...stats.targets.map((target) => target.clicks))
  const daily = stats.daily.slice(-range)

  return (
    <div className="space-y-4" data-analytics-ignore>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total views"
          value={stats.totals.views}
          hint={`${stats.totals.activeDays} active days in the last 30`}
        />
        <StatCard
          label="Views today"
          value={stats.totals.viewsToday}
          hint={`${stats.totals.clicksToday} clicks today`}
        />
        <StatCard label="Total clicks" value={stats.totals.clicks} hint="All tracked clicks" />
        <StatCard label="Unique visitors" value={visitorStats?.total ?? 0} hint="All-time, deduplicated" />
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-eyebrow text-label text-xs">Views by date</p>
            <p className="text-muted mt-1 text-xs">Daily page views across every tracked route.</p>
          </div>
          <div className="flex items-center gap-1">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRange(days)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  range === days ? 'brand-gradient text-white' : 'bg-base-200 text-muted hover:text-base-content'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        <ViewsChart daily={daily} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <p className="label-eyebrow text-label text-xs">Top pages</p>
          <p className="text-muted mt-1 mb-4 text-xs">Where the views happened.</p>
          {stats.pages.length ? (
            <ul className="space-y-3">
              {stats.pages.slice(0, 8).map((page) => (
                <BarRow
                  key={page.path}
                  label={PAGE_LABELS[page.path] ?? page.path}
                  value={page.views}
                  max={maxPageViews}
                  title={`${page.path}: ${page.views} views, ${page.clicks} clicks`}
                />
              ))}
            </ul>
          ) : (
            <p className="text-faint text-sm">No views recorded yet.</p>
          )}
        </Card>

        <Card className="min-w-0">
          <p className="label-eyebrow text-label text-xs">Most clicked</p>
          <p className="text-muted mt-1 mb-4 text-xs">Elements visitors engaged with.</p>
          {stats.targets.length ? (
            <ul className="space-y-3">
              {stats.targets.slice(0, 8).map((target) => (
                <BarRow key={target.label} label={target.label} value={target.clicks} max={maxTargetClicks} />
              ))}
            </ul>
          ) : (
            <p className="text-faint text-sm">No clicks recorded yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <p className="label-eyebrow text-label text-xs">Click heat map</p>
        <p className="text-muted mt-1 mb-5 text-xs">
          Where people clicked, mapped to a {stats.grid.cols} × {stats.grid.rows} viewport grid over the last{' '}
          {stats.heatmap.days} days.
        </p>
        <ClickHeatmap cells={stats.heatmap.cells} total={stats.heatmap.total} days={stats.heatmap.days} />
      </Card>

      <div className="text-muted flex flex-wrap items-center justify-between gap-2 pb-2 text-xs">
        <span>Last updated {new Date(stats.generatedAt).toLocaleString()}</span>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="link-brand inline-flex items-center gap-2 font-semibold disabled:opacity-50"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
    </div>
  )
}
