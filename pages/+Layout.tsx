import React from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import '../styles.css'

export { Layout }

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeToggle />
      {children}
    </>
  )
}
