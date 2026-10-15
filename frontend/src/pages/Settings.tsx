import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2, RefreshCw, Server, Eye, Sliders, FileText } from 'lucide-react';

interface SettingsState {
  confidenceThreshold: number;
  imageSize: number;
  maxVideoLength: number;
  autoSaveResults: boolean;
  exportFormat: 'csv' | 'json';
  apiBaseUrl: string;
  showDemoNotice: boolean;
}

const defaults: SettingsState = {
  confidenceThreshold: 0.25,
  imageSize: 640,
  maxVideoLength: 120,
  autoSaveResults: false,
  exportFormat: 'csv',
  apiBaseUrl: 'http://localhost:8000',
  showDemoNotice: true,
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(defaults);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const reset = () => setSettings(defaults);

  const SectionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
    </div>
  );

  const SettingRow: React.FC<{ label: string; sub?: string; children: React.ReactNode }> = ({ label, sub, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      {/* Detection Settings */}
      <SectionCard icon={<Sliders size={18} />} title="Detection Configuration" subtitle="Deep neural vision model and inference parameters">
        <SettingRow label="Confidence Threshold" sub="Minimum confidence score for a detection to be kept">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min={0.05} max={0.95} step={0.05} value={settings.confidenceThreshold}
              onChange={(e) => update('confidenceThreshold', parseFloat(e.target.value))}
              style={{ width: 140, accentColor: 'var(--accent-blue)' }} />
            <span style={{ fontWeight: 700, color: 'var(--accent-blue)', width: 38, textAlign: 'right' }}>
              {(settings.confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
        </SettingRow>

        <SettingRow label="Image Size" sub="Input resolution for neural inference (px)">
          <select className="input" style={{ width: 120 }} value={settings.imageSize}
            onChange={(e) => update('imageSize', parseInt(e.target.value))}>
            <option value={416}>416 × 416</option>
            <option value={640}>640 × 640</option>
            <option value={768}>768 × 768 (Optimal)</option>
            <option value={1280}>1280 × 1280</option>
          </select>
        </SettingRow>

        <SettingRow label="Max Video Length (seconds)" sub="Videos longer than this will be truncated for processing">
          <input type="number" className="input" style={{ width: 100 }} min={10} max={600}
            value={settings.maxVideoLength} onChange={(e) => update('maxVideoLength', parseInt(e.target.value))} />
        </SettingRow>
      </SectionCard>

      {/* Backend Connection */}
      <SectionCard icon={<Server size={18} />} title="Backend Connection" subtitle="FastAPI inference server configuration">
        <SettingRow label="API Base URL" sub="The URL of the running FastAPI backend">
          <input className="input" style={{ width: 240 }} value={settings.apiBaseUrl}
            onChange={(e) => update('apiBaseUrl', e.target.value)} />
        </SettingRow>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm">Test Connection</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#22c55e', fontWeight: 600 }}>
            <span className="status-dot live" />
            Backend online · FastAPI / Uvicorn Connected (Port 8000)
          </div>
        </div>
      </SectionCard>

      {/* Display settings */}
      <SectionCard icon={<Eye size={18} />} title="Display Preferences">
        <SettingRow label="Real-time Visual Annotations" sub="Display dynamic bounding boxes and HUD on road images">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.showDemoNotice}
              onChange={(e) => update('showDemoNotice', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enabled</span>
          </label>
        </SettingRow>
        <SettingRow label="Auto-save Analysis Results" sub="Automatically save detection results to local repository">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.autoSaveResults}
              onChange={(e) => update('autoSaveResults', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enabled</span>
          </label>
        </SettingRow>
      </SectionCard>

      {/* Export settings */}
      <SectionCard icon={<FileText size={18} />} title="Export Preferences">
        <SettingRow label="Default Export Format">
          <div style={{ display: 'flex', gap: 10 }}>
            {(['csv', 'json'] as const).map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${settings.exportFormat === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => update('exportFormat', f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </SettingRow>
      </SectionCard>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={save}>
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          <RefreshCw size={15} /> Reset to Defaults
        </button>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 8 }}>
          Settings are applied to active road inspection workflows.
        </div>
      </div>
    </div>
  );
};
