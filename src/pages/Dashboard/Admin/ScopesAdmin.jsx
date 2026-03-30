import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Shield, 
    Plus, 
    Trash2, 
    Lock, 
    UserPlus, 
    Activity,
    Info,
    RefreshCw
} from 'lucide-react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { getScopes, assignScopeToUser, removeScopeFromUser } from '../../../services/adminService';
import '../Clients.css';

const ScopesAdmin = () => {
    const [scopes, setScopes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchScopes = async () => {
        setLoading(true);
        try {
            // Mock data for scopes if service fails
            const data = await getScopes();
            if (data && data.items) {
                setScopes(data.items);
            } else {
                setScopes([
                    { id: '1', name: 'trainer_pro', description: 'Full access to professional training tools and client management.', userCount: 340 },
                    { id: '2', name: 'gym_owner', description: 'Administrative access for gym management and staff oversight.', userCount: 120 },
                    { id: '3', name: 'client_basic', description: 'Standard client access to workout plans and tracking.', userCount: 1338 },
                    { id: '4', name: 'system_admin', description: 'Root level access to all system management tools.', userCount: 6 },
                    { id: '5', name: 'billing_manager', description: 'Access to financial reports and subscription management.', userCount: 15 },
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch scopes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScopes();
    }, []);

    const filteredScopes = scopes.filter(scope => 
        scope.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        scope.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="su-admin-scopes">
            <div className="su-dashboard-header-flex" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="su-page-title">Security Scopes</h1>
                    <p className="su-page-subtitle">Manage system access levels and permission rules</p>
                </div>
                <Button onClick={() => alert('New Scope Creation')}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Create New Scope
                </Button>
            </div>

            <Card className="su-clients-container">
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search scopes by name..." 
                            className="su-bare-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={fetchScopes} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'su-spin' : ''} />
                    </Button>
                </div>

                <div className="su-table-responsive">
                    <table className="su-clients-table">
                        <thead>
                            <tr>
                                <th>Scope Name</th>
                                <th>Description</th>
                                <th>Users Count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Activity className="su-spin" size={24} color="var(--primary)" />
                                        <p style={{ marginTop: '0.5rem' }} className="su-text-muted">Loading scopes...</p>
                                    </td>
                                </tr>
                            ) : filteredScopes.length > 0 ? (
                                filteredScopes.map(scope => (
                                    <tr key={scope.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="su-client-avatar" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                                    <Lock size={16} />
                                                </div>
                                                <span className="su-client-name" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{scope.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="su-text-muted" style={{ fontSize: '0.875rem', maxWidth: '400px' }}>{scope.description}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Shield size={16} className="su-accent-text" />
                                                <strong>{scope.userCount}</strong> users
                                            </div>
                                        </td>
                                        <td>
                                            <div className="su-table-actions">
                                                <Button variant="ghost" size="sm" title="View Details" onClick={() => alert('Scope Details')}>
                                                    <Info size={16} color="var(--primary)" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Delete Scope" onClick={() => alert('Delete Scope')}>
                                                    <Trash2 size={16} color="var(--error)" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <p className="su-text-muted">No scopes found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="su-mt-4">
                <Card style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px dashed var(--primary)' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Shield size={24} color="var(--primary)" />
                        <div>
                            <h4 style={{ fontWeight: 600, color: 'var(--text-main)' }}>Policy Security Reminder</h4>
                            <p className="su-text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                System scopes are cached globally. After making changes to a user's scopes, please trigger a <strong>Scope Sync</strong> in the User Management page to ensure immediate propagation.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ScopesAdmin;
