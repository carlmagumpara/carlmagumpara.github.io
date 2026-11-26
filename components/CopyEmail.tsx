import { useEffect, useRef, useState } from 'react'
import { FaCopy } from 'react-icons/fa'

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be unavailable (e.g. insecure context) - the mailto link still works.
    }
  }

  return (
    <span>
      <a href={`mailto:${email}`} className="link-brand font-bold">
        {email}
      </a>
      <button type="button" onClick={copy} aria-label="Copy email address">
        <FaCopy className="ml-2 inline cursor-pointer" />
      </button>
      {copied && <span className="text-faint ml-2 text-xs">Copied!</span>}
    </span>
  )
}
