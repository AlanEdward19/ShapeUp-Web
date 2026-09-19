import React from 'react';
import XpCelebrationPopup from '../../components/gamification/XpCelebrationPopup';

export default function WorkoutFinishXpPopup({ xpCelebration }) {
    return (
        <XpCelebrationPopup
            open={xpCelebration.open}
            status={xpCelebration.status}
            delta={xpCelebration.delta}
            mascotImageUrl={xpCelebration.mascotImageUrl}
            onDismiss={xpCelebration.dismiss}
        />
    );
}
