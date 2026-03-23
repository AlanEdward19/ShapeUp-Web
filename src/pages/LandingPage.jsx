import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, MapPin, Zap, TrendingUp, CheckCircle2, Star, Shield, Users, Smartphone } from 'lucide-react';
import Logo from '../components/Logo/Logo';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('atletas');
    const [currency, setCurrency] = useState('BRL');

    const toggleCurrency = () => {
        setCurrency(c => c === 'BRL' ? 'USD' : 'BRL');
    };

    const scrollToPricing = () => {
        document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
    };

    const formatPrice = (brl, usd) => {
        if (brl === 'Sob Consulta') return brl;
        if (currency === 'BRL') return `R$ ${brl}`;
        return `$ ${usd}`;
    };

    const pricingData = {
        atletas: [
            {
                name: 'Atleta Free',
                desc: 'Para quem está começando e quer organizar seus treinos.',
                priceBRL: '0,00',
                priceUSD: '0.00',
                period: '/mês',
                featured: false,
                features: [
                    'Criar programas de treino próprios',
                    'Acompanhamento de evolução básica',
                    'Histórico de sessões',
                    'Acesso à comunidade ShapeUp'
                ],
                btnText: 'Começar Grátis'
            },
            {
                name: 'Atleta Pro',
                desc: 'Para quem busca performance máxima e vantagens exclusivas.',
                priceBRL: '19,90',
                priceUSD: '4.90',
                period: '/mês',
                featured: true,
                badge: 'MAIS POPULAR',
                features: [
                    'Tudo do plano Free',
                    'Análises avançadas e Inteligência Artificial',
                    'Mapa de academias parceiras com descontos',
                    'Check-in integrado estilo Gympass (Em Breve)'
                ],
                btnText: 'Assinar Pro'
            }
        ],
        treinadores: [
            {
                name: 'Treinador Starter',
                desc: 'Ideal para personal trainers construindo sua carteira.',
                priceBRL: '49,90',
                priceUSD: '9.90',
                period: '/mês',
                featured: false,
                features: [
                    'Gerenciamento de até 10 clientes',
                    'Construtor de treinos e periodização',
                    'Métricas de assertividade do treinamento',
                    'Dashboards básicos de lucro'
                ],
                btnText: 'Começar Starter'
            },
            {
                name: 'Treinador Scale',
                desc: 'Para profissionais escalando seus negócios e consultorias.',
                priceBRL: '149,90',
                priceUSD: '29.90',
                period: '/mês',
                featured: true,
                badge: 'MAIOR CUSTO-BENEFÍCIO',
                features: [
                    'Clientes ilimitados',
                    'Geração de treinos com Inteligência Artificial',
                    'Dashboards financeiros completos',
                    'Notificações e alertas de fadiga do cliente'
                ],
                btnText: 'Assinar Scale'
            }
        ],
        academias: [
            {
                name: 'Academia Base',
                desc: 'Digitalize sua academia e integre seus professores.',
                priceBRL: '499,90',
                priceUSD: '99.90',
                period: '/mês',
                featured: false,
                features: [
                    'Até 10 Treinadores',
                    'Até 500 Clientes vinculados',
                    'Gestão avançada de vínculo Treinador-Cliente',
                    'Integração com Catracas e Dashboards de lucro'
                ],
                btnText: 'Assinar Base'
            },
            {
                name: 'Academia Enterprise',
                desc: 'Solução completa para grandes redes e franquias.',
                priceBRL: 'Sob Consulta',
                priceUSD: 'Custom',
                period: '',
                featured: true,
                badge: 'ILIMITADO',
                features: [
                    'Treinadores e Clientes Ilimitados',
                    'Todos os recursos de Inteligência Artificial',
                    'Relatórios customizados de BI',
                    'Suporte prioritário 24/7 e Onboarding VIP'
                ],
                btnText: 'Falar com Consultor'
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
                    <Smartphone size={18} /> Já sou cliente / Entrar
                </button>
            </header>

            <section className="su-lp-hero">
                <div className="su-lp-hero-content">
                    <span className="su-lp-badge">O ÚNICO SOFTWARE QUE VOCÊ PRECISA</span>
                    <h1 className="su-lp-title">Evolua como Treinador. <br /><span>Supere seus limites</span> como Atleta.</h1>
                    <p className="su-lp-subtitle">
                        A plataforma definitiva para prescrição inteligente de treinos, periodização avançada, e acompanhamento de evolução real. Feita para treinadores independentes, academias e atletas que não aceitam o básico.
                    </p>
                    <div className="su-lp-cta-group">
                        <button className="su-lp-btn-primary" onClick={scrollToPricing}>Conhecer Planos</button>
                        <button className="su-lp-btn-secondary" onClick={() => navigate('/register')}>Criar Conta Grátis</button>
                    </div>
                </div>
            </section>

            <section className="su-lp-features">
                <h2 className="su-lp-section-title">Engenharia de Resultados</h2>
                <p className="su-lp-section-subtitle">Tudo que você precisa para elevar o nível do seu treinamento e faturamento.</p>

                <div className="su-lp-features-grid">
                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap">
                            <Dumbbell size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">Construtor Inteligente</h3>
                        <p className="su-lp-feature-desc">Prescreva treinos complexos em segundos. Calcule volume estrutural, RPE, e tempo estimado de sessão automaticamente enquanto monta a periodização.</p>
                    </div>

                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap accent">
                            <TrendingUp size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">Métricas de Assertividade e Lucro</h3>
                        <p className="su-lp-feature-desc">Para profissionais e academias: acompanhe retenção de alunos, faturamento, e a taxa de cumprimento e assertividade dos treinos gerados.</p>
                    </div>

                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap success">
                            <MapPin size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">Mapa de Academias e Descontos</h3>
                        <p className="su-lp-feature-desc">Atletas independentes podem localizar academias parceiras na plataforma e garantir descontos exclusivos na mensalidade ou diária.</p>
                    </div>

                    <div className="su-lp-feature-card">
                        <div className="su-lp-icon-wrap">
                            <Shield size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">Vínculos Institucionais</h3>
                        <p className="su-lp-feature-desc">Módulo exclusivo para Academias: gerencie todo seu time de professores, clientes, e visualize exatamente qual cliente está atrelado a qual treinador.</p>
                    </div>

                    <div className="su-lp-feature-card" style={{ opacity: 0.7 }}>
                        <div className="su-lp-icon-wrap" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                            <Smartphone size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">Check-in Integrado <span className="su-lp-coming-soon">Em breve</span></h3>
                        <p className="su-lp-feature-desc">No melhor estilo Gympass, faça check-ins rápidos pelo app nas academias cadastradas e gerencie acessos na catraca de forma simplificada.</p>
                    </div>

                    <div className="su-lp-feature-card" style={{ opacity: 0.7 }}>
                        <div className="su-lp-icon-wrap" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                            <Activity size={28} />
                        </div>
                        <h3 className="su-lp-feature-title">Módulo de Nutrição <span className="su-lp-coming-soon">Em breve</span></h3>
                        <p className="su-lp-feature-desc">Expansão da plataforma para integrar dieta, macros e acompanhamento nutricional unificados na mesma experiência fluida.</p>
                    </div>
                </div>
            </section>

            <section id="pricing" className="su-lp-pricing">
                <h2 className="su-lp-section-title">Escolha seu perfil</h2>
                <p className="su-lp-section-subtitle">Planos dimensionados para o seu momento e ambição.</p>

                <div className="su-lp-currency-toggle">
                    <span className={`su-lp-currency-label ${currency === 'BRL' ? 'active' : ''}`}>BRL (R$)</span>
                    <div className={`su-lp-toggle-switch ${currency === 'USD' ? 'active' : ''}`} onClick={toggleCurrency}></div>
                    <span className={`su-lp-currency-label ${currency === 'USD' ? 'active' : ''}`}>USD ($)</span>
                </div>

                <div className="su-lp-tabs">
                    <button className={`su-lp-tab-btn ${activeTab === 'atletas' ? 'active' : ''}`} onClick={() => setActiveTab('atletas')}>Para Você (Atletas)</button>
                    <button className={`su-lp-tab-btn ${activeTab === 'treinadores' ? 'active' : ''}`} onClick={() => setActiveTab('treinadores')}>Para Treinadores</button>
                    <button className={`su-lp-tab-btn ${activeTab === 'academias' ? 'active' : ''}`} onClick={() => setActiveTab('academias')}>Para Academias</button>
                </div>

                <div className="su-lp-pricing-grid">
                    {pricingData[activeTab].map((plan, idx) => (
                        <div key={idx} className={`su-lp-price-card ${plan.featured ? 'featured' : ''}`}>
                            {plan.featured && <div className="su-lp-featured-banner">{plan.badge}</div>}
                            <h3 className="su-lp-price-name">{plan.name}</h3>
                            <p className="su-lp-price-desc">{plan.desc}</p>

                            <div className="su-lp-price-amount">
                                {plan.priceBRL !== 'Sob Consulta' && <span className="su-lp-price-currency">{currency === 'BRL' ? 'R$' : '$'}</span>}
                                {currency === 'BRL' ? plan.priceBRL : plan.priceUSD}
                                {plan.period && <span className="su-lp-price-period">{plan.period}</span>}
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
                <p>&copy; {new Date().getFullYear()} ShapeUp Software. Todos os direitos reservados.</p>
                <p style={{ marginTop: '0.5rem', opacity: 0.5, fontSize: '0.8rem' }}>Transformando o fitness através da tecnologia e inteligência.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
