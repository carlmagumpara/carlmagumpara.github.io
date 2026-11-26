import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'
import { siteConfig } from '../lib/site-config.mjs'

export default {
  // Vike renders React for us (SSR + hydration + layouts).
  extends: [vikeReact],

  // Pre-render pages to static HTML at build time (SSG) - ideal for a portfolio.
  prerender: true,

  title: `${siteConfig.profile.name} | ${siteConfig.profile.title}`,
  description:
    'Full-stack engineer building reliable web, API, and mobile products with Laravel, React, and React Native.',
  image: `https://${siteConfig.githubUsername}.github.io/avatar.jpg`
} satisfies Config
