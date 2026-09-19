import React from 'react';
import { Sparkles } from 'lucide-react';
import './XpCelebrationPopup.css';

const XpCelebrationPopup = ({
    open,
    status,
    delta,
    mascotImageUrl,
    onDismiss,
}) => {
    if (!open) {
        return null;
    }

    return (
        <div className="su-xp-celebration-overlay" role="dialog" aria-modal="true" aria-label="XP ganho" data-testid="xp-celebration-overlay">
            <div className="su-xp-celebration-card">
                <button
                    type="button"
                    className="su-xp-celebration-dismiss"
                    onClick={onDismiss}
                    aria-label="Fechar"
                >
                    ×
                </button>

                <div className="su-xp-celebration-mascot" data-testid="xp-celebration-mascot">
                    {mascotImageUrl ? (
                        <img src={mascotImageUrl} alt="" />
                    ) : (
                        <Sparkles aria-hidden="true" size={28} strokeWidth={1.75} />
                    )}
                </div>

                <div className="su-xp-celebration-body">
                    {status === 'pending' && (
                        <p className="su-xp-celebration-pending" data-testid="xp-celebration-pending">
                            Calculando XP…
                        </p>
                    )}
                    {status === 'resolved' && delta != null && (
                        <p className="su-xp-celebration-delta" data-testid="xp-celebration-delta">
                            +{delta} XP
                        </p>
                    )}
                    {status === 'neutral' && (
                        <p className="su-xp-celebration-neutral" data-testid="xp-celebration-neutral">
                            XP em processamento
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default XpCelebrationPopup;
