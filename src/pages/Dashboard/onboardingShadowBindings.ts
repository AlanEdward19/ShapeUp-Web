import { createRoot, type Root } from 'react-dom/client';
import { createElement, type ChangeEvent } from 'react';
import { sourceDocument } from '../../stitch/sourceRuntime';

const headings = [
  'Bem-vindo ao ShapeUp.',
  'Nutrição & Gasto Calórico.',
  'Seu Perfil de Atleta.',
  'Seu Workspace Está Pronto.',
];
const badges = [
  'Calibração de Abertura',
  'Fórmula de Combustível',
  'Registro de Performance',
  'Setup Finalizado',
];

export type OnboardingValues = Record<string, string | number | undefined>;

export type OnboardingShadowApi = {
  step: number;
  saving: boolean;
  saved: boolean;
  values: OnboardingValues;
  update: (field: string, value: string) => void;
  setStep: (step: number) => void;
  finish: () => void;
  navigateDashboard: () => void;
};

let nutritionMount: Root | null = null;

function NutritionFields({
  values,
  update,
}: {
  values: OnboardingValues;
  update: (field: string, value: string) => void;
}) {
  return createElement(
    'div',
    { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-sm' },
    createElement(
      'label',
      null,
      'Idade',
      createElement('input', {
        type: 'number',
        min: 14,
        max: 100,
        value: values.age || '',
        onChange: (event: ChangeEvent<HTMLInputElement>) => update('age', event.target.value),
        className: 'w-full bg-oxide-850 border rounded px-3 py-2',
        'aria-label': 'Idade',
      }),
    ),
    createElement(
      'label',
      null,
      'Sexo biológico',
      createElement(
        'select',
        {
          value: values.sex || '',
          onChange: (event: ChangeEvent<HTMLSelectElement>) => update('sex', event.target.value),
          className: 'w-full bg-oxide-850 border rounded px-3 py-2',
          'aria-label': 'Sexo biológico',
        },
        createElement('option', { value: '' }, 'Selecionar'),
        createElement('option', { value: 'Male' }, 'Masculino'),
        createElement('option', { value: 'Female' }, 'Feminino'),
      ),
    ),
    createElement(
      'label',
      null,
      'Atividade diária',
      createElement(
        'select',
        {
          value: values.activity || 'Moderate',
          onChange: (event: ChangeEvent<HTMLSelectElement>) => update('activity', event.target.value),
          className: 'w-full bg-oxide-850 border rounded px-3 py-2',
        },
        createElement('option', { value: 'Sedentary' }, 'Sedentário'),
        createElement('option', { value: 'Light' }, 'Levemente ativo'),
        createElement('option', { value: 'Moderate' }, 'Moderadamente ativo'),
        createElement('option', { value: 'Active' }, 'Muito ativo'),
      ),
    ),
  );
}

function mountNutritionFields(root: ShadowRoot, api: OnboardingShadowApi) {
  const panel = root.getElementById('step-content-3');
  if (!panel) return;
  let host = panel.querySelector('[data-onboarding-nutrition-mount]') as HTMLDivElement | null;
  if (!host) {
    host = document.createElement('div');
    host.dataset.onboardingNutritionMount = 'true';
    panel.appendChild(host);
  }
  if (!nutritionMount) nutritionMount = createRoot(host);
  nutritionMount.render(
    createElement(NutritionFields, { values: api.values, update: api.update }),
  );
}

function syncChoiceGroups(root: ShadowRoot, api: OnboardingShadowApi) {
  const document = sourceDocument('onboarding');
  root.querySelectorAll('label.cursor-pointer,div.cursor-pointer').forEach((node) => {
    const element = node as HTMLElement;
    if (element.querySelector('input')) return;
    const siblings = [...element.parentElement!.children].filter((item) =>
      item.classList.contains('cursor-pointer'),
    );
    if (siblings.length <= 1) return;
    const group = [...document.querySelectorAll('label.cursor-pointer,div.cursor-pointer')].filter(
      (item) => item.parentElement === element.parentElement,
    );
    const groupId = `choice-${[...document.querySelectorAll('label.cursor-pointer,div.cursor-pointer')].indexOf(group[0])}`;
    const selected =
      api.values[groupId] ??
      group.findIndex((item) => item.classList.contains('card-selected'));
    const index = group.indexOf(element);
    element.setAttribute('role', 'radio');
    element.tabIndex = 0;
    element.setAttribute('aria-checked', selected === index ? 'true' : 'false');
    if (selected === index) element.dataset.selected = 'true';
    else delete element.dataset.selected;
    element.classList.remove('card-selected');
    if (selected === index) element.classList.add('card-selected');
    element.onclick = () => api.update(groupId, String(index));
    element.onkeydown = (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        api.update(groupId, String(index));
      }
    };
  });
}

