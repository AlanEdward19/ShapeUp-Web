import React from 'react';
import { Trophy, Flame, Coins, Zap } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import { useLanguage } from '../../contexts/LanguageContext';
import './RankingList.css';

const RankingList = ({
    entries = [],
    currentUserId,
    nextCursor,
    onLoadMore,
    isLoading = false,
    isLoadingMore = false,
}) => {
    const { t } = useLanguage();

    const title = t('gamification.ranking.title') || 'Global Ranking';
    const loadMoreLabel = t('gamification.ranking.loadMore') || 'Load more';
    const emptyLabel = t('gamification.ranking.empty') || 'No ranking data yet.';
    const youLabel = t('gamification.ranking.you') || 'You';
    const userLabel = t('gamification.ranking.user') || 'User';

    return (
        <Card className="su-ranking-card">
            <h3 className="su-section-title">
                <Trophy size={20} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--warning)' }} />
                {title}
            </h3>

            {isLoading && entries.length === 0 ? (
                <div className="su-ranking-empty">{t('common.loading') || 'Loading...'}</div>
            ) : entries.length === 0 ? (
                <div className="su-ranking-empty">{emptyLabel}</div>
            ) : (
                <div className="su-ranking-list">
                    {entries.map((entry, index) => {
                        const isCurrentUser = currentUserId != null && entry.userId === currentUserId;

                        return (
                            <div
                                key={`${entry.userId}-${index}`}
                                className={`su-ranking-row${isCurrentUser ? ' su-ranking-row--current' : ''}`}
                            >
                                <div className="su-ranking-rank">#{index + 1}</div>
                                <div className="su-ranking-user">
                                    <span className="su-ranking-user-label">
                                        {isCurrentUser ? youLabel : `${userLabel} #${entry.userId}`}
                                    </span>
                                    <div className="su-ranking-stats">
                                        <span className="su-ranking-stat" title={t('gamification.ranking.level') || 'Level'}>
                                            <Zap size={14} />
                                            Lv {entry.level ?? 0}
                                        </span>
                                        <span className="su-ranking-stat" title={t('gamification.ranking.xp') || 'XP'}>
                                            {entry.totalXp ?? 0} XP
                                        </span>
                                        <span className="su-ranking-stat" title={t('gamification.ranking.streak') || 'Streak'}>
                                            <Flame size={14} />
                                            {entry.currentStreak ?? 0}
                                        </span>
                                        <span className="su-ranking-stat" title={t('gamification.ranking.coins') || 'ShapeCoins'}>
                                            <Coins size={14} />
                                            {entry.shapeCoins ?? 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="su-ranking-score">
                                    <span className="su-ranking-score-value">{entry.shapeScore ?? 0}</span>
                                    <span className="su-ranking-score-label">
                                        {t('gamification.ranking.shapeScore') || 'ShapeScore'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {nextCursor && (
                <div className="su-ranking-footer">
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        fullWidth
                    >
                        {isLoadingMore ? (t('common.loading') || 'Loading...') : loadMoreLabel}
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default RankingList;
