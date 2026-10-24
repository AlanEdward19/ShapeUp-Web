import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../test/withLang';
import ProfileSelectionDialog from '../ProfileSelectionDialog';

const roles = [{ role: 'Trainer' }, { role: 'IndependentClient' }];

const setup = (props = {}) => {
    localStorage.setItem('shapeup_language', 'pt-BR');
    const onSelect = vi.fn();
    const onCancel = vi.fn();
    render(withLang(
        <ProfileSelectionDialog roles={roles} user={{ displayName: 'Alan' }} busyIndex={null} onSelect={onSelect} onCancel={onCancel} {...props} />,
    ));
    return { onSelect, onCancel };
};

describe('ProfileSelectionDialog', () => {
    it('renders nothing when the account has a single profile flow (no roles pending)', () => {
        setup({ roles: [] });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('lists each profile with a description and reports the chosen one', () => {
        const { onSelect } = setup();
        expect(screen.getByRole('dialog', { name: 'Como você quer entrar?' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Treino próprio/ }));
        expect(onSelect).toHaveBeenCalledWith(roles[1], 1);
    });

    it('lets the user back out to another account with Escape or the link', () => {
        const { onCancel } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Usar outra conta' }));
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
        expect(onCancel).toHaveBeenCalledTimes(2);
    });

    it('locks the other options while one profile is being opened', () => {
        setup({ busyIndex: 0 });
        expect(screen.getByRole('button', { name: /Personal trainer/ })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Treino próprio/ })).toBeDisabled();
    });
});
