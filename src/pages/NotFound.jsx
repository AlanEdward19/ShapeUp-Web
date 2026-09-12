import { Link } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { useLanguage } from '../contexts/LanguageContext'
import './NotFound.css'

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="su-404">
      <SeoHead title={t('seo.404.title')} description={t('seo.404.desc')} path="/404" noIndex />
      <p className="su-404-code">404</p>
      <h1>{t('notfound.title')}</h1>
      <p>{t('notfound.body')}</p>
      <Link className="su-404-cta" to="/">{t('notfound.home')}</Link>
    </div>
  )
}
