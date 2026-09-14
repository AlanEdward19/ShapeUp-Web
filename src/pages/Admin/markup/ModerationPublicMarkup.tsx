import type { ChangeEvent, ReactElement } from 'react';

type MacroKey = 'kcal' | 'proteinG' | 'carbG' | 'fatG';

export type ModerationQueueItem = {
  requestId: string;
  foodName: string;
  requestedByUserId: string;
  createdAtUtc: string;
  publicMacros?: Partial<Record<MacroKey, number>>;
  proposedMacros?: Partial<Record<MacroKey, number>>;
};

const MACRO_KEYS: MacroKey[] = ['kcal', 'proteinG', 'carbG', 'fatG'];

const MACRO_LABELS: Record<MacroKey, string> = {
  kcal: 'Calorias',
  proteinG: 'Proteína',
  carbG: 'Carbo',
  fatG: 'Gordura',
};

const TABLE_ROWS: [MacroKey, string][] = [
  ['kcal', 'Valor Energético'],
  ['proteinG', 'Proteínas'],
  ['carbG', 'Carboidratos'],
  ['fatG', 'Gorduras Totais'],
];

export type ModerationShellState = {
  items: ModerationQueueItem[];
  filtered: ModerationQueueItem[];
  selected: ModerationQueueItem | null;
  setSelected: (item: ModerationQueueItem | null) => void;
  query: string;
  setQuery: (value: string) => void;
  deciding: boolean;
  decide: (decision: 'Approved' | 'Rejected') => void;
};

