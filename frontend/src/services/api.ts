import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export const detectionApi = {
  analyzeImage: (file: File, confidence: number = 0.15) => {
    const form = new FormData();
    form.append('file', file);
    form.append('confidence', String(confidence));
    return api.post('/detect/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const videoApi = {
  analyzeVideo: (file: File, confidence: number = 0.20, slowMotion: boolean = true) => {
    const form = new FormData();
    form.append('file', file);
    form.append('confidence', String(confidence));
    form.append('slow_motion', slowMotion ? 'true' : 'false');
    return api.post('/detect/video', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000,
    });
  },
  getStatus: (jobId: string) => api.get(`/detect/video/${jobId}/status`),
};

export const analyticsApi = {
  getStats: () => api.get('/analytics/stats'),
  getDetections: () => api.get('/analytics/detections'),
  getSources: () => api.get('/analytics/sources'),
  resetActivity: () => api.post('/analytics/reset'),
  updateStatus: (id: string, status: string) => api.patch(`/analytics/detections/${id}/status`, { status }),
};

export const modelApi = {
  getInfo: () => api.get('/model/info'),
};

export const systemApi = {
  getHealth: () => api.get('/health'),
};

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  signup: (data: { name: string; email: string; password: string; role?: string; department?: string }) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
};

export default api;
