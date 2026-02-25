// src/pages/home/index.tsx

import { useNavigate } from 'react-router-dom';
import { useApp } from '../../App';
import { needsUpdate } from '../../utils/date';
import { Category } from '../../types';
import styles from './index.module.scss';

const CATEGORIES: { key: Category | 'all'; label: string; color: string; icon: string }[] = [
  { key: 'all', label: '全部', color: '#1a73e8', icon: '🔐' },
  { key: 'social', label: '社交媒体', color: '#1a73e8', icon: '💬' },
  { key: 'finance', label: '金融', color: '#34a853', icon: '💳' },
  { key: 'ecommerce', label: '电商', color: '#f97316', icon: '🛒' },
  { key: 'work', label: '工作', color: '#9333ea', icon: '💼' },
  { key: 'other', label: '其他', color: '#6b7280', icon: '📁' },
];

export function HomePage() {
  const navigate = useNavigate();
  const {
    passwords,
    searchQuery,
    setSearchQuery,
    logout,
    reminderSettings,
  } = useApp();

  const reminderDays = reminderSettings?.days || 90;
  const reminderEnabled = reminderSettings?.enabled || false;

  // 计算每个分类的密码数量和需要更新的数量
  const categoryStats = CATEGORIES.map(cat => {
    const filteredPasswords = cat.key === 'all'
      ? passwords
      : passwords.filter(p => p.category === cat.key);

    const count = filteredPasswords.length;
    const updateCount = reminderEnabled
      ? filteredPasswords.filter(p => needsUpdate(p.updatedAt, reminderDays)).length
      : 0;

    return {
      ...cat,
      count,
      updateCount,
    };
  });

  const handleCardClick = (category: Category | 'all') => {
    navigate(`/category/${category}`);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>密码</h1>
        <button
          onClick={logout}
          className={styles.logoutButton}
          title="退出登录"
        >
          🚪
        </button>
      </div>

      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索密码..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {categoryStats.map(cat => (
          <div
            key={cat.key}
            className={styles.card}
            onClick={() => handleCardClick(cat.key)}
          >
            <div
              className={styles.cardIcon}
              style={{ backgroundColor: `${cat.color}15` }}
            >
              <span style={{ fontSize: '20px' }}>{cat.icon}</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>{cat.label}</div>
              <div className={styles.cardCount}>{cat.count} 个密码</div>
              {cat.updateCount > 0 && (
                <div className={styles.cardUpdate}>{cat.updateCount} 个需要更新</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.fab} onClick={() => navigate('/password/new')}>
        +
      </button>
    </div>
  );
}
