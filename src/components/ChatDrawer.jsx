import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Paperclip, Image as ImageIcon, FileText, Check, CheckCheck, Clock, MoreVertical, Edit2, Trash2, Reply } from 'lucide-react';
import { addNotification } from '../utils/notifications';
import { useLanguage } from '../contexts/LanguageContext';
import './ChatDrawer.css';

const ChatDrawer = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    // Get active client info
    const clientId = String(localStorage.getItem('shapeup_client_id') || '1');
    const clientName = localStorage.getItem('shapeup_user_name') || 'Client';

    const [messages, setMessages] = useState(() => {
        const stored = localStorage.getItem('shapeup_messages');
        let allMessages = stored ? JSON.parse(stored) : [];
        // Filter messages for this client only
        let clientMessages = allMessages.filter(m => m.clientId === clientId);
        if (clientMessages.length === 0) {
            // Initial mock message for demonstration if empty
            clientMessages = [
                {
                    id: 1, clientId: clientId, clientName: clientName, sender: 'coach',
                    text: 'Hey! I saw you finished Upper Power. How did the bench feel today?',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'read', tag: 'general', isTicket: false
                }
            ];
            allMessages = [...allMessages, ...clientMessages];
            localStorage.setItem('shapeup_messages', JSON.stringify(allMessages));
        }
        return clientMessages;
    });
    const [newMessage, setNewMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState('general');
    const [attachedFile, setAttachedFile] = useState(null);
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [activeMsgMenu, setActiveMsgMenu] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const tags = [
        { value: 'general', label: t('client.chat.tag.general') },
        { value: 'form check', label: t('client.chat.tag.form_check') },
        { value: 'rpe report', label: t('client.chat.tag.rpe_report') },
        { value: 'question', label: t('client.chat.tag.question') },
        { value: 'check-in', label: t('client.chat.tag.checkin') }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToMessage = (msgId) => {
        const el = document.getElementById(`msg-${msgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('su-highlight-msg');
            setTimeout(() => el.classList.remove('su-highlight-msg'), 2000);
        }
    };

    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

    useEffect(() => {
        const loadMessages = () => {
            const stored = localStorage.getItem('shapeup_messages');
            if (stored) {
                const allMessages = JSON.parse(stored);
                let hasChanges = false;

                const updatedAll = allMessages.map(m => {
                    if (m.clientId === clientId && m.sender === 'coach' && m.status !== 'read') {
                        hasChanges = true;
                        return { ...m, status: 'read' };
                    }
                    return m;
                });

                if (hasChanges && isOpen) {
                    localStorage.setItem('shapeup_messages', JSON.stringify(updatedAll));
                    window.dispatchEvent(new Event('shapeup_messages_updated'));
                }

                setMessages(updatedAll.filter(m => m.clientId === clientId));
            }
        };

        if (isOpen) {
            loadMessages();
            // Add a small delay for DOM to render the new messages before scrolling
            setTimeout(scrollToBottom, 100);
        }

        const handleSync = () => {
            if (isOpen) loadMessages();
        };

        window.addEventListener('storage', handleSync);
        window.addEventListener('shapeup_messages_updated', handleSync);

        return () => {
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('shapeup_messages_updated', handleSync);
        };
    }, [isOpen, clientId]);

    const handleSend = () => {
        if (!newMessage.trim() && !attachedFile) return;

        if (editingMsgId) {
            setMessages(prev => {
                const refreshed = prev.map(msg =>
                    msg.id === editingMsgId
                        ? { ...msg, text: newMessage, isEdited: true, attachment: attachedFile || msg.attachment }
                        : msg
                );
                syncToStorage(refreshed);
                return refreshed;
            });
            setEditingMsgId(null);
            setNewMessage('');
            setSelectedTag('general');
            setAttachedFile(null);
            setReplyingTo(null);
            return;
        }

        const newMsg = {
            id: Date.now(),
            clientId: clientId,
            clientName: clientName,
            sender: 'client',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tag: selectedTag,
            isTicket: selectedTag !== 'general',
            attachment: attachedFile,
            replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null,
            status: 'sent' // changed from sending to sent immediately for simplicity, or we can leave as unread. Let's use 'sent' to show 1 tick.
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);

        // Save to global storage
        const stored = localStorage.getItem('shapeup_messages');
        const allMessages = stored ? JSON.parse(stored) : [];
        localStorage.setItem('shapeup_messages', JSON.stringify([...allMessages, newMsg]));

        // Notify professional
        addNotification('pro', 'message', 'New Message', `${clientName}: ${newMessage || 'Sent an attachment'}`, 'primary', {
            link: '/dashboard/feedback',
            state: { clientId: clientId }
        });

        setNewMessage('');
        setSelectedTag('general');
        setAttachedFile(null);
        setReplyingTo(null);
        setTimeout(scrollToBottom, 50);
    };

    const syncToStorage = (clientMsgs) => {
        const stored = localStorage.getItem('shapeup_messages');
        const allMessages = stored ? JSON.parse(stored) : [];
        const otherMsgs = allMessages.filter(m => m.clientId !== clientId);
        localStorage.setItem('shapeup_messages', JSON.stringify([...otherMsgs, ...clientMsgs]));
    };

    const handleEdit = (msg) => {
        setEditingMsgId(msg.id);
        setNewMessage(msg.text || '');
        setActiveMsgMenu(null);
        if (msg.attachment) {
            setAttachedFile(msg.attachment);
        }
    };

    const handleDelete = (id) => {
        setMessages(prev => {
            const refreshed = prev.filter(msg => msg.id !== id);
            syncToStorage(refreshed);
            return refreshed;
        });
        setActiveMsgMenu(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a local object URL to display the image/video preview
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

    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            message: msg
        });
    };

    if (!isOpen) return null;

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
        <div className="su-chat-overlay" onClick={onClose}>
            <div className="su-chat-drawer" onClick={e => e.stopPropagation()}>
                <div className="su-chat-header">
                    <div className="su-chat-header-info">
                        <div className="su-chat-avatar">
                            <User size={20} />
                        </div>
                        <div className="su-chat-user-details">
                            <h3>{t('client.chat.title')}</h3>
                            <span className="su-chat-status">{t('client.chat.status.online')}</span>
                        </div>
                    </div>
                    <button className="su-chat-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="su-chat-body" onClick={() => setActiveMsgMenu(null)}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`su-chat-bubble-wrapper ${msg.sender}`}>
                            <div className="su-chat-bubble-container">
                                {msg.sender === 'client' && (
                                    <div className="su-chat-msg-actions">
                                        <button
                                            className="su-chat-msg-menu-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMsgMenu(activeMsgMenu === msg.id ? null : msg.id);
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {activeMsgMenu === msg.id && (
                                            <div className="su-chat-msg-menu">
                                                <button onClick={() => handleEdit(msg)}>
                                                    <Edit2 size={14} /> {t('common.edit') || 'Edit'}
                                                </button>
                                                <button className="del" onClick={() => handleDelete(msg.id)}>
                                                    <Trash2 size={14} /> {t('common.delete') || 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div
                                    id={`msg-${msg.id}`}
                                    className="su-chat-bubble"
                                    onContextMenu={(e) => handleContextMenu(e, msg)}
                                >
                                    {msg.replyTo && (
                                        <div
                                            style={{ backgroundColor: 'var(--bg-main)', borderLeft: '3px solid var(--primary)', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', opacity: 0.8, cursor: 'pointer' }}
                                            onClick={() => scrollToMessage(msg.replyTo.id)}
                                        >
                                            <strong style={{ display: 'block', color: msg.replyTo.sender === 'client' ? 'var(--text-main)' : 'var(--primary)', marginBottom: '0.25rem' }}>
                                                {msg.replyTo.sender === 'client' ? t('client.chat.you') : t('client.chat.coach')}
                                            </strong>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                                {msg.replyTo.text || t('pro.feedback.attachment.doc')}
                                            </div>
                                        </div>
                                    )}

                                    {msg.tag && msg.tag !== 'general' && (
                                        <span className={`su-chat-tag ${msg.tag.replace(' ', '-')}`}>
                                            {tags.find(t => t.value === msg.tag)?.label || msg.tag}
                                        </span>
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

                                    {msg.text && <p>{msg.text}</p>}
                                    <div className="su-chat-meta">
                                        {msg.isEdited && <span className="su-chat-edited-val">{t('client.chat.edited')}</span>}
                                        <span className="su-chat-time">{msg.time}</span>
                                        {msg.sender === 'client' && renderMessageStatus(msg.status)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="su-chat-footer">
                    <div className="su-chat-input-controls">
                        <select
                            value={selectedTag}
                            onChange={e => setSelectedTag(e.target.value)}
                            className="su-chat-tag-select"
                        >
                            {tags.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div className="su-chat-input-area">
                        {replyingTo && (
                            <div style={{ backgroundColor: 'var(--bg-main)', borderLeft: '3px solid var(--primary)', padding: '0.5rem', margin: '0.5rem 1rem 0 1rem', borderRadius: '0.25rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <strong style={{ display: 'block', color: replyingTo.sender === 'client' ? 'var(--text-main)' : 'var(--primary)', marginBottom: '0.25rem' }}>
                                        {t('client.chat.replying')}{replyingTo.sender === 'client' ? t('client.chat.you') : t('client.chat.coach')}
                                    </strong>
                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', color: 'var(--text-muted)' }}>
                                        {replyingTo.text || t('pro.feedback.attachment.doc')}
                                    </div>
                                </div>
                                <button onClick={() => setReplyingTo(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        {attachedFile && (
                            <div className="su-chat-active-attachment">
                                <span className="su-chat-active-attachment-name">{attachedFile.name}</span>
                                <button className="su-chat-remove-attachment" onClick={() => setAttachedFile(null)}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <div className="su-chat-input-row">
                            <button
                                className="su-chat-attach-btn"
                                onClick={triggerFileInput}
                                title="Attach Image, Video, or PDF"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*,video/*,application/pdf"
                                onChange={handleFileChange}
                            />
                            <textarea
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder={editingMsgId ? t('client.chat.input.editing') : t('client.chat.input.placeholder')}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            {editingMsgId && (
                                <button className="su-chat-cancel-edit-btn" onClick={() => {
                                    setEditingMsgId(null);
                                    setNewMessage('');
                                    setAttachedFile(null);
                                }}>
                                    <X size={18} />
                                </button>
                            )}
                            <button
                                className="su-chat-send-btn"
                                onClick={handleSend}
                                disabled={!newMessage.trim() && !attachedFile}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {contextMenu.visible && (
                <div
                    className="su-context-menu"
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x
                    }}
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
                        <span>{t('client.chat.menu.reply')}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatDrawer;
