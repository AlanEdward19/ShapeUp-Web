import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Paperclip, Image as ImageIcon, FileText, Check, CheckCheck, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import './ChatDrawer.css';

const ChatDrawer = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'coach', text: 'Hey! I saw you finished Upper Power. How did the bench feel today?', time: '10:00 AM', status: 'read' },
        { id: 2, sender: 'client', text: 'It was great. Pushed hard on the last set.', time: '11:15 AM', tag: 'rpe report', status: 'read' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState('general');
    const [attachedFile, setAttachedFile] = useState(null);
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [activeMsgMenu, setActiveMsgMenu] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const tags = [
        { value: 'general', label: 'General' },
        { value: 'form check', label: 'Form Check' },
        { value: 'rpe report', label: 'RPE Report' },
        { value: 'question', label: 'Question' },
        { value: 'check-in', label: 'Check-in' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages]);

    const handleSend = () => {
        if (!newMessage.trim() && !attachedFile) return;

        if (editingMsgId) {
            setMessages(messages.map(msg =>
                msg.id === editingMsgId
                    ? { ...msg, text: newMessage, isEdited: true, attachment: attachedFile || msg.attachment }
                    : msg
            ));
            setEditingMsgId(null);
            setNewMessage('');
            setSelectedTag('general');
            setAttachedFile(null);
            return;
        }

        const newMsg = {
            id: Date.now(),
            sender: 'client',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tag: selectedTag,
            attachment: attachedFile,
            status: 'sending' // Initial status
        };

        setMessages([...messages, newMsg]);
        setNewMessage('');
        setSelectedTag('general');
        setAttachedFile(null);

        // Simulate message status changes
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'sent' } : m));
            setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
            }, 2000);
        }, 1000);
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
        setMessages(messages.filter(msg => msg.id !== id));
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
                            <h3>Coach Alex</h3>
                            <span className="su-chat-status">Online</span>
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
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button className="del" onClick={() => handleDelete(msg.id)}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="su-chat-bubble">
                                    {msg.tag && msg.tag !== 'general' && (
                                        <span className={`su-chat-tag ${msg.tag.replace(' ', '-')}`}>
                                            {tags.find(t => t.value === msg.tag)?.label || msg.tag}
                                        </span>
                                    )}

                                    {msg.attachment && (
                                        <div className={`su-chat-attachment-preview ${msg.attachment.type}`}>
                                            {msg.attachment.type === 'image' && (
                                                <img src={msg.attachment.url} alt="Attached" className="su-chat-attachment-media" />
                                            )}
                                            {msg.attachment.type === 'video' && (
                                                <video src={msg.attachment.url} controls className="su-chat-attachment-media" />
                                            )}
                                            {msg.attachment.type !== 'image' && msg.attachment.type !== 'video' && (
                                                <div className="su-chat-attachment-file">
                                                    <div className="su-chat-attachment-icon">
                                                        {msg.attachment.type === 'pdf' ? <FileText size={24} /> : <Paperclip size={24} />}
                                                    </div>
                                                    <span className="su-chat-attachment-name">{msg.attachment.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.text && <p>{msg.text}</p>}
                                    <div className="su-chat-meta">
                                        {msg.isEdited && <span className="su-chat-edited-val">(editado)</span>}
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
                                placeholder={editingMsgId ? "Editing message..." : "Message Coach..."}
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
        </div>
    );
};

export default ChatDrawer;
