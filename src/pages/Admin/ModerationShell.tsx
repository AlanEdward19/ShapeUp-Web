import {
  createElement,
  useEffect,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import Workspace from '../../stitch/Workspace';
import { renderSource, sourceDocument, nodeText } from '../../stitch/sourceRuntime';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';

type MacroKey = 'kcal' | 'proteinG' | 'carbG' | 'fatG';

export type ModerationQueueItem = {
  requestId: string;
  foodName: string;
  requestedByUserId: string;
  createdAtUtc: string;
  publicMacros?: Partial<Record<MacroKey, number>>;
  proposedMacros?: Partial<Record<MacroKey, number>>;
};

type ModerationDecision = 'Approved' | 'Rejected';

type BindProps = Record<string, unknown> & {
  className?: string;
  style?: Record<string, string | number>;
  hidden?: boolean;
  value?: string;
  disabled?: boolean;
  onClick?: () => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  role?: string;
  'aria-modal'?: boolean;
  'aria-label'?: string;
};

type BindFn = (
  node: Element,
  props: BindProps,
  _children: unknown,
  _render: unknown,
) => ReactElement | null | undefined;

const MACRO_KEYS: MacroKey[] = ['kcal', 'proteinG', 'carbG', 'fatG'];

const TABLE_ROWS: [MacroKey, string][] = [
  ['kcal', 'Valor Energético'],
  ['proteinG', 'Proteínas'],
  ['carbG', 'Carboidratos'],
  ['fatG', 'Gorduras Totais'],
];

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

  const document = sourceDocument('moderation');
  const prototype = document.querySelector('[data-source-onclick^="openInspectionDrawer"]');

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

  const bind: BindFn = (node, props) => {
    const action = node.getAttribute('data-source-onclick') || '';
    if (prototype && node === prototype.parentElement) {
      const filtered = items.filter((item) => item.foodName.toLowerCase().includes(query.toLowerCase()));
      return (
        <div {...props}>
          {filtered.map((item) =>
            renderSource(
              prototype,
              (element: Element, attributes: BindProps) => {
                if (element === prototype) attributes.onClick = () => setSelected(item);
                if (element.localName === 'h3') return <h3 {...attributes}>{item.foodName}</h3>;
                if (element.localName === 'strong') {
                  const index = [...prototype.querySelectorAll('strong')].indexOf(element as Element);
                  return (
                    <strong {...attributes}>
                      {item.proposedMacros?.[MACRO_KEYS[index]] ?? '—'}
                    </strong>
                  );
                }
                if (element.children.length === 0 && nodeText(element).startsWith('#ALM')) {
                  return <span {...attributes}>#{item.requestId}</span>;
                }
                return undefined;
              },
              item.requestId,
            ),
          )}
          {items.length === 0 && (
            <p className="p-5 text-[#85766f]">Nenhuma solicitação aguardando moderação.</p>
          )}
        </div>
      );
    }
    if (node.id === 'inspectionDrawer') {
      props.style = { ...props.style, transform: selected ? 'translateX(0)' : 'translateX(100%)' };
      props.role = 'dialog';
      props['aria-modal'] = true;
      props['aria-label'] = 'Inspeção nutricional';
      props.hidden = !selected;
    }
    if (node.id === 'drawerBackdrop') {
      props.hidden = !selected;
      props.className = (props.className || '').replace('hidden', '').replace('opacity-0', '');
      props.onClick = () => setSelected(null);
    }
    if (action.includes('closeInspectionDrawer')) props.onClick = () => setSelected(null);
    if (node.id === 'drawerTitle') return <h3 {...props}>{selected?.foodName}</h3>;
    if (node.id === 'drawerItemCode') return <span {...props}>Solicitação #{selected?.requestId}</span>;
    if (node.id === 'drawerMeta') {
      return (
        <div {...props}>
          Enviado por: {selected?.requestedByUserId} •{' '}
          {selected ? new Date(selected.createdAtUtc).toLocaleString('pt-BR') : ''}
        </div>
      );
    }
    if (node.id === 'drawerTableBody') {
      return (
        <tbody {...(props as ComponentProps<'tbody'>)}>
          {TABLE_ROWS.map(([key, label]) => (
            <tr key={key}>
              <td className="py-2 px-4">{label}</td>
              <td className="py-2 px-4 text-right">{selected?.publicMacros?.[key]}</td>
              <td className="py-2 px-4 text-right">{selected?.proposedMacros?.[key]}</td>
              <td className="py-2 px-4 text-right">Proposta</td>
            </tr>
          ))}
        </tbody>
      );
    }
    if (node.localName === 'button' && /Aprovar/.test(nodeText(node))) {
      props.onClick = () => decide('Approved');
      props.disabled = deciding;
    }
    if (node.localName === 'button' && /Rejeitar|Recusar/.test(nodeText(node))) {
      props.onClick = () => decide('Rejected');
      props.disabled = deciding;
    }
    if (node.localName === 'input') {
      props.value = query;
      props.onChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);
    }
    if (node.children.length === 0 && node.id === 'drawerAlertTitle') {
      return createElement(node.localName, props, 'Compare os valores publicados com a proposta');
    }
    if (node.id === 'drawerAlertDesc') {
      return (
        <span {...props}>A decisão só é aplicada após a confirmação do serviço de moderação.</span>
      );
    }
    if (node.id === 'drawerAlertBadge') return <span {...props}>Aguardando revisão</span>;
    return undefined;
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

  const WorkspaceHost = Workspace as (props: {
    name: string;
    after?: ReactNode;
    bind?: BindFn;
  }) => ReactElement;

  return <WorkspaceHost name="moderation" after={errorAlert} bind={bind} />;
}
