import { useEffect, useState } from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'
import { THEME_CHANGE_EVENT } from './ZoomEffects'

export function ThemeToggle() {
  // Start from the light state on both server and client so hydration stays
  // stable; the inline head script has already applied the real theme before
  // first paint, and this effect syncs the button's labels right after mount.
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark')
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch {
      // Storage can be blocked (e.g. private mode); the theme still applies
      // for the rest of this visit.
    }
    setDark(isDark)
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: isDark ? 'dark' : 'light' })
    )
  }

  const label = dark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle cursor-pointer text-xl"
      aria-label={label}
      aria-pressed={dark}
      title={label}
    >
      <FiSun className="hidden h-5 w-5 dark:block" />
      <FiMoon className="block h-5 w-5 dark:hidden" />
    </button>
  )
}
