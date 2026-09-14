import type { KeyboardEvent, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceNavigation from '../../dashboard-stitch/WorkspaceNavigation';
import type { MessageViewState } from '../MessagesShell';

export type MessagesMarkupState = MessageViewState & {
  query: string;
  setQuery: (value: string) => void;
  coach: string;
  sender: 'coach' | 'client';
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

export function MessagesPublicMarkup({ state }: { state: MessagesMarkupState }): ReactElement {
  const navigate = useNavigate();
  const inbox = state.inboxFeed || [{ clientId: 'coach', clientName: state.coach }];
  const filtered = inbox.filter((item) =>
    item.clientName.toLowerCase().includes(state.query.toLowerCase()),
  );

  return (
    <>
      <WorkspaceNavigation flow open={state.navOpen} close={() => state.setNavOpen(false)} />
      <div className="flex-1 flex min-h-screen h-screen overflow-hidden">
        <section
          className="w-80 border-r border-border-strong bg-surface-card flex flex-col shrink-0 sn-conversations"
        >
          <div className="p-4 border-b border-border-strong">
            <h1 className="font-headline text-xl font-bold">Conversas</h1>
            <input
              className="w-full mt-3 px-3 py-2 rounded bg-surface-base border border-border-strong text-sm"
              placeholder="Buscar conversa..."
              value={state.query}
              onChange={(event) => state.setQuery(event.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((item) => {
              const selected =
                item.clientId === state.selectedClientId || !state.inboxFeed;
              return (
                <button
                  key={item.clientId}
                  type="button"
                  className="w-full p-4 text-left border-b border-border-strong hover:bg-surface-elevated"
                  style={{ borderLeft: `2px solid ${selected ? '#e06c43' : 'transparent'}` }}
                  onClick={() => state.setSelectedClientId?.(item.clientId)}
                >
                  <strong className="text-sm text-text-primary">{item.clientName}</strong>
                  <p className="text-xs text-text-muted mt-1">
                    {item.lastMsgText || 'Prescrição e acompanhamento'}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <main className="flex-1 bg-surface-base flex flex-col justify-between overflow-hidden min-w-0">
          <header className="h-16 px-6 border-b border-border-strong bg-surface-card flex items-center justify-between shrink-0">
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm font-semibold text-text-primary truncate">{state.coach}</h2>
              <p className="text-xs text-text-muted">Prescrição e acompanhamento</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 rounded text-xs font-medium bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-1.5"
              onClick={() => navigate('/dashboard/training')}
            >
              <span className="material-symbols-outlined text-[16px]">fitness_center</span>
              <span>Minha Ficha</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4" role="log" aria-label="Mensagens">
            {state.messages.length ? (
              state.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.sender === state.sender ? 'items-end self-end' : 'items-start'
                  } max-w-xl`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] text-text-muted">{message.time}</span>
                    <span className="text-xs font-medium text-text-secondary">
                      {message.sender === state.sender ? 'Você' : state.coach}
                    </span>
                  </div>
                  <div
                    className={`${
                      message.sender === state.sender
                        ? 'bg-primary-terracotta text-white rounded-tr-sm'
                        : 'bg-surface-card border border-border-strong text-text-primary rounded-tl-sm'
                    } rounded-2xl px-4 py-3 text-sm leading-relaxed`}
                  >
                    {message.text}
                    {message.attachment?.data && (
                      <a href={message.attachment.data} download={message.attachment.name}>
                        {message.attachment.name}
                      </a>
                    )}
                  </div>
                  {message.sender === state.sender && state.handleDelete && (
                    <button
                      type="button"
                      className="text-xs text-text-muted mt-1"
                      onClick={() => state.handleDelete!(message.id)}
                    >
                      Excluir
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted">Nenhuma mensagem nesta conversa.</p>
            )}
          </div>

          <div className="p-4 border-t border-border-strong bg-surface-card">
            <div className="bg-surface-base border border-border-strong focus-within:border-primary-terracotta rounded-lg p-2.5 transition-colors">
              <textarea
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none px-1"
                placeholder={`Enviar mensagem para ${state.coach}...`}
                rows={2}
                value={state.newMessage}
                onChange={(event) => state.setNewMessage(event.target.value)}
                onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    state.handleSend();
                  }
                }}
              />
              <div className="flex items-center justify-between pt-2 border-t border-border-strong">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="w-8 h-8 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated flex items-center justify-center transition-colors"
                    title="Anexar vídeo de execução"
                    onClick={state.triggerFileInput}
                  >
                    <span className="material-symbols-outlined text-[19px]">videocam</span>
                  </button>
                  <span>
                    <input
                      type="file"
                      ref={state.fileInputRef}
                      hidden
                      accept="image/*,video/*,audio/*,.pdf"
                      onChange={state.handleFileChange}
                    />
                    <button
                      type="button"
                      className="w-8 h-8 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated flex items-center justify-center transition-colors"
                      title="Gravar áudio"
                      onClick={state.triggerFileInput}
                    >
                      <span className="material-symbols-outlined text-[19px]">mic</span>
                    </button>
                  </span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated flex items-center justify-center transition-colors"
                    title="Anexar foto do treino"
                    onClick={state.triggerFileInput}
                  >
                    <span className="material-symbols-outlined text-[19px]">image</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-md bg-primary-terracotta hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  onClick={state.handleSend}
                  disabled={!state.newMessage.trim() && !state.attachedFile}
                >
                  <span>Enviar</span>
                  <span className="material-symbols-outlined text-[15px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <aside className="w-80 border-l border-border-strong bg-surface-card p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
          <div>
            <h3 className="font-headline text-lg font-bold">{state.coach}</h3>
            <p className="text-xs text-text-muted">Prescrição e acompanhamento</p>
            <h4 className="text-xs uppercase mt-4">Documentos & Diretrizes</h4>
            <div className="mt-2 space-y-2">
              {state.messages
                .filter((message) => message.attachment?.data)
                .map((message) => (
                  <a
                    key={message.id}
                    href={message.attachment!.data}
                    download={message.attachment!.name}
                    className="block p-3 text-xs border border-border-strong rounded"
                  >
                    {message.attachment!.name}
                  </a>
                ))}
            </div>
            <button
              type="button"
              className="w-full py-2 mt-4 rounded-md bg-primary-terracotta text-xs font-semibold text-white"
              onClick={() => navigate('/dashboard/training')}
            >
              Ver Treino do Dia
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
