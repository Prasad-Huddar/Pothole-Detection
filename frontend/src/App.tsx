import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { DetectionPage } from './pages/Detection';
import { VideoAnalysis } from './pages/VideoAnalysis';
import { Analytics } from './pages/Analytics';
import { Monitoring } from './pages/Monitoring';
import { Maintenance } from './pages/Maintenance';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/detection" element={<DetectionPage />} />
            <Route path="/video" element={<VideoAnalysis />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/model" element={<Navigate to="/settings" replace />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <AuthModal />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
