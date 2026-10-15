import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Filter, ArrowUpDown, RefreshCw, AlertCircle } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { severityBadgeClass, riskColor, formatDateTime } from '../utils/helpers';
import { Detection, Severity } from '../types';
import { useNavigate } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.fill ?? p.color, fontSize: '0.8125rem' }}>
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

type SortKey = 'riskScore' | 'confidence' | 'severity' | 'timestamp';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDetections();
      if (res.data?.detections && Array.isArray(res.data.detections)) {
        setDetections(
          res.data.detections.map((d: any) => ({
            id: d.id,
            trackingId: d.tracking_id || null,
            source: d.source || 'Road Inspection Stream',
            severity: d.severity || 'Medium',
            confidence: Number(d.confidence) || 0.8,
            riskScore: Number(d.risk_score) || 60,
            priority: d.priority || 'Medium Priority',
            timestamp: d.timestamp || new Date().toISOString(),
            status: d.status || 'Pending Review',
            area: d.area,
          }))
        );
      } else {
        setDetections([]);
      }
    } catch (err) {
      console.warn('Analytics live sync notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const handleReset = () => fetchLiveData();
    window.addEventListener('roadvision:reset', handleReset);
    return () => window.removeEventListener('roadvision:reset', handleReset);
  }, []);

  const sources = ['All', ...Array.from(new Set(detections.map((d) => d.source)))];

  const highCount = detections.filter((d) => d.severity === 'High').length;
  const mediumCount = detections.filter((d) => d.severity === 'Medium').length;
  const lowCount = detections.filter((d) => d.severity === 'Low').length;
  const avgRisk = detections.length > 0
    ? (detections.reduce((acc, d) => acc + d.riskScore, 0) / detections.length).toFixed(1)
    : '0';

  const severityPie = [
    { name: 'High', value: highCount, fill: '#ef4444' },
    { name: 'Medium', value: mediumCount, fill: '#f59e0b' },
    { name: 'Low', value: lowCount, fill: '#22c55e' },
  ].filter((item) => item.value > 0 || detections.length === 0);

  // Group by source for stacked bar chart
  const sourceGroups = detections.reduce((acc: Record<string, { high: number; medium: number; low: number }>, d) => {
    const s = d.source.length > 14 ? d.source.slice(0, 12) + '...' : d.source;
    if (!acc[s]) acc[s] = { high: 0, medium: 0, low: 0 };
    if (d.severity === 'High') acc[s].high += 1;
    else if (d.severity === 'Medium') acc[s].medium += 1;
    else acc[s].low += 1;
    return acc;
  }, {});

  const sourceBarData = Object.entries(sourceGroups).map(([name, counts]) => ({
    name,
    ...counts,
  }));

  const avgConfidence = detections.length > 0
    ? Math.round((detections.reduce((acc, d) => acc + d.confidence, 0) / detections.length) * 100)
    : 85;

  const riskRadarData = [
    { metric: 'Detection Area', value: Math.min(100, Math.round(Number(avgRisk) * 1.05)) },
    { metric: 'AI Confidence', value: avgConfidence },
    { metric: 'Track Stability', value: Math.max(60, Math.min(95, 70 + detections.length * 2)) },
    { metric: 'Severity Score', value: Math.round(Number(avgRisk)) },
    { metric: 'Road Density', value: Math.min(100, detections.length * 12) },
  ];

  const filtered = detections
    .filter((d) => (severityFilter === 'All' || d.severity === severityFilter))
    .filter((d) => (sourceFilter === 'All' || d.source === sourceFilter))
    .sort((a, b) => {
      let av: any = a[sortKey], bv: any = b[sortKey];
      if (sortKey === 'severity') {
        const order: Record<Severity, number> = { High: 3, Medium: 2, Low: 1 };
        av = order[a.severity]; bv = order[b.severity];
      }
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const sort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={fetchLiveData} title="Refresh Live Analytics">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Live Telemetry
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {[
          { label: 'High Severity', value: highCount, sub: 'Immediate action required', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Medium Severity', value: mediumCount, sub: 'Schedule repair soon', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Low Severity', value: lowCount, sub: 'Routine maintenance', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Avg. Risk Score', value: avgRisk, sub: 'Calculated across session', color: 'var(--accent-blue)', bg: 'var(--accent-blue-dim)' },
        ].map((s) => (
          <div key={s.label} className="kpi-card">
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16 }}>
        {/* Severity Pie */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Severity Distribution</div>
          {detections.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No detections recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityPie} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value">
                  {severityPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>} iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source stacked bar */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Severity by Source</div>
          {sourceBarData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No road sources analyzed yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sourceBarData} barSize={16}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>} iconSize={8} />
                <Bar dataKey="high" name="High" stackId="a" fill="#ef4444" fillOpacity={0.85} />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="#f59e0b" fillOpacity={0.85} />
                <Bar dataKey="low" name="Low" stackId="a" fill="#22c55e" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Risk Radar */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Risk Factor Profile</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={riskRadarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Radar name="Risk Factors" dataKey="value" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters + table */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Detailed Results</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Showing {filtered.length} of {detections.length} observations — live inspection stream
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select className="input" style={{ width: 130 }} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as any)}>
              <option value="All">All Severity</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="input" style={{ width: 180 }} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              {sources.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              border: '1px dashed var(--border-default)',
            }}
          >
            <AlertCircle size={26} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              No potholes recorded in current filter
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 400, margin: '4px auto 14px' }}>
              Upload road imagery in Pothole Detection to generate live telemetry points.
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
                  <th>Track ID</th>
                  <th>Unique ID</th>
                  <th>Source</th>
                  <th onClick={() => sort('severity')} style={{ cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Severity <ArrowUpDown size={11} /></span>
                  </th>
                  <th onClick={() => sort('confidence')} style={{ cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Confidence <ArrowUpDown size={11} /></span>
                  </th>
                  <th onClick={() => sort('riskScore')} style={{ cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Risk Score <ArrowUpDown size={11} /></span>
                  </th>
                  <th>Priority</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => (
                  <tr key={d.id}>
                    <td><span className="mono" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{d.trackingId || `TRK-${String(idx + 1).padStart(4, '0')}`}</span></td>
                    <td><span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.id}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.source}</td>
                    <td><span className={severityBadgeClass(d.severity)}>{d.severity}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-bar" style={{ width: 56 }}>
                          <div className="progress-bar-fill" style={{ width: `${d.confidence * 100}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{(d.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', border: `2.5px solid ${riskColor(d.riskScore)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: riskColor(d.riskScore) }}>
                          {d.riskScore}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${d.priority === 'High Priority' ? 'badge-high' : d.priority === 'Medium Priority' ? 'badge-medium' : 'badge-low'}`}>
                        {d.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDateTime(d.timestamp)}</td>
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
