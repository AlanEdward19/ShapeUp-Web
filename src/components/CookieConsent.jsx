import React from 'react'
import { Link } from 'react-router-dom'
import { CONSENT_ANALYTICS, CONSENT_ESSENTIAL, readConsent, writeConsent } from '../utils/cookieConsent'
import { startAnalyticsIfAllowed } from '../utils/analytics'
import { useLanguage } from '../contexts/LanguageContext'
import './CookieConsent.css'

export default function CookieConsent() {
  const { t } = useLanguage()
  const [visible, setVisible] = React.useState(() => !readConsent())

  if (!visible) return null

  const choose = async (value) => {
    writeConsent(value)
    setVisible(false)
    if (value === CONSENT_ANALYTICS) await startAnalyticsIfAllowed()
  }

  return (
    <div className="su-cookie" role="dialog" aria-labelledby="su-cookie-title" aria-live="polite">
      <div className="su-cookie-copy">
        <p id="su-cookie-title" className="su-cookie-title">{t('cookie.title')}</p>
        <p className="su-cookie-text">
          {t('cookie.body')}{' '}
          <Link to="/privacy">{t('cookie.privacy')}</Link>
        </p>
      </div>
      <div className="su-cookie-actions">
        <button type="button" className="su-cookie-secondary" onClick={() => choose(CONSENT_ESSENTIAL)}>
          {t('cookie.essential')}
        </button>
        <button type="button" className="su-cookie-primary" onClick={() => choose(CONSENT_ANALYTICS)}>
          {t('cookie.analytics')}
        </button>
      </div>
    </div>
  )
}
