import React, { useCallback, useState } from 'react'
import { Loader } from '../components/Loader'
import { LoaderContext } from '../components/LoaderContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { HeartButton } from '../components/HeartButton'
import { FloatingHearts } from '../components/FloatingHearts'
import { LiveCursors } from '../components/LiveCursors'
import NeonCursor from '../components/NeonCursor'
import { LivePresenceProvider } from '../components/LivePresence'
import { AnalyticsTracker } from '../components/AnalyticsTracker'
import { LiveVisitors } from '../components/LiveVisitors'
import { UniqueVisitors } from '../components/UniqueVisitors'
import PhysicsPlayground from '../components/PhysicsPlayground'
import '../styles.css'

export { Layout }

function Layout({ children }: { children: React.ReactNode }) {
  const [loaderDone, setLoaderDone] = useState(false)
  const handleLoaderDone = useCallback(() => setLoaderDone(true), [])

  return (
    <LoaderContext.Provider value={loaderDone}>
      <LivePresenceProvider>
        <AnalyticsTracker />
        <Loader onDone={handleLoaderDone} />
        {/* Both controls share one fixed anchor so they stay side by side. */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 sm:top-6 sm:right-6">
          <HeartButton />
          <ThemeToggle />
        </div>
        <LiveCursors />
        <NeonCursor />
        <FloatingHearts />
        <div className="visitor-stats">
          <UniqueVisitors />
          <LiveVisitors />
        </div>
        {/*<PhysicsPlayground />*/}
        {/* Routed content fades on navigation; the fixed controls above stay put. */}
        <div className="page-content" data-page-content>
          {children}
        </div>
      </LivePresenceProvider>
    </LoaderContext.Provider>
  )
}
