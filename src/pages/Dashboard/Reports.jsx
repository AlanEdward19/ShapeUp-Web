import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FileText, Download, Calendar, Users, Filter, Plus, ChevronDown, CheckCircle, XCircle, Clock, MoreVertical, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const { t } = useLanguage();
    const [reportType, setReportType] = useState('performance');
    const [targetScope, setTargetScope] = useState('all');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [dateRange, setDateRange] = useState('last_30');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportsHistory, setReportsHistory] = useState([]);

    // Data state
    const [clients, setClients] = useState([]);

    React.useEffect(() => {
        const storedClients = localStorage.getItem('shapeup_clients');
        if (storedClients) {
            setClients(JSON.parse(storedClients));
        }

        const storedHistory = localStorage.getItem('shapeup_reports_history');
        if (storedHistory) {
            setReportsHistory(JSON.parse(storedHistory));
        }
    }, []);

    const handleGenerateReport = async () => {
        setIsGenerating(true);

        // Short delay to simulate generation
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            if (exportFormat === 'pdf') {
                generatePDF();
            } else if (exportFormat === 'csv') {
                generateCSV();
            }

            // Save to history
            const newReport = {
                id: Date.now(),
                name: `${exportFormat.toUpperCase()}: ${reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('_', ' ')} - ${targetScope === 'specific' ? clients.find(c => String(c.id) === String(selectedClientId))?.name : 'All Clients'}`,
                type: reportType,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Completed',
                size: exportFormat === 'pdf' ? '0.5 MB' : '0.05 MB'
            };

            const updatedHistory = [newReport, ...reportsHistory].slice(0, 10);
            setReportsHistory(updatedHistory);
            localStorage.setItem('shapeup_reports_history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const now = new Date();
        const dateStr = now.toLocaleDateString();

        // 1. Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('ShapeUp - Performance Report', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${dateStr}`, 14, 30);

        if (reportType === 'performance') {
            generatePerformanceReport(doc);
        } else if (reportType === 'billing') {
            generateBillingReport(doc);
        } else if (reportType === 'client_history') {
            generateClientHistoryReport(doc);
        } else {
            doc.text('This report type is not yet implemented for real data.', 14, 45);
        }

        doc.save(`ShapeUp_Report_${reportType}_${now.getTime()}.pdf`);
    };

    const downloadCSV = (headers, rows, fileName) => {
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateCSV = () => {
        const now = new Date();
        const fileName = `ShapeUp_Export_${reportType}_${now.getTime()}.csv`;
        let headers = [];
        let rows = [];

        // Helper to parse volume string correctly
        const parseVolume = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const cleaned = val.replace(/[^\d.]/g, '');
                return parseFloat(cleaned) || 0;
            }
            return 0;
        };

        // Date Range Logic
        let startDate = new Date();
        let endDate = now;
        if (dateRange === 'last_30') startDate.setDate(now.getDate() - 30);
        else if (dateRange === 'last_month') startDate.setMonth(now.getMonth() - 1);
        else if (dateRange === 'ytd') startDate = new Date(now.getFullYear(), 0, 1);
        else if (dateRange === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        }

        if (reportType === 'performance') {
            headers = ['Client Name', 'Status', 'Completed', 'Skipped', 'Adherence %', 'Total Volume (kg)'];
            let targetClients = clients;
            if (targetScope === 'specific' && selectedClientId) {
                targetClients = clients.filter(c => String(c.id) === String(selectedClientId));
            }

            rows = targetClients.map(client => {
                const storedPlans = localStorage.getItem(`shapeup_client_plans_${client.id}`);
                let completed = 0;
                let skipped = 0;
                let totalVolumeSum = 0;

                if (storedPlans) {
                    const plans = JSON.parse(storedPlans);
                    plans.forEach(plan => {
                        (plan.history || []).forEach(h => {
                            const hDate = new Date(h.date);
                            if (hDate >= startDate && hDate <= endDate) {
                                const isSkipped = h.status === 'skipped' || (h.exercises || []).every(ex => ex.skipped);
                                if (isSkipped) skipped++;
                                else {
                                    completed++;
                                    totalVolumeSum += parseVolume(h.totalVol);
                                }
                            }
                        });
                    });
                }
                const totalSessions = completed + skipped;
                const adherence = totalSessions > 0 ? Math.round((completed / totalSessions) * 100) : 0;
                return [client.name, client.status || 'Active', completed, skipped, adherence, totalVolumeSum];
            });
        }
        else if (reportType === 'billing') {
            headers = ['Client Name', 'Status', 'Billing Type', 'Plan Detail', 'Monthly Rate ($)'];
            const storedPlans = localStorage.getItem('shapeup_pro_plans');
            const proPlans = storedPlans ? JSON.parse(storedPlans) : [];
            let targetClients = clients;
            if (targetScope === 'specific' && selectedClientId) {
                targetClients = clients.filter(c => String(c.id) === String(selectedClientId));
            }

            rows = targetClients.map(client => {
                let billingAmount = 0;
                let billingDetail = 'N/A';
                if (client.billingType === 'custom' && client.customPrice) {
                    billingAmount = Number(client.customPrice);
                    billingDetail = `Custom`;
                } else if (client.billingType === 'plan' && client.billingPlanId) {
                    const p = proPlans.find(plan => plan.id === client.billingPlanId);
                    if (p && p.price) {
                        billingAmount = Number(p.price);
                        billingDetail = p.name;
                    }
                }
                return [client.name, client.status || 'Active', client.billingType || 'plan', billingDetail, billingAmount];
            });
        }
        else if (reportType === 'client_history') {
            headers = ['Date', 'Plan Name', 'Status', 'Exercise Name', 'Set Details', 'Exercise RPE', 'Session Comments'];
            if (targetScope !== 'specific' || !selectedClientId) return alert('Please select a specific client for history export');

            const client = clients.find(c => String(c.id) === String(selectedClientId));
            if (!client) return;

            const storedPlans = localStorage.getItem(`shapeup_client_plans_${client.id}`);
            if (storedPlans) {
                const plans = JSON.parse(storedPlans);
                plans.forEach(plan => {
                    (plan.history || []).forEach(h => {
                        const hDate = new Date(h.date);
                        if (hDate >= startDate && hDate <= endDate) {
                            const dateStr = new Date(h.date).toLocaleDateString();
                            const isSkipped = h.status === 'skipped' || (h.exercises || []).every(ex => ex.skipped);

                            if (h.exercises && h.exercises.length > 0) {
                                h.exercises.forEach(ex => {
                                    const logSummary = (ex.sets || []).map(s => {
                                        const weight = s.load || s.weight || 0;
                                        const rpeStr = s.rpe ? `@RPE${s.rpe}` : '';
                                        return `${s.reps}x${weight}${rpeStr}`;
                                    }).join('; ');

                                    rows.push([
                                        dateStr,
                                        plan.name,
                                        isSkipped ? 'Skipped' : 'Completed',
                                        ex.name,
                                        ex.skipped ? 'Skipped' : logSummary,
                                        h.rpe || '-',
                                        h.comments || ''
                                    ]);
                                });
                            } else {
                                rows.push([dateStr, plan.name, 'Skipped', '-', '-', h.rpe || '-', h.comments || '']);
                            }
                        }
                    });
                });
            }
            rows.sort((a, b) => new Date(b[0]) - new Date(a[0]));
        }

        downloadCSV(headers, rows, fileName);
    };

    const generateClientHistoryReport = (doc) => {
        const client = clients.find(c => String(c.id) === String(selectedClientId));
        if (!client) return;

        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text(`Client History: ${client.name}`, 14, 45);

        // Date Range Logic
        const now = new Date();
        let startDate = new Date();
        let endDate = now;

        if (dateRange === 'last_30') startDate.setDate(now.getDate() - 30);
        else if (dateRange === 'last_month') startDate.setMonth(now.getMonth() - 1);
        else if (dateRange === 'ytd') startDate = new Date(now.getFullYear(), 0, 1);
        else if (dateRange === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        }

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, 52);

        const storedPlans = localStorage.getItem(`shapeup_client_plans_${client.id}`);
        let sessions = [];

        if (storedPlans) {
            const plans = JSON.parse(storedPlans);
            plans.forEach(plan => {
                (plan.history || []).forEach(h => {
                    const hDate = new Date(h.date);
                    if (hDate >= startDate && hDate <= endDate) {
                        sessions.push({ ...h, planName: plan.name });
                    }
                });
            });
        }

        // Sort sessions by date (newest first)
        sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sessions.length === 0) {
            doc.text('No workout history found for this period.', 14, 65);
            return;
        }

        let currentY = 60;

        sessions.forEach((session, index) => {
            const dateStr = new Date(session.date).toLocaleDateString();
            const isSkipped = session.status === 'skipped' || (session.exercises || []).every(ex => ex.skipped);

            // Add Header for each session
            doc.setFontSize(11);
            doc.setTextColor(40, 40, 40);
            doc.text(`${dateStr} - ${session.planName} ${isSkipped ? '(SKIPPED)' : ''}`, 14, currentY);
            currentY += 5;

            if (!isSkipped && session.exercises && session.exercises.length > 0) {
                const exerciseData = session.exercises.map(ex => {
                    const sets = ex.sets || [];
                    const logSummary = sets.map(s => {
                        const weight = s.load || s.weight || 0;
                        const rpe = s.rpe ? ` @ RPE ${s.rpe}` : '';
                        return `${s.reps}x${weight}kg${rpe}`;
                    }).join(', ');

                    return [
                        ex.name,
                        ex.skipped ? 'Skipped' : (logSummary || 'Done'),
                        session.rpe ? `Avg RPE ${session.rpe}` : '-'
                    ];
                });

                autoTable(doc, {
                    startY: currentY,
                    head: [['Exercise', 'Logs', 'Session RPE']],
                    body: exerciseData,
                    headStyles: { fillColor: [71, 85, 105], fontSize: 9 }, // Slate-600
                    bodyStyles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                    theme: 'striped',
                });

                currentY = doc.lastAutoTable.finalY + 5;
            } else {
                currentY += 5;
            }

            if (session.comments) {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.setFont('helvetica', 'italic');
                doc.text(`Comments: "${session.comments}"`, 16, currentY);
                doc.setFont('helvetica', 'normal');
                currentY += 8;
            } else {
                currentY += 5;
            }

            // Page break check
            if (currentY > 260 && index < sessions.length - 1) {
                doc.addPage();
                currentY = 20;
            }
        });
    };

    const generateBillingReport = (doc) => {
        const storedPlans = localStorage.getItem('shapeup_pro_plans');
        const proPlans = storedPlans ? JSON.parse(storedPlans) : [];

        // Filter clients based on scope
        let targetClients = clients;
        if (targetScope === 'specific' && selectedClientId) {
            targetClients = clients.filter(c => String(c.id) === String(selectedClientId));
        }

        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129); // Success-like color for billing
        doc.text('Billing & Revenue Summary', 14, 45);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Active Roster Status as of ${new Date().toLocaleDateString()}`, 14, 52);

        let totalExpectedRevenue = 0;

        const tableData = targetClients.map(client => {
            let billingAmount = 0;
            let billingDetail = 'N/A';

            if (client.billingType === 'custom' && client.customPrice) {
                billingAmount = Number(client.customPrice);
                billingDetail = `Custom ($${billingAmount})`;
            } else if (client.billingType === 'plan' && client.billingPlanId) {
                const p = proPlans.find(plan => plan.id === client.billingPlanId);
                if (p && p.price) {
                    billingAmount = Number(p.price);
                    billingDetail = `${p.name} ($${billingAmount})`;
                }
            }

            totalExpectedRevenue += billingAmount;

            return [
                client.name,
                client.status || 'Active',
                client.billingType === 'plan' ? 'Standard Plan' : 'Custom Agreement',
                billingDetail,
                `$${billingAmount.toLocaleString()}`
            ];
        });

        autoTable(doc, {
            startY: 60,
            head: [['Client Name', 'Status', 'Billing Type', 'Plan Detail', 'Monthly Rate']],
            body: tableData,
            headStyles: { fillColor: [16, 185, 129] },
            alternateRowStyles: { fillColor: [240, 253, 244] },
            margin: { top: 60 },
        });

        // Summary Statistics
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Financial Summary', 14, finalY);
        doc.setFontSize(10);
        doc.text(`Total Clients in Scope: ${targetClients.length}`, 14, finalY + 7);
        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129);
        doc.text(`Total Monthly Recurring Revenue (MRR): $${totalExpectedRevenue.toLocaleString()}`, 14, finalY + 16);
    };

    const generatePerformanceReport = (doc) => {
        // Filter clients based on scope
        let targetClients = clients;
        if (targetScope === 'specific' && selectedClientId) {
            targetClients = clients.filter(c => String(c.id) === String(selectedClientId));
        }

        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235); // Primary color
        doc.text('Overall Roster Performance & Adherence', 14, 45);

        // Date Range Logic
        const now = new Date();
        let startDate = new Date();
        let endDate = now;

        if (dateRange === 'last_30') startDate.setDate(now.getDate() - 30);
        else if (dateRange === 'last_month') startDate.setMonth(now.getMonth() - 1);
        else if (dateRange === 'ytd') startDate = new Date(now.getFullYear(), 0, 1);
        else if (dateRange === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        }

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, 52);

        // Helper to parse volume string correctly
        const parseVolume = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                // Extract only numbers and dots
                const cleaned = val.replace(/[^\d.]/g, '');
                return parseFloat(cleaned) || 0;
            }
            return 0;
        };

        // Collect data for each client
        const tableData = targetClients.map(client => {
            const storedPlans = localStorage.getItem(`shapeup_client_plans_${client.id}`);
            let completed = 0;
            let skipped = 0;
            let totalVolumeSum = 0;

            if (storedPlans) {
                const plans = JSON.parse(storedPlans);
                plans.forEach(plan => {
                    (plan.history || []).forEach(h => {
                        const hDate = new Date(h.date);
                        if (hDate >= startDate && hDate <= endDate) {
                            const isSkipped = h.status === 'skipped' || (h.exercises || []).every(ex => ex.skipped);
                            if (isSkipped) skipped++;
                            else {
                                completed++;
                                totalVolumeSum += parseVolume(h.totalVol);
                            }
                        }
                    });
                });
            }

            const totalSessions = completed + skipped;
            const adherence = totalSessions > 0 ? Math.round((completed / totalSessions) * 100) : 0;

            return [
                client.name,
                client.status || 'Active',
                completed.toString(),
                skipped.toString(),
                `${adherence}%`,
                `${totalVolumeSum.toLocaleString()} kg`
            ];
        });

        autoTable(doc, {
            startY: 60,
            head: [['Client Name', 'Status', 'Completed', 'Skipped', 'Adherence', 'Total Volume']],
            body: tableData,
            headStyles: { fillColor: [37, 99, 235] },
            alternateRowStyles: { fillColor: [240, 245, 255] },
            margin: { top: 60 },
        });

        // Summary Statistics
        const finalY = doc.lastAutoTable.finalY + 10;
        const totalCompleted = targetClients.reduce((acc, c, idx) => acc + parseInt(tableData[idx][2]), 0);
        const totalSkipped = targetClients.reduce((acc, c, idx) => acc + parseInt(tableData[idx][3]), 0);
        const totalVolumeSum = tableData.reduce((acc, row) => acc + parseVolume(row[5]), 0);
        const avgAdherence = tableData.length > 0
            ? Math.round(tableData.reduce((acc, row) => acc + parseInt(row[4]), 0) / tableData.length)
            : 0;

        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Summary Statistics', 14, finalY);
        doc.setFontSize(10);
        doc.text(`Total Completed Sessions: ${totalCompleted}`, 14, finalY + 7);
        doc.text(`Total Skipped Sessions: ${totalSkipped}`, 14, finalY + 14);
        doc.text(`Total Volume (Roster): ${totalVolumeSum.toLocaleString()} kg`, 14, finalY + 21);
        doc.text(`Average Roster Adherence: ${avgAdherence}%`, 14, finalY + 28);
    };

    return (
        <div className="su-reports-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{t('reports.title')}</h1>
                    <p className="su-page-subtitle">{t('reports.subtitle')}</p>
                </div>
            </div>

            <div className="su-reports-grid su-mt-4">
                {/* Generator Configurator */}
                <Card className="su-reports-generator">
                    <div className="su-generator-header">
                        <FileText size={24} className="su-text-primary" />
                        <h2>{t('reports.generator.title')}</h2>
                    </div>

                    <div className="su-generator-form">
                        <div className="su-form-group">
                            <label className="su-form-label">{t('reports.form.type')}</label>
                            <div className="su-select-wrapper">
                                <select
                                    className="su-select su-full-width"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option value="performance">{t('reports.type.performance')}</option>
                                    <option value="billing">{t('reports.type.billing')}</option>
                                    <option value="client_history">{t('reports.type.history')}</option>
                                </select>
                                <ChevronDown size={16} className="su-select-icon" />
                            </div>
                        </div>

                        <div className="su-form-row">
                            <div className="su-form-group su-flex-1">
                                <label className="su-form-label"><Users size={14} /> {t('reports.form.scope')}</label>
                                <div className="su-select-wrapper">
                                    <select
                                        className="su-select su-full-width"
                                        value={targetScope}
                                        onChange={(e) => setTargetScope(e.target.value)}
                                        disabled={reportType === 'exercises'}
                                    >
                                        <option value="all">{t('reports.scope.all')} ({clients.length})</option>
                                        <option value="specific">{t('reports.scope.specific')}</option>
                                    </select>
                                    <ChevronDown size={16} className="su-select-icon" />
                                </div>
                            </div>

                            {targetScope === 'specific' && (
                                <div className="su-form-group su-flex-1">
                                    <label className="su-form-label">{t('reports.form.client')}</label>
                                    <div className="su-select-wrapper">
                                        <select
                                            className="su-select su-full-width"
                                            value={selectedClientId}
                                            onChange={(e) => setSelectedClientId(e.target.value)}
                                        >
                                            <option value="">{t('reports.form.client.placeholder')}</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="su-select-icon" />
                                    </div>
                                </div>
                            )}

                            <div className="su-form-group su-flex-1">
                                <label className="su-form-label"><Calendar size={14} /> {t('reports.form.range')}</label>
                                <div className="su-select-wrapper">
                                    <select
                                        className="su-select su-full-width"
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                    >
                                        <option value="last_30">{t('reports.range.30days')}</option>
                                        <option value="last_month">{t('reports.range.lastmonth')}</option>
                                        <option value="ytd">{t('reports.range.ytd')}</option>
                                        <option value="custom">{t('reports.range.custom')}</option>
                                    </select>
                                    <ChevronDown size={16} className="su-select-icon" />
                                </div>
                            </div>
                        </div>

                        {dateRange === 'custom' && (
                            <div className="su-form-row su-mt-4">
                                <div className="su-form-group su-flex-1">
                                    <label className="su-form-label">{t('reports.form.start')}</label>
                                    <input
                                        type="date"
                                        className="su-input su-full-width"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="su-form-group su-flex-1">
                                    <label className="su-form-label">{t('reports.form.end')}</label>
                                    <input
                                        type="date"
                                        className="su-input su-full-width"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {reportType === 'client_history' && targetScope !== 'specific' && (
                            <div className="su-warning-alert su-mt-4">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>{t('reports.warning.scope.title')}</strong>
                                    <p>{t('reports.warning.scope.desc')}</p>
                                </div>
                            </div>
                        )}

                        <div className="su-form-group">
                            <label className="su-form-label">{t('reports.form.format')}</label>
                            <div className="su-format-toggles">
                                {[
                                    { value: 'pdf', label: t('reports.format.pdf') },
                                    { value: 'csv', label: t('reports.format.csv') },
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
                            <Button
                                icon={isGenerating ? <Clock size={16} /> : <Plus size={16} />}
                                className="su-generate-btn"
                                onClick={handleGenerateReport}
                                disabled={
                                    isGenerating ||
                                    (targetScope === 'specific' && !selectedClientId) ||
                                    (dateRange === 'custom' && (!customStartDate || !customEndDate)) ||
                                    (reportType === 'client_history' && targetScope !== 'specific')
                                }
                            >
                                {isGenerating ? t('reports.btn.generating') : t('reports.btn.generate')}
                            </Button>
                            <span className="su-form-help">
                                {isGenerating ? t('reports.help.wait') : t('reports.help.ready')}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Report History */}
                <Card className="su-reports-history">
                    <div className="su-history-header">
                        <h2>{t('reports.history.title')}</h2>
                        <Button variant="outline" size="sm">{t('reports.history.view_all')}</Button>
                    </div>

                    <div className="su-history-table-wrapper">
                        <table className="su-history-table">
                            <thead>
                                <tr>
                                    <th>{t('reports.history.col.name')}</th>
                                    <th>{t('reports.history.col.type')}</th>
                                    <th>{t('reports.history.col.date')}</th>
                                    <th>{t('reports.history.col.status')}</th>
                                    <th>{t('reports.history.col.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportsHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="su-empty-history">
                                            {t('reports.history.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    reportsHistory.map((report) => (
                                        <tr key={report.id}>
                                            <td>
                                                <div className="su-report-name-cell">
                                                    <FileText size={16} className="su-text-muted" />
                                                    <span>{report.name}</span>
                                                </div>
                                            </td>
                                            <td><span className={`su-report-type-tag ${report.type}`}>{report.type}</span></td>
                                            <td>{report.date}</td>
                                            <td>
                                                <span className="su-status-badge completed">
                                                    <CheckCircle size={12} /> {t('reports.history.status.completed')}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="su-download-action-btn" onClick={() => alert('Download again feature coming soon')}>
                                                    <Download size={14} />
                                                    <span>{t('reports.history.btn.download')}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
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
