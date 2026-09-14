import { useState, type ChangeEvent, type ReactElement, type RefObject } from 'react';
import ChatDrawer from '../../components/ChatDrawer';
import Feedback from './Feedback';
import DashboardStitchHost from '../dashboard-stitch/DashboardStitchHost';
import { workspaceNavStyle } from '../dashboard-stitch/workspaceNavStyle';
import { MessagesPublicMarkup } from './markup/MessagesPublicMarkup';

const MESSAGES_RESPONSIVE_CSS =
  '@media(max-width:1200px){main+aside{display:none}}@media(max-width:767px){.stitch-body>div{min-width:0}main{width:100%;min-width:0}main>header{padding:12px}main>div{padding:12px}.sn-conversations{display:block!important;width:100%!important;max-height:180px;overflow:auto;flex:none!important}.stitch-body>div{flex-wrap:wrap}}';

export type InboxFeedItem = {
  clientId: string;
  clientName: string;
  lastMsgText?: string;
};

export type MessageAttachment = {
  data: string;
  name: string;
};

export type ThreadMessage = {
  id: string | number;
  sender: string;
  time: string;
  text: string;
  attachment?: MessageAttachment;
};

export type MessageViewState = {
  messages: ThreadMessage[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSend: () => void;
  handleFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  triggerFileInput?: () => void;
  attachedFile?: File | null;
  inboxFeed?: InboxFeedItem[];
  selectedClientId?: string | null;
  setSelectedClientId?: (id: string) => void;
  handleDelete?: (id: string | number) => void;
};

function MessageView(state: MessageViewState) {
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const coach =
    state.inboxFeed?.find((item) => item.clientId === state.selectedClientId)?.clientName ||
    localStorage.getItem('shapeup_coach_name') ||
    'Seu treinador';
  const sender = state.inboxFeed ? 'coach' : 'client';

  return (
    <DashboardStitchHost
      name="messages"
      css={workspaceNavStyle + MESSAGES_RESPONSIVE_CSS}
      after={
        <button
          type="button"
          className="sn-mobile"
          aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setNavOpen((open) => !open)}
        >
          <span className="material-symbols-outlined">{navOpen ? 'close' : 'menu'}</span>
        </button>
      }
    >
      <MessagesPublicMarkup
        state={{
          ...state,
          query,
          setQuery,
          coach,
          sender,
          navOpen,
          setNavOpen,
        }}
      />
    </DashboardStitchHost>
  );
}

type RenderViewProps = { renderView?: (state: MessageViewState) => ReactElement };

const FeedbackWithView = Feedback as (props: RenderViewProps) => ReactElement;
const ChatDrawerWithView = ChatDrawer as (props: {
  isOpen: boolean;
  embedded?: boolean;
  coachName?: string;
  onClose?: () => void;
  renderView?: (state: MessageViewState) => ReactElement;
}) => ReactElement;

function StitchMessages() {
  const role = localStorage.getItem('shapeup_role');
  const isPro = role === 'professional' || role === 'gym';
  if (isPro) {
    return <FeedbackWithView renderView={(viewState) => <MessageView {...viewState} />} />;
  }
  return (
    <ChatDrawerWithView
      isOpen
      embedded
      coachName={localStorage.getItem('shapeup_coach_name') ?? undefined}
      onClose={() => {}}
      renderView={(viewState) => <MessageView {...viewState} />}
    />
  );
}

/** `/dashboard/feedback` — pro/gym inbox uses the same stitch messages shell via `Feedback`. */
export const StitchFeedback = StitchMessages;

export default StitchMessages;
