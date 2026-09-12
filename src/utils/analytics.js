import { analyticsAllowed } from './cookieConsent'

let started = false

export async function startAnalyticsIfAllowed({
  consentStorage = localStorage,
  measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENTID,
} = {}) {
  if (started || !analyticsAllowed(consentStorage) || !measurementId) return false
  if (typeof window === 'undefined') return false

  const { getApp } = await import('firebase/app')
  const { getAnalytics, isSupported } = await import('firebase/analytics')
  const supported = await isSupported().catch(() => false)
  if (!supported) return false

  getAnalytics(getApp())
  started = true
  return true
}

export function resetAnalyticsForTests() {
  started = false
}
