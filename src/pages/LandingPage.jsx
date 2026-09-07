import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, MapPin, Zap, TrendingUp, CheckCircle2, Star, Shield, Users, Smartphone } from 'lucide-react';
import Logo from '../components/Logo/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import './LandingPage.css';

const CUSTOM_PRICE = 'CUSTOM';

const LandingPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('atletas');
    const [currency, setCurrency] = useState('BRL');

    const toggleCurrency = () => {
        setCurrency(c => c === 'BRL' ? 'USD' : 'BRL');
    };

    const scrollToPricing = () => {
        document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
    };

    const featureKeys = (plan) => [0, 1, 2, 3].map(i => t(`landing.pricing.${plan}.feature.${i}`));

    const pricingData = {
        atletas: [
            {
                name: t('landing.pricing.athletes.free.name'),
                desc: t('landing.pricing.athletes.free.desc'),
                priceBRL: '0,00',
                priceUSD: '0.00',
                period: '/mês',
                featured: false,
                features: featureKeys('athletes.free'),
                btnText: t('landing.pricing.athletes.free.btn')
            },
            {
                name: t('landing.pricing.athletes.pro.name'),
                desc: t('landing.pricing.athletes.pro.desc'),
                priceBRL: '19,90',
                priceUSD: '4.90',
                period: '/mês',
                featured: true,
                badge: t('landing.pricing.athletes.pro.badge'),
                features: featureKeys('athletes.pro'),
                btnText: t('landing.pricing.athletes.pro.btn')
            }
        ],
        treinadores: [
            {
                name: t('landing.pricing.trainers.starter.name'),
                desc: t('landing.pricing.trainers.starter.desc'),
                priceBRL: '49,90',
                priceUSD: '9.90',
                period: '/mês',
                featured: false,
                features: featureKeys('trainers.starter'),
                btnText: t('landing.pricing.trainers.starter.btn')
            },
            {
                name: t('landing.pricing.trainers.scale.name'),
                desc: t('landing.pricing.trainers.scale.desc'),
                priceBRL: '149,90',
                priceUSD: '29.90',
                period: '/mês',
                featured: true,
                badge: t('landing.pricing.trainers.scale.badge'),
                features: featureKeys('trainers.scale'),
                btnText: t('landing.pricing.trainers.scale.btn')
            }
        ],
        academias: [
            {
                name: t('landing.pricing.gyms.base.name'),
                desc: t('landing.pricing.gyms.base.desc'),
                priceBRL: '499,90',
                priceUSD: '99.90',
                period: '/mês',
                featured: false,
                features: featureKeys('gyms.base'),
                btnText: t('landing.pricing.gyms.base.btn')
            },
            {
                name: t('landing.pricing.gyms.enterprise.name'),
                desc: t('landing.pricing.gyms.enterprise.desc'),
                priceBRL: CUSTOM_PRICE,
                priceUSD: CUSTOM_PRICE,
                period: '',
                featured: true,
                badge: t('landing.pricing.gyms.enterprise.badge'),
                features: featureKeys('gyms.enterprise'),
                btnText: t('landing.pricing.gyms.enterprise.btn')
            }
        ]
    };

    return (
        <div className="su-landing-page">
            <header className="su-lp-header">
                <div className="su-lp-logo">
                    <Logo className="su-lp-dynamic-logo" /> ShapeUp
                </div>
                <button className="su-lp-login-btn" onClick={() => navigate('/login')}>
                    <Smartphone size={18} /> {t('landing.header.login')}
                </button>
            </header>

            <section className="su-lp-hero">
                <div className="su-lp-hero-content">
                    <span className="su-lp-badge">{t('landing.hero.badge')}</span>
                    <h1 className="su-lp-title">{t('landing.hero.title.pre')}<br /><span>{t('landing.hero.title.highlight')}</span>{t('landing.hero.title.post')}</h1>
                    <p className="su-lp-subtitle">
                        {t('landing.hero.subtitle')}
                    </p>
                    <div className="su-lp-cta-group">
                        <button className="su-lp-btn-primary" onClick={scrollToPricing}>{t('landing.hero.cta')}</button>
                    </div>
                </div>
            </section>

            <section className="su-lp-features">
                <h2 className="su-lp-section-title">{t('landing.features.title')}</h2>
                <p className="su-lp-section-subtitle">{t('landing.features.subtitle')}</p>

                <div className="su-lp-features-grid">
                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap">
                            <Dumbbell size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">{t('landing.features.builder.title')}</h3>
                        <p className="su-lp-feature-desc">{t('landing.features.builder.desc')}</p>
                    </div>

                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap accent">
                            <TrendingUp size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">{t('landing.features.metrics.title')}</h3>
                        <p className="su-lp-feature-desc">{t('landing.features.metrics.desc')}</p>
                    </div>

                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap success">
                            <MapPin size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">{t('landing.features.map.title')}</h3>
                        <p className="su-lp-feature-desc">{t('landing.features.map.desc')}</p>
                    </div>

                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap">
                            <Shield size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">{t('landing.features.institutional.title')}</h3>
                        <p className="su-lp-feature-desc">{t('landing.features.institutional.desc')}</p>
                    </div>

                    <div className="su-lp-feature-card su-lp-feature-card--muted">
                        <div className="su-lp-icon-wrap su-lp-icon-wrap--muted">
                            <Smartphone size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">{t('landing.features.checkin.title')} <span className="su-lp-coming-soon">{t('landing.features.coming_soon')}</span></h3>
                        <p className="su-lp-feature-desc">{t('landing.features.checkin.desc')}</p>
                    </div>

                    <div className="su-lp-feature-card su-lp-feature-card--muted">
                        <div className="su-lp-icon-wrap su-lp-icon-wrap--muted">
                            <Activity size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">{t('landing.features.nutrition.title')} <span className="su-lp-coming-soon">{t('landing.features.coming_soon')}</span></h3>
                        <p className="su-lp-feature-desc">{t('landing.features.nutrition.desc')}</p>
                    </div>
                </div>
            </section>

            <section id="pricing" className="su-lp-pricing">
                <h2 className="su-lp-section-title">{t('landing.pricing.title')}</h2>
                <p className="su-lp-section-subtitle">{t('landing.pricing.subtitle')}</p>

                <div className="su-lp-currency-toggle">
                    <span className={`su-lp-currency-label ${currency === 'BRL' ? 'active' : ''}`}>BRL (R$)</span>
                    <div className={`su-lp-toggle-switch ${currency === 'USD' ? 'active' : ''}`} onClick={toggleCurrency}></div>
                    <span className={`su-lp-currency-label ${currency === 'USD' ? 'active' : ''}`}>USD ($)</span>
                </div>

                <div className="su-lp-tabs">
                    <button className={`su-lp-tab-btn ${activeTab === 'atletas' ? 'active' : ''}`} onClick={() => setActiveTab('atletas')}>{t('landing.pricing.tab.athletes')}</button>
                    <button className={`su-lp-tab-btn ${activeTab === 'treinadores' ? 'active' : ''}`} onClick={() => setActiveTab('treinadores')}>{t('landing.pricing.tab.trainers')}</button>
                    <button className={`su-lp-tab-btn ${activeTab === 'academias' ? 'active' : ''}`} onClick={() => setActiveTab('academias')}>{t('landing.pricing.tab.gyms')}</button>
                </div>

                <div className="su-lp-pricing-grid">
                    {pricingData[activeTab].map((plan, idx) => (
                        <div key={idx} className={`su-lp-price-card ${plan.featured ? 'featured' : ''}`}>
                            {plan.featured && <div className="su-lp-featured-banner">{plan.badge}</div>}
                            <h3 className="su-lp-price-name">{plan.name}</h3>
                            <p className="su-lp-price-desc">{plan.desc}</p>

                            <div className="su-lp-price-amount">
                                {plan.priceBRL === CUSTOM_PRICE
                                    ? t('landing.pricing.gyms.enterprise.price')
                                    : (
                                        <>
                                            <span className="su-lp-price-currency">{currency === 'BRL' ? 'R$' : '$'}</span>
                                            {currency === 'BRL' ? plan.priceBRL : plan.priceUSD}
                                            {plan.period && <span className="su-lp-price-period">{plan.period}</span>}
                                        </>
                                    )}
                            </div>

                            <ul className="su-lp-features-list">
                                {plan.features.map((feat, i) => (
                                    <li key={i}><CheckCircle2 size={18} /> {feat}</li>
                                ))}
                            </ul>

                            <button className="su-lp-card-btn" onClick={() => navigate('/register')}>{plan.btnText}</button>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="su-lp-footer">
                <p>&copy; {new Date().getFullYear()} ShapeUp Software. {t('landing.footer.rights')}</p>
                <p className="su-lp-footer-tagline">{t('landing.footer.tagline')}</p>
            </footer>
        </div>
    );
};

export default LandingPage;
