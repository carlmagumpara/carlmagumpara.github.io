import { useEffect, useRef, useState } from 'react'

const FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxkoppzMetMlRVP9ydERwJRh82ilV8B57gVYjKrIPbmkmnf5LgReV8HVWuTCseBWsY/exec'

type FieldName = 'name' | 'email' | 'message'
type FormValues = Record<FieldName, string>
type FormErrors = Partial<Record<FieldName, string>>
type Toast = { message: string; variant: 'success' | 'error' } | null

const initialValues: FormValues = { name: '', email: '', message: '' }

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = 'Required.'
  if (!values.email.trim()) errors.email = 'Required.'
  if (!values.message.trim()) errors.message = 'Required.'
  return errors
}

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  function showToast(message: string, variant: 'success' | 'error') {
    setToast({ message, variant })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target as { name: FieldName; value: string }
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(nextValues)[name] }))
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = event.target.name as FieldName
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        // Apps Script's doPost reads the JSON body from postData.contents;
        // text/plain avoids a CORS preflight for this simple request.
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(values)
      })

      if (response.status === 422) {
        const data = await response.json().catch(() => ({}))
        if (data && data.errors) setErrors((prev) => ({ ...prev, ...data.errors }))
        showToast('Please check the highlighted fields.', 'error')
        return
      }
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

      showToast('Message sent!', 'success')
      setValues(initialValues)
      setErrors({})
      setTouched({})
    } catch (error) {
      console.error(error)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="new-password" className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label-eyebrow text-label text-xs">
            Name
          </label>
          <input
            id="contact-name"
            className="input mt-2"
            placeholder="Your name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.name && touched.name)}
          />
          {errors.name && touched.name && (
            <span className="mt-1 block text-xs text-red-500">{errors.name}</span>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="label-eyebrow text-label text-xs">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            className="input mt-2"
            placeholder="you@company.com"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.email && touched.email)}
          />
          {errors.email && touched.email && (
            <span className="mt-1 block text-xs text-red-500">{errors.email}</span>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="label-eyebrow text-label text-xs">
          Message
        </label>
        <textarea
          id="contact-message"
          className="input mt-2 min-h-[140px] resize-y"
          placeholder="Tell me about your project…"
          name="message"
          value={values.message}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.message && touched.message)}
        />
        {errors.message && touched.message && (
          <span className="mt-1 block text-xs text-red-500">{errors.message}</span>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-muted text-xs">
          Available for full-stack web, API, and mobile development.
        </div>
        <button className="btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : 'Send message'}
        </button>
      </div>
      {toast && (
        <div className="toast" data-variant={toast.variant} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </form>
  )
}
