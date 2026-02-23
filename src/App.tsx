// src/App.tsx

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginPage } from './pages/Login';
import { PasswordListPage } from './pages/PasswordList';
import { PasswordDetailPage } from './pages/PasswordDetail';
import { GeneratorPage } from './pages/Generator';
import { SettingsPage } from './pages/Settings';
import { Layout } from './components/layout/Layout';
import './styles/global.scss';
import styles from './App.module.scss';

function AppContent() {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<'passwords' | 'generator' | 'settings'>('passwords');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Routes>
        <Route path="/" element={<PasswordListPage />} />
        <Route path="/password/new" element={<PasswordDetailPage />} />
        <Route path="/password/:id" element={<PasswordDetailPage />} />
        <Route path="/generator" element={<GeneratorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className={styles.app}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
