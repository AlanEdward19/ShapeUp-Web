import { render, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../../../stitch/styles/exercises.css?inline', () => ({ default: '' }));
vi.mock('../../../contexts/AuthContext', () => ({useAuth:()=>({currentUser:{uid:'test'},signOut:vi.fn()})}));
vi.mock('../../../contexts/UserProfileContext', () => ({useUserProfile:()=>({name:'Test',initials:'T',photo:''})}));
vi.mock('../../../hooks/useExercises', () => ({useExercises:()=>({exercises:[{id:7,name:'Exercício real',muscles:['Peitoral'],equipments:[],steps:['Instrução da API'],muscleDetails:[{muscleGroup:1,muscleNamePt:'Peitoral',activationPercent:62}]}],loading:false,searchTerm:'',setSearchTerm:vi.fn()})}));
import Exercises from '../ExercisesShell';

describe('ExercisesShell', () => {
it('opens details only on inspection, uses real data, and closes with Escape',()=>{
 localStorage.setItem('shapeup_language','pt-BR');
 const {container}=render(<MemoryRouter><Exercises /></MemoryRouter>);
 const root=container.querySelector('[data-stitch]').shadowRoot;
 const drawer=root.getElementById('exerciseDrawer');
 expect(drawer).toHaveAttribute('aria-hidden','true');
 const row=root.querySelector('.exercise-item');
 fireEvent.click(row);
 expect(drawer).toHaveAttribute('data-open','true');
 expect(drawer).toHaveTextContent('Instrução da API');
 expect(drawer).toHaveTextContent('62%');
 expect(drawer).not.toHaveTextContent('95%');
 expect(root.querySelector('.stitch-body')).not.toHaveTextContent('PÁGINA 1 DE 15');
 expect(row).not.toHaveTextContent('Glúteo Máximo, Adutores, Lombar');
 fireEvent.keyDown(within(drawer).getByTitle('Fechar Painel'),{key:'Escape'});
 expect(drawer).toHaveAttribute('aria-hidden','true');
 expect(root.activeElement).toBe(row);
});
});