function syncTemplateFields(root: ShadowRoot, api: OnboardingShadowApi) {
  const document = sourceDocument('onboarding');
  const templateInputs = [...document.querySelectorAll('input,select')];
  const shadowInputs = [...root.querySelectorAll('input,select')].filter(
    (element) => !element.closest('[data-onboarding-nutrition-mount]'),
  );
  templateInputs.forEach((_, globalIndex) => {
    const element = shadowInputs[globalIndex] as HTMLInputElement | HTMLSelectElement | undefined;
    if (!element) return;
    const field = `field-${globalIndex}`;
    const stored = api.values[field];
    if (stored !== undefined && stored !== '') {
      element.value = String(stored);
    } else if (element instanceof HTMLInputElement && element.type === 'text' && globalIndex === 0) {
      element.value = localStorage.getItem('shapeup_user_name') || element.defaultValue || '';
    }
    const label =
      element.parentElement?.querySelector('label')?.textContent?.trim() ||
      element.closest('div')?.previousElementSibling?.textContent?.trim() ||
      `Parâmetro ${globalIndex + 1}`;
    element.setAttribute('aria-label', label);
    element.onchange = (event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      api.update(field, target.value);
    };
  });
}

function replaceKcalCopy(root: ShadowRoot) {
  root.querySelectorAll('*').forEach((node) => {
    if (node.childNodes.length === 1 && node.textContent?.includes('1.845 kcal')) {
      node.textContent = 'Configurar no diário';
    }
  });
}

function wirePhotoUpload(root: ShadowRoot, api: OnboardingShadowApi) {
  root.querySelectorAll('button').forEach((button) => {
    if (!/Carregar foto/.test(button.textContent || '')) return;
    if (button.dataset.onboardingPhotoWired) return;
    button.dataset.onboardingPhotoWired = 'true';
    const label = document.createElement('label');
    label.className = button.className;
    label.textContent = 'Carregar foto local';
    const input = document.createElement('input');
    input.type = 'file';
    input.hidden = true;
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => api.update('avatar', String(reader.result));
        reader.readAsDataURL(file);
      }
    };
    label.appendChild(input);
    button.replaceWith(label);
  });
}

export function applyOnboardingShadowBindings(root: ShadowRoot, api: OnboardingShadowApi) {
  for (let index = 1; index <= 4; index += 1) {
    const panel = root.getElementById(`step-content-${index}`);
    if (!panel) continue;
    const visible = index === api.step;
    panel.toggleAttribute('hidden', !visible);
    panel.classList.toggle('hidden', !visible);
  }

  for (let index = 1; index <= 4; index += 1) {
    const nav = root.getElementById(`nav-step-${index}`);
    if (!nav) continue;
    if (index === api.step) nav.setAttribute('aria-current', 'step');
    else nav.removeAttribute('aria-current');
    nav.style.borderColor = index === api.step ? '#e06c43' : 'transparent';
  }

  const headline = root.getElementById('left-headline');
  if (headline) headline.textContent = headings[api.step - 1];
  const badge = root.getElementById('left-badge-tag');
  if (badge) badge.textContent = badges[api.step - 1];
  const mascot = root.getElementById('mascot-image') as HTMLImageElement | null;
  if (mascot) mascot.src = '/stitch/ryno.png';

  mountNutritionFields(root, api);
  syncChoiceGroups(root, api);
  syncTemplateFields(root, api);
  replaceKcalCopy(root);
  wirePhotoUpload(root, api);

  root.querySelectorAll('[data-source-onclick]').forEach((node) => {
    const element = node as HTMLButtonElement;
    const action = element.getAttribute('data-source-onclick') || '';
    const target = action.match(/switchStep\((\d)\)/)?.[1];
    if (target) {
      element.disabled = api.saving;
      element.onclick = () => {
        if (Number(target) === 4) api.finish();
        else api.setStep(Number(target));
      };
    } else if (action.startsWith('alert(')) {
      element.disabled = api.saving;
      element.onclick = () => (api.saved ? api.navigateDashboard() : api.finish());
    }
  });
}

export function teardownOnboardingShadowBindings() {
  nutritionMount?.unmount();
  nutritionMount = null;
}
