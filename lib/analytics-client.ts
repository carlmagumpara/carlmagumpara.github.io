/** Grid resolution used for the click heat map (kept in sync with lib/analytics.mjs). */
export const GRID_COLS = 20
export const GRID_ROWS = 12

/** How much history the dashboard requests from /api/analytics. */
export const HISTORY_DAYS = 30
export const DETAIL_DAYS = 14

/** Only these routes are tracked; anything else (404s, assets) is ignored. */
export const TRACKED_PATHS = ['/', '/projects', '/work-experience', '/get-in-touch', '/analytics'] as const

/** Traffic sources that can be attributed from a landing URL. */
export type TrafficSource = 'facebook'

export type AnalyticsEvent =
  | { type: 'view'; path: string; source?: TrafficSource }
  | { type: 'click'; path: string; x: number; y: number; target: string }

export type DailyPoint = { date: string; views: number; clicks: number }
export type PageStat = { path: string; views: number; clicks: number }
export type TargetStat = { label: string; clicks: number }
export type HeatCell = { x: number; y: number; clicks: number }

export type AnalyticsStats = {
  generatedAt: string
  historyDays: number
  detailDays: number
  grid: { cols: number; rows: number }
  totals: {
    views: number
    clicks: number
    viewsToday: number
    clicksToday: number
    activeDays: number
    facebookViews: number
    facebookToday: number
  }
  daily: DailyPoint[]
  pages: PageStat[]
  targets: TargetStat[]
  heatmap: {
    days: number
    cols: number
    rows: number
    total: number
    cells: HeatCell[]
    peak: HeatCell | null
  }
}

/** Normalize a browser pathname to one of the tracked routes ('' = skip). */
export function normalizeAnalyticsPath(value: string): string {
  const path = (value.split(/[?#]/, 1)[0] || '/').replace(/\/+$/, '') || '/'
  return (TRACKED_PATHS as readonly string[]).includes(path) ? path : ''
}

const FBCLID_SESSION_KEY = 'analytics:facebook'
let facebookVisit: boolean | undefined

/**
 * Facebook appends `fbclid` to links shared on the platform. Detect it on the
 * landing page and remember it for the tab session so client-side navigation
 * and reloads stay attributed to the same visit.
 */
export function isFacebookVisit(): boolean {
  if (facebookVisit !== undefined) return facebookVisit
  if (typeof window === 'undefined') return false

  let fromFacebook = new URLSearchParams(window.location.search).has('fbclid')
  if (fromFacebook) {
    try {
      window.sessionStorage.setItem(FBCLID_SESSION_KEY, '1')
    } catch {
      // Storage can be blocked (private mode); the landing page still counts.
    }
  } else {
    try {
      fromFacebook = window.sessionStorage.getItem(FBCLID_SESSION_KEY) === '1'
    } catch {
      fromFacebook = false
    }
  }

  facebookVisit = fromFacebook
  return fromFacebook
}
