// src/pages/Login.tsx

import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import styles from './Login.module.scss';

export function LoginPage() {
  const { login, isFirstTime, setupMasterPassword } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('请输入密码');
      return;
    }

    if (isFirstTime) {
      if (password.length < 6) {
        setError('密码至少6位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次密码不一致');
        return;
      }
      setLoading(true);
      try {
        await setupMasterPassword(password);
      } catch (err) {
        setError('设置密码失败');
      }
      setLoading(false);
    } else {
      setLoading(true);
      const success = await login(password);
      setLoading(false);
      if (!success) {
        setError('密码错误');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>密码守护者</h1>
        <p className={styles.subtitle}>
          {isFirstTime ? '设置您的主密码' : '请输入主密码解锁'}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />

          {isFirstTime && (
            <Input
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          )}

          {error && <div className={styles.error}>{error}</div>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '请稍候...' : (isFirstTime ? '设置密码' : '解锁')}
          </Button>
        </form>
      </div>
    </div>
  );
}
