import { Link } from 'react-router-dom'
import Logo from '../components/Logo/Logo'
import SeoHead from '../components/SeoHead'
import { useLanguage } from '../contexts/LanguageContext'
import { legalDocuments } from '../content/legal'
import './LegalDocument.css'

export default function LegalDocument({ kind }) {
  const { t } = useLanguage()
  const doc = legalDocuments[kind]
  const path = kind === 'privacy' ? '/privacy' : '/terms'

  return (
    <div className="su-legal">
      <SeoHead title={t(doc.seoTitleKey)} description={t(doc.seoDescKey)} path={path} />
      <header className="su-legal-top">
        <Link to="/" className="su-legal-brand">
          <Logo className="su-legal-logo" />
          ShapeUp
        </Link>
        <Link to="/" className="su-legal-home">{t('notfound.home')}</Link>
      </header>
      <article className="su-legal-article">
        <p className="su-legal-kicker">{t(doc.updatedKey)}</p>
        <h1>{t(doc.titleKey)}</h1>
        {doc.sections.map((section) => (
          <section key={section.headingKey}>
            <h2>{t(section.headingKey)}</h2>
            <p>{t(section.bodyKey)}</p>
          </section>
        ))}
      </article>
    </div>
  )
}
