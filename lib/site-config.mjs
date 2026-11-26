import { readFileSync } from 'node:fs'
import path from 'node:path'

// Vike loads +config/+title/+description files at config time, where JSON
// imports are transformed into pointer imports. Read the shared config directly.
export const siteConfig = JSON.parse(readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'))
