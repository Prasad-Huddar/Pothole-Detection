import { Detection, DashboardStats, MaintenanceRecord, RoadSource, ModelInfo, TimeSeriesPoint } from '../types';

export const DEMO_DETECTIONS: Detection[] = [
  { id: 'PH-001', trackingId: 'TRK-042', source: 'Road_Segment_A.mp4', severity: 'High', confidence: 0.94, riskScore: 87, priority: 'High Priority', timestamp: '2026-10-11T08:23:14Z', status: 'Pending Review', area: 3840, frameNumber: 142 },
  { id: 'PH-002', trackingId: 'TRK-037', source: 'Road_Segment_A.mp4', severity: 'High', confidence: 0.91, riskScore: 82, priority: 'High Priority', timestamp: '2026-10-11T08:23:19Z', status: 'Under Review', area: 2960, frameNumber: 208 },
  { id: 'PH-003', trackingId: 'TRK-055', source: 'Road_Segment_B.mp4', severity: 'Medium', confidence: 0.87, riskScore: 61, priority: 'Medium Priority', timestamp: '2026-10-11T10:41:07Z', status: 'Pending Review', area: 1480, frameNumber: 76 },
  { id: 'PH-004', trackingId: 'TRK-018', source: 'Highway_Survey.mp4', severity: 'Low', confidence: 0.79, riskScore: 28, priority: 'Low Priority', timestamp: '2026-10-11T11:05:32Z', status: 'Reviewed', area: 640, frameNumber: 312 },
  { id: 'PH-005', trackingId: null, source: 'Pothole_Image_01.jpg', severity: 'High', confidence: 0.96, riskScore: 91, priority: 'High Priority', timestamp: '2026-10-11T13:22:45Z', status: 'Pending Review', area: 5120 },
  { id: 'PH-006', trackingId: 'TRK-063', source: 'Road_Segment_B.mp4', severity: 'Medium', confidence: 0.83, riskScore: 55, priority: 'Medium Priority', timestamp: '2026-10-11T10:41:22Z', status: 'Pending Review', area: 1240, frameNumber: 184 },
  { id: 'PH-007', trackingId: 'TRK-071', source: 'City_Center_Patrol.mp4', severity: 'Low', confidence: 0.76, riskScore: 22, priority: 'Low Priority', timestamp: '2026-10-12T07:14:09Z', status: 'Reviewed', area: 520, frameNumber: 89 },
  { id: 'PH-008', trackingId: 'TRK-079', source: 'City_Center_Patrol.mp4', severity: 'Medium', confidence: 0.85, riskScore: 58, priority: 'Medium Priority', timestamp: '2026-10-12T07:14:35Z', status: 'Scheduled', area: 1680, frameNumber: 247 },
  { id: 'PH-009', trackingId: null, source: 'Pothole_Image_02.jpg', severity: 'Low', confidence: 0.81, riskScore: 31, priority: 'Low Priority', timestamp: '2026-10-12T09:33:11Z', status: 'Reviewed', area: 720 },
  { id: 'PH-010', trackingId: 'TRK-088', source: 'Highway_Survey.mp4', severity: 'High', confidence: 0.93, riskScore: 84, priority: 'High Priority', timestamp: '2026-10-11T11:06:18Z', status: 'Pending Review', area: 4200, frameNumber: 441 },
  { id: 'PH-011', trackingId: 'TRK-091', source: 'Road_Segment_A.mp4', severity: 'Medium', confidence: 0.88, riskScore: 63, priority: 'Medium Priority', timestamp: '2026-10-11T08:24:02Z', status: 'Under Review', area: 1920, frameNumber: 356 },
  { id: 'PH-012', trackingId: null, source: 'Pothole_Image_03.jpg', severity: 'High', confidence: 0.97, riskScore: 93, priority: 'High Priority', timestamp: '2026-10-12T11:15:00Z', status: 'Pending Review', area: 6400 },
];

export const DEMO_STATS: DashboardStats = {
  totalUniquePotholes: 127,
  highSeverity: 38,
  mediumSeverity: 54,
  lowSeverity: 35,
  roadsRequiringAttention: 6,
  videosAnalyzed: 4,
  imagesAnalyzed: 3,
  isDemo: true,
};

