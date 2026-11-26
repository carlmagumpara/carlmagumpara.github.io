import React from 'react'

export function Card({
  children,
  className = '',
  id
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`card flex flex-col justify-center px-6 py-4 ${className}`}>
      {children}
    </section>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <h2 className="label-eyebrow text-label mb-4 text-xs">{children}</h2>
}

export function GroupLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="label-eyebrow text-faint mb-2 text-xs">{children}</h3>
}

export function Badges({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="badge">
          {item}
        </li>
      ))}
    </ul>
  )
}
