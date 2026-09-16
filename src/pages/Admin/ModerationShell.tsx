import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';
import DashboardShellHost from '../shell-assets/DashboardShellHost';
import {
  ModerationPublicMarkup,
  type ModerationQueueItem,
} from './markup/ModerationPublicMarkup';

export type { ModerationQueueItem };

type ModerationDecision = 'Approved' | 'Rejected';

export default function ModerationShell(): ReactElement {
  const { getPendingModerations, decideModeration } = useNutritionApi();
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [selected, setSelected] = useState<ModerationQueueItem | null>(null);
  const [error, setError] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    getPendingModerations(undefined, undefined)
      .then((result: { items?: ModerationQueueItem[] }) => {
        if (active) setItems(result?.items || []);
      })
      .catch((fetchError: Error) => {
        if (active) setError(fetchError.message);
      });
    return () => {
      active = false;
    };
  }, [getPendingModerations]);

  const filtered = useMemo(
    () => items.filter((item) => item.foodName.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  const decide = async (decision: ModerationDecision) => {
    if (!selected || deciding) return;
    setDeciding(true);
    try {
      await decideModeration(selected.requestId, decision);
      setItems((current) => current.filter((item) => item.requestId !== selected.requestId));
      setSelected(null);
    } catch (decideError) {
      setError((decideError as Error).message);
    } finally {
      setDeciding(false);
    }
  };

  const errorAlert: ReactNode =
    error && (
      <p
        role="alert"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#211a17',
          padding: 16,
          color: '#ffb4ab',
          zIndex: 100,
        }}
      >
        {error}
      </p>
    );

  const shellState = {
    items,
    filtered,
    selected,
    setSelected,
    query,
    setQuery,
    deciding,
    decide,
  };

  return (
    <DashboardShellHost name="moderation" after={errorAlert}>
      <ModerationPublicMarkup state={shellState} />
    </DashboardShellHost>
  );
}
