// src/components/password/password-card/index.tsx

import { Password, CATEGORY_CONFIG } from '../../../types';
import { formatUpdateTime, needsUpdate } from '../../../utils/date';
import styles from './index.module.scss';

interface PasswordCardProps {
  password: Password;
  onClick: () => void;
  onCopy: () => void;
  onDelete: () => void;
  reminderEnabled?: boolean;
  reminderDays?: number;
}

export function PasswordCard({ password, onClick, onCopy, onDelete, reminderEnabled = false, reminderDays = 90 }: PasswordCardProps) {
  const { label, color } = CATEGORY_CONFIG[password.category];
  const updateTimeText = formatUpdateTime(password.updatedAt);
  const isNeedUpdate = reminderEnabled && needsUpdate(password.updatedAt, reminderDays);

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.icon} style={{ background: `${color}20` }}>
          {password.name[0].toUpperCase()}
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{password.name}</div>
          <div className={styles.account}>{password.account || '无账号'}</div>
        </div>
        <span className={styles.category} style={{ background: `${color}20`, color }}>
          {label}
        </span>
      </div>
      <div className={styles.footer}>
        <span className={styles.updateTime}>{updateTimeText}</span>
        {isNeedUpdate && (
          <span className={styles.needUpdate}>需要更新</span>
        )}
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={e => { e.stopPropagation(); onCopy(); }}>
            📋 复制
          </button>
          <button className={styles.actionBtn} onClick={e => { e.stopPropagation(); onDelete(); }}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
