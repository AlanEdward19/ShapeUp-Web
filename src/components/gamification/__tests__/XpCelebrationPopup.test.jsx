import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import XpCelebrationPopup from '../XpCelebrationPopup';

describe('XpCelebrationPopup', () => {
    it('renders nothing when open is false', () => {
        const { container } = render(
            <XpCelebrationPopup open={false} status="pending" onDismiss={() => {}} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('shows pending state without numeric XP', () => {
        render(<XpCelebrationPopup open status="pending" onDismiss={() => {}} />);
        expect(screen.getByTestId('xp-celebration-pending')).toBeInTheDocument();
        expect(screen.queryByTestId('xp-celebration-delta')).not.toBeInTheDocument();
        expect(screen.queryByText(/\+\d+\s*XP/i)).not.toBeInTheDocument();
        expect(screen.queryByText('+0 XP')).not.toBeInTheDocument();
    });

    it('shows resolved delta text', () => {
        render(
            <XpCelebrationPopup open status="resolved" delta={120} onDismiss={() => {}} />
        );
        expect(screen.getByTestId('xp-celebration-delta')).toHaveTextContent('+120 XP');
    });

    it('shows neutral copy without +0 XP', () => {
        render(<XpCelebrationPopup open status="neutral" onDismiss={() => {}} />);
        expect(screen.getByTestId('xp-celebration-neutral')).toHaveTextContent('XP em processamento');
        expect(screen.queryByText('+0 XP')).not.toBeInTheDocument();
    });

    it('uses lucide placeholder when mascotImageUrl is absent', () => {
        render(<XpCelebrationPopup open status="pending" onDismiss={() => {}} />);
        const mascot = screen.getByTestId('xp-celebration-mascot');
        expect(mascot.querySelector('svg')).toBeInTheDocument();
        expect(mascot.querySelector('img')).not.toBeInTheDocument();
    });

    it('uses mascotImageUrl when provided', () => {
        render(
            <XpCelebrationPopup
                open
                status="pending"
                mascotImageUrl="https://example.com/mascot.png"
                onDismiss={() => {}}
            />
        );
        const img = screen.getByTestId('xp-celebration-mascot').querySelector('img');
        expect(img).toHaveAttribute('src', 'https://example.com/mascot.png');
    });

    it('calls onDismiss when close control is clicked', () => {
        const onDismiss = vi.fn();
        render(<XpCelebrationPopup open status="pending" onDismiss={onDismiss} />);
        fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
