import { Severity, Priority } from '../types';

export const severityColor = (s: Severity) => {
  switch (s) {
    case 'High': return '#ef4444';
    case 'Medium': return '#f59e0b';
    case 'Low': return '#22c55e';
  }
};

export const severityBadgeClass = (s: Severity) => {
  switch (s) {
    case 'High': return 'badge badge-high';
    case 'Medium': return 'badge badge-medium';
    case 'Low': return 'badge badge-low';
  }
};

export const priorityBadgeClass = (p: Priority) => {
  switch (p) {
    case 'High Priority': return 'badge badge-high';
    case 'Medium Priority': return 'badge badge-medium';
    case 'Low Priority': return 'badge badge-low';
  }
};

export const riskColor = (score: number) => {
  if (score >= 70) return '#ef4444';
  if (score >= 40) return '#f59e0b';
  return '#22c55e';
};

export const riskLabel = (score: number) => {
  if (score >= 70) return 'High Risk';
  if (score >= 40) return 'Medium Risk';
  return 'Low Risk';
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
};

export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export const pct = (val: number, total: number) =>
  total === 0 ? 0 : Math.round((val / total) * 100);
