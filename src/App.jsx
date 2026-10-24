// src/App.jsx
import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import ToastContainer from './components/common/ToastContainer';

// Auth Components
import RoleChooser from './components/auth/RoleChooser';
import ClientAuth from './components/auth/ClientAuth';
import WorkerAuth from './components/auth/WorkerAuth';
import AdminAuth from './components/auth/AdminAuth';

// Role Dashboards
import ClientDashboard from './components/client/ClientDashboard';
import WorkerDashboard from './components/worker/WorkerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const { currentUser } = useApp();

  // Screen when not logged in or when user clicks 'Portals':
  // 'CHOOSER' | 'CLIENT_AUTH' | 'WORKER_AUTH' | 'ADMIN_AUTH'
  const [authView, setAuthView] = useState('CHOOSER');
  const [forceShowAuth, setForceShowAuth] = useState(false);

  const handleOpenRoleChooser = () => {
    setAuthView('CHOOSER');
    setForceShowAuth(true);
  };

  const handleSelectRoleFromChooser = (role) => {
    if (role === 'CLIENT') setAuthView('CLIENT_AUTH');
    else if (role === 'WORKER') setAuthView('WORKER_AUTH');
    else if (role === 'ADMIN') setAuthView('ADMIN_AUTH');
  };

  // If user is authenticated and not browsing the auth portal switcher
  const isDashboardView = currentUser && !forceShowAuth;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Real-time floating alerts */}
      <ToastContainer />

      {/* Main Global Header */}
      <Navbar onNavigateToRoleChooser={handleOpenRoleChooser} />

      {/* Main Content Area */}
      <main className="flex-1">
        {isDashboardView ? (
          <>
            {currentUser.role === 'CLIENT' && <ClientDashboard />}
            {currentUser.role === 'WORKER' && <WorkerDashboard />}
            {currentUser.role === 'ADMIN' && <AdminDashboard />}
          </>
        ) : (
          <div className="py-6 sm:py-10">
            {authView === 'CHOOSER' && (
              <RoleChooser onSelectRole={handleSelectRoleFromChooser} />
            )}
            {authView === 'CLIENT_AUTH' && (
              <ClientAuth
                onBack={() => setAuthView('CHOOSER')}
                onSuccess={() => setForceShowAuth(false)}
              />
            )}
            {authView === 'WORKER_AUTH' && (
              <WorkerAuth
                onBack={() => setAuthView('CHOOSER')}
                onSuccess={() => setForceShowAuth(false)}
              />
            )}
            {authView === 'ADMIN_AUTH' && (
              <AdminAuth
                onBack={() => setAuthView('CHOOSER')}
                onSuccess={() => setForceShowAuth(false)}
              />
            )}
          </div>
        )}
      </main>

      {/* Simple Clean Light Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SkillLink Unified Hyperlocal Marketplace &bull; Escrow Protected</span>
          <span className="font-mono text-[11px] text-slate-400">Classic Light Mode Production Environment</span>
        </div>
      </footer>
    </div>
  );
}
