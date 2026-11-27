import { CountUp } from './CountUp'
import { usePresence } from './LivePresence'

/** Compact, always-visible count of everyone currently on the page. */
export function LiveVisitors() {
  const { users, count, status } = usePresence()

  const label =
    status === 'online' ? (
      <>
        <span className="tabular-nums">
          <CountUp value={count} />
        </span>{' '}
        {count === 1 ? 'person' : 'people'} browsing now
      </>
    ) : status === 'connecting' ? (
      'Connecting…'
    ) : (
      'Offline'
    )

  const names = status === 'online' ? [...users.map((user) => user.name), 'You'] : []

  return (
    <div
      className="visitor-badge"
      data-status={status}
      role="status"
      aria-live="polite"
      title={names.join(', ')}
    >
      {status === 'online' && (
        <span className="visitor-avatars" aria-hidden="true">
          {users.slice(0, 2).map((user) => (
            <span key={user.clientId} className="visitor-avatar" style={{ backgroundColor: user.color }} />
          ))}
          <span className="visitor-avatar visitor-avatar-me" aria-label="You" />
        </span>
      )}
      <span>{label}</span>
    </div>
  )
}
