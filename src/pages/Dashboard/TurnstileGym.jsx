import { useLanguage } from '../../contexts/LanguageContext';
export default function TurnstileGym() {
 const { language }=useLanguage();
 const labels={'pt-BR':['Controle de acesso','Nenhuma catraca conectada. A integração de dispositivos e registros de acesso ainda não está disponível.'],en:['Access control','No turnstiles connected. Device and access-log integration is not available yet.'],es:['Control de acceso','No hay torniquetes conectados. La integración de dispositivos y registros de acceso aún no está disponible.']}[language];
 return <section><h1 className="su-page-title">{labels[0]}</h1><p className="su-page-subtitle">{labels[1]}</p></section>;
}
