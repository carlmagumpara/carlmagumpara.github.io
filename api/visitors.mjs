import { createVisitorsHandler } from '../lib/visitors.mjs'

// Vercel Node function: records a visit and returns { total, today }.
export default createVisitorsHandler()
