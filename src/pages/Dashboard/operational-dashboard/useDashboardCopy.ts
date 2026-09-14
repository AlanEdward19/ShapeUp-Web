import { useLanguage } from '../../../contexts/LanguageContext';
import { copy } from '../../../stitch/copy';

export function useDashboardCopy() {
  const { language, translateCopy } = useLanguage();
  return {
    language,
    tr: (text: string) =>
      language === 'pt-BR'
        ? text
        : copy[text]?.[language === 'es' ? 1 : 0] || translateCopy(text),
  };
}
