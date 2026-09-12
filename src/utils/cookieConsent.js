export const CONSENT_KEY = 'shapeup_cookie_consent'
export const CONSENT_ESSENTIAL = 'essential'
export const CONSENT_ANALYTICS = 'analytics'

export function readConsent(storage = localStorage) {
  try {
    return storage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

export function writeConsent(value, storage = localStorage) {
  storage.setItem(CONSENT_KEY, value)
}

export function analyticsAllowed(storage = localStorage) {
  return readConsent(storage) === CONSENT_ANALYTICS
}
