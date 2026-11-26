import React from 'react'
import { Loader } from '../components/Loader'
import { ThemeToggle } from '../components/ThemeToggle'
import { HeartButton } from '../components/HeartButton'
import { FloatingHearts } from '../components/FloatingHearts'
import { LiveCursors } from '../components/LiveCursors'
import { LivePresenceProvider } from '../components/LivePresence'
import { LiveVisitors } from '../components/LiveVisitors'
import PhysicsPlayground from '../components/PhysicsPlayground'
import '../styles.css'

export { Layout }

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LivePresenceProvider>
      <Loader />
      {/* Both controls share one fixed anchor so they stay side by side. */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 sm:top-6 sm:right-6">
        <HeartButton />
        <ThemeToggle />
      </div>
      <LiveCursors />
      <FloatingHearts />
      <LiveVisitors />
      {/*<PhysicsPlayground />*/}
      {/* Routed content fades on navigation; the fixed controls above stay put. */}
      <div className="page-content" data-page-content>
        {children}
      </div>
    </LivePresenceProvider>
  )
}
