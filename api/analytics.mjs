import { createAnalyticsHandler } from '../lib/analytics.mjs'

// Vercel Node function: records batched page-view/click events and serves the
// aggregates used by the /analytics page.
export default createAnalyticsHandler()
