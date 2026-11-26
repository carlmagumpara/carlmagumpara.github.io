import React from 'react'
import { Card, Eyebrow } from './Card'

export function SectionPage({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 md:px-0">
      <main className="flex grow flex-col py-8">
        <a href="/" className="link-brand mb-4 text-sm font-semibold">
          ← Back to home
        </a>
        <Card>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="brand-text mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="text-muted mt-2 text-sm">{description}</p>
          <div className="mt-6">{children}</div>
        </Card>
        <footer className="text-muted pt-8 pb-2 text-center text-sm">
          Designed &amp; built by Carl Anthony Magumpara · © {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  )
}
