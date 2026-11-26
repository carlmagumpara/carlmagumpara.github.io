import React from 'react'
import { Loader } from '../components/Loader'
import { ThemeToggle } from '../components/ThemeToggle'
import { LiveCursors } from '../components/LiveCursors'
import { LivePresenceProvider } from '../components/LivePresence'
import { LiveVisitors } from '../components/LiveVisitors'
import '../styles.css'

export { Layout }

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LivePresenceProvider>
      <Loader />
      <ThemeToggle />
      <LiveCursors />
      <LiveVisitors />
      {children}
    </LivePresenceProvider>
  )
}
