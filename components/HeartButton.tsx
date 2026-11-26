import { useState } from 'react'
import { FiHeart } from 'react-icons/fi'
import { usePresence } from './LivePresence'

/** Sends a heart to every other visitor using the shared presence socket. */
export function HeartButton() {
  const { sendHeart, status } = usePresence()
  const [burst, setBurst] = useState(0)
  const disabled = status !== 'online'

  function send() {
    sendHeart()
    // A fresh key restarts the ping animation on rapid consecutive clicks.
    setBurst((value) => value + 1)
  }

  const label = disabled ? 'Connecting to visitors…' : 'Send a heart to everyone here'

  return (
    <button
      type="button"
      onClick={send}
      disabled={disabled}
      className="theme-toggle heart-button cursor-pointer"
      aria-label={label}
      title={label}
    >
      <FiHeart className="h-5 w-5" />
      {burst > 0 && <span key={burst} className="heart-button-ping" aria-hidden="true" />}
    </button>
  )
}
