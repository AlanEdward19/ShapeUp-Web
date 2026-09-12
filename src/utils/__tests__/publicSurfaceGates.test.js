import { describe, expect, it } from 'vitest'
import {
  isHoneypotFilled,
  validateBirthDate,
  validateEmail,
  validatePassword,
} from '../formValidation'
import { redirectToHttpsIfNeeded } from '../forceHttps'
import { analyticsAllowed, writeConsent, CONSENT_ANALYTICS } from '../cookieConsent'

describe('formValidation', () => {
  it('rejects incomplete emails and short passwords', () => {
    expect(validateEmail('not-an-email')).toBe('form.email.invalid')
    expect(validatePassword('123')).toBe('form.password.short')
    expect(isHoneypotFilled('http://spam.test')).toBe(true)
  })

  it('rejects birth dates younger than 13', () => {
    const lastYear = `${new Date().getFullYear() - 1}-01-01`
    expect(validateBirthDate(lastYear)).toBe('form.birth.age')
    expect(validateBirthDate('1990-05-01')).toBeNull()
  })
})

describe('forceHttps', () => {
  it('rewrites production http hosts', () => {
    const calls = []
    const loc = {
      hostname: 'shapeup.app',
      protocol: 'http:',
      href: 'http://shapeup.app/privacy',
      replace(url) { calls.push(url) },
    }
    const prev = import.meta.env.PROD
    expect(typeof prev).toBe('boolean')
    if (!import.meta.env.PROD) {
      expect(redirectToHttpsIfNeeded(loc)).toBe(false)
      return
    }
    expect(redirectToHttpsIfNeeded(loc)).toBe(true)
    expect(calls[0]).toBe('https://shapeup.app/privacy')
  })

  it('skips localhost', () => {
    const loc = { hostname: 'localhost', protocol: 'http:', href: 'http://localhost:5173/', replace() {} }
    expect(redirectToHttpsIfNeeded(loc)).toBe(false)
  })
})

describe('cookieConsent', () => {
  it('only allows analytics after explicit consent', () => {
    const storage = new Map()
    const api = {
      getItem: (k) => storage.get(k) ?? null,
      setItem: (k, v) => storage.set(k, v),
    }
    expect(analyticsAllowed(api)).toBe(false)
    writeConsent(CONSENT_ANALYTICS, api)
    expect(analyticsAllowed(api)).toBe(true)
  })
})
