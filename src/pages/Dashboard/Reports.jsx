import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    FileText, Download, Calendar, Users, Filter, Plus,
    ChevronDown, MessageSquare, Send, Paperclip, Search,
    CheckCheck, Circle
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './Reports.css';

// ─── Mock Data ──────────────────────────────────────────────

const reportHistory = [
    { id: 1, name: 'Q3 Financial Summary', type: 'Billing', date: 'Oct 01, 2025', status: 'Completed', size: '2.4 MB' },
    { id: 2, name: 'September Roster Adherence', type: 'Performance', date: 'Oct 01, 2025', status: 'Completed', size: '1.1 MB' },
    { id: 3, name: 'Mike K. Prog. Block A', type: 'Client Data', date: 'Sep 28, 2025', status: 'Completed', size: '0.8 MB' },
    { id: 4, name: 'Active Clients List', type: 'Directory', date: 'Sep 15, 2025', status: 'Completed', size: '0.3 MB' },
];

const mockClients = [
    { id: 1, name: 'Mike K.', avatar: 'MK', status: 'online', lastMsg: 'Got it! Will do the extra cardio.', time: '10:24' },
    { id: 2, name: 'Sarah J.', avatar: 'SJ', status: 'offline', lastMsg: 'My knee is still a bit sore...', time: 'Yesterday' },
    { id: 3, name: 'David R.', avatar: 'DR', status: 'online', lastMsg: 'How many reps for the warm-up set?', time: '09:01' },
    { id: 4, name: 'Anna B.', avatar: 'AB', status: 'away', lastMsg: 'Session done! Felt great today 💪', time: 'Mon' },
    { id: 5, name: 'Mark T.', avatar: 'MT', status: 'offline', lastMsg: 'Can we reschedule to Thursday?', time: 'Sun' },
];

const mockHistory = {
    1: [
        { id: 1, from: 'them', text: 'Hey coach! Finished the lower body session.', time: '10:10', read: true },
        { id: 2, from: 'me', text: 'Nice work Mike! How did the squat feel?', time: '10:12', read: true },
        { id: 3, from: 'them', text: 'Felt strong. Hit 120 kg × 5 on the top set!', time: '10:15', read: true },
        { id: 4, from: 'me', text: 'That\'s a new PR! Keep it up. For tomorrow — add 10 min of zone 2 cardio after the session.', time: '10:20', read: true },
        { id: 5, from: 'them', text: 'Got it! Will do the extra cardio.', time: '10:24', read: true },
    ],
    2: [
        { id: 1, from: 'them', text: 'Hi, I missed yesterday\'s session, sorry.', time: 'Yesterday 14:00', read: true },
        { id: 2, from: 'me', text: 'No worries! Is everything okay?', time: 'Yesterday 14:05', read: true },
        { id: 3, from: 'them', text: 'My knee is still a bit sore...', time: 'Yesterday 14:08', read: true },
    ],
    3: [
        { id: 1, from: 'them', text: 'How many reps for the warm-up set?', time: '09:01', read: true },
    ],
    4: [
        { id: 1, from: 'them', text: 'Session done! Felt great today 💪', time: 'Mon 18:30', read: true },
        { id: 2, from: 'me', text: 'Amazing! See you Wednesday 🙌', time: 'Mon 18:45', read: true },
    ],
    5: [
        { id: 1, from: 'them', text: 'Can we reschedule to Thursday?', time: 'Sun 12:00', read: true },
    ],
};

