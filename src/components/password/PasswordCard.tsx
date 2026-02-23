// src/components/password/PasswordCard.tsx

import { Password, CATEGORY_CONFIG } from '../../types';
import { calculateStrength } from '../../utils/generator';
import styles from './PasswordCard.module.scss';

interface PasswordCardProps {
  password: Password;
  onClick: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export function PasswordCard({ password, onClick, onCopy, onDelete }: PasswordCardProps) {
  const { label, color } = CATEGORY_CONFIG[password.category];
  const { strength } = calculateStrength(password.password);

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
        <span className={`${styles.strength} ${styles[strength]}`}>
          {strength === 'weak' ? '弱' : strength === 'medium' ? '中' : '强'}
        </span>
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
