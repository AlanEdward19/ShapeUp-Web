import { useEffect } from 'react'
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../config/site'
import { useLanguage } from '../contexts/LanguageContext'

export default function SeoHead({
  title,
  description,
  path = '/',
  image = '/og-preview.png',
  noIndex = false,
}) {
  const language = useLanguage()?.language || 'pt-BR'
  const localizedDescription = description || SITE_DESCRIPTION[language] || SITE_DESCRIPTION.en
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`
    document.title = fullTitle

    const canonical = `${SITE_URL}${path}`
    const setMeta = (selector, attr, value) => {
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (selector.startsWith('meta[name=')) {
          el.setAttribute('name', selector.match(/name="([^"]+)"/)[1])
        } else if (selector.startsWith('meta[property=')) {
          el.setAttribute('property', selector.match(/property="([^"]+)"/)[1])
        }
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]', 'content', localizedDescription)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', localizedDescription)
    setMeta('meta[property="og:image"]', 'content', `${SITE_URL}${image}`)
    setMeta('meta[property="og:url"]', 'content', canonical)
    setMeta('meta[property="og:type"]', 'content', 'website')
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', localizedDescription)
    setMeta('meta[property="og:locale"]', 'content', { 'pt-BR': 'pt_BR', en: 'en_US', es: 'es_ES' }[language])
    setMeta('meta[name="twitter:image"]', 'content', `${SITE_URL}${image}`)
    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex, nofollow' : 'index, follow')

    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', canonical)
  }, [title, localizedDescription, path, image, noIndex, language])

  return null
}
