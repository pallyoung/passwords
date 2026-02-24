// src/pages/password-detail/index.tsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../App';
import { Button } from '../../components/common/button';
import { Input } from '../../components/common/input';
import { Category, CATEGORY_CONFIG } from '../../types';
import { generatePassword, calculateStrength } from '../../utils/generator';
import styles from './index.module.scss';

const CATEGORIES: Category[] = ['social', 'finance', 'ecommerce', 'work', 'other'];

export function PasswordDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { passwords, addPassword, updatePassword, rule } = useApp();
  const isNew = !id;
  const existing = !isNew ? passwords.find(p => p.id === id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [account, setAccount] = useState(existing?.account || '');
  const [password, setPassword] = useState(existing?.password || '');
  const [category, setCategory] = useState<Category>(existing?.category || 'other');
  const [url, setUrl] = useState(existing?.url || '');
  const [notes, setNotes] = useState(existing?.notes || '');

  const strength = calculateStrength(password);

  const handleGenerate = () => {
    setPassword(generatePassword(rule));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    if (isNew) {
      await addPassword({ name, account, password, category, url, notes });
    } else if (existing) {
      await updatePassword({ id: existing.id, data: { name, account, password, category, url, notes } });
    }
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ←
        </button>
        <h1 className={styles.title}>{isNew ? '添加密码' : '编辑密码'}</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>名称 *</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：微信"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>账号</label>
          <Input
            value={account}
            onChange={e => setAccount(e.target.value)}
            placeholder="手机号/邮箱/用户名"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>密码 *</label>
          <div className={styles.passwordWrapper}>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="输入或生成密码"
              showToggle
              required
            />
            <button type="button" className={styles.generateBtn} onClick={handleGenerate}>
              ⚡
            </button>
          </div>

          {password && (
            <>
              <div className={styles.strengthIndicator}>
                <div className={styles.strengthBar}>
                  <div
                    className={`${styles.fill} ${styles[strength.strength]}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className={`${styles.strengthText} ${styles[strength.strength]}`}>
                  {strength.strength === 'weak' ? '弱' : strength.strength === 'medium' ? '中' : '强'}
                </span>
              </div>

              {strength.suggestions.length > 0 && strength.strength !== 'strong' && (
                <div className={styles.suggestions}>
                  {strength.suggestions.map((s, i) => (
                    <div key={i} className={styles.suggestion}>💡 {s}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>分类</label>
          <select
            className={styles.select}
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>网址</label>
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>备注</label>
          <Input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="额外信息..."
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/')}>
            取消
          </Button>
          <Button type="submit" fullWidth>
            保存
          </Button>
        </div>
      </form>
    </div>
  );
}
