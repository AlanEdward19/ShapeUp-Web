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

type NutritionFieldRefs = {
  ageInput: HTMLInputElement;
  sexSelect: HTMLSelectElement;
  activitySelect: HTMLSelectElement;
};

let nutritionFieldRefs: NutritionFieldRefs | null = null;

function mountNutritionFields(root: ShadowRoot, api: OnboardingShadowApi) {
  const panel = root.getElementById('step-content-3');
  if (!panel) return;
  let host = panel.querySelector('[data-onboarding-nutrition-mount]') as HTMLDivElement | null;
  if (!host) {
    host = document.createElement('div');
    host.dataset.onboardingNutritionMount = 'true';
    host.className = 'grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-sm';

    const ageLabel = document.createElement('label');
    ageLabel.append('Idade');
    const ageInput = document.createElement('input');
    ageInput.type = 'number';
    ageInput.min = '14';
    ageInput.max = '100';
    ageInput.className = 'w-full bg-oxide-850 border rounded px-3 py-2';
    ageInput.setAttribute('aria-label', 'Idade');
    ageLabel.appendChild(ageInput);

    const sexLabel = document.createElement('label');
    sexLabel.append('Sexo biológico');
    const sexSelect = document.createElement('select');
    sexSelect.className = 'w-full bg-oxide-850 border rounded px-3 py-2';
    sexSelect.setAttribute('aria-label', 'Sexo biológico');
    for (const [value, text] of [
      ['', 'Selecionar'],
      ['Male', 'Masculino'],
      ['Female', 'Feminino'],
    ] as const) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      sexSelect.appendChild(option);
    }
    sexLabel.appendChild(sexSelect);

    const activityLabel = document.createElement('label');
    activityLabel.append('Atividade diária');
    const activitySelect = document.createElement('select');
    activitySelect.className = 'w-full bg-oxide-850 border rounded px-3 py-2';
    for (const [value, text] of [
      ['Sedentary', 'Sedentário'],
      ['Light', 'Levemente ativo'],
      ['Moderate', 'Moderadamente ativo'],
      ['Active', 'Muito ativo'],
    ] as const) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      activitySelect.appendChild(option);
    }
    activityLabel.appendChild(activitySelect);

    host.append(ageLabel, sexLabel, activityLabel);
    panel.appendChild(host);
    nutritionFieldRefs = { ageInput, sexSelect, activitySelect };
  }

  const refs = nutritionFieldRefs;
  if (!refs) return;
  refs.ageInput.value = String(api.values.age ?? '');
  refs.ageInput.onchange = (event) =>
    api.update('age', (event.target as HTMLInputElement).value);
  refs.sexSelect.value = String(api.values.sex ?? '');
  refs.sexSelect.onchange = (event) =>
    api.update('sex', (event.target as HTMLSelectElement).value);
  refs.activitySelect.value = String(api.values.activity ?? 'Moderate');
  refs.activitySelect.onchange = (event) =>
    api.update('activity', (event.target as HTMLSelectElement).value);
}

function choiceNodes(root: ShadowRoot) {
  return [...root.querySelectorAll('label.cursor-pointer,div.cursor-pointer')];
}

function syncChoiceGroups(root: ShadowRoot, api: OnboardingShadowApi) {
  const allChoices = choiceNodes(root);
  root.querySelectorAll('label.cursor-pointer,div.cursor-pointer').forEach((node) => {
    const element = node as HTMLElement;
    if (element.querySelector('input')) return;
    const siblings = [...element.parentElement!.children].filter((item) =>
      item.classList.contains('cursor-pointer'),
    );
    if (siblings.length <= 1) return;
    const group = allChoices.filter((item) => item.parentElement === element.parentElement);
    const groupId = `choice-${allChoices.indexOf(group[0])}`;
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

function isTemplateField(element: Element) {
  if (element.closest('[data-onboarding-nutrition-mount]')) return false;
  if (element instanceof HTMLInputElement && element.type === 'file') return false;
  return true;
}

function syncTemplateFields(root: ShadowRoot, api: OnboardingShadowApi) {
  const shadowInputs = [...root.querySelectorAll('input,select')].filter(isTemplateField);
  shadowInputs.forEach((element, globalIndex) => {
    const fieldElement = element as HTMLInputElement | HTMLSelectElement;
    const field = `field-${globalIndex}`;
    const stored = api.values[field];
    if (stored !== undefined && stored !== '') {
      fieldElement.value = String(stored);
    } else if (
      fieldElement instanceof HTMLInputElement &&
      fieldElement.type === 'text' &&
      globalIndex === 0
    ) {
      fieldElement.value =
        localStorage.getItem('shapeup_user_name') || fieldElement.defaultValue || '';
    }
    const label =
      fieldElement.parentElement?.querySelector('label')?.textContent?.trim() ||
      fieldElement.closest('div')?.previousElementSibling?.textContent?.trim() ||
      `Parâmetro ${globalIndex + 1}`;
    fieldElement.setAttribute('aria-label', label);
    fieldElement.onchange = (event) => {
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
    button.parentElement?.appendChild(input);
    button.onclick = () => input.click();
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
  syncTemplateFields(root, api);
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
  nutritionFieldRefs = null;
}
