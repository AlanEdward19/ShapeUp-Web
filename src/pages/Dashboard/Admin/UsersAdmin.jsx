import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Trash2, 
    UserPlus, 
    Shield, 
    Mail, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { getUsers, deleteUser, syncUserScopes } from '../../../services/adminService';
import { useLanguage } from '../../../contexts/LanguageContext';
import '../Clients.css'; // Reusing table styles

const UsersAdmin = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // In a real app, we use the service. For now, mock data if service is not ready.
            const data = await getUsers('', 20);
            if (data && data.items) {
                setUsers(data.items);
            } else {
                // Fallback mock data
                setUsers([
                    { id: 1, name: 'Alan Edward', email: 'alan@shapeup.com', role: 'admin', status: 'Active', joined: '2025-01-15' },
                    { id: 2, name: 'Beatriz Gomez', email: 'beatriz@gym.com', role: 'gym', status: 'Active', joined: '2025-02-10' },
                    { id: 3, name: 'Carlos Trainer', email: 'carlos@pro.com', role: 'professional', status: 'Active', joined: '2025-03-05' },
                    { id: 4, name: 'Daniel Smith', email: 'daniel@client.com', role: 'client', status: 'Inactive', joined: '2025-03-20' },
                    { id: 5, name: 'Elena Rodriguez', email: 'elena@independent.com', role: 'independent', status: 'Active', joined: '2026-01-12' },
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, filterRole]);

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(id);
                setUsers(users.filter(u => u.id !== id));
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    const handleSyncScopes = async (userId) => {
        try {
            await syncUserScopes(userId);
            alert('Scopes synchronized successfully.');
        } catch (err) {
            alert('Failed to sync scopes.');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="su-admin-users">
            <div className="su-dashboard-header-flex" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="su-page-title">User Management</h1>
                    <p className="su-page-subtitle">Manage all system users, roles, and access permissions</p>
                </div>
                <Button onClick={() => alert('Invite User flow')}>
                    <UserPlus size={18} style={{ marginRight: '8px' }} />
                    Invite User
                </Button>
            </div>

            <Card className="su-clients-container">
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="su-bare-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="su-filter-select-wrapper">
                        <Filter size={16} />
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="all">All Roles</option>
                            <option value="admin">System Admin</option>
                            <option value="professional">Professional</option>
                            <option value="gym">Gym Admin</option>
                            <option value="independent">Independent</option>
                            <option value="client">Client</option>
                        </select>
                    </div>

                    <Button variant="ghost" onClick={fetchUsers} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'su-spin' : ''} />
                    </Button>
                </div>

                <div className="su-table-responsive">
                    <table className="su-clients-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Activity className="su-spin" size={24} color="var(--primary)" />
                                        <p style={{ marginTop: '0.5rem' }} className="su-text-muted">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="su-client-cell-user">
                                                <div className="su-client-avatar">
                                                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="su-client-name">{user.name}</div>
                                                    <div className="su-text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{user.role}</span>
                                        </td>
                                        <td>
                                            <span className={`su-status-badge ${user.status.toLowerCase()}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="su-text-muted">{user.joined}</div>
                                        </td>
                                        <td>
                                            <div className="su-table-actions">
                                                <Button variant="ghost" size="sm" title="Manage Scopes" onClick={() => handleSyncScopes(user.id)}>
                                                    <Shield size={16} color="var(--primary)" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Delete User" onClick={() => handleDeleteUser(user.id)}>
                                                    <Trash2 size={16} color="var(--error)" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <p className="su-text-muted">No users found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                            <ChevronLeft size={16} />
                        </Button>
                        <span className="su-text-muted">Page {currentPage} of {totalPages}</span>
                        <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UsersAdmin;
