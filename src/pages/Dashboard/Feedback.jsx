import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, MessageSquare, Video, Reply, CheckCircle, Paperclip, X, FileText, Check, CheckCheck, Clock } from 'lucide-react';
import { useTour } from '@reactour/tour';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { addNotification } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import './Feedback.css';

const Feedback = () => {
    const location = useLocation();
    const { t } = useLanguage();
    const { setIsOpen, setSteps } = useTour();
    const [allMessages, setAllMessages] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
    const [firstUnreadId, setFirstUnreadId] = useState(null);
    const fileInputRef = useRef(null);
    const threadEndRef = useRef(null);
    const firstUnreadRef = useRef(null);

    useEffect(() => {
        const loadMessages = () => {
            const stored = localStorage.getItem('shapeup_messages');
            if (stored) {
                setAllMessages(JSON.parse(stored));
            }
        };

        loadMessages();

        window.addEventListener('storage', loadMessages);
        window.addEventListener('shapeup_messages_updated', loadMessages);

        return () => {
            window.removeEventListener('storage', loadMessages);
            window.removeEventListener('shapeup_messages_updated', loadMessages);
        };
    }, []);

    // ─── Email/Feedback Tour Trigger ───────────────────────────────────
    useEffect(() => {
        const hasSeenTour = sessionStorage.getItem('shapeup_feedback_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="fb-header"]',
                    content: 'Esta é a Central de Mensagens! Aqui você visualiza e responde todas as dúvidas e mensagens enviadas pelos seus clientes, organizadas por conversa.',
                },
                {
                    selector: '[data-tour="fb-sidebar"]',
                    content: 'O painel esquerdo lista todas as conversas ativas. Conversas com mensagens não lidas aparecem em destaque, e tickets abertos ficam no topo da lista.',
                },
                {
                    selector: '[data-tour="fb-reply"]',
                    content: 'Digite sua resposta aqui e pressione Enter (ou clique em Enviar) para responder. Você também pode anexar imagens, vídeos ou PDFs clicando no ícone de clipe.',
                }
            ];
            setSteps(tourSteps);
            setTimeout(() => {
                setIsOpen(true);
            }, 600);
            sessionStorage.setItem('shapeup_feedback_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps]);

    useEffect(() => {
        const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
        if (contextMenu.visible) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            message: msg
        });
    };

    // Grouping logic
    const inboxGroups = {};
    allMessages.forEach(msg => {
        if (!inboxGroups[msg.clientId]) {
            inboxGroups[msg.clientId] = {
                clientId: msg.clientId,
                clientName: msg.clientName,
                clientInitials: msg.clientName.split(' ').map(n => n[0]).join(''),
                messages: [],
                hasUnread: false,
                activeTicketTag: null,
                latestMessageId: 0,
                lastMsgText: '',
                lastMsgTime: ''
            };
        }
        inboxGroups[msg.clientId].messages.push(msg);

        if (msg.sender === 'client' && msg.status !== 'read') {
            inboxGroups[msg.clientId].hasUnread = true;
        }

        if (msg.isTicket && msg.status !== 'resolved') {
            inboxGroups[msg.clientId].activeTicketTag = msg.tag;
        }

        if (msg.id > inboxGroups[msg.clientId].latestMessageId) {
            inboxGroups[msg.clientId].latestMessageId = msg.id;
            inboxGroups[msg.clientId].lastMsgText = msg.text;
            inboxGroups[msg.clientId].lastMsgTime = msg.time;
        }
    });

    const inboxFeed = Object.values(inboxGroups).sort((a, b) => {
        // Sort by ticket active, then unread, then latest msg id
        if (a.activeTicketTag && !b.activeTicketTag) return -1;
        if (!a.activeTicketTag && b.activeTicketTag) return 1;
        if (a.hasUnread && !b.hasUnread) return -1;
        if (!a.hasUnread && b.hasUnread) return 1;
        return b.latestMessageId - a.latestMessageId;
    });

    // Initial select
    useEffect(() => {
        if (!selectedClientId && inboxFeed.length > 0) {
            if (location.state && location.state.clientId) {
                const found = inboxFeed.find(g => g.clientId.toString() === location.state.clientId.toString());
                if (found) setSelectedClientId(found.clientId);
                else setSelectedClientId(inboxFeed[0].clientId);
            } else if (location.state && location.state.clientName) {
                const found = inboxFeed.find(g => g.clientName === location.state.clientName);
                if (found) setSelectedClientId(found.clientId);
                else setSelectedClientId(inboxFeed[0].clientId);
            } else {
                setSelectedClientId(inboxFeed[0].clientId);
            }
        }
    }, [inboxFeed, selectedClientId, location.state]);

    const activeThread = selectedClientId ? inboxGroups[selectedClientId] : null;

    // View Thread (Marks as Read) and scrolling
    useEffect(() => {
        setFirstUnreadId(null);
    }, [selectedClientId]);

    useEffect(() => {
        if (activeThread && activeThread.hasUnread) {
            const unreadMsgs = allMessages.filter(m => m.clientId === selectedClientId && m.sender === 'client' && m.status !== 'read');

            if (unreadMsgs.length > 0 && firstUnreadId === null) {
                const first = unreadMsgs.sort((a, b) => a.id - b.id)[0];
                setFirstUnreadId(first.id);
            }

            const updated = allMessages.map(m => {
                if (m.clientId === selectedClientId && m.sender === 'client' && m.status !== 'read') {
                    return { ...m, status: 'read' };
                }
                return m;
            });
            setAllMessages(updated);
            localStorage.setItem('shapeup_messages', JSON.stringify(updated));
            window.dispatchEvent(new Event('shapeup_messages_updated'));
        }
    }, [selectedClientId, activeThread, allMessages, firstUnreadId]);

    useEffect(() => {
        // slight delay to allow rendering
        setTimeout(() => {
            if (firstUnreadId && firstUnreadRef.current) {
                firstUnreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (threadEndRef.current) {
                threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }, [activeThread?.messages.length, firstUnreadId]);

    const handleReply = () => {
        if (!replyText.trim() && !attachedFile) return;
        const newMsg = {
            id: Date.now(),
            clientId: activeThread.clientId,
            clientName: activeThread.clientName,
            sender: 'coach',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tag: 'general',
            isTicket: false,
            attachment: attachedFile,
            replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null,
            status: 'sent'
        };
        const updated = [...allMessages, newMsg];
        setAllMessages(updated);
        localStorage.setItem('shapeup_messages', JSON.stringify(updated));
        window.dispatchEvent(new Event('shapeup_messages_updated'));

        // Notify client
        addNotification(activeThread.clientId.toString(), 'message', 'New Message from Coach', replyText || 'Sent an attachment', 'success', {
            link: '/dashboard/training'
        });

        setReplyText('');
        setAttachedFile(null);
        setReplyingTo(null);

        setTimeout(() => {
            if (threadEndRef.current) {
                threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 50);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            let type = 'file';
            if (file.type.startsWith('image/')) type = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            if (file.type === 'application/pdf') type = 'pdf';

            setAttachedFile({
                name: file.name,
                type: type,
                url: fileUrl
            });
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleResolve = () => {
        if (!activeThread) return;
        const updated = allMessages.map(m => {
            if (m.clientId === selectedClientId && m.isTicket && m.status !== 'resolved') {
                return { ...m, status: 'resolved' };
            }
            return m;
        });
        setAllMessages(updated);
        localStorage.setItem('shapeup_messages', JSON.stringify(updated));
        window.dispatchEvent(new Event('shapeup_messages_updated'));
    };

    const scrollToMessage = (msgId) => {
        const el = document.getElementById(`msg-${msgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('su-highlight-msg');
            setTimeout(() => el.classList.remove('su-highlight-msg'), 2000);
        }
    };

    const getTypeColor = (type) => {
        if (!type) return 'transparent';
        const t = typeof type === 'string' ? type.toLowerCase() : '';
        if (t.includes('form')) return 'var(--primary)';
        if (t.includes('rpe')) return 'var(--warning)';
        if (t.includes('check-in')) return 'var(--success)';
        return 'var(--text-muted)';
    };

    const renderMessageStatus = (status) => {
        switch (status) {
            case 'sending':
                return <Clock size={12} className="su-chat-status-icon sending" />;
            case 'sent':
                return <Check size={14} className="su-chat-status-icon sent" />;
            case 'read':
                return <CheckCheck size={14} className="su-chat-status-icon read" />;
            default:
                return null;
        }
    };

    return (
        <div className="su-feedback-dashboard">
            <div className="su-dashboard-header-flex" data-tour="fb-header">
                <div>
                    <h1 className="su-page-title">{t('pro.feedback.title')}</h1>
                    <p className="su-page-subtitle">{t('pro.feedback.subtitle')}</p>
                </div>
            </div>

            <div className="su-inbox-layout">
                {/* Left Column: Feed List */}
                <Card className="su-inbox-sidebar" data-tour="fb-sidebar">
                    <div className="su-inbox-header">
                        <div className="su-search-box su-inbox-search">
                            <Search size={16} className="su-text-muted" />
                            <input type="text" placeholder={t('pro.feedback.search')} className="su-bare-input" />
                        </div>
                        <button className="su-icon-btn su-text-muted"><Filter size={18} /></button>
                    </div>

                    <div className="su-inbox-list">
                        {inboxFeed.length === 0 && <p className="su-text-muted su-mt-4" style={{ textAlign: 'center' }}>{t('pro.feedback.empty.list')}</p>}
                        {inboxFeed.map(group => (
                            <div
                                key={group.clientId}
                                className={`su-inbox-item ${selectedClientId === group.clientId ? 'active' : ''} ${group.hasUnread ? 'unread' : ''}`}
                                onClick={() => setSelectedClientId(group.clientId)}
                            >
                                <div className="su-inbox-item-header">
                                    <div className="su-inbox-client">
                                        <div className="su-inbox-avatar">{group.clientInitials}</div>
                                        <span className="su-inbox-name">{group.clientName}</span>
                                    </div>
                                    <span className="su-inbox-time">{group.lastMsgTime}</span>
                                </div>
                                <div className="su-inbox-item-subject">
                                    <span className="su-inbox-type-dot" style={{ backgroundColor: getTypeColor(group.activeTicketTag || 'general') }}></span>
                                    {group.activeTicketTag ? `${t('pro.feedback.ticket.needs')}${group.activeTicketTag}` : t('pro.feedback.ticket.general')}
                                </div>
                                <p className="su-inbox-preview">{group.lastMsgText}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Column: Detailed Thread */}
                <Card className="su-inbox-thread">
                    {activeThread ? (
                        <div className="su-thread-container">
                            {/* Thread Header */}
                            <div className="su-thread-header">
                                <div className="su-thread-meta">
                                    <div className="su-inbox-avatar large">{activeThread.clientInitials}</div>
                                    <div>
                                        <h2 className="su-thread-subject">{activeThread.clientName}</h2>
                                        <div className="su-thread-subtitle">
                                            {activeThread.activeTicketTag ? (
                                                <>
                                                    <span style={{ color: getTypeColor(activeThread.activeTicketTag), fontWeight: 600, textTransform: 'capitalize' }}>{activeThread.activeTicketTag}</span>
                                                    <span className="su-dot-separator">•</span>
                                                    <span className="su-danger-text" style={{ color: 'var(--error)' }}>{t('pro.feedback.ticket.action')}</span>
                                                </>
                                            ) : (
                                                <span className="su-text-muted">Chat History</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="su-thread-actions">
                                    {activeThread.activeTicketTag && (
                                        <Button variant="outline" size="small" icon={<CheckCircle size={16} />} onClick={handleResolve}>{t('pro.feedback.btn.resolve')}</Button>
                                    )}
                                </div>
                            </div>

                            {/* Thread Body */}
                            <div className="su-thread-body">
                                {activeThread.messages.map(msg => (
                                    <React.Fragment key={msg.id}>
                                        {msg.id === firstUnreadId && (
                                            <div className="su-unread-divider" ref={firstUnreadRef} style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '1.5rem 0', color: 'var(--primary)' }}>
                                                <div style={{ flex: 1, borderBottom: '1px solid var(--primary)', opacity: 0.3 }}></div>
                                                <span style={{ margin: '0 1rem', fontSize: '0.8rem', fontWeight: 600 }}>{t('pro.feedback.unread.new')}</span>
                                                <div style={{ flex: 1, borderBottom: '1px solid var(--primary)', opacity: 0.3 }}></div>
                                            </div>
                                        )}
                                        <div
                                            id={`msg-${msg.id}`}
                                            className={`su-message-bubble ${msg.sender}`}
                                            onContextMenu={(e) => handleContextMenu(e, msg)}
                                        >
                                            {msg.replyTo && (
                                                <div
                                                    style={{ backgroundColor: 'var(--bg-main)', borderLeft: '3px solid var(--primary)', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', opacity: 0.8, cursor: 'pointer' }}
                                                    onClick={() => scrollToMessage(msg.replyTo.id)}
                                                >
                                                    <strong style={{ display: 'block', color: msg.replyTo.sender === 'coach' ? 'var(--primary)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                        {msg.replyTo.sender === 'coach' ? t('pro.feedback.you') : msg.clientName}
                                                    </strong>
                                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                                        {msg.replyTo.text || t('pro.feedback.attachment.doc')}
                                                    </div>
                                                </div>
                                            )}
                                            {msg.tag && msg.tag !== 'general' && (
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: getTypeColor(msg.tag), marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                                    {msg.tag}
                                                </div>
                                            )}
                                            {msg.attachment && (
                                                <div className="su-chat-bubble-attachment" style={{ marginTop: '0.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                                    {msg.attachment.type === 'image' && (
                                                        <img src={msg.attachment.url} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                                                    )}
                                                    {msg.attachment.type === 'video' && (
                                                        <video src={msg.attachment.url} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)' }} />
                                                    )}
                                                    {msg.attachment.type === 'pdf' && (
                                                        <div
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                                                            onClick={() => window.open(msg.attachment.url, '_blank')}
                                                        >
                                                            <FileText size={20} className="su-text-primary" />
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{msg.attachment.name}</span>
                                                        </div>
                                                    )}
                                                    {msg.attachment.type === 'file' && (
                                                        <div
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                                                            onClick={() => window.open(msg.attachment.url, '_blank')}
                                                        >
                                                            <Paperclip size={20} className="su-text-muted" />
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{msg.attachment.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <p>{msg.text}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', opacity: 0.6, fontSize: '0.75rem', justifyContent: 'flex-end' }}>
                                                <span className="su-chat-time">{msg.time}</span>
                                                {msg.sender === 'coach' && renderMessageStatus(msg.status)}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                                <div ref={threadEndRef} />
                            </div>

                            {/* Thread Reply Box */}
                            <div className="su-thread-reply-box-container" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                                {replyingTo && (
                                    <div style={{ backgroundColor: 'var(--bg-card)', borderLeft: '3px solid var(--primary)', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <strong style={{ display: 'block', color: replyingTo.sender === 'coach' ? 'var(--primary)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                {t('pro.feedback.replying')}{replyingTo.sender === 'coach' ? t('pro.feedback.you') : activeThread.clientName}
                                            </strong>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', color: 'var(--text-muted)' }}>
                                                {replyingTo.text || t('pro.feedback.attachment.doc')}
                                            </div>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                {attachedFile && (
                                    <div className="su-chat-active-attachment" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                        <div style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}>
                                            {attachedFile.type === 'pdf' ? <FileText size={16} /> : <Paperclip size={16} />}
                                        </div>
                                        <span className="su-chat-active-attachment-name" style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachedFile.name}</span>
                                        <button className="su-chat-remove-attachment" onClick={() => setAttachedFile(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', marginLeft: '0.5rem', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                <div className="su-thread-reply-box" data-tour="fb-reply" style={{ padding: 0, border: 'none', backgroundColor: 'transparent' }}>
                                    <textarea
                                        className="su-reply-textarea"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder={`${t('pro.feedback.input.placeholder')}${activeThread.clientName.split(' ')[0]}...`}
                                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleReply();
                                            }
                                        }}
                                    ></textarea>
                                    <div className="su-reply-actions" style={{ padding: '0.5rem 0 0 0' }}>
                                        <button className="su-icon-btn su-text-muted" title="Attach Media" onClick={triggerFileInput}><Paperclip size={18} /></button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            accept="image/*,video/*,application/pdf"
                                            onChange={handleFileChange}
                                        />
                                        <Button icon={<Reply size={16} />} onClick={handleReply}>{t('pro.feedback.input.btn')}</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="su-thread-empty">
                            <MessageSquare size={48} className="su-empty-icon" />
                            <h3>{t('pro.feedback.empty.thread.title')}</h3>
                            <p>{t('pro.feedback.empty.thread.desc')}</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Global Context Menu */}
            {contextMenu.visible && (
                <div
                    className="su-context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="su-context-menu-item"
                        onClick={() => {
                            setReplyingTo(contextMenu.message);
                            setContextMenu({ ...contextMenu, visible: false });
                        }}
                    >
                        <Reply size={16} />
                        <span>{t('pro.feedback.menu.reply')}</span>
                    </button>
                    {/* Future options could go here (delete, copy, etc) */}
                </div>
            )}
        </div>
    );
};

export default Feedback;
