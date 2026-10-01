import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withLang } from '../../../test/withLang';
import SessionEndCard from '../SessionEndCard';

const renderCard = (summary) => render(withLang(
    <SessionEndCard title="Treino A" summary={summary} volumeText="1.200" durationText="45m" />,
));

describe('SessionEndCard', () => {
    it('shows the sentence, the story preview and says posting happens on the phone', () => {
        localStorage.setItem('shapeup_language', 'pt-BR');
        renderCard({ completedSets: 8, totalSets: 10, loadIncreases: 2 });
        expect(screen.getByTestId('session-end-sentence')).toHaveTextContent('Você cumpriu 8 de 10 séries e subiu a carga em 2 exercícios.');
        expect(screen.getByText('8/10')).toBeInTheDocument();
        expect(screen.getByText(/abra o ShapeUp no celular/)).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('says the load did not go up when nothing increased', () => {
        localStorage.setItem('shapeup_language', 'pt-BR');
        renderCard({ completedSets: 3, totalSets: 3, loadIncreases: 0 });
        expect(screen.getByTestId('session-end-sentence')).toHaveTextContent('Você cumpriu 3 de 3 séries e a carga não subiu desta vez.');
    });
});
