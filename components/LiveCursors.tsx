import { usePresence } from './LivePresence'

/** Overlay that shows the cursors of everyone else on this page. */
export function LiveCursors() {
  const { users } = usePresence()

  return (
    <div className="cursor-overlay" aria-hidden="true">
      {users
        .filter((user) => user.visible)
        .map((user) => (
          <div
            key={user.clientId}
            className="remote-cursor"
            style={{ transform: `translate3d(${user.x * 100}vw, ${user.y * 100}vh, 0)` }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 2 L4 22 L9.5 16.5 L13 23 L16.5 21.2 L13 14.8 L20 14 Z"
                fill={user.color}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="remote-cursor-label" style={{ backgroundColor: user.color }}>
              {user.name}
            </span>
          </div>
        ))}
    </div>
  )
}