// ─── Chat Panel ─────────────────────────────────────────────
const ChatPanel = ({ client, messages, onSendMessage }) => {
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onSendMessage(trimmed);
        setInput('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div className="su-chat-panel">
            {/* Chat header */}
            <div className="su-chat-header">
                <div className="su-chat-avatar">{client.avatar}</div>
                <div className="su-chat-header-info">
                    <span className="su-chat-name">{client.name}</span>
                    <span className={`su-chat-status-dot ${client.status}`} />
                    <span className="su-chat-status-label">{client.status === 'online' ? 'Online' : client.status === 'away' ? 'Away' : 'Offline'}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="su-chat-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`su-msg-row ${msg.from === 'me' ? 'su-msg-me' : 'su-msg-them'}`}>
                        {msg.from === 'them' && (
                            <div className="su-msg-avatar-sm">{client.avatar}</div>
                        )}
                        <div className="su-msg-bubble">
                            <p className="su-msg-text">{msg.text}</p>
                            <div className="su-msg-meta">
                                <span className="su-msg-time">{msg.time}</span>
                                {msg.from === 'me' && <CheckCheck size={12} className="su-msg-tick" />}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="su-chat-input-bar">
                <button className="su-chat-attach-btn" title="Attach file">
                    <Paperclip size={18} />
                </button>
                <textarea
                    className="su-chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Message ${client.name}…`}
                    rows={1}
                />
                <button
                    className={`su-chat-send-btn ${input.trim() ? 'active' : ''}`}
                    onClick={handleSend}
                    disabled={!input.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

// ─── REPORTS COMPONENT ──────────────────────────────────────
const Reports = () => {
    const location = useLocation();
    const openChatClient = location.state?.openChat ?? null;

    const [activeTab, setActiveTab] = useState(openChatClient ? 'messages' : 'reports');
    const [reportType, setReportType] = useState('performance');
    const [targetScope, setTargetScope] = useState('all');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [clientSearch, setClientSearch] = useState('');

    // Determine start client
    const findClient = (c) => mockClients.find(mc => mc.id === c?.id) ?? mockClients[0];
    const [selectedClient, setSelectedClient] = useState(
        openChatClient ? findClient(openChatClient) : mockClients[0]
    );

    const [conversations, setConversations] = useState(
        Object.fromEntries(mockClients.map(c => [c.id, [...(mockHistory[c.id] || [])]]))
    );

    const handleSendMessage = (text) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setConversations(prev => ({
            ...prev,
            [selectedClient.id]: [
                ...prev[selectedClient.id],
                { id: Date.now(), from: 'me', text, time: timeStr, read: false }
            ]
        }));
    };

    const filteredClients = mockClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase())
    );

    const currentMessages = conversations[selectedClient.id] || [];

    return (
        <div className="su-reports-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Reports & Messages</h1>
                    <p className="su-page-subtitle">Export data or chat directly with your clients.</p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="su-cp-tabs su-mt-4">
                <button
                    className={`su-cp-tab ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <FileText size={16} /> Reports & Exports
                </button>
                <button
                    className={`su-cp-tab ${activeTab === 'messages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    <MessageSquare size={16} /> Messages
                </button>
            </div>

            {/* ── REPORTS TAB ──────────────────────────────── */}
            {activeTab === 'reports' && (
                <div className="su-reports-grid su-mt-4">
                    <Card className="su-reports-generator">
                        <div className="su-generator-header">
                            <FileText size={24} className="su-text-primary" />
                            <h2>Create New Report</h2>
                        </div>

                        <div className="su-generator-form">
                            <div className="su-form-group">
                                <label className="su-form-label">Report Type</label>
                                <div className="su-select-wrapper">
                                    <select className="su-select su-full-width" value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}>
                                        <option value="performance">Overall Roster Performance & Adherence</option>
                                        <option value="billing">Billing & Revenue Summary</option>
                                        <option value="client_history">Specific Client History (Workouts & Logs)</option>
                                        <option value="exercises">Exercises Database Export</option>
                                    </select>
                                    <ChevronDown size={16} className="su-select-icon" />
                                </div>
                            </div>

                            <div className="su-form-row">
                                <div className="su-form-group su-flex-1">
                                    <label className="su-form-label"><Users size={14} /> Target Scope</label>
                                    <div className="su-select-wrapper">
                                        <select className="su-select su-full-width" value={targetScope}
                                            onChange={(e) => setTargetScope(e.target.value)}
                                            disabled={reportType === 'exercises'}>
                                            <option value="all">All Active Clients (36)</option>
                                            <option value="specific">Specific Client...</option>
                                        </select>
                                        <ChevronDown size={16} className="su-select-icon" />
                                    </div>
                                </div>
                                <div className="su-form-group su-flex-1">
                                    <label className="su-form-label"><Calendar size={14} /> Date Range</label>
                                    <div className="su-select-wrapper">
                                        <select className="su-select su-full-width">
                                            <option value="last_30">Last 30 Days</option>
                                            <option value="last_month">Last Month</option>
                                            <option value="ytd">Year to Date (YTD)</option>
                                            <option value="custom">Custom Range...</option>
                                        </select>
                                        <ChevronDown size={16} className="su-select-icon" />
                                    </div>
                                </div>
                            </div>

                            <div className="su-form-group">
                                <label className="su-form-label">Export Format</label>
                                <div className="su-format-toggles">
                                    {[{ value: 'pdf', label: 'PDF Document' }, { value: 'csv', label: 'CSV / Excel' }].map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`su-format-btn ${exportFormat === opt.value ? 'active' : ''}`}
                                            onClick={() => setExportFormat(opt.value)}>
                                            <span className="su-format-dot" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="su-generator-footer">
                                <Button icon={<Plus size={16} />} className="su-generate-btn">Generate Report</Button>
                                <span className="su-form-help">Generation usually takes 10-15 seconds.</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="su-reports-history">
                        <div className="su-history-header">
                            <h3>Recent Reports</h3>
                            <button className="su-icon-btn"><Filter size={16} className="su-text-muted" /></button>
                        </div>
                        <div className="su-table-responsive">
                            <table className="su-history-table">
                                <thead>
                                    <tr>
                                        <th>Report Name</th><th>Type</th><th>Date Generated</th><th>Size</th>
                                        <th className="su-text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportHistory.map(report => (
                                        <tr key={report.id}>
                                            <td className="su-font-medium su-text-main">{report.name}</td>
                                            <td><span className="su-report-type-badge">{report.type}</span></td>
                                            <td className="su-text-muted">{report.date}</td>
                                            <td className="su-text-muted">{report.size}</td>
                                            <td className="su-text-right">
                                                <Button variant="outline" size="small" icon={<Download size={14} />}>Download</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── MESSAGES TAB ──────────────────────────────── */}
            {activeTab === 'messages' && (
                <div className="su-messages-layout su-mt-4">
                    {/* Sidebar: client list */}
                    <Card className="su-contacts-panel">
                        <div className="su-contacts-search">
                            <Search size={14} className="su-search-icon-inner" />
                            <input
                                className="su-contacts-search-input"
                                placeholder="Search clients…"
                                value={clientSearch}
                                onChange={e => setClientSearch(e.target.value)}
                            />
                        </div>
                        <div className="su-contacts-list">
                            {filteredClients.map(c => {
                                const msgs = conversations[c.id] || [];
                                const last = msgs[msgs.length - 1];
                                return (
                                    <button
                                        key={c.id}
                                        className={`su-contact-row ${selectedClient.id === c.id ? 'active' : ''}`}
                                        onClick={() => setSelectedClient(c)}
                                    >
                                        <div className="su-contact-avatar-wrap">
                                            <div className="su-contact-avatar">{c.avatar}</div>
                                            <span className={`su-presence-dot ${c.status}`} />
                                        </div>
                                        <div className="su-contact-info">
                                            <span className="su-contact-name">{c.name}</span>
                                            <span className="su-contact-preview">
                                                {last?.from === 'me' && '↩ '}
                                                {last?.text?.slice(0, 38)}{(last?.text?.length ?? 0) > 38 ? '…' : ''}
                                            </span>
                                        </div>
                                        <span className="su-contact-time">{last?.time ?? ''}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Chat panel */}
                    <ChatPanel
                        client={selectedClient}
                        messages={currentMessages}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            )}
        </div>
    );
};

export default Reports;
