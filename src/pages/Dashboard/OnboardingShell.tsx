import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicStitchHost from '../public-auth/PublicStitchHost';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';
import { OnboardingStaticMarkup } from './markup/OnboardingStaticMarkup';
import {
  applyOnboardingShadowBindings,
  teardownOnboardingShadowBindings,
  type OnboardingValues,
} from './onboardingShadowBindings';

const choiceCss =
  '[data-selected=true]{border-color:#e06c43!important;background:rgba(224,108,67,.08)!important}[role=radio]:focus-visible{outline:2px solid #e06c43}';

export default function OnboardingShell() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { completeOnboarding } = useNutritionApi();
  const navigate = useNavigate();
  const storageKey = `shapeup_setup_${localStorage.getItem('shapeup_user_id') || 'current'}`;
  const [values, setValues] = useState<OnboardingValues>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}') as OnboardingValues;
    } catch {
      return {};
    }
  });
  const shadowRef = useRef<ShadowRoot | null>(null);

  const update = useCallback((field: string, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  }, []);

  const finish = useCallback(async () => {
    if (saving) return;
    if (!values.age || !values.sex || !values['field-3']) {
      setStep(3);
      setError('Informe idade, sexo biológico e altura para calcular sua meta nutricional.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await completeOnboarding({
        age: Number(values.age),
        heightCm: Number(values['field-3']),
        biologicalSex: String(values.sex),
        activityLevel: String(values.activity || 'Moderate'),
      });
      localStorage.setItem(storageKey, JSON.stringify(values));
      setSaved(true);
      setStep(4);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }, [completeOnboarding, saving, storageKey, values]);

  const navigateDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const shadowApi = useMemo(
    () => ({
      step,
      saving,
      saved,
      values,
      update,
      setStep,
      finish,
      navigateDashboard,
    }),
    [step, saving, saved, values, update, finish, navigateDashboard],
  );

  const handleShadowRoot = useCallback((root: ShadowRoot | null) => {
    shadowRef.current = root;
  }, []);

  useLayoutEffect(() => {
    const root = shadowRef.current;
    if (!root) return;
    applyOnboardingShadowBindings(root, shadowApi);
  }, [shadowApi]);

  useEffect(() => () => teardownOnboardingShadowBindings(), []);

  return (
    <PublicStitchHost
      name="onboarding"
      css={choiceCss}
      onShadowRoot={handleShadowRoot}
      after={
        error ? (
          <p
            role="alert"
            style={{
              position: 'fixed',
              bottom: 60,
              left: 24,
              right: 24,
              padding: 16,
              background: '#211a17',
              color: '#ffb4ab',
              zIndex: 90,
            }}
          >
            {error}
          </p>
        ) : null
      }
    >
      <OnboardingStaticMarkup />
    </PublicStitchHost>
  );
}
