// src/components/layout/Layout.tsx

import { ReactNode } from 'react';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'passwords' | 'generator' | 'settings';
  onTabChange: (tab: 'passwords' | 'generator' | 'settings') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <main className={styles.main}>
          {children}
        </main>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === 'passwords' ? styles.active : ''}`}
            onClick={() => onTabChange('passwords')}
          >
            <span className={styles.navIcon}>🔐</span>
            密码
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'generator' ? styles.active : ''}`}
            onClick={() => onTabChange('generator')}
          >
            <span className={styles.navIcon}>⚡</span>
            生成
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => onTabChange('settings')}
          >
            <span className={styles.navIcon}>⚙️</span>
            设置
          </button>
        </nav>
      </div>
    </div>
  );
}
