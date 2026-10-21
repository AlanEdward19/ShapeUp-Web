import React from 'react';
import { useParams } from 'react-router-dom';
import ProfileSelectionDialog from '../components/ProfileSelectionDialog';
import WorkspaceShellPage from '../components/Workspace/WorkspaceShellPage';
import { workspaceNavStyle } from '../pages/shell-assets/workspaceNavStyle';
import { AthleteDashboardMarkup } from '../pages/Dashboard/operational-dashboard/AthleteDashboardMarkup';
import athleteHomeCss from '../pages/Dashboard/operational-dashboard/athlete/athleteHome.css?inline';

const roles = [{ role: 'Trainer' }, { role: 'IndependentClient' }, { role: 'GymOwner' }];

const day = offset => new Date(Date.now() - offset * 86400000).toISOString();
const volumes = [3200, 3650, 3400, 4100, 3900, 4600, 4350, 5100];

const athlete = {
    userName: 'Alan Oliveira',
    plan: { name: 'Hipertrofia — Upper A', phase: 'Semana 3 · Bloco de volume' },
    showTodayCard: true,
    exercises: [
        { id: 1, name: 'Supino reto', muscles: ['Peitoral', 'Tríceps'], sets: [{ reps: '8', load: '80' }, {}, {}, {}] },
        { id: 2, name: 'Remada curvada', muscles: ['Dorsais', 'Bíceps'], sets: [{ reps: '10', load: '70' }, {}, {}] },
        { id: 3, name: 'Desenvolvimento com halteres', muscles: ['Ombros'], sets: [{ reps: '10', load: '28' }, {}, {}] },
        { id: 4, name: 'Rosca direta', muscles: ['Bíceps'], sets: [{ reps: '12', load: '30' }, {}, {}] },
    ],
    chartData: volumes.map((volume, index) => ({ session: index + 1, volume, startedAt: day(volumes.length - index + (index > 5 ? 0 : 1)), date: '' })),
    trainingError: '',
    dashboard: { sessionsCompletionRate: 75, weeklyVolumeProgressPercent: 12, weeklyVolume: 14850, sessionsCompletedThisWeek: 3, sessionsTargetPerWeek: 4 },
    nutrition: { totals: { kcal: 1720, proteinG: 118 }, goal: { kcal: 2400, proteinG: 160, waterMl: 3000 }, meals: [1, 2, 3] },
    water: 1250,
    onAddWater: () => {},
    onRemoveWater: () => {},
    messages: [{ id: 1, sender: 'coach', text: 'Ótimo ritmo nesta semana! Suba 2 kg no supino se as 8 reps saírem limpas.' }],
    language: 'pt-BR',
    tr: text => text,
    onNavigate: () => {},
    gamificationProfile: { level: 7, totalXp: 3420, currentStreak: 5, shapeScore: 812, shapeCoins: 140 },
    rankingEntries: [],
    weeklyReading: { status: 'locked' },
};

/** Dev-only gallery (`/__design/:name`) so screens can be reviewed without a backend session. */
export default function DesignPreview() {
    const { name } = useParams();
    if (name === 'profile-dialog') {
        return (
            <ProfileSelectionDialog
                roles={roles}
                user={{ displayName: 'Alan Oliveira', email: 'alan@shapeup.app' }}
                busyIndex={null}
                onSelect={() => {}}
                onCancel={() => {}}
            />
        );
    }
    if (name === 'athlete' || name === 'athlete-rest' || name === 'athlete-empty') {
        localStorage.setItem('shapeup_role', 'independent');
        const state = name === 'athlete'
            ? athlete
            : name === 'athlete-rest'
                ? { ...athlete, showTodayCard: false, exercises: [] }
                : { ...athlete, plan: undefined, showTodayCard: false, exercises: [], chartData: [], dashboard: null, nutrition: {}, water: 0, messages: [], gamificationProfile: null };
        return (
            <WorkspaceShellPage name="athlete" css={workspaceNavStyle + athleteHomeCss}>
                <AthleteDashboardMarkup state={state} />
            </WorkspaceShellPage>
        );
    }
    return <p style={{ padding: 24 }}>Unknown preview: {name}</p>;
}
