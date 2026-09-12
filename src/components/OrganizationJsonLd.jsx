import { useEffect } from 'react'
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../config/site'
import { useLanguage } from '../contexts/LanguageContext'

export default function OrganizationJsonLd() {
  const { language } = useLanguage()
  useEffect(() => {
    const id = 'shapeup-jsonld'
    let script = document.getElementById(id)
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web',
          url: SITE_URL,
          description: SITE_DESCRIPTION[language] || SITE_DESCRIPTION.en,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        },
        {
          '@type': 'Organization',
          name: `${SITE_NAME} Software`,
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.svg`,
        },
      ],
    })
  }, [language])
  return null
}
