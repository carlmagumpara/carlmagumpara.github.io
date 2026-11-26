import React from 'react'
import { Loader } from '../components/Loader'
import { ThemeToggle } from '../components/ThemeToggle'
import { LiveCursors } from '../components/LiveCursors'
import '../styles.css'

export { Layout }

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Loader />
      <ThemeToggle />
      <LiveCursors />
      {children}
    </>
  )
}
