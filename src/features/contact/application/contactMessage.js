export const CONTACT_EMAIL = 'info.meetmath@alquds.edu'

export function validateContact(values) {
  const data = Object.fromEntries(['name', 'email', 'subject', 'message'].map((key) => [key, String(values[key] || '').trim()]))
  const errors = {}
  if (data.name.length < 2 || data.name.length > 100) errors.name = 'name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254) errors.email = 'email'
  if (data.subject.length < 3 || data.subject.length > 120) errors.subject = 'subject'
  if (data.message.length < 10 || data.message.length > 2000) errors.message = 'message'
  return { data, errors }
}

export function contactMailto(data) {
  const body = `${data.message}\n\n${data.name}\n${data.email}`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`
}

// A successful response means the server accepted the request, not that email was delivered.
export async function submitContact(data, endpoint, fetcher = fetch) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetcher(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data), signal: controller.signal,
    })
    if (!response.ok) throw new Error('CONTACT_REQUEST_FAILED')
  } finally {
    clearTimeout(timeout)
  }
}
