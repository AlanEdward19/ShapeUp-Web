import React, { useState } from 'react';
import { Search, Filter, MessageSquare, Video, Reply, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './Feedback.css';

// Mock Inbox Data
const inboxItems = [
    {
        id: 1,
        clientName: 'Mike K.',
        clientInitials: 'MK',
        type: 'Form Check',
        subject: 'Bench Press Form Review',
        time: '30m ago',
        status: 'Unread',
        preview: 'Hey coach, can you check my elbow tuck on this set? Felt a bit weird.',
        videoAttached: true
    },
    {
        id: 2,
        clientName: 'Sarah J.',
        clientInitials: 'SJ',
        type: 'RPE Report',
        subject: 'High fatigue this week',
        time: '2h ago',
        status: 'Unread',
        preview: 'I rated everything an RPE 9 today. Not sleeping well, should I drop volume?',
        videoAttached: false
    },
    {
        id: 3,
        clientName: 'David R.',
        clientInitials: 'DR',
        type: 'General',
        subject: 'Question about supplements',
        time: 'Yesterday',
        status: 'Read',
        preview: 'Is creatine something I should be loading or just taking 5g a day?',
        videoAttached: false
    },
    {
        id: 4,
        clientName: 'Anna B.',
        clientInitials: 'AB',
        type: 'Check-in',
        subject: 'Weekly Check-in: Week 4',
        time: '2 days ago',
        status: 'Read',
        preview: 'Weight is up 0.5kg this week, measurements are the same. Motivation is high!',
        videoAttached: false
    }
];

const Feedback = () => {
    const [selectedMessage, setSelectedMessage] = useState(inboxItems[0]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'Form Check': return 'var(--primary)';
            case 'RPE Report': return 'var(--warning)';
            case 'Check-in': return 'var(--success)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="su-feedback-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Feedback & Inbox</h1>
                    <p className="su-page-subtitle">Review client check-ins, form videos, and direct messages.</p>
                </div>
            </div>

            <div className="su-inbox-layout">
                {/* Left Column: Feed List */}
                <Card className="su-inbox-sidebar">
                    <div className="su-inbox-header">
                        <div className="su-search-box su-inbox-search">
                            <Search size={16} className="su-text-muted" />
                            <input type="text" placeholder="Search messages..." className="su-bare-input" />
                        </div>
                        <button className="su-icon-btn su-text-muted"><Filter size={18} /></button>
                    </div>

                    <div className="su-inbox-list">
                        {inboxItems.map(item => (
                            <div
                                key={item.id}
                                className={`su-inbox-item ${selectedMessage?.id === item.id ? 'active' : ''} ${item.status === 'Unread' ? 'unread' : ''}`}
                                onClick={() => setSelectedMessage(item)}
                            >
                                <div className="su-inbox-item-header">
                                    <div className="su-inbox-client">
                                        <div className="su-inbox-avatar">{item.clientInitials}</div>
                                        <span className="su-inbox-name">{item.clientName}</span>
                                    </div>
                                    <span className="su-inbox-time">{item.time}</span>
                                </div>
                                <div className="su-inbox-item-subject">
                                    <span className="su-inbox-type-dot" style={{ backgroundColor: getTypeColor(item.type) }}></span>
                                    {item.subject}
                                </div>
                                <p className="su-inbox-preview">{item.preview}</p>
                                {item.videoAttached && (
                                    <div className="su-inbox-attachment-badge">
                                        <Video size={12} /> Video Attached
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Column: Detailed Thread */}
                <Card className="su-inbox-thread">
                    {selectedMessage ? (
                        <div className="su-thread-container">
                            {/* Thread Header */}
                            <div className="su-thread-header">
                                <div className="su-thread-meta">
                                    <div className="su-inbox-avatar large">{selectedMessage.clientInitials}</div>
                                    <div>
                                        <h2 className="su-thread-subject">{selectedMessage.subject}</h2>
                                        <div className="su-thread-subtitle">
                                            <span style={{ color: getTypeColor(selectedMessage.type), fontWeight: 600 }}>{selectedMessage.type}</span>
                                            <span className="su-dot-separator">•</span>
                                            <span>From: <strong className="su-text-main">{selectedMessage.clientName}</strong></span>
                                            <span className="su-dot-separator">•</span>
                                            <span className="su-text-muted">{selectedMessage.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="su-thread-actions">
                                    <Button variant="outline" size="small" icon={<CheckCircle size={16} />}>Mark Resolved</Button>
                                </div>
                            </div>

                            {/* Thread Body */}
                            <div className="su-thread-body">
                                <div className="su-message-bubble client">
                                    <p>{selectedMessage.preview}</p>

                                    {selectedMessage.videoAttached && (
                                        <div className="su-thread-media-attachment">
                                            <div className="su-fake-video-player">
                                                <Video size={32} className="su-text-muted" />
                                                <span>bench_press_set3.mp4</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mock previous reply if it was a read thread */}
                                {selectedMessage.status === 'Read' && (
                                    <div className="su-message-bubble coach">
                                        <p>Hey {selectedMessage.clientName.split(' ')[0]}, received loud and clear. Let's adjust for next week.</p>
                                    </div>
                                )}
                            </div>

                            {/* Thread Reply Box */}
                            <div className="su-thread-reply-box">
                                <textarea className="su-reply-textarea" placeholder={`Reply to ${selectedMessage.clientName.split(' ')[0]}...`}></textarea>
                                <div className="su-reply-actions">
                                    <button className="su-icon-btn su-text-muted" title="Attach Media"><Video size={18} /></button>
                                    <Button icon={<Reply size={16} />}>Send Reply</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="su-thread-empty">
                            <MessageSquare size={48} className="su-empty-icon" />
                            <h3>No Message Selected</h3>
                            <p>Select a conversation from the active feed to view details.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Feedback;
