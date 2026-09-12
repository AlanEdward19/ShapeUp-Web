import { render, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import { StitchLanding, StitchLogin } from './PublicPages';
import Registration from './Registration';
import RouteMetadata from '../components/RouteMetadata';

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ register: vi.fn(), signIn: vi.fn(), signInWithGoogle: vi.fn(), resetPassword: vi.fn() }) }));
const mount = component => {
  localStorage.setItem('shapeup_language', 'pt-BR');
  const {container} = render(<LanguageProvider><MemoryRouter>{component}</MemoryRouter></LanguageProvider>);
  return container.querySelector('[data-stitch]').shadowRoot;
};

it('shares the home link and removes setup and compliance clutter from registration', () => {
  const root = mount(<Registration />);
  expect(root.querySelector('.st-auth-brand')).toHaveAttribute('href', '/');
  expect(root.querySelector('.stitch-body')).not.toHaveTextContent('Setup de Ambiente');
  expect(root.querySelector('.stitch-body')).not.toHaveTextContent('Segurança de dados e conformidade integral com LGPD.');
});

it('changes language without resetting entered registration fields', async () => {
  const root = mount(<Registration />);
  const name = root.getElementById('fullName');
  fireEvent.change(name, { target: {value:'Alan Silva'} });
  fireEvent.change(root.querySelector('[aria-label="Language / Idioma"]'), {target:{value:'en'}});
  await waitFor(() => expect(root.querySelector('h1')).toHaveTextContent('How will you use ShapeUp?'));
  expect(name).toHaveValue('Alan Silva');
  fireEvent.change(root.querySelector('[aria-label="Language / Idioma"]'), {target:{value:'es'}});
  await waitFor(() => expect(root.querySelector('h1')).toHaveTextContent('¿Cómo usarás ShapeUp?'));
  expect(name).toHaveValue('Alan Silva');
  fireEvent.change(root.querySelector('[aria-label="Language / Idioma"]'), {target:{value:'pt-BR'}});
  await waitFor(() => expect(root.querySelector('h1')).toHaveTextContent('Como você pretende usar o ShapeUp?'));
});

it('renders one working password toggle and a home link in login', () => {
  const root = mount(<StitchLogin />);
  expect(root.querySelector('.st-auth-brand')).toHaveAttribute('href','/');
  const button = within(root.querySelector('.stitch-body')).getByRole('button',{name:'Mostrar senha'});
  expect(root.querySelectorAll('#toggle-pwd')).toHaveLength(1);
  fireEvent.click(button);
  expect(root.getElementById('password')).toHaveAttribute('type','text');
  expect(button).toHaveAttribute('aria-label','Ocultar senha');
  fireEvent.click(button);
  expect(root.getElementById('password')).toHaveAttribute('type','password');
});

it('translates the landing headline and navigation to English and Spanish', async () => {
  const root = mount(<StitchLanding />);
  fireEvent.change(root.querySelector('[aria-label="Language / Idioma"]'),{target:{value:'en'}});
  await waitFor(() => expect(root.querySelector('h1')).toHaveTextContent('Training software built for people who live the practice.'));
  fireEvent.change(root.querySelector('[aria-label="Language / Idioma"]'),{target:{value:'es'}});
  await waitFor(() => expect(root.querySelector('h1')).toHaveTextContent('Software de entrenamiento para quienes viven la práctica.'));
  expect(root.querySelector('nav')).toHaveTextContent('Nuestro enfoque');
  expect(document.title).toBe('Diario de entrenamiento para atletas, entrenadores y gimnasios · ShapeUp');
});

for (const [language, step, badge, birth, finish, mismatch, title] of [
  ['en', 'Step', 'Step', 'Date of birth', 'Create account', 'Passwords do not match.', 'Create account'],
  ['es', 'Paso', 'Etapa', 'Fecha de nacimiento', 'Crear cuenta', 'Las contraseñas no coinciden.', 'Crear cuenta'],
]) {
  it(`localizes all registration stages and validation in ${language}`, async () => {
    localStorage.setItem('shapeup_language', language);
    const {container} = render(<LanguageProvider><MemoryRouter initialEntries={['/register']}><RouteMetadata /><Registration /></MemoryRouter></LanguageProvider>);
    const root = container.querySelector('[data-stitch]').shadowRoot;
    expect(document.title).toBe(`${title} · ShapeUp`);
    expect(root.querySelector('.stitch-body')).toHaveTextContent(`${step} 1 ${language === 'en' ? 'of' : 'de'} 3:`);
    fireEvent.change(root.getElementById('fullName'), {target:{value:'Alan Silva'}});
    fireEvent.change(root.getElementById('email'), {target:{value:'alan@example.com'}});
    fireEvent.submit(root.querySelector('form'));
    expect(root.querySelector('.stitch-body')).toHaveTextContent(`${badge} 02/03`);
    fireEvent.change(root.getElementById('password'), {target:{value:'StrongPassword123!'}});
    fireEvent.change(root.getElementById('confirmPassword'), {target:{value:'DifferentPassword123!'}});
    fireEvent.submit(root.querySelector('form'));
    expect(root.querySelector('[role="alert"]')).toHaveTextContent(mismatch);
    fireEvent.change(root.querySelector('[aria-label="Language / Idioma"]'), {target:{value:'pt-BR'}});
    await waitFor(() => expect(root.querySelector('[role="alert"]')).toHaveTextContent('As senhas não coincidem.'));
    expect(document.title).toBe('Criar conta · ShapeUp');
    fireEvent.change(root.querySelector('[aria-label="Language / Idioma"]'), {target:{value:language}});
    fireEvent.change(root.getElementById('confirmPassword'), {target:{value:'StrongPassword123!'}});
    fireEvent.submit(root.querySelector('form'));
    expect(root.querySelector('.stitch-body')).toHaveTextContent(`${badge} 03/03`);
    expect(root.querySelector('label[for="birthDate"]')).toHaveTextContent(birth);
    expect(root.querySelector('button[type="submit"]')).toHaveTextContent(finish);
    expect(root.getElementById('fullName')).toHaveValue('Alan Silva');
  });
}
