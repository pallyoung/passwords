// src/pages/password-list/index.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../App';
import { PasswordCard } from '../../components/password/password-card';
import { Modal } from '../../components/common/modal';
import { needsUpdate } from '../../utils/date';
import { Category, CATEGORY_CONFIG } from '../../types';
import styles from './index.module.scss';

type TabCategory = Category | 'all';

const CATEGORIES: TabCategory[] = ['all', 'social', 'finance', 'ecommerce', 'work', 'other'];

export function PasswordListPage() {
  const navigate = useNavigate();
  const {
    passwords,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    deletePassword,
    logout,
    reminderSettings,
  } = useApp();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copyText, setCopyText] = useState('');

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.account.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const needUpdateCount = reminderSettings?.enabled
    ? passwords.filter(p => needsUpdate(p.updatedAt, reminderSettings.days)).length
    : 0;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyText('复制成功');
      setTimeout(() => setCopyText(''), 2000);
    } catch {
      setCopyText('复制失败');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePassword(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryLabel = (cat: TabCategory) => {
    if (cat === 'all') return '全部';
    return CATEGORY_CONFIG[cat].label;
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>密码</h1>
        <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
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

      <div className={styles.stats}>
        共 {passwords.length} 个密码
        {needUpdateCount > 0 && (
          <span className={styles.needUpdate}>，{needUpdateCount} 个需要更新</span>
        )}
      </div>

      <div className={styles.tabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.tab} ${selectedCategory === cat ? styles.active : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filteredPasswords.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.icon}>🔐</div>
            <div className={styles.text}>
              {passwords.length === 0 ? '还没有密码，点击下方添加' : '没有找到匹配的密码'}
            </div>
          </div>
        ) : (
          filteredPasswords.map(p => (
            <PasswordCard
              key={p.id}
              password={p}
              onClick={() => navigate(`/password/${p.id}`)}
              onCopy={() => handleCopy(p.password)}
              onDelete={() => setDeleteId(p.id)}
              reminderEnabled={reminderSettings?.enabled}
              reminderDays={reminderSettings?.days || 90}
            />
          ))
        )}
      </div>

      <button className={styles.fab} onClick={() => navigate('/password/new')}>
        +
      </button>

      {copyText && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#34a853',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
        }}>
          {copyText}
        </div>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="确认删除"
        onConfirm={handleDelete}
        confirmText="删除"
        danger
      >
        确定要删除这个密码吗？此操作无法撤销。
      </Modal>
    </div>
  );
}
