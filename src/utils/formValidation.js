const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value) {
  const email = (value || '').trim().toLowerCase()
  if (!email) return 'form.email.required'
  if (!EMAIL_RE.test(email)) return 'form.email.invalid'
  return null
}

export function validatePassword(value, { min = 8 } = {}) {
  if (!value) return 'form.password.required'
  if (value.length < min) return 'form.password.short'
  return null
}

export function validateRequiredName(value) {
  if (!(value || '').trim()) return 'form.name.required'
  return null
}

export function validateBirthDate(value, { minAge = 13 } = {}) {
  if (!value) return 'form.birth.required'
  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return 'form.birth.invalid'
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - minAge)
  if (birth > cutoff) return 'form.birth.age'
  return null
}

export function isHoneypotFilled(value) {
  return Boolean(value && String(value).trim())
}
