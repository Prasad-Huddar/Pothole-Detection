import React, { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

interface LiveSource {
  id: string;
  name: string;
  type: string;
  unique_potholes: number;
  high: number;
  medium: number;
  low: number;
  risk_score: number;
  risk_level: string;
  last_analyzed: string;
}

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState<{ csv?: boolean; pdf?: boolean }>({});

  const [stats, setStats] = useState({
    totalUniquePotholes: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    roadsRequiringAttention: 0,
    videosAnalyzed: 0,
    imagesAnalyzed: 0,
  });

  const [sources, setSources] = useState<LiveSource[]>([]);
  const [detections, setDetections] = useState<any[]>([]);

  const fetchLiveReportData = async () => {
    setLoading(true);
    try {
      const [statsRes, sourcesRes, detRes] = await Promise.allSettled([
        analyticsApi.getStats(),
        analyticsApi.getSources(),
        analyticsApi.getDetections(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        const d = statsRes.value.data;
        setStats({
          totalUniquePotholes: d.total_unique_potholes ?? 0,
          highSeverity: d.high_severity ?? 0,
          mediumSeverity: d.medium_severity ?? 0,
          lowSeverity: d.low_severity ?? 0,
          roadsRequiringAttention: d.roads_requiring_attention ?? 0,
          videosAnalyzed: d.videos_analyzed ?? 0,
          imagesAnalyzed: d.images_analyzed ?? 0,
        });
      }

      if (sourcesRes.status === 'fulfilled' && sourcesRes.value?.data?.sources) {
        setSources(sourcesRes.value.data.sources);
      }

      if (detRes.status === 'fulfilled' && detRes.value?.data?.detections) {
        setDetections(detRes.value.data.detections);
      }
    } catch (err) {
      console.error('Failed to load real-time report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveReportData();
  }, []);

  const handleCSV = () => {
    const headers = ['Unique ID', 'Tracking ID', 'Source Roadway', 'Severity', 'Confidence', 'Risk Score', 'Priority', 'Status', 'Timestamp'];
    const rows = detections.map((d) => [
      d.id,
      d.tracking_id ?? '',
      d.source ?? 'Inspected Road',
      d.severity,
      (Number(d.confidence) * 100).toFixed(1) + '%',
      d.risk_score,
      d.priority,
      d.status || 'Pending Review',
      d.timestamp,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `potholeiq_audit_detections_${new Date().toISOString().split('T')[0]}.csv`);

    setExported((p) => ({ ...p, csv: true }));
    setTimeout(() => setExported((p) => ({ ...p, csv: false })), 3000);
  };

  const handlePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const now = new Date().toLocaleString('en-GB');

    // Header
    doc.setFillColor(10, 14, 26);
    doc.rect(0, 0, w, 38, 'F');
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('POTHOLEIQ AI', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(139, 150, 176);
    doc.setFont('helvetica', 'normal');
    doc.text('Intelligent Autonomous Pothole Vision & Road Defect Audit', 14, 26);
    doc.setTextColor(240, 244, 255);
    doc.text(`Report generated: ${now}`, 14, 33);

    let y = 50;

    const sectionTitle = (title: string) => {
      doc.setFillColor(26, 34, 54);
      doc.rect(10, y - 5, w - 20, 12, 'F');
      doc.setTextColor(56, 189, 248);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(title, 14, y + 3);
      y += 14;
    };

    const row = (label: string, value: string) => {
      doc.setTextColor(139, 150, 176);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(label, 14, y);
      doc.setTextColor(240, 244, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, y);
      y += 7;
    };

    // Official notice
    doc.setFillColor(34, 197, 94, 0.15 * 255);
    doc.rect(10, y, w - 20, 10, 'F');
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(8.5);
    doc.text('✔  OFFICIAL ROAD INFRASTRUCTURE CONDITION ASSESSMENT REPORT', 14, y + 6);
    y += 16;

    sectionTitle('Real-Time Detection Summary');
    row('Total Unique Potholes', String(stats.totalUniquePotholes));
    row('High Severity Hazards', String(stats.highSeverity));
    row('Medium Severity Defects', String(stats.mediumSeverity));
    row('Low Severity Depressions', String(stats.lowSeverity));
    row('Roads / Sources Inspected', String(stats.roadsRequiringAttention));
    row('Videos Analyzed', String(stats.videosAnalyzed));
    row('Images Analyzed', String(stats.imagesAnalyzed));
    y += 4;

    sectionTitle('Severity Distribution');
    const total = stats.highSeverity + stats.mediumSeverity + stats.lowSeverity;
    if (total > 0) {
      row('High (%)', `${((stats.highSeverity / total) * 100).toFixed(1)}%`);
      row('Medium (%)', `${((stats.mediumSeverity / total) * 100).toFixed(1)}%`);
      row('Low (%)', `${((stats.lowSeverity / total) * 100).toFixed(1)}%`);
    } else {
      row('Status', 'No potholes detected currently.');
    }
    y += 4;

    sectionTitle('Active Analyzed Road Sources');
    if (sources.length > 0) {
      sources.slice(0, 6).forEach((src) => {
        row(src.name, `${src.unique_potholes} potholes — ${src.risk_level} Risk (Score: ${src.risk_score})`);
      });
    } else {
      row('Sources', 'No media sources analyzed yet.');
    }
    y += 4;

    sectionTitle('AI Vision Architecture');
    row('Vision Engine', 'PotholeIQ Deep Neural Vision Network (Active)');
    row('Tracking System', 'Real-Time Spatial Tracking (TRK-xxxx)');
    row('Severity Assessment', 'Area & Confidence Multi-Scale Weighting');

    // Footer
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setTextColor(74, 85, 104);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`POTHOLEIQ AI — Infrastructure Assessment — Page ${p} of ${pages}`, w / 2, 290, { align: 'center' });
    }

    doc.save(`potholeiq_assessment_${new Date().toISOString().split('T')[0]}.pdf`);
    setExported((p) => ({ ...p, pdf: true }));
    setTimeout(() => setExported((p) => ({ ...p, pdf: false })), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'var(--accent-blue-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)',
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Analysis Summary Report
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Comprehensive overview of all pothole detections, severity estimates, and maintenance priorities
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchLiveReportData} title="Refresh Live Data">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="btn btn-secondary" onClick={handleCSV}>
              {exported.csv ? <CheckCircle2 size={14} color="#22c55e" /> : <FileSpreadsheet size={14} />}
              {exported.csv ? 'Downloaded!' : 'Export CSV'}
            </button>
            <button className="btn btn-primary" onClick={handlePDF}>
              {exported.pdf ? <CheckCircle2 size={14} /> : <Download size={14} />}
              {exported.pdf ? 'Downloaded!' : 'Export PDF Report'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Unique Potholes', value: stats.totalUniquePotholes, color: 'var(--accent-blue)' },
            { label: 'High Severity', value: stats.highSeverity, color: '#ef4444' },
            { label: 'Medium Severity', value: stats.mediumSeverity, color: '#f59e0b' },
            { label: 'Low Severity', value: stats.lowSeverity, color: '#22c55e' },
            { label: 'Videos Analyzed', value: stats.videosAnalyzed, color: 'var(--text-primary)' },
            { label: 'Images Analyzed', value: stats.imagesAnalyzed, color: 'var(--text-primary)' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <Calendar size={13} />
          Report date: {formatDateTime(new Date().toISOString())} — Road Infrastructure Assessment
        </div>
      </div>

      {/* Road Sources table */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Analyzed Road Sources</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {sources.length} {sources.length === 1 ? 'Source' : 'Sources'} Recorded
          </span>
        </div>

        {sources.length === 0 ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              border: '1px dashed var(--border-default)',
            }}
          >
            <AlertCircle size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              No road media analyzed yet in this session
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 420, margin: '4px auto 16px' }}>
              Upload road imagery or video in Pothole Detection to generate live telemetry, risk assessments, and audit logs.
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/detection')}>
              Go to Pothole Detection
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Unique Potholes</th>
                  <th>High</th>
                  <th>Medium</th>
                  <th>Low</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Last Analyzed</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{s.type}</td>
                    <td style={{ fontWeight: 700 }}>{s.unique_potholes}</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{s.high}</td>
                    <td style={{ color: '#f59e0b', fontWeight: 600 }}>{s.medium}</td>
                    <td style={{ color: '#22c55e', fontWeight: 600 }}>{s.low}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: s.risk_score >= 70 ? '#ef4444' : s.risk_score >= 40 ? '#f59e0b' : '#22c55e',
                      }}
                    >
                      {s.risk_score}
                    </td>
                    <td>
                      <span className={`badge ${s.risk_level === 'High' ? 'badge-high' : s.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                        {s.risk_level}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDateTime(s.last_analyzed)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
