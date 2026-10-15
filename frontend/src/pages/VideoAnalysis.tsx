import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Video as VideoIcon, Upload, Play, Clock, Film, Layers,
  CircleDot, CheckCircle2, AlertCircle, Download, Info, Cpu, Activity,
  Search, Crosshair, ShieldAlert, Sparkles, Filter, ChevronRight, RefreshCw
} from 'lucide-react';
import { Detection } from '../types';
import { severityBadgeClass, riskColor, formatDuration } from '../utils/helpers';
import { videoApi } from '../services/api';

interface VideoJob {
  jobId: string;
  filename: string;
  duration?: number;
  totalFrames?: number;
  processedFrames: number;
  fps?: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalDetections: number;
  uniquePotholes: number;
  errorMessage?: string;
  detections: Detection[];
  processedVideoUrl?: string;
  isDemo: boolean;
}

const StatusBadge: React.FC<{ status: VideoJob['status'] }> = ({ status }) => {
  const cfg = {
    queued: { bg: 'rgba(56,189,248,0.1)', color: 'var(--accent-blue)', label: 'Queued' },
    processing: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Processing' },
    completed: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'Completed' },
    failed: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Failed' },
  }[status];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
};

export const VideoAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [job, setJob] = useState<VideoJob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.20);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Initializing...');
  const [viewMode, setViewMode] = useState<'annotated' | 'original'>('annotated');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPotholeId, setSelectedPotholeId] = useState<string | null>(null);
  const [slowMotion, setSlowMotion] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);

  const checkBackend = useCallback(async () => {
    setCheckingBackend(true);
    try {
      const res = await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(3000) });
      setBackendConnected(res.ok);
    } catch {
      setBackendConnected(false);
    } finally {
      setCheckingBackend(false);
    }
  }, []);

  useEffect(() => { checkBackend(); }, [checkBackend]);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = rate;
    }
  };

  const handleFile = (f: File) => {
    const allowed = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'];
    if (!allowed.some((t) => f.type === t || f.name.match(/\.(mp4|avi|mov|mkv|webm)$/i))) {
      setError('Please upload a valid video file (MP4, AVI, MOV, MKV, WEBM).');
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError('File size exceeds 500 MB limit.');
      return;
    }
    setError(null);
    setFile(f);
    setJob(null);
    setProgress(0);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgress(15);
    setCurrentStage('Uploading video & extracting frames...');

    // Progress tick simulator while server processes
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) {
          setCurrentStage('Running YOLO11 multi-scale feature detection...');
          return prev + 6;
        } else if (prev < 70) {
          setCurrentStage('Applying ByteTrack multi-frame object tracking...');
          return prev + 4;
        } else if (prev < 90) {
          setCurrentStage('Encoding H.264 video with HUD reticles...');
          return prev + 2;
        }
        return prev;
      });
    }, 900);

    try {
      const response = await videoApi.analyzeVideo(file, confidence, slowMotion);
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStage('Analysis complete!');

      const data = response.data;
      const normalizedDetections: Detection[] = (data.detections || []).map((d: any) => ({
        id: d.id,
        trackingId: d.tracking_id || d.id,
        source: file.name,
        severity: d.severity,
        confidence: Number(d.confidence),
        riskScore: Number(d.risk_score),
        priority: d.priority,
        timestamp: d.timestamp || new Date().toISOString(),
        status: 'Pending Review',
        frameNumber: d.frame_number ?? 1,
        area: d.area ?? 5000,
        bbox: d.bbox ? [d.bbox.x1, d.bbox.y1, d.bbox.x2, d.bbox.y2] : [100, 100, 200, 200],
      }));

      const fps = data.fps || (slowMotion ? 15 : 25);
      const totalFrames = data.total_frames || data.processed_frames || 100;
      const duration = totalFrames > 0 ? totalFrames / fps : 10;

      setJob({
        jobId: data.job_id,
        filename: file.name,
        duration,
        totalFrames,
        processedFrames: data.processed_frames || totalFrames,
        fps,
        status: 'completed',
        totalDetections: data.total_detections || normalizedDetections.length,
        uniquePotholes: data.unique_potholes || normalizedDetections.length,
        detections: normalizedDetections,
        processedVideoUrl: data.processed_video_url || undefined,
        isDemo: false,
      });

      setViewMode('annotated');
      setProcessing(false);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProcessing(false);
      console.error('Video analysis error:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to analyze video. Please try again.';
      setError(`Video processing error: ${msg}`);
    }
  };

  const handleDownloadVideo = async () => {
    if (!job?.processedVideoUrl) {
      setError('Processed video is not available for download.');
      return;
    }
    try {
      // Fetch the video as blob to force download (avoids browser just playing it)
      const response = await fetch(job.processedVideoUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${file?.name?.replace(/\.[^/.]+$/, '') || 'road'}_bytetrack_analyzed.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      // Fallback: open in new tab for manual download
      window.open(job.processedVideoUrl, '_blank');
    }
  };

  const seekToPothole = (frameNumber?: number) => {
    if (!frameNumber || !videoPlayerRef.current) return;
    const vid = videoPlayerRef.current;
    const fps = job?.fps || (slowMotion ? 15 : 25);
    const timeInSeconds = Math.max(0, (frameNumber - 1) / fps);

    const doSeek = () => {
      vid.currentTime = timeInSeconds;
    };

    const onSeeked = () => {
      vid.playbackRate = 0.5;
      setPlaybackRate(0.5);
      vid.play().catch(() => {});
      vid.removeEventListener('seeked', onSeeked);
    };

    vid.addEventListener('seeked', onSeeked);

    // If video is not ready, wait for it; otherwise seek immediately
    if (vid.readyState >= 2) {
      doSeek();
    } else {
      const onReady = () => {
        doSeek();
        vid.removeEventListener('loadeddata', onReady);
      };
      vid.addEventListener('loadeddata', onReady);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setJob(null);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSelectedPotholeId(null);
  };

  // Filter side panel detections — also apply confidence threshold client-side
  // so the slider works interactively after analysis is complete
  const filteredDetections = (job?.detections || []).filter((d) => {
    const matchesConfidence = d.confidence >= confidence;
    const matchesSeverity = severityFilter === 'all' || d.severity === severityFilter;
    const matchesSearch =
      !searchQuery ||
      (d.trackingId && d.trackingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesConfidence && matchesSeverity && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Engine Banner */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', flexShrink: 0 }}>
          <VideoIcon size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            Video Analysis for Pothole Detection
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Detects all craters and water puddles across continuous road footage. Tracks physical defects across frames to eliminate double counting.
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: backendConnected ? '#22c55e' : '#ef4444',
              boxShadow: backendConnected ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '0.8rem', color: backendConnected ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
            {backendConnected ? 'Active' : 'Server Offline (Port 8000)'}
          </span>
          <button
            className="btn btn-ghost btn-xs"
            onClick={checkBackend}
            disabled={checkingBackend}
            title="Check server status"
            style={{ padding: '3px 6px', color: 'var(--accent-blue)' }}
          >
            <RefreshCw size={12} className={checkingBackend ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Dual-Column Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: job ? '1.25fr 0.95fr' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Left Column: Upload, Controls & Video Player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!file ? (
            <div
              className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
              style={{ minHeight: 260 }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: '1rem' }}>
                Drop road video footage here
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                or click to browse from your device
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                MP4 · AVI · MOV · MKV · WEBM · Max 500 MB
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Video Header with View Mode Switch */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Play size={16} color="var(--accent-blue)" />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    {job?.processedVideoUrl ? (viewMode === 'annotated' ? 'ByteTrack HUD Analyzed Video' : 'Original Video Footage') : 'Video Preview'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Interactive Playback Speed Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-base)', padding: '2px 4px', borderRadius: 6, border: '1px solid var(--border-subtle)', gap: 2 }}>
                    <Clock size={12} color="var(--accent-blue)" style={{ marginLeft: 3, marginRight: 2 }} />
                    {[0.25, 0.5, 0.75, 1.0, 1.25].map((rate) => (
                      <button
                        key={rate}
                        className={`btn btn-sm ${playbackRate === rate ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => changePlaybackRate(rate)}
                        style={{ padding: '2px 5px', fontSize: '0.72rem', fontWeight: 600, height: 22, minWidth: 28 }}
                        title={`Set video playback speed to ${rate}x`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {job?.processedVideoUrl && (
                    <div style={{ display: 'flex', background: 'var(--bg-base)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                      <button
                        className={`btn btn-sm ${viewMode === 'annotated' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('annotated')}
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Sparkles size={12} /> Annotated
                      </button>
                      <button
                        className={`btn btn-sm ${viewMode === 'original' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('original')}
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Original
                      </button>
                    </div>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={reset} disabled={processing} style={{ fontSize: '0.75rem' }}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Video Player Display */}
              <div style={{ position: 'relative', background: '#05070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                  ref={videoPlayerRef}
                  key={viewMode === 'annotated' && job?.processedVideoUrl ? job.processedVideoUrl : preview!}
                  src={viewMode === 'annotated' && job?.processedVideoUrl ? job.processedVideoUrl : preview!}
                  controls
                  playsInline
                  style={{ width: '100%', maxHeight: 420, display: 'block', background: '#000' }}
                />
              </div>

              {/* Video Meta & Download Bar */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  {job && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(56,189,248,0.12)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                      Playback: {playbackRate}x
                    </span>
                  )}
                </div>

                {job?.processedVideoUrl && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleDownloadVideo}
                    title="Download Analyzed MP4 with HUD"
                    style={{ gap: 6, padding: '7px 14px' }}
                  >
                    <Download size={14} /> Download Analyzed Video
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Configuration Card */}
          <div className="card" style={{ padding: 16 }}>
            {/* Slow-Motion Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: slowMotion ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: slowMotion ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Slow-Motion Review (0.5x Speed)
                    <span style={{ fontSize: '0.7rem', background: slowMotion ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)', color: slowMotion ? '#22c55e' : 'var(--text-muted)', padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>
                      {slowMotion ? 'Recommended' : '1.0x Normal'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Slows fast dashcam footage by 50% so rapid craters and road defects can be visually verified without skipping.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSlowMotion(!slowMotion)}
                disabled={processing}
                style={{
                  background: slowMotion ? 'var(--accent-blue)' : 'var(--bg-base)',
                  color: slowMotion ? '#0a0e1a' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: slowMotion ? 'var(--accent-blue)' : 'var(--border-subtle)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: slowMotion ? '#0a0e1a' : 'var(--text-muted)' }} />
                {slowMotion ? '0.5x Active' : '1.0x Realtime'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} color="var(--accent-blue)" />
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Confidence Threshold</label>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)', padding: '2px 8px', borderRadius: 6, fontSize: '0.85rem' }}>
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.12}
              max={0.60}
              step={0.02}
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              disabled={processing}
              style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#ef4444', fontSize: '0.875rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Progress Indicator */}
          {processing && (
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Processing Video...</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-blue)', fontWeight: 800 }}>{progress}%</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                {currentStage}
              </div>
            </div>
          )}

          {!job && (
            <button
              className="btn btn-primary"
              disabled={!file || processing}
              onClick={analyze}
              style={{ justifyContent: 'center', padding: '12px 24px', fontSize: '0.9375rem', fontWeight: 700 }}
            >
              {processing ? (
                <><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0a0e1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing Video with ByteTrack...</>
              ) : (
                <><Cpu size={17} /> Start Video Analysis & Tracking</>
              )}
            </button>
          )}

          {/* Video Telemetry KPI Cards */}
          {job && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Unique Potholes', value: job.uniquePotholes, color: '#22c55e', note: 'ByteTrack IDs' },
                { label: 'High Risk Hazards', value: job.detections.filter((d) => d.severity === 'High').length, color: '#ef4444', note: 'Immediate action' },
                { label: 'Frame Detections', value: job.totalDetections, color: 'var(--accent-blue)', note: 'All instances' },
                { label: 'Total Frames', value: job.totalFrames ?? job.processedFrames, color: 'var(--text-primary)', note: `${(job.duration || 0).toFixed(1)}s footage` },
              ].map((item) => (
                <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color, marginTop: 4 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {item.note}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Detected Potholes Side Panel */}
        {job ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 720 }}>
            {/* Side Panel Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={17} color="var(--accent-blue)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Detected Road Hazards</span>
                </div>
                <span className="badge badge-low" style={{ fontWeight: 700 }}>
                  {filteredDetections.length} of {(job.detections || []).filter(d => d.confidence >= confidence).length} Potholes
                </span>
              </div>

              {/* Severity Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {(['all', 'High', 'Medium', 'Low'] as const).map((sev) => {
                  const count = sev === 'all' ? job.detections.length : job.detections.filter((d) => d.severity === sev).length;
                  const isActive = severityFilter === sev;
                  return (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: isActive ? 'var(--accent-blue)' : 'var(--border-subtle)',
                        background: isActive ? 'var(--accent-blue-dim)' : 'transparent',
                        color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sev === 'all' ? 'All' : sev} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter by Track ID (#TRK-0001)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px 6px 32px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                  }}
                />
              </div>
            </div>

            {/* Scrollable Pothole List */}
            <div style={{ overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {filteredDetections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No potholes found matching current filters.
                </div>
              ) : (
                filteredDetections.map((d) => {
                  const isSelected = selectedPotholeId === d.id;
                  const sevColor = d.severity === 'High' ? '#ef4444' : d.severity === 'Medium' ? '#f59e0b' : '#22c55e';

                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedPotholeId(d.id);
                        seekToPothole(d.frameNumber);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: isSelected ? `1.5px solid ${sevColor}` : '1px solid var(--border-subtle)',
                        background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-base)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {/* Top Row: Track ID & Severity */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                            {d.trackingId || d.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Frame #{d.frameNumber ?? 1}
                          </span>
                        </div>
                        <span className={severityBadgeClass(d.severity)} style={{ fontSize: '0.72rem' }}>
                          {d.severity}
                        </span>
                      </div>

                      {/* Middle Row: Risk Score & Priority */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 3 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Risk Score</span>
                          <span style={{ fontWeight: 700, color: riskColor(d.riskScore) }}>{d.riskScore} / 100</span>
                        </div>
                        <div className="progress-bar" style={{ height: 5 }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${d.riskScore}%`,
                              background: riskColor(d.riskScore),
                            }}
                          />
                        </div>
                      </div>

                      {/* Bottom Row: Metrics & Seek action */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span>Conf: <strong>{(d.confidence * 100).toFixed(0)}%</strong></span>
                          <span>Area: <strong>{d.area ? `${d.area.toLocaleString()} px²` : '—'}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPotholeId(d.id);
                            seekToPothole(d.frameNumber);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 3,
                            color: 'var(--accent-blue)', fontWeight: 600,
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', padding: '2px 4px', borderRadius: 4,
                          }}
                        >
                          <Crosshair size={12} /> Jump to Frame
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          !processing && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 320 }}>
              <div className="empty-state" style={{ flex: 1 }}>
                <div className="empty-state-icon"><Activity size={24} color="var(--accent-blue)" /></div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Awaiting Video Analysis</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 320 }}>
                  Upload a roadway video and click "Start Video Analysis" to view tracked pothole hazards and ByteTrack telemetry in real time.
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
