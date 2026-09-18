import type { ChangeEvent, ReactElement, ReactNode } from 'react';

export type GymsExploreChromeProps = {
  query: string;
  onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
  listColumn: ReactNode;
  mapColumn: ReactNode;
};

export function GymsExploreChrome({
  query,
  onQueryChange,
  listColumn,
  mapColumn,
}: GymsExploreChromeProps): ReactElement {
  return (
    <div data-gym-page className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
      <header className="h-auto border-b border-[var(--border-color)] bg-[#211a17] px-6 py-3 shrink-0 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[var(--text-muted)] text-lg">search</span>
              <input
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md pl-9 pr-4 py-2 text-sm text-[var(--text-main)] placeholder:text-stone-500 focus:outline-none focus:border-[#e06c43] transition-colors"
                placeholder="Buscar por bairro, academia ou tipo de treino..."
                type="text"
                value={query}
                onChange={onQueryChange}
              />
            </div>
            <div className="relative shrink-0 flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-[#e06c43] text-base">location_on</span>
              <select
                className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md pl-8 pr-8 py-2 text-xs font-medium text-[var(--text-main)] appearance-none focus:outline-none focus:border-[#e06c43] cursor-pointer"
                defaultValue="São Paulo, SP"
              >
                <option>São Paulo, SP</option>
                <option>Campinas, SP</option>
                <option>Rio de Janeiro, RJ</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 text-[var(--text-muted)] text-sm pointer-events-none">
                expand_more
              </span>
            </div>
            <div className="relative shrink-0 flex items-center">
              <select
                className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md px-3 py-2 text-xs font-medium text-[var(--text-main)] appearance-none focus:outline-none focus:border-[#e06c43] cursor-pointer"
                defaultValue="Até 5 km"
              >
                <option>Até 5 km</option>
                <option>Até 10 km</option>
                <option>Até 25 km</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 text-[var(--text-muted)] text-sm pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
              <strong className="text-[var(--text-main)] font-semibold">18 unidades</strong> encontradas
            </span>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#29211d] hover:bg-[var(--border-color)] border border-[var(--border-color)] rounded-md text-xs font-medium text-[var(--text-main)] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">tune</span> Filtros
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 custom-scroll text-nowrap text-xs">
          <span className="text-[var(--text-muted)] text-[11px] font-medium pr-1">Filtros:</span>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full bg-[#e06c43]/15 text-[#e06c43] border border-[#e06c43]/40 font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">badge</span> Com Ficha Integrada
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full bg-[#29211d] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] font-medium flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">fitness_center</span> Hammer Strength / Heavy
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full bg-[#29211d] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] font-medium flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">ac_unit</span> Recovery &amp; Crioterapia
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full bg-[#29211d] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] font-medium flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">local_parking</span> Estacionamento Valet
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full bg-[#29211d] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] font-medium flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">schedule</span> Aberto 24h
          </button>
        </div>
      </header>

      <div data-gym-layout className="flex-1 flex min-h-0 relative">
        <div
          data-gym-list
          className="w-[440px] border-r border-surface-border bg-[#181311] flex flex-col shrink-0"
        >
          <div className="px-5 py-3 border-b border-surface-border flex items-center justify-between text-xs text-on-surface-muted">
            <span>Organizado por proximidade</span>
            <div className="flex items-center gap-1 font-semibold text-on-surface cursor-pointer hover:text-primary">
              <span>Mais próximas</span>
              <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3.5">{listColumn}</div>
        </div>
        {mapColumn}
      </div>

    </div>
  );
}
