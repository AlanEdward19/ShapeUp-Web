import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, MessageSquare, ExternalLink } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import InviteClientModal from '../../components/InviteClientModal';
import './Clients.css';

// Mock Client Data
const clientsList = [
    { id: 1, name: 'Mike K.', activePlan: 'Upper Power Phase 1', compliance: 92, lastCheckin: '2 hours ago', status: 'Active' },
    { id: 2, name: 'Sarah J.', activePlan: 'Lower Hypertrophy', compliance: 65, lastCheckin: '4 days ago', status: 'Needs Attention' },
    { id: 3, name: 'David R.', activePlan: 'Full Body Metabolic', compliance: 100, lastCheckin: '1 day ago', status: 'Active' },
    { id: 4, name: 'Anna B.', activePlan: 'Prep Phase 3', compliance: 88, lastCheckin: '12 hours ago', status: 'Active' },
    { id: 5, name: 'Mark T.', activePlan: 'Strength Foundations', compliance: 40, lastCheckin: '1 week ago', status: 'Inactive' },
];

const Clients = () => {
    const navigate = useNavigate();
    const [showInvite, setShowInvite] = useState(false);

    const handleRowClick = (id) => {
        navigate(`/dashboard/clients/${id}`);
    };

    return (
        <div className="su-clients-dashboard">
            {showInvite && <InviteClientModal onClose={() => setShowInvite(false)} />}
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Client Management</h1>
                    <p className="su-page-subtitle">Directory of your {clientsList.length} active and inactive trainees.</p>
                </div>
                <Button onClick={() => setShowInvite(true)}>Invite New Client</Button>
            </div>

            <Card className="su-clients-container su-mt-4">
                {/* Toolbar */}
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input type="text" placeholder="Search clients..." className="su-bare-input" />
                    </div>
                    <div className="su-toolbar-actions">
                        <Button variant="outline" icon={<Filter size={16} />}>Filter</Button>
                    </div>
                </div>

                {/* Directory Table */}
                <div className="su-table-responsive">
                    <table className="su-clients-table">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Active Plan</th>
                                <th>Compliance</th>
                                <th>Last Check-in</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientsList.map(client => (
                                <tr
                                    key={client.id}
                                    className="su-clickable-row"
                                    onClick={() => handleRowClick(client.id)}
                                >
                                    {/* Client Name/Avatar */}
                                    <td>
                                        <div className="su-client-cell-user">
                                            <div className="su-client-avatar">{client.name.split(' ').map(n => n[0]).join('')}</div>
                                            <span className="su-client-name">{client.name}</span>
                                        </div>
                                    </td>

                                    {/* Plan */}
                                    <td className="su-text-main">{client.activePlan}</td>

                                    {/* Compliance */}
                                    <td>
                                        <div className="su-compliance-bar-rail">
                                            <div
                                                className={`su-compliance-bar-fill ${client.compliance < 70 ? 'poor' : 'good'}`}
                                                style={{ width: `${client.compliance}%` }}
                                            ></div>
                                        </div>
                                        <span className="su-compliance-text">{client.compliance}%</span>
                                    </td>

                                    {/* Checkin */}
                                    <td className="su-text-muted">{client.lastCheckin}</td>

                                    {/* Status Badge */}
                                    <td>
                                        <span className={`su-status-badge ${client.status.toLowerCase().replace(' ', '-')}`}>
                                            {client.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td>
                                        <div className="su-table-actions" onClick={(e) => e.stopPropagation()}>
                                            <button className="su-icon-btn su-text-muted" title="Send Message">
                                                <MessageSquare size={16} />
                                            </button>
                                            <button className="su-icon-btn su-text-muted" title="View Profile">
                                                <ExternalLink size={16} />
                                            </button>
                                            <button className="su-icon-btn su-text-muted">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Clients;
