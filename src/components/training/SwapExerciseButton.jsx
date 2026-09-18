import React from 'react';
import Button from '../Button';
import { useLanguage } from '../../contexts/LanguageContext';

const SwapExerciseButton = ({ disabled, onClick, title }) => {
    const { t } = useLanguage();
    return (
        <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={disabled}
            onClick={onClick}
            title={title || (disabled ? t('client.session.swap.no_alternatives') : undefined)}
        >
            {t('client.session.swap.button')}
        </Button>
    );
};

export default SwapExerciseButton;
