import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUserManagementApi } from '../../hooks/api/useUserManagementApi';
import WorkspaceShellPage from '../../components/Workspace/WorkspaceShellPage';
import { workspaceNavStyle } from '../shell-assets/workspaceNavStyle';
import { useEffect, useState } from 'react';
import {
  SettingsPublicMarkup,
  type SettingsValues,
} from './markup/SettingsPublicMarkup';

export default function SettingsShell() {
  const key = `shapeup_profile_details_${localStorage.getItem('shapeup_user_id') || 'current'}`;
  const [values, setValues] = useState<SettingsValues>(() => {
    try {
      return {
        name: localStorage.getItem('shapeup_user_name') || '',
        email: localStorage.getItem('shapeup_user_email') || '',
        ...JSON.parse(localStorage.getItem(key) || '{}'),
      };
    } catch {
      return {};
    }
  });
  const [notice, setNotice] = useState('');
  const { getMe } = useUserManagementApi();
  useEffect(() => {
    let active = true;
    getMe()
      .then((user) => {
        if (active) {
          setValues((previous) => ({
            ...previous,
            name: user.name || user.fullName || previous.name,
            email: user.email || previous.email,
          }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getMe]);
  const { resetPassword } = useAuth() as unknown as { resetPassword: (email: string) => Promise<void> };
  const { setUnitSystem, unitSystem, language, setLanguage, t } = useLanguage();

  const update = (field: string, value: string | boolean) => {
    setNotice('');
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const shellState = {
    values,
    update,
    notice,
    language,
    setLanguage,
    unitSystem,
    setUnitSystem,
    langTitle: t('preferences.lang.title'),
    langDesc: t('preferences.lang.desc'),
    onSave: () => {
      localStorage.setItem(key, JSON.stringify(values));
      localStorage.setItem('shapeup_user_name', String(values.name || ''));
      window.dispatchEvent(new Event('shapeup_profile_updated'));
      setNotice('Alterações salvas com sucesso.');
    },
    onResetPassword: async () => {
      try {
        await resetPassword(String(values.email || ''));
        setNotice('Enviamos as instruções de redefinição para seu e-mail.');
      } catch {
        setNotice('Não foi possível enviar. Confira seu e-mail e tente novamente.');
      }
    },
    onStubAction: () => {
      setNotice('Esta operação ainda não está disponível no serviço de autenticação.');
    },
  };

  return (
    <WorkspaceShellPage name="settings" css={workspaceNavStyle}>
      <SettingsPublicMarkup state={shellState} />
    </WorkspaceShellPage>
  );
}
