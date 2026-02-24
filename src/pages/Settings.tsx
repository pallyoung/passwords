// src/pages/Settings.tsx

import { useState } from 'react';
import { useApp } from '../App';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { setMasterPassword } from '../utils/storage';
import { needsUpdate } from '../utils/date';
import styles from './Settings.module.scss';

export function SettingsPage() {
  const { rule, logout, reminderSettings, updateReminderSettings, passwords } = useApp();
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const REMINDER_OPTIONS = [30, 60, 90, 180, 365];

  const needUpdateCount = reminderSettings?.enabled
    ? passwords.filter(p => needsUpdate(p.updatedAt, reminderSettings.days)).length
    : 0;

  const handleReminderToggle = async (enabled: boolean) => {
    await updateReminderSettings({ ...reminderSettings!, enabled });
  };

  const handleReminderDaysChange = async (days: number) => {
    await updateReminderSettings({ ...reminderSettings!, days });
    setShowReminderModal(false);
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');
    if (newPassword.length < 6) {
      setError('新密码至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    try {
      await setMasterPassword(newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      logout(undefined);
    } catch {
      setError('修改失败');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>设置</h1>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>密码生成</div>
        <div className={styles.card}>
          <div className={styles.item} onClick={() => setShowRuleModal(true)}>
            <span className={styles.itemLabel}>生成规则</span>
            <span className={styles.itemValue}>长度 {rule.length} ×</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>安全</div>
        <div className={styles.card}>
          <div className={styles.item} onClick={() => setShowPasswordModal(true)}>
            <span className={styles.itemLabel}>修改主密码</span>
            <span className={styles.itemValue}>→</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>密码更新提醒</div>
        <div className={styles.card}>
          <div className={styles.item}>
            <span className={styles.itemLabel}>定期提醒</span>
            <input
              type="checkbox"
              checked={reminderSettings?.enabled || false}
              onChange={e => handleReminderToggle(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          {reminderSettings?.enabled && (
            <>
              <div className={styles.item} onClick={() => setShowReminderModal(true)}>
                <span className={styles.itemLabel}>提醒周期</span>
                <span className={styles.itemValue}>{reminderSettings.days} 天</span>
              </div>
              {needUpdateCount > 0 && (
                <div style={{ padding: '12px 16px', color: '#f97316', fontSize: '14px' }}>
                  当前有 {needUpdateCount} 个密码需要更新
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.version}>
        密码守护者 v1.0.0
      </div>

      <Modal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        title="生成规则"
        confirmText="保存"
        onConfirm={() => setShowRuleModal(false)}
      >
        <p>长度: {rule.length}</p>
        <p>大写: {rule.includeUppercase ? '✓' : '✗'}</p>
        <p>小写: {rule.includeLowercase ? '✓' : '✗'}</p>
        <p>数字: {rule.includeNumbers ? '✓' : '✗'}</p>
        <p>特殊字符: {rule.includeSymbols ? '✓' : '✗'}</p>
        <p>排除易混淆: {rule.excludeAmbiguous ? '✓' : '✗'}</p>
      </Modal>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setError('');
        }}
        title="修改主密码"
        onConfirm={handleChangePassword}
        confirmText="确认修改"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            type="password"
            placeholder="当前密码"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="新密码"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="确认新密码"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {error && <div style={{ color: '#ea4335', fontSize: '12px' }}>{error}</div>}
        </div>
      </Modal>

      <Modal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="选择提醒周期"
        confirmText="确定"
        onConfirm={() => setShowReminderModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {REMINDER_OPTIONS.map(days => (
            <div
              key={days}
              onClick={() => handleReminderDaysChange(days)}
              style={{
                padding: '12px',
                border: reminderSettings?.days === days ? '2px solid #1a73e8' : '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                background: reminderSettings?.days === days ? '#e8f0fe' : 'white',
              }}
            >
              {days} 天
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
