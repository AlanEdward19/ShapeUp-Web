import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Plus, 
    Trash2, 
    Layers, 
    Users, 
    Activity,
    Info,
    RefreshCw,
    Globe,
    Lock
} from 'lucide-react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { getGroups, createGroup, deleteGroup } from '../../../services/adminService';
import '../Clients.css';

const GroupsAdmin = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await getGroups();
            if (data && data.items) {
                setGroups(data.items);
            } else {
                // Fallback mock data
                setGroups([
                    { id: '1', name: 'Global Trainers', type: 'System', memberCount: 340, visibility: 'Public', status: 'Active' },
                    { id: '2', name: 'Alpha Gym Staff', type: 'Gym', memberCount: 15, visibility: 'Private', status: 'Active' },
                    { id: '3', name: 'Beta Fitness Instructors', type: 'Gym', memberCount: 12, visibility: 'Private', status: 'Active' },
                    { id: '4', name: 'Independent Coaches', type: 'System', memberCount: 450, visibility: 'Public', status: 'Active' },
                    { id: '5', name: 'Premium Client Group', type: 'System', memberCount: 85, visibility: 'Private', status: 'Active' },
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch groups:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        group.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="su-admin-groups">
            <div className="su-dashboard-header-flex" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="su-page-title">Global Groups</h1>
                    <p className="su-page-subtitle">Manage system groups, membership types, and visibility rules</p>
                </div>
                <Button onClick={() => alert('New Group Creation')}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Create New Group
                </Button>
            </div>

            <Card className="su-clients-container">
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search groups..." 
                            className="su-bare-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={fetchGroups} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'su-spin' : ''} />
                    </Button>
                </div>

                <div className="su-table-responsive">
                    <table className="su-clients-table">
                        <thead>
                            <tr>
                                <th>Group Name</th>
                                <th>Type</th>
                                <th>Members</th>
                                <th>Visibility</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Activity className="su-spin" size={24} color="var(--primary)" />
                                        <p style={{ marginTop: '0.5rem' }} className="su-text-muted">Loading groups...</p>
                                    </td>
                                </tr>
                            ) : filteredGroups.length > 0 ? (
                                filteredGroups.map(group => (
                                    <tr key={group.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="su-client-avatar" style={{ backgroundColor: 'rgba(8, 182, 212, 0.1)' }}>
                                                    <Layers size={16} />
                                                </div>
                                                <span className="su-client-name">{group.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 500 }}>{group.type}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} className="su-text-muted" />
                                                <strong>{group.memberCount}</strong> members
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {group.visibility === 'Public' ? <Globe size={14} className="su-success-text" /> : <Lock size={14} className="su-warning-text" />}
                                                <span style={{ fontSize: '0.875rem' }}>{group.visibility}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`su-status-badge ${group.status.toLowerCase()}`}>
                                                {group.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="su-table-actions">
                                                <Button variant="ghost" size="sm" title="Group Info" onClick={() => alert('Group Details')}>
                                                    <Info size={16} color="var(--primary)" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Delete Group" onClick={() => alert('Delete Group')}>
                                                    <Trash2 size={16} color="var(--error)" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <p className="su-text-muted">No groups found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default GroupsAdmin;
