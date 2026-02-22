import React, { useState } from 'react';
import { Users, Activity, MessageSquare, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InviteClientModal from '../../components/InviteClientModal';
import './DashboardProfessional.css';

const DashboardProfessional = () => {
    const [showInvite, setShowInvite] = useState(false);

    return (
        <div className="su-pro-dashboard">
            {showInvite && <InviteClientModal onClose={() => setShowInvite(false)} />}
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Coach Overview</h1>
                    <p className="su-page-subtitle">A high-level look at your active clients and recent activity.</p>
                </div>
                <Button onClick={() => setShowInvite(true)}>Invite New Client</Button>
            </div>

            {/* Aggregate Metrics Grid */}
            <div className="su-metrics-grid">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Active Clients</span>
                        <Users size={20} className="su-text-muted" />
                    </div>
                    <div className="su-metric-value">24</div>
                    <span className="su-metric-trend positive">↑ 2 this month</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Workouts Completed</span>
                        <CheckCircle size={20} className="su-success-text" />
                    </div>
                    <div className="su-metric-value">142</div>
                    <span className="su-metric-trend positive">Last 7 days</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Workouts Skipped</span>
                        <XCircle size={20} className="su-error-text" />
                    </div>
                    <div className="su-metric-value">11</div>
                    <span className="su-metric-trend negative">Needs attention</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Client Engagement</span>
                        <Activity size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">92%</div>
                    <span className="su-metric-trend positive">↑ 4% this month</span>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="su-overview-layout">

                {/* Recent Client Logs Column */}
                <div className="su-client-feed">
                    <h3 className="su-section-title">Global Client Activity Feed</h3>

                    <div className="su-feed-list">
                        {/* Feed Item 1: Complete + PR */}
                        <Card className="su-feed-item">
                            <div className="su-feed-avatar">MK</div>
                            <div className="su-feed-content">
                                <div className="su-feed-meta">
                                    <span className="su-feed-name">Mike K.</span>
                                    <span className="su-feed-time">2 hours ago</span>
                                </div>
                                <div className="su-feed-action">
                                    Completed session: <strong>Upper Power Phase 2</strong>
                                </div>
                                <div className="su-feed-badges">
                                    <span className="su-badge pr"><TrendingUp size={14} /> New PR (Bench Press)</span>
                                </div>
                            </div>
                        </Card>

                        {/* Feed Item 2: Skipped */}
                        <Card className="su-feed-item">
                            <div className="su-feed-avatar">SJ</div>
                            <div className="su-feed-content">
                                <div className="su-feed-meta">
                                    <span className="su-feed-name">Sarah J.</span>
                                    <span className="su-feed-time">4 hours ago</span>
                                </div>
                                <div className="su-feed-action">
                                    Missed scheduled template: <strong>Lower Hypertrophy</strong>
                                </div>
                            </div>
                        </Card>

                        {/* Feed Item 3: Comment left */}
                        <Card className="su-feed-item">
                            <div className="su-feed-avatar">DR</div>
                            <div className="su-feed-content">
                                <div className="su-feed-meta">
                                    <span className="su-feed-name">David R.</span>
                                    <span className="su-feed-time">Yesterday</span>
                                </div>
                                <div className="su-feed-action">
                                    Completed session: <strong>Full Body Metabolic</strong>
                                </div>
                                <div className="su-feed-comment-bubble">
                                    <MessageSquare size={14} />
                                    "Felt a slight pinch on the split squats, RPE was higher than usual."
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Sidebar Summary Area */}
                <div className="su-overview-sidebar">
                    <Card className="su-attention-card">
                        <h3 className="su-card-title">Client Alerts</h3>
                        <ul className="su-alert-list">
                            <li><strong>Sarah J.</strong> skipped two consecutive sessions.</li>
                            <li><strong>Mark T.</strong> reported pain in left shoulder during workout.</li>
                            <li><strong>Anna B.</strong> needs a Phase 3 plan assignment (Phase 2 ending soon).</li>
                        </ul>
                    </Card>
                </div>

            </div>

        </div>
    );
};

export default DashboardProfessional;
