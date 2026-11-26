import type { CSSProperties } from 'react'
import { FiHeart } from 'react-icons/fi'
import { usePresence } from './LivePresence'

/** Overlay of hearts sent by other visitors; each heart fades itself out. */
export function FloatingHearts() {
  const { hearts } = usePresence()

  return (
    <div className="heart-overlay" aria-hidden="true">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{ '--heart-drift': `${heart.drift}px` } as CSSProperties}
        >
          <FiHeart className="floating-heart-icon" style={{ color: heart.color }} />
          <span className="floating-heart-label">
            <span className="floating-heart-dot" style={{ backgroundColor: heart.color }} />
            {heart.name} sent a heart
          </span>
        </div>
      ))}
    </div>
  )
}
