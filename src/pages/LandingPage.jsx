import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Dumbbell, PlayCircle, Plus } from 'lucide-react';
import Logo from '../components/Logo/Logo';
import SeoHead from '../components/SeoHead';
import OrganizationJsonLd from '../components/OrganizationJsonLd';
import ProductPreview from '../components/ProductPreview';
import { useLanguage } from '../contexts/LanguageContext';
import { SITE_DESCRIPTION } from '../config/site';
import './LandingPage.css';

const pillars = [
  ['01. PRESCRIÇÃO ÁGIL', 'Prescrição rápida & gestão de cargas', 'Monte fichas completas em minutos com suporte a cadência, repetições em reserva (RIR) e progressão de tonelagem semanal. Copie, adapte e aplique blocos inteiros sem retrabalho.', 'Histórico claro de cargas e progressão real por exercício', 'Biblioteca objetiva com variações articulares testadas'],
  ['02. APP DO ALUNO', 'Acompanhamento real & feedback direto', 'O aluno abre o app e vê exatamente o que precisa fazer: sem enrolação, cronômetro automático de descanso e campo de anotação de carga fácil de usar no meio do treino.', 'Registro de séries com um toque e histórico acessível', 'Fotos comparativas e medidas corporais consolidadas'],
  ['03. GESTÃO & OPERAÇÃO', 'Operação & cobrança sem fricção', 'Cobranças recorrentes via Pix e cartão automatizadas, controle de vencimentos e integração para academias e estúdios que usam catracas físicas e controle de acesso.', 'Régua automática de renovação sem constrangimento', 'Suporte a catracas locais para estúdios e boxes'],
];
const library = [
  ['Stiff com Barra', 'Cadeia posterior • Extensão de quadril pura'],
  ['Cadeira Flexora', 'Isolador • Flexão de joelho em 90° de quadril'],
  ['Elevação Pélvica com Barra', 'Glúteo máximo • Pico encurtado'],
];
const plans = [
  { category: 'Individual', name: 'Atleta Solo', role: 'independent', price: '29', note: 'Cobrado anualmente ou R$ 39 no mensal', description: 'Para quem treina por conta própria e quer registrar histórico de cargas, cadência e evolução corporal.', features: ['Registro completo de treinos e cargas', 'Cronômetro inteligente de recuperação', 'Histórico fotográfico e medidas'], action: 'Começar assinatura' },
  { category: 'Profissional', name: 'Personal Trainer', role: 'professional', price: '89', note: 'Cobrado anualmente ou R$ 119 no mensal', description: 'Para treinadores gerenciarem suas consultorias presenciais e online com agilidade e cobrança integrada.', features: ['Até 50 alunos ativos simultâneos', 'Montagem de treinos e blocos ilimitados', 'Cobrança recorrente automática via Pix', 'Sua logomarca no aplicativo do aluno'], action: 'Testar 14 dias grátis' },
  { category: 'Estúdios & boxes', name: 'Gestão de Unidade', role: 'gym', price: '249', note: 'Por unidade física ativa', description: 'Estrutura completa com equipe de professores, recepção e controle de catracas locais.', features: ['Alunos ilimitados no banco de dados', 'Acesso para múltiplos professores', 'Integração com catracas (Hikvision, Control iD)', 'Suporte prioritário via WhatsApp'], action: 'Falar com consultor' },
];
const testimonials = [
  ['Parei de perder meus domingos inteiros montando planilhas no computador. Com o ShapeUp eu atualizo a ficha do atleta no intervalo entre os atendimentos presenciais.', 'Guilherme Vasconcelos', 'Personal Trainer • São Paulo'],
  ['Meus alunos finalmente registram as cargas que levantam. O app é direto, sem propagandas ou distrações infantis que atrapalham o ritmo do treino.', 'Camila Rezende', 'Treinadora de Força • Curitiba'],
  ['Resolveu duas dores ao mesmo tempo no nosso estúdio: a cobrança automática via Pix todo dia 5 e o controle de fichas unificado para os três professores.', 'Lucas Fagundes', 'Gestor do Estúdio Atlas • Belo Horizonte'],
];
function Brand() { return <Link className="lp-brand" to="/" aria-label="ShapeUp, início"><Logo /><span>Shape<b>Up</b></span></Link>; }
function SectionHeading({ eyebrow, title, children }) { return <div className="lp-section-heading"><span className="lp-eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>; }

export default function LandingPage() {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState([]);
  const toggleExercise = (name) => setSelected(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  return <div className="stitch-landing">
    <SeoHead title={t('seo.home.title')} description={SITE_DESCRIPTION[language] || SITE_DESCRIPTION.en} path="/" />
    <OrganizationJsonLd />
    <header className="lp-topbar"><div className="lp-container"><Brand /><nav aria-label="Navegação principal"><a href="#pilares">Pilares</a><a href="#fluxo">Workflow real</a><a href="#manifesto">A abordagem</a><a href="#planos">Planos</a></nav><div className="lp-actions"><Link to="/login">Entrar</Link><a href="#planos" className="lp-button lp-primary">Experimentar na prática</a></div></div></header>
    <main>
      <section className="lp-hero"><div className="lp-container">
        <div className="lp-hero-copy"><span className="lp-eyebrow">Plataforma de prescrição e acompanhamento</span><h1>O software de treino e prescrição feito para quem vive da prática.</h1><p>Criado para personal trainers, preparadores físicos e academias que precisam de velocidade na montagem de treinos, acompanhamento real de atletas e gestão sem ruído.</p><div className="lp-actions"><a className="lp-button lp-primary" href="#planos">Experimentar na prática</a><a className="lp-button" href="#fluxo"><PlayCircle size={18} />Ver demonstração interativa</a></div></div>
        <ProductPreview />
      </div></section>
      <section id="pilares"><div className="lp-container"><SectionHeading eyebrow="A essência da ferramenta" title="Menos cliques e zero burocracia. O foco no que gera resultado.">Desenvolvido para atender a realidade diária de quem atende múltiplos alunos, precisa periodizar com precisão e não tem tempo a perder com interfaces lentas.</SectionHeading><div className="lp-pillars">{pillars.map(([label, title, description, ...features]) => <article key={label}><span className="lp-eyebrow">{label}</span><h3>{title}</h3><p>{description}</p><ul>{features.map(feature => <li key={feature}>{feature}</li>)}</ul></article>)}</div></div></section>
      <section id="fluxo" className="lp-workflow"><div className="lp-container lp-workflow-grid"><div><SectionHeading eyebrow="Eficiência comprovada" title="De 40 minutos para 4 minutos por ficha de treino.">O tempo gasto montando PDFs ou planilhas confusas é o tempo que você deixa de usar para captar novos clientes ou atender seus atletas na sala de musculação.</SectionHeading><ol className="lp-steps">{[['Estruture o bloco', 'Selecione objetivos, número de semanas e divisão de dias em poucos cliques.'], ['Puxe da sua biblioteca pessoal', 'Use seus exercícios favoritos ou salve combinações recorrentes para reutilizar.'], ['Envio imediato ao app do aluno', 'Sem download de arquivos pesados. O treino sincroniza na hora com vídeos e notas.']].map(([title, description]) => <li key={title}><div><strong>{title}</strong><p>{description}</p></div></li>)}</ol></div><div className="lp-library"><header><h3><Dumbbell size={20} />Biblioteca de exercícios & padrões</h3><small>Filtro: Posterior de coxa</small></header><div>{library.map(([name, description]) => <div className="lp-library-row" key={name}><div><strong>{name}</strong><small>{description}</small></div><button type="button" aria-pressed={selected.includes(name)} onClick={() => toggleExercise(name)}>{selected.includes(name) ? <Check size={14} /> : <Plus size={14} />}{selected.includes(name) ? 'Adicionado' : 'Inserir no treino'}</button></div>)}</div><footer><span>Personalize cadências, vídeos demonstrativos e orientações específicas.</span><span role="status">{selected.length ? `${selected.length} exercício${selected.length > 1 ? 's' : ''} no treino de exemplo` : 'Experimente inserir um exercício'}</span></footer></div></div></section>
      <section id="manifesto"><div className="lp-container"><SectionHeading eyebrow="A realidade de quem usa" title="Criado a partir da rotina diária no salão de musculação." /><div className="lp-testimonials">{testimonials.map(([quote, name, position]) => <blockquote key={name}><p>“{quote}”</p><cite><strong>{name}</strong><small>{position}</small></cite></blockquote>)}</div></div></section>
      <section id="planos"><div className="lp-container"><SectionHeading eyebrow="Investimento claro" title="Planos diretos para cada estágio da sua atuação.">Sem taxas ocultas de matrícula ou fidelidade forçada. Cancele quando quiser.</SectionHeading><div className="lp-plans">{plans.map(plan => <article key={plan.role} className={plan.role === 'professional' ? 'lp-plan lp-featured' : 'lp-plan'}><span className="lp-eyebrow">{plan.category}</span><h3>{plan.name}</h3><p>{plan.description}</p><div className="lp-price"><div>R$ <strong>{plan.price}</strong><span>{t('landing.pricing.period')}</span></div><small>{plan.note}</small></div><ul>{plan.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul><div className="lp-plan-action"><Link className={`lp-button ${plan.role === 'professional' ? 'lp-primary' : ''}`} to={`/register?role=${plan.role}`}>{plan.action}</Link></div></article>)}</div></div></section>
    </main>
    <footer className="lp-footer"><div className="lp-container"><div className="lp-footer-top"><div><Brand /><p>Software de prescrição & gestão atlética</p></div><nav aria-label="Rodapé"><a href="#pilares">Pilares</a><a href="#fluxo">Workflow</a><a href="#planos">Planos</a><Link to="/login">Área do cliente</Link></nav></div><div className="lp-footer-bottom"><span>© {new Date().getFullYear()} ShapeUp. Desenvolvido para a prática real do treinamento físico.</span><div><Link to="/privacy">Privacidade</Link><Link to="/terms">Termos de uso</Link></div></div></div></footer>
  </div>;
}