export const DEMO_ROAD_SOURCES: RoadSource[] = [
  { id: 'RS-001', name: 'Road Segment A', type: 'video', uniquePotholes: 34, highSeverity: 12, mediumSeverity: 15, lowSeverity: 7, riskScore: 78, riskLevel: 'High', lastAnalyzed: '2026-10-11T08:30:00Z' },
  { id: 'RS-002', name: 'Road Segment B', type: 'video', uniquePotholes: 28, highSeverity: 6, mediumSeverity: 14, lowSeverity: 8, riskScore: 61, riskLevel: 'Medium', lastAnalyzed: '2026-10-11T10:50:00Z' },
  { id: 'RS-003', name: 'Highway Survey', type: 'video', uniquePotholes: 41, highSeverity: 17, mediumSeverity: 18, lowSeverity: 6, riskScore: 82, riskLevel: 'High', lastAnalyzed: '2026-10-11T11:15:00Z' },
  { id: 'RS-004', name: 'City Center Patrol', type: 'video', uniquePotholes: 14, highSeverity: 2, mediumSeverity: 7, lowSeverity: 5, riskScore: 45, riskLevel: 'Medium', lastAnalyzed: '2026-10-12T07:20:00Z' },
  { id: 'RS-005', name: 'Pothole Image 01', type: 'image', uniquePotholes: 3, highSeverity: 2, mediumSeverity: 1, lowSeverity: 0, riskScore: 88, riskLevel: 'High', lastAnalyzed: '2026-10-11T13:25:00Z' },
  { id: 'RS-006', name: 'Pothole Image 02', type: 'image', uniquePotholes: 4, highSeverity: 0, mediumSeverity: 2, lowSeverity: 2, riskScore: 34, riskLevel: 'Low', lastAnalyzed: '2026-10-12T09:35:00Z' },
  { id: 'RS-007', name: 'Pothole Image 03', type: 'image', uniquePotholes: 3, highSeverity: 3, mediumSeverity: 0, lowSeverity: 0, riskScore: 94, riskLevel: 'High', lastAnalyzed: '2026-10-12T11:18:00Z' },
];

export const DEMO_MAINTENANCE: MaintenanceRecord[] = DEMO_DETECTIONS.map((d) => ({
  id: `MNT-${d.id}`,
  potholeId: d.id,
  trackingId: d.trackingId,
  source: d.source,
  severity: d.severity,
  riskScore: d.riskScore,
  priority: d.priority,
  reason: d.severity === 'High'
    ? 'Large detection area with high confidence. Poses significant risk to road users.'
    : d.severity === 'Medium'
    ? 'Moderate size pothole with medium tracking persistence across frames.'
    : 'Small pothole with low risk score. Monitor during routine inspection.',
  recommendedAction: d.severity === 'High'
    ? 'Immediate asphalt patching required'
    : d.severity === 'Medium'
    ? 'Schedule repair within 2–4 weeks'
    : 'Log for next routine maintenance cycle',
  status: d.status,
  createdAt: d.timestamp,
  updatedAt: d.timestamp,
}));

export const DEMO_TIME_SERIES: TimeSeriesPoint[] = [
  { date: 'Oct 1', detections: 0, unique: 0 },
  { date: 'Oct 3', detections: 18, unique: 11 },
  { date: 'Oct 5', detections: 34, unique: 22 },
  { date: 'Oct 7', detections: 12, unique: 8 },
  { date: 'Oct 9', detections: 56, unique: 37 },
  { date: 'Oct 10', detections: 44, unique: 29 },
  { date: 'Oct 11', detections: 89, unique: 61 },
  { date: 'Oct 12', detections: 47, unique: 31 },
];

export const DEMO_MODEL_INFO: ModelInfo = {
  connected: false,
  demoMode: true,
  name: 'YOLOv8 Pothole Detector',
  version: 'v8',
  dataset: 'RDD2022 (Road Damage Detection Dataset 2022)',
  classes: ['Pothole'],
  imageSize: 640,
  confidenceThreshold: 0.25,
  metrics: undefined,
};
