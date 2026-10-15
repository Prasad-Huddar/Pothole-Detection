import React from 'react';
import { MapPin, Video as VideoIcon, Image as ImgIcon, Clock, AlertTriangle } from 'lucide-react';
import { DEMO_ROAD_SOURCES } from '../utils/demoData';
import { formatDateTime, riskColor } from '../utils/helpers';

export const Monitoring: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Map placeholder */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Geospatial Road Map</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>GPS coordinates required for map visualization</div>
          </div>
          <span className="badge badge-neutral">Location Data Not Available</span>
        </div>
        <div style={{ height: 320, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          {/* Stylised map grid */}
          <div style={{ position: 'relative', width: 280, height: 180, opacity: 0.3 }}>
            {Array.from({ length: 6 }).map((_, r) => (
              <div key={r} style={{ position: 'absolute', left: 0, right: 0, top: r * 36, height: 1, background: 'var(--border-default)' }} />
            ))}
            {Array.from({ length: 8 }).map((_, c) => (
              <div key={c} style={{ position: 'absolute', top: 0, bottom: 0, left: c * 40, width: 1, background: 'var(--border-default)' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={24} color="var(--text-muted)" />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Location Data Available</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 360 }}>
              GPS coordinates or road location metadata are required to display pothole observations on a map.
              Attach location data to your analysis sources to enable this feature.
            </div>
          </div>
        </div>
      </div>

      {/* Road sources grid */}
      <div>
        <div className="section-title">Analyzed Road Sources</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {DEMO_ROAD_SOURCES.map((src) => (
            <div key={src.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    {src.type === 'video' ? <VideoIcon size={16} /> : <ImgIcon size={16} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{src.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{src.type}</div>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, background: src.riskLevel === 'High' ? 'rgba(239,68,68,0.12)' : src.riskLevel === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)', color: riskColor(src.riskScore) }}>
                  {src.riskLevel} Risk
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Unique', value: src.uniquePotholes, color: 'var(--text-primary)' },
                  { label: 'High', value: src.highSeverity, color: '#ef4444' },
                  { label: 'Medium', value: src.mediumSeverity, color: '#f59e0b' },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 7, padding: '8px 4px' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Risk bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                  <span>Risk Score</span>
                  <span style={{ color: riskColor(src.riskScore), fontWeight: 700 }}>{src.riskScore}/100</span>
                </div>
                <div className="progress-bar" style={{ height: 5 }}>
                  <div style={{ height: '100%', width: `${src.riskScore}%`, background: riskColor(src.riskScore), borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <Clock size={11} />
                Last analyzed: {formatDateTime(src.lastAnalyzed)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk summary */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Risk Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { level: 'High Risk', count: DEMO_ROAD_SOURCES.filter(s => s.riskLevel === 'High').length, color: '#ef4444', desc: 'Immediate inspection recommended' },
            { level: 'Medium Risk', count: DEMO_ROAD_SOURCES.filter(s => s.riskLevel === 'Medium').length, color: '#f59e0b', desc: 'Schedule inspection within 2–4 weeks' },
            { level: 'Low Risk', count: DEMO_ROAD_SOURCES.filter(s => s.riskLevel === 'Low').length, color: '#22c55e', desc: 'Include in routine maintenance cycle' },
          ].map((r) => (
            <div key={r.level} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, borderLeft: `3px solid ${r.color}` }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: r.color }}>{r.count}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{r.level} Sources</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
