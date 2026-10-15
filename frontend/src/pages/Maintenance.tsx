import React, { useState } from 'react';
import { Wrench, CheckCircle2, Clock, ArrowUpDown, Search, Filter, Eye, RefreshCw } from 'lucide-react';
import { DEMO_MAINTENANCE } from '../utils/demoData';
import { MaintenanceRecord, Priority, ReviewStatus } from '../types';
import { severityBadgeClass, riskColor, formatDateTime } from '../utils/helpers';
import { analyticsApi } from '../services/api';

export const Maintenance: React.FC = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>(DEMO_MAINTENANCE);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<'riskScore' | 'priority'>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const updateStatus = async (id: string, newStatus: ReviewStatus) => {
    setRecords((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r)
    );
    try {
      await analyticsApi.updateStatus(id, newStatus);
    } catch {
      // Keep optimistic update
    }
  };

  const priorityOrder: Record<Priority, number> = { 'High Priority': 3, 'Medium Priority': 2, 'Low Priority': 1 };

  const filtered = records
    .filter((r) => {
      const q = search.toLowerCase();
      return !q || r.potholeId.toLowerCase().includes(q) || r.source.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
    })
    .filter((r) => priorityFilter === 'All' || r.priority === priorityFilter)
    .filter((r) => statusFilter === 'All' || r.status === statusFilter)
    .sort((a, b) => {
      const av = sortKey === 'riskScore' ? a.riskScore : priorityOrder[a.priority];
      const bv = sortKey === 'riskScore' ? b.riskScore : priorityOrder[b.priority];
      return sortAsc ? av - bv : bv - av;
    });

  const groups: Record<Priority, MaintenanceRecord[]> = {
    'High Priority': filtered.filter((r) => r.priority === 'High Priority'),
    'Medium Priority': filtered.filter((r) => r.priority === 'Medium Priority'),
    'Low Priority': filtered.filter((r) => r.priority === 'Low Priority'),
  };

  const selectedRecord = selectedId ? records.find((r) => r.id === selectedId) : null;

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Main list */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header + filters */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input" style={{ paddingLeft: 32 }} placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Filter size={14} color="var(--text-muted)" />
            <select className="input" style={{ width: 150 }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}>
              <option value="All">All Priority</option>
              <option value="High Priority">High Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="Low Priority">Low Priority</option>
            </select>
            <select className="input" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="All">All Status</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => sort('riskScore' as any)}>
              <ArrowUpDown size={13} /> Sort by Risk
            </button>
          </div>
        </div>

        {/* Priority groups */}
        {(['High Priority', 'Medium Priority', 'Low Priority'] as Priority[]).map((prio) => {
          const groupRecords = groups[prio];
          if (groupRecords.length === 0 && priorityFilter !== 'All') return null;
          const color = prio === 'High Priority' ? '#ef4444' : prio === 'Medium Priority' ? '#f59e0b' : '#22c55e';
          return (
            <div key={prio}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prio}</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{groupRecords.length}</span>
              </div>
              {groupRecords.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No records in this priority group
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {groupRecords.map((r) => (
                    <div
                      key={r.id}
                      className="card"
                      style={{ padding: 16, cursor: 'pointer', borderLeft: selectedId === r.id ? `3px solid ${color}` : '3px solid transparent', transition: 'all 0.18s' }}
                      onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span className="mono" style={{ fontWeight: 600 }}>{r.potholeId}</span>
                            {r.trackingId && <span className="mono badge badge-info" style={{ fontSize: '0.7rem' }}>{r.trackingId}</span>}
                            <span className={severityBadgeClass(r.severity)}>{r.severity}</span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{r.source}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.reason}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: riskColor(r.riskScore) }}>{r.riskScore}</div>
                          <span className={`badge ${r.status === 'Reviewed' || r.status === 'Completed' ? 'badge-low' : r.status === 'Scheduled' ? 'badge-info' : 'badge-neutral'}`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                      {/* Quick actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedId(r.id)}>
                          <Eye size={12} /> Details
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(r.id, 'Under Review')}>
                          <RefreshCw size={12} /> Mark Under Review
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(r.id, 'Reviewed')}>
                          <CheckCircle2 size={12} /> Mark Reviewed
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(r.id, 'Scheduled')}>
                          <Clock size={12} /> Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedRecord && (
        <div className="card" style={{ width: 300, flexShrink: 0, padding: 20, alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 16 }}>Record Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Pothole ID', value: selectedRecord.potholeId, mono: true },
              { label: 'Tracking ID', value: selectedRecord.trackingId ?? 'N/A (image)', mono: true },
              { label: 'Source', value: selectedRecord.source },
              { label: 'Severity', value: selectedRecord.severity },
              { label: 'Risk Score', value: `${selectedRecord.riskScore}/100` },
              { label: 'Priority', value: selectedRecord.priority },
              { label: 'Status', value: selectedRecord.status },
              { label: 'Created', value: formatDateTime(selectedRecord.createdAt) },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: f.mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{f.value}</div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Reason</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedRecord.reason}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Recommended Action</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>{selectedRecord.recommendedAction}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['Pending Review', 'Under Review', 'Reviewed', 'Scheduled', 'Completed'] as ReviewStatus[]).map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${selectedRecord.status === s ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => updateStatus(selectedRecord.id, s)}
                >
                  {selectedRecord.status === s && <CheckCircle2 size={12} />}
                  {s}
                </button>
              ))}
            </div>
            <div style={{ padding: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 7, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Wrench size={12} style={{ marginRight: 5, display: 'inline', color: '#22c55e' }} />
              Status updates synchronize in real-time with road maintenance work-orders.
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function sort(key: 'riskScore' | 'priority') {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  }
};
