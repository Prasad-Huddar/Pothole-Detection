// Core application types

export type Severity = 'Low' | 'Medium' | 'High';
export type Priority = 'High Priority' | 'Medium Priority' | 'Low Priority';
export type ReviewStatus = 'Pending Review' | 'Under Review' | 'Reviewed' | 'Scheduled' | 'In Progress' | 'Completed' | 'Repaired';
export type ProcessingStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export interface Detection {
  id: string;
  trackingId: string | null;
  source: string;
  severity: Severity;
  confidence: number;
  riskScore: number;
  priority: Priority;
  timestamp: string;
  status: ReviewStatus;
  bbox?: [number, number, number, number]; // x1, y1, x2, y2
  area?: number;
  frameNumber?: number;
}

export interface VideoAnalysis {
  id: string;
  filename: string;
  status: ProcessingStatus;
  duration?: number;
  totalFrames?: number;
  processedFrames: number;
  fps?: number;
  totalDetections: number;
  uniquePotholes: number;
  startedAt?: string;
  completedAt?: string;
  outputPath?: string;
  errorMessage?: string;
  detections: Detection[];
}

export interface ImageAnalysis {
  id: string;
  filename: string;
  status: ProcessingStatus;
  detections: Detection[];
  processedImageUrl?: string;
  width?: number;
  height?: number;
  analyzedAt: string;
  totalDetections: number;
  isDemo: boolean;
}

export interface RoadSource {
  id: string;
  name: string;
  type: 'image' | 'video';
  uniquePotholes: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastAnalyzed: string;
  location?: { lat: number; lng: number };
}

export interface MaintenanceRecord {
  id: string;
  potholeId: string;
  trackingId: string | null;
  source: string;
  severity: Severity;
  riskScore: number;
  priority: Priority;
  reason: string;
  recommendedAction: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ModelInfo {
  connected: boolean;
  demoMode: boolean;
  name?: string;
  version?: string;
  weightsPath?: string;
  dataset: string;
  classes: string[];
  imageSize: number;
  confidenceThreshold: number;
  metrics?: {
    precision?: number;
    recall?: number;
    map50?: number;
    map5095?: number;
    inferenceSpeed?: number;
  };
}

export interface DashboardStats {
  totalUniquePotholes: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  roadsRequiringAttention: number;
  videosAnalyzed: number;
  imagesAnalyzed: number;
  isDemo: boolean;
}

export interface SeverityDataPoint {
  name: string;
  value: number;
  fill: string;
}

export interface TimeSeriesPoint {
  date: string;
  detections: number;
  unique: number;
}

export interface AppSettings {
  confidenceThreshold: number;
  imageSize: number;
  maxVideoLength: number;
  autoSaveResults: boolean;
  exportFormat: 'csv' | 'json';
  theme: 'dark';
  apiBaseUrl: string;
}
