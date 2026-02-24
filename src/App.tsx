// src/App.tsx

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { RelaxProvider, useRelaxState, useActions } from '@relax-state/react';
import { LoginPage } from './pages/login';
import { PasswordListPage } from './pages/password-list';
import { PasswordDetailPage } from './pages/password-detail';
import { GeneratorPage } from './pages/Generator';
import { SettingsPage } from './pages/Settings';
import { Layout } from './components/layout/layout';
import {
  store,
  isAuthenticatedState,
  isFirstTimeState,
  initAppAction,
  setupMasterPasswordAction,
  loginAction,
  logoutAction,
  addPasswordAction,
  updatePasswordAction,
  deletePasswordAction,
  updateRuleAction,
  setSearchQueryAction,
  setSelectedCategoryAction,
  passwordsState,
  ruleState,
  searchQueryState,
  selectedCategoryState,
  reminderSettingsState,
  updateReminderSettingsAction
} from './store';
import './styles/global.scss';
import styles from './App.module.scss';

function getActiveTab(pathname: string): 'passwords' | 'generator' | 'settings' {
  if (pathname === '/generator') return 'generator';
  if (pathname === '/settings') return 'settings';
  return 'passwords';
}

function MainContent() {
  const [isAuthenticated] = useRelaxState(isAuthenticatedState);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'passwords' | 'generator' | 'settings'>(() => getActiveTab(location.pathname));

  useEffect(() => {
    setActiveTab(getActiveTab(location.pathname));
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Outlet />
    </Layout>
  );
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [init] = useActions([initAppAction]);

  useEffect(() => {
    init(undefined);
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <RelaxProvider store={store}>
          <AppInitializer>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<MainContent />}>
                <Route index element={<PasswordListPage />} />
                <Route path="password/new" element={<PasswordDetailPage />} />
                <Route path="password/:id" element={<PasswordDetailPage />} />
                <Route path="generator" element={<GeneratorPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppInitializer>
        </RelaxProvider>
      </div>
    </BrowserRouter>
  );
}

// 导出 Hooks 供组件使用
export function useApp() {
  const [isAuthenticated] = useRelaxState(isAuthenticatedState);
  const [isFirstTime] = useRelaxState(isFirstTimeState);
  const [passwords] = useRelaxState(passwordsState);
  const [rule] = useRelaxState(ruleState);
  const [searchQuery] = useRelaxState(searchQueryState);
  const [selectedCategory] = useRelaxState(selectedCategoryState);
  const [reminderSettings] = useRelaxState(reminderSettingsState);

  const [setupMasterPassword] = useActions([setupMasterPasswordAction]);
  const [login] = useActions([loginAction]);
  const [logout] = useActions([logoutAction]);
  const [addPassword] = useActions([addPasswordAction]);
  const [updatePassword] = useActions([updatePasswordAction]);
  const [deletePassword] = useActions([deletePasswordAction]);
  const [updateRule] = useActions([updateRuleAction]);
  const [setSearchQuery] = useActions([setSearchQueryAction]);
  const [setSelectedCategory] = useActions([setSelectedCategoryAction]);
  const [updateReminderSettings] = useActions([updateReminderSettingsAction]);

  return {
    isAuthenticated,
    isFirstTime,
    login,
    logout,
    setupMasterPassword,
    passwords,
    addPassword,
    updatePassword,
    deletePassword,
    rule,
    updateRule,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    reminderSettings,
    updateReminderSettings,
  };
}
