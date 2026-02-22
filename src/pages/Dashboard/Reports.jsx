import React, { useState } from 'react';
import { FileText, Download, Calendar, Users, Filter, Plus, ChevronDown } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './Reports.css';

// Mock History
const reportHistory = [
    { id: 1, name: 'Q3 Financial Summary', type: 'Billing', date: 'Oct 01, 2025', status: 'Completed', size: '2.4 MB' },
    { id: 2, name: 'September Roster Adherence', type: 'Performance', date: 'Oct 01, 2025', status: 'Completed', size: '1.1 MB' },
    { id: 3, name: 'Mike K. Prog. Block A', type: 'Client Data', date: 'Sep 28, 2025', status: 'Completed', size: '0.8 MB' },
    { id: 4, name: 'Active Clients List', type: 'Directory', date: 'Sep 15, 2025', status: 'Completed', size: '0.3 MB' },
];

const Reports = () => {
    const [reportType, setReportType] = useState('performance');
    const [targetScope, setTargetScope] = useState('all');
    const [exportFormat, setExportFormat] = useState('pdf');

    return (
        <div className="su-reports-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Reports & Exports</h1>
                    <p className="su-page-subtitle">Generate custom data exports for billing, adherence, and client history.</p>
                </div>
            </div>

            <div className="su-reports-grid su-mt-4">
                {/* Generator Configurator */}
                <Card className="su-reports-generator">
                    <div className="su-generator-header">
                        <FileText size={24} className="su-text-primary" />
                        <h2>Create New Report</h2>
                    </div>

                    <div className="su-generator-form">
                        <div className="su-form-group">
                            <label className="su-form-label">Report Type</label>
                            <div className="su-select-wrapper">
                                <select
                                    className="su-select su-full-width"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
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
                                    <select
                                        className="su-select su-full-width"
                                        value={targetScope}
                                        onChange={(e) => setTargetScope(e.target.value)}
                                        disabled={reportType === 'exercises'}
                                    >
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
                                {[
                                    { value: 'pdf', label: 'PDF Document' },
                                    { value: 'csv', label: 'CSV / Excel' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`su-format-btn ${exportFormat === opt.value ? 'active' : ''}`}
                                        onClick={() => setExportFormat(opt.value)}
                                    >
                                        <span className="su-format-dot" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="su-generator-footer">
                            <Button icon={<Plus size={16} />} className="su-generate-btn">
                                Generate Report
                            </Button>
                            <span className="su-form-help">Generation usually takes 10-15 seconds.</span>
                        </div>
                    </div>
                </Card>

                {/* Report History */}
                <Card className="su-reports-history">
                    <div className="su-history-header">
                        <h3>Recent Reports</h3>
                        <button className="su-icon-btn"><Filter size={16} className="su-text-muted" /></button>
                    </div>

                    <div className="su-table-responsive">
                        <table className="su-history-table">
                            <thead>
                                <tr>
                                    <th>Report Name</th>
                                    <th>Type</th>
                                    <th>Date Generated</th>
                                    <th>Size</th>
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
                                            <Button variant="outline" size="small" icon={<Download size={14} />}>
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {reportHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="su-empty-state">No recent reports found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
