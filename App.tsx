
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Personal } from './pages/Personal';
import { Occupational } from './pages/Occupational';
import { Financial } from './pages/Financial';
import { StrategicGantt } from './pages/StrategicGantt';
import { Archive } from './pages/Archive';
import { Guide } from './pages/Guide';
import { AdminUsers } from './pages/AdminUsers';
import { Auth } from './pages/Auth';
import { AppProvider, useApp } from './context/AppContext';
import { Loader2, Sparkles } from 'lucide-react';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center space-y-6 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <Sparkles className="text-blue-500 w-8 h-8" />
            </div>
            <div className="space-y-2">
                <p className="text-white text-xl font-black tracking-tight">מנטור עצמי</p>
                <p className="text-blue-100/40 text-sm font-medium animate-pulse">בודק הרשאות גישה...</p>
            </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  const canAccess = userProfile?.role === 'admin' || userProfile?.status === 'approved';
  
  if (!canAccess) {
    return <Auth />;
  }

  return <>{children}</>;
};

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useApp();

  if (loading) return null;
  if (userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="personal" element={<Personal />} />
            <Route path="occupational" element={<Occupational />} />
            <Route path="financial" element={<Financial />} />
            <Route path="strategy" element={<StrategicGantt />} />
            <Route path="archive" element={<Archive />} />
            <Route path="guide" element={<Guide />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="admin/users" element={
              <AdminGuard>
                <AdminUsers />
              </AdminGuard>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
