import { fireEvent, render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import DatePicker from './DatePicker';
import { LanguageProvider } from '../contexts/LanguageContext';
it('submits the selected date, enforces bounds and navigates a month boundary',()=>{
 localStorage.setItem('shapeup_language','en');const changed=vi.fn();
 const {container}=render(<LanguageProvider><form><DatePicker id="date" defaultValue="2026-09-30" min="2026-09-20" max="2026-10-10" onChange={changed}/></form></LanguageProvider>);
 const dialog=container.querySelector('dialog');dialog.showModal=()=>dialog.setAttribute('open','');dialog.close=()=>dialog.removeAttribute('open');
 fireEvent.click(screen.getByRole('button',{name:'Choose date'}));
 expect(container.querySelector('[data-date="2026-09-19"]')).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Next month'}));
 expect(container.querySelector('[data-date="2026-10-11"]')).toBeDisabled();
 fireEvent.click(container.querySelector('[data-date="2026-10-02"]'));
 expect(container.querySelector('form').elements.date.value).toBe('2026-10-02');
 expect(changed).toHaveBeenCalledWith(expect.objectContaining({target:expect.objectContaining({value:'2026-10-02'})}));
 expect(dialog).not.toHaveAttribute('open');
});
