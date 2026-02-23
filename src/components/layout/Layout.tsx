// src/components/layout/Layout.tsx

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'passwords' | 'generator' | 'settings';
  onTabChange: (tab: 'passwords' | 'generator' | 'settings') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const navigate = useNavigate();

  const handleTabChange = (tab: 'passwords' | 'generator' | 'settings') => {
    onTabChange(tab);
    if (tab === 'passwords') {
      navigate('/');
    } else if (tab === 'generator') {
      navigate('/generator');
    } else if (tab === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <main className={styles.main}>
          {children}
        </main>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === 'passwords' ? styles.active : ''}`}
            onClick={() => handleTabChange('passwords')}
          >
            <span className={styles.navIcon}>🔐</span>
            密码
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'generator' ? styles.active : ''}`}
            onClick={() => handleTabChange('generator')}
          >
            <span className={styles.navIcon}>⚡</span>
            生成
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <span className={styles.navIcon}>⚙️</span>
            设置
          </button>
        </nav>
      </div>
    </div>
  );
}
