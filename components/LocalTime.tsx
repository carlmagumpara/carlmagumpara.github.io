import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { Card, Eyebrow } from './Card'

const LOCAL_ZONE = 'Asia/Manila'

const clockOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
}

const localFormatter = new Intl.DateTimeFormat('en-US', { ...clockOptions, timeZone: LOCAL_ZONE })
// No timeZone here: uses the visitor's own browser time zone.
const visitorFormatter = new Intl.DateTimeFormat('en-US', clockOptions)

function zoneAbbreviation(date: Date) {
  return (
    new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? ''
  )
}

function Clock({ icon, label, time, title }: { icon: ReactNode; label: string; time: string; title?: string }) {
  return (
    <div className="flex items-center gap-3" title={title}>
      <span className="text-brand-start text-lg" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="label-eyebrow text-faint truncate text-[10px]">{label}</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{time}</p>
      </div>
    </div>
  )
}

export function LocalTime() {
  // Render a stable placeholder on the server so hydration matches, then start ticking.
  const [now, setNow] = useState<Date | null>(null)
  const [visitorZone, setVisitorZone] = useState<string | null>(null)

  useEffect(() => {
    setVisitorZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local')
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const abbreviation = now ? zoneAbbreviation(now) : ''

  return (
    <Card className="sm:col-span-2">
      <Eyebrow>Local time</Eyebrow>
      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        <Clock
          icon={<FaMapMarkerAlt />}
          label="Manila, PH (UTC+8)"
          time={now ? localFormatter.format(now) : '--:--:--'}
          title="Asia/Manila"
        />
        <Clock
          icon={<FaClock />}
          label={`Your time${abbreviation ? ` (${abbreviation})` : ''}`}
          time={now ? visitorFormatter.format(now) : '--:--:--'}
          title={visitorZone ?? undefined}
        />
      </div>
    </Card>
  )
}
