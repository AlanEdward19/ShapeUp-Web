import React from 'react';
import { Trophy, Zap, Coins, Target, Award } from 'lucide-react';
import Card from '../Card';
import './GamificationProgressCard.css';

const XP_PER_LEVEL = 500;

const isZeroedProfile = (profile) => {
    const totalXp = profile?.totalXp ?? 0;
    const currentStreak = profile?.currentStreak ?? 0;
    const shapeCoins = profile?.shapeCoins ?? 0;
    const shapeScore = profile?.shapeScore ?? 0;
    const level = profile?.level ?? 1;

    return (
        totalXp === 0
        && currentStreak === 0
        && shapeCoins === 0
        && shapeScore === 0
        && level === 1
    );
};

const GamificationProgressCard = ({ profile }) => {
    const totalXp = profile?.totalXp ?? 0;
    const level = profile?.level ?? 1;
    const currentStreak = profile?.currentStreak ?? 0;
    const shapeCoins = profile?.shapeCoins ?? 0;
    const shapeScore = profile?.shapeScore ?? 0;

    const xpInCurrentLevel = totalXp % XP_PER_LEVEL;
    const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100));
    const xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel;
    const isZeroed = isZeroedProfile(profile);

    return (
        <Card className="su-metric-card su-gamification-progress-card">
            <div className="su-metric-header">
                <span className="su-metric-label">Gamificação</span>
                <Trophy size={20} className="su-accent-text" />
            </div>

            {isZeroed ? (
                <p className="su-gamification-empty-copy">
                    Complete seu primeiro treino pra começar
                </p>
            ) : (
                <>
                    <div className="su-gamification-xp-block">
                        <div className="su-gamification-xp-row">
                            <Zap size={18} className="su-primary-text" aria-hidden="true" />
                            <span className="su-gamification-xp-value">{totalXp} XP</span>
                            <span className="su-gamification-level-badge">Nível {level}</span>
                        </div>
                        <div
                            className="su-gamification-progress-track"
                            role="progressbar"
                            aria-valuenow={xpInCurrentLevel}
                            aria-valuemin={0}
                            aria-valuemax={XP_PER_LEVEL}
                            aria-label={`Progresso de XP no nível ${level}`}
                        >
                            <div
                                className="su-gamification-progress-fill"
                                style={{ width: `${xpProgressPercent}%` }}
                            />
                        </div>
                        <span className="su-metric-trend">
                            {xpToNextLevel === XP_PER_LEVEL
                                ? `${xpInCurrentLevel} / ${XP_PER_LEVEL} XP neste nível`
                                : `${xpToNextLevel} XP para o próximo nível`}
                        </span>
                    </div>

                    <div className="su-gamification-stats-grid">
                        <div className="su-gamification-stat">
                            <div className="su-gamification-stat-header">
                                <span className="su-metric-label">Streak</span>
                                <Award size={16} className="su-warning-text" aria-hidden="true" />
                            </div>
                            <div className="su-gamification-stat-value">{currentStreak}</div>
                        </div>

                        <div className="su-gamification-stat">
                            <div className="su-gamification-stat-header">
                                <span className="su-metric-label">ShapeCoins</span>
                                <Coins size={16} className="su-accent-text" aria-hidden="true" />
                            </div>
                            <div className="su-gamification-stat-value">{shapeCoins}</div>
                        </div>

                        <div className="su-gamification-stat">
                            <div className="su-gamification-stat-header">
                                <span className="su-metric-label">ShapeScore</span>
                                <Target size={16} className="su-primary-text" aria-hidden="true" />
                            </div>
                            <div className="su-gamification-stat-value">{shapeScore}</div>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
};

export default GamificationProgressCard;