function QueueCard({
  item,
  onSelect,
}: {
  item: ModerationQueueItem;
  onSelect: () => void;
}) {
  return (
    <div
      className="p-5 rounded-lg bg-[#1c1613] hover:bg-[#211a17] border border-[#2b221d] hover:border-[#e06c43]/60 transition-all cursor-pointer shadow-sm relative group"
      onClick={onSelect}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-10 h-10 rounded bg-[#e06c43]/10 border border-[#e06c43]/30 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[#e06c43] text-xl">nutrition</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs text-[#85766f] font-mono">#{item.requestId}</span>
            </div>
            <h3 className="text-base font-semibold text-[#f3eae5] group-hover:text-[#ffb59d] transition-colors mt-1">
              {item.foodName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#85766f] mt-0.5">
              <span>
                Enviado por: <span className="text-[#f3eae5]">{item.requestedByUserId}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 lg:self-center shrink-0">
          <div className="flex items-center gap-3 text-xs font-mono-num bg-[#171311] px-3.5 py-2 rounded-md border border-[#2b221d]">
            {MACRO_KEYS.map((key, index) => (
              <div key={key} className="flex items-center gap-3">
                {index > 0 && <div className="w-px h-6 bg-[#2b221d]" />}
                <div>
                  <span className="text-[#85766f] text-[10px] block font-sans">{MACRO_LABELS[key]}</span>
                  <strong className="text-[#f3eae5] text-sm">
                    {item.proposedMacros?.[key] ?? '—'}
                  </strong>
                  {key === 'kcal' ? ' kcal' : 'g'}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              className="text-xs font-medium text-[#e06c43] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              onClick={(event) => {
                event.stopPropagation();
                onSelect();
              }}
            >
              <span>Inspecionar</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModerationPublicMarkup({ state }: { state: ModerationShellState }): ReactElement {
  const { filtered, items, selected, setSelected, query, setQuery, deciding, decide } = state;

  const onSearch = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden">
      <aside className="w-64 bg-[#1c1613] border-r border-[#2b221d] flex flex-col justify-between shrink-0 select-none z-30">
        <div className="flex flex-col">
          <div className="h-14 px-4 border-b border-[#2b221d] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-condensed font-bold tracking-wider text-base text-[#f3eae5] leading-none">
                SHAPEUP
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#85766f]">DATA ENGINE</span>
            </div>
          </div>
          <nav className="flex flex-col px-2 space-y-0.5 mt-3">
            <span
              aria-current="page"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium text-[#f3eae5] bg-[#211a17] border-l-2 border-[#e06c43]"
            >
              <span className="material-symbols-outlined text-base text-[#e06c43]">restaurant</span>
              <span>Moderação de Alimentos</span>
            </span>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#171311]">
        <header className="h-14 border-b border-[#2b221d] bg-[#1c1613] px-5 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#85766f]">Administração</span>
            <span className="text-[#2b221d]">/</span>
            <span className="text-[#f3eae5] font-medium">Moderação de Catálogo</span>
          </div>
          <div className="w-96 max-w-md hidden md:flex items-center relative">
            <span className="material-symbols-outlined absolute left-2.5 text-base text-[#85766f]">search</span>
            <input
              className="w-full pl-8 pr-12 py-1.5 bg-[#171311] border border-[#2b221d] rounded text-xs text-[#f3eae5] placeholder-[#85766f] focus:outline-none focus:border-[#e06c43]"
              placeholder="Buscar por nome do produto, marca ou EAN..."
              type="text"
              value={query}
              onChange={onSearch}
            />
          </div>
        </header>

        <section className="border-b border-[#2b221d] bg-[#171311] px-8 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 relative py-3.5">
          <div className="flex flex-col">
            <h1 className="font-condensed text-2xl font-bold tracking-wide text-[#f3eae5] leading-tight">
              Moderação de Alimentos &amp; Catálogo
            </h1>
            <p className="text-xs text-[#85766f] mt-1">
              Curadoria de itens submetidos pela comunidade para inserção no banco oficial ShapeUp Data Engine.
            </p>
          </div>
        </section>

        <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative bg-[#171311]">
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
            <div className="max-w-6xl mx-auto flex flex-col space-y-5">
              <div className="flex flex-col space-y-3.5">
                {filtered.map((item) => (
                  <QueueCard key={item.requestId} item={item} onSelect={() => setSelected(item)} />
                ))}
                {items.length === 0 && (
                  <p className="p-5 text-[#85766f]">Nenhuma solicitação aguardando moderação.</p>
                )}
              </div>
            </div>
          </div>

          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            id="drawerBackdrop"
            hidden={!selected}
            onClick={() => setSelected(null)}
          />

          <aside
            className="fixed top-0 right-0 h-full w-full sm:w-[620px] lg:w-[680px] bg-[#1c1613] border-l border-[#2b221d] shadow-2xl z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out translate-x-full"
            id="inspectionDrawer"
            role="dialog"
            aria-modal={true}
            aria-label="Inspeção nutricional"
            hidden={!selected}
            style={{ transform: selected ? 'translateX(0)' : 'translateX(100%)' }}
          >
            <div className="h-16 px-6 border-b border-[#2b221d] bg-[#211a17] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f3eae5] font-condensed tracking-wide uppercase">
                    Mesa de Análise &amp; Validação Técnica
                  </h2>
                  <span className="text-[11px] font-mono text-[#85766f]" id="drawerItemCode">
                    Solicitação #{selected?.requestId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-md border border-[#2b221d] hover:bg-[#171311] text-[#85766f] hover:text-[#f3eae5] flex items-center justify-center transition-colors"
                title="Fechar painel (Esc)"
                onClick={() => setSelected(null)}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#171311]">
              <div className="p-4 rounded-lg bg-[#1c1613] border border-[#2b221d] flex flex-col gap-2">
                <h3 className="font-condensed text-xl font-bold tracking-wide text-[#f3eae5] mt-1" id="drawerTitle">
                  {selected?.foodName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#85766f]" id="drawerMeta">
                  Enviado por: {selected?.requestedByUserId} •{' '}
                  {selected ? new Date(selected.createdAtUtc).toLocaleString('pt-BR') : ''}
                </div>
              </div>

              <div
                className="bg-[#1c1613] border border-[#7d986b]/30 rounded-lg p-3.5 flex items-center justify-between text-xs"
                id="drawerAlertBox"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-semibold text-[#f3eae5]" id="drawerAlertTitle">
                      Compare os valores publicados com a proposta
                    </span>
                    <span className="block text-[#85766f] text-[11px] mt-0.5" id="drawerAlertDesc">
                      A decisão só é aplicada após a confirmação do serviço de moderação.
                    </span>
                  </div>
                </div>
                <span
                  className="text-[11px] font-mono text-[#7d986b] bg-[#7d986b]/10 border border-[#7d986b]/20 px-2 py-1 rounded shrink-0"
                  id="drawerAlertBadge"
                >
                  Aguardando revisão
                </span>
              </div>

              <div className="border border-[#2b221d] rounded-lg overflow-hidden bg-[#1c1613]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#2b221d] text-[11px] font-mono uppercase text-[#85766f] bg-[#1c1613]">
                      <th className="py-2.5 px-4 font-normal">Nutriente</th>
                      <th className="py-2.5 px-4 font-normal text-right">Declarado</th>
                      <th className="py-2.5 px-4 font-normal text-right">Cálculo</th>
                      <th className="py-2.5 px-4 font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2b221d] font-mono-num" id="drawerTableBody">
                    {TABLE_ROWS.map(([key, label]) => (
                      <tr key={key}>
                        <td className="py-2 px-4">{label}</td>
                        <td className="py-2 px-4 text-right">{selected?.publicMacros?.[key]}</td>
                        <td className="py-2 px-4 text-right">{selected?.proposedMacros?.[key]}</td>
                        <td className="py-2 px-4 text-right">Proposta</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-[#2b221d] bg-[#211a17] flex items-center justify-between shrink-0 gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded border border-[#2b221d] text-xs font-medium text-[#f3eae5] hover:bg-[#171311] transition-colors flex items-center gap-1.5"
                  disabled={deciding}
                  onClick={() => decide('Rejected')}
                >
                  <span className="material-symbols-outlined text-sm text-[#85766f]">close</span>
                  <span>Rejeitar</span>
                </button>
              </div>
              <button
                type="button"
                className="px-5 py-2 rounded bg-[#e06c43] hover:bg-[#d05d35] text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
                disabled={deciding}
                onClick={() => decide('Approved')}
              >
                <span className="material-symbols-outlined text-base">check</span>
                <span>Aprovar e Publicar</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
