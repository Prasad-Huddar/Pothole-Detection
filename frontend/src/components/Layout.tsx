import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopNav />
        <main className="page-content page-enter" style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
