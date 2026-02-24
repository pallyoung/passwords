# 密码更新提醒功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为密码管理器添加密码更新时间展示和更新提醒功能

**Architecture:** 在现有数据模型中添加提醒设置，修改 UI 组件展示更新时间和提醒徽章

**Tech Stack:** React, TypeScript, @relax-state/react

---

## Task 1: 添加 ReminderSettings 类型

**Files:**
- Modify: `src/types/index.ts:1-62`

**Step 1: 修改 types/index.ts**

在 `AppData` 接口中添加 `reminderSettings` 字段：

```typescript
// 提醒设置
export interface ReminderSettings {
  enabled: boolean;
  days: number;
}

// 默认提醒设置
export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  days: 90,
};

// 应用数据
export interface AppData {
  passwords: Password[];
  generationRule: GenerationRule;
  reminderSettings?: ReminderSettings;
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add ReminderSettings type"
```

---

## Task 2: Store 添加提醒状态和 Action

**Files:**
- Modify: `src/store/index.ts:1-151`

**Step 1: 添加状态和 Action**

在 store 中添加：

```typescript
// 提醒设置
export const reminderSettingsState = state<ReminderSettings>(DEFAULT_REMINDER, 'reminderSettings');

// 更新提醒设置
export const updateReminderSettingsAction = action(
  async (s: any, newSettings: ReminderSettings) => {
    const { saveData } = await import('../utils/storage');
    s.set(reminderSettingsState, newSettings);
    await saveData(
      { passwords: s.get(passwordsState), generationRule: s.get(ruleState), reminderSettings: newSettings },
      masterPassword
    );
  },
  { name: 'updateReminderSettings' }
);
```

同时修改 `loginAction` 加载提醒设置：

```typescript
export const loginAction = action(
  async (s: any, password: string) => {
    const { verifyMasterPassword, loadData } = await import('../utils/storage');
    const isValid = await verifyMasterPassword(password);
    if (isValid) {
      masterPassword = password;
      const data = await loadData(password);
      s.set(passwordsState, data.passwords);
      s.set(ruleState, data.generationRule || DEFAULT_RULE);
      s.set(reminderSettingsState, data.reminderSettings || DEFAULT_REMINDER);  // 新增
      s.set(isAuthenticatedState, true);
      return true;
    }
    return false;
  },
  { name: 'login' }
);
```

修改 `setupMasterPasswordAction` 保存默认提醒设置：

```typescript
export const setupMasterPasswordAction = action(
  async (s: any, password: string) => {
    const { setMasterPassword, saveData } = await import('../utils/storage');
    await setMasterPassword(password);
    masterPassword = password;
    const data = { passwords: [], generationRule: DEFAULT_RULE, reminderSettings: DEFAULT_REMINDER };
    await saveData(data, password);
    s.set(isFirstTimeState, false);
    s.set(isAuthenticatedState, true);
  },
  { name: 'setupMasterPassword' }
);
```

**Step 2: Commit**

```bash
git add src/store/index.ts
git commit -m "feat: add reminder settings state and actions"
```

---

## Task 3: 添加时间格式化工具函数

**Files:**
- Create: `src/utils/date.ts`

**Step 1: 创建工具函数**

```typescript
// src/utils/date.ts

/**
 * 格式化更新时间显示
 * - 小于 1 天：刚刚更新
 * - 1-30 天：X 天前
 * - 30 天以上：X 月 X 日
 */
export function formatUpdateTime(updatedAt: number): string {
  const now = Date.now();
  const diffMs = now - updatedAt;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return '刚刚更新';
  }

  if (diffDays <= 30) {
    return `${diffDays} 天前`;
  }

  const date = new Date(updatedAt);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

/**
 * 检查密码是否需要更新
 */
export function needsUpdate(updatedAt: number, reminderDays: number): boolean {
  const now = Date.now();
  const diffDays = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
  return diffDays > reminderDays;
}
```

**Step 2: Commit**

```bash
git add src/utils/date.ts
git commit -m "feat: add date utility functions"
```

---

## Task 4: 修改 PasswordCard 显示更新时间

**Files:**
- Modify: `src/components/password/PasswordCard.tsx:1-47`

**Step 1: 修改 PasswordCard**

```typescript
import { Password, CATEGORY_CONFIG } from '../../types';
import { calculateStrength } from '../../utils/generator';
import { formatUpdateTime, needsUpdate } from '../../utils/date';  // 新增
import styles from './PasswordCard.module.scss';

interface PasswordCardProps {
  password: Password;
  onClick: () => void;
  onCopy: () => void;
  onDelete: () => void;
  reminderEnabled?: boolean;   // 新增
  reminderDays?: number;       // 新增
}

export function PasswordCard({ password, onClick, onCopy, onDelete, reminderEnabled = false, reminderDays = 90 }: PasswordCardProps) {
  const { label, color } = CATEGORY_CONFIG[password.category];
  const { strength } = calculateStrength(password.password);
  const updateTimeText = formatUpdateTime(password.updatedAt);  // 新增
  const isNeedUpdate = reminderEnabled && needsUpdate(password.updatedAt, reminderDays);  // 新增

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
      {/* 新增 footer 部分 */}
      <div className={styles.footer}>
        <span className={styles.updateTime}>{updateTimeText}</span>  {/* 新增 */}
        {isNeedUpdate && (  // 新增
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
```

**Step 2: 更新 CSS 样式**

在 `PasswordCard.module.scss` 中添加：

```scss
.updateTime {
  font-size: 12px;
  color: #9ca3af;
}

.needUpdate {
  font-size: 12px;
  color: #f97316;
  background: #fff7ed;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
}
```

**Step 3: Commit**

```bash
git add src/components/password/PasswordCard.tsx src/components/password/PasswordCard.module.scss
git commit -m "feat: display update time and reminder badge on password card"
```

---

## Task 5: 修改 PasswordList 显示统计信息

**Files:**
- Modify: `src/pages/PasswordList.tsx:1-144`

**Step 1: 修改 PasswordList**

```typescript
// 在组件中添加
const { reminderSettings } = useApp();  // 新增

// 计算需要更新的密码数量
const needUpdateCount = reminderSettings?.enabled
  ? passwords.filter(p => needsUpdate(p.updatedAt, reminderSettings.days)).length
  : 0;

// 在 return 中，搜索框后面添加统计信息
<div className={styles.stats}>  {/* 新增 */}
  共 {passwords.length} 个密码
  {needUpdateCount > 0 && (
    <span className={styles.needUpdate}>，{needUpdateCount} 个需要更新</span>
  )}
</div>

// 修改 PasswordCard 调用，传递提醒参数
<PasswordCard
  key={p.id}
  password={p}
  onClick={() => navigate(`/password/${p.id}`)}
  onCopy={() => handleCopy(p.password)}
  onDelete={() => setDeleteId(p.id)}
  reminderEnabled={reminderSettings?.enabled}
  reminderDays={reminderSettings?.days || 90}
/>
```

**Step 2: 添加 CSS**

在 `PasswordList.module.scss` 中添加：

```scss
.stats {
  padding: 12px 16px;
  font-size: 14px;
  color: #6b7280;

  .needUpdate {
    color: #f97316;
  }
}
```

**Step 3: Commit**

```bash
git add src/pages/PasswordList.tsx src/pages/PasswordList.module.scss
git commit -m "feat: display password update statistics"
```

---

## Task 6: 修改 Settings 添加提醒设置 UI

**Files:**
- Modify: `src/pages/Settings.tsx:1-119`

**Step 1: 修改 Settings 页面**

```typescript
import { useState } from 'react';
import { useApp } from '../App';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { setMasterPassword } from '../utils/storage';
import { needsUpdate } from '../utils/date';  // 新增
import styles from './Settings.module.scss';

const REMINDER_OPTIONS = [30, 60, 90, 180, 365];

export function SettingsPage() {
  const { rule, logout, reminderSettings, updateReminderSettings, passwords } = useApp();  // 修改
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);  // 新增
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // 计算需要更新的密码数量
  const needUpdateCount = reminderSettings?.enabled
    ? passwords.filter(p => needsUpdate(p.updatedAt, reminderSettings.days)).length
    : 0;

  // 处理提醒开关
  const handleReminderToggle = async (enabled: boolean) => {
    await updateReminderSettings({ ...reminderSettings!, enabled });
  };

  // 处理提醒周期修改
  const handleReminderDaysChange = async (days: number) => {
    await updateReminderSettings({ ...reminderSettings!, days });
  };

  // ... 保留原有的 handleChangePassword 函数

  return (
    <div className={styles.container}>
      {/* ... 保留密码生成和安全区块 ... */}

      {/* 新增：密码更新提醒区块 */}
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

      {/* 新增：提醒周期选择弹窗 */}
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

      {/* ... 保留版本信息和弹窗 ... */}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat: add reminder settings UI in settings page"
```

---

## Task 7: 更新 App.tsx 暴露新状态和 Actions

**Files:**
- Modify: `src/App.tsx`

**Step 1: 检查 useApp hook**

查看 `App.tsx` 确保 `reminderSettings` 和 `updateReminderSettings` 已被导出。如果没有，添加它们。

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: expose reminder settings in useApp hook"
```

---

## Task 8: 测试和验证

**Step 1: 运行应用**

```bash
pnpm dev
```

**Step 2: 验证功能**

1. 添加新密码，确认显示更新时间
2. 进入设置，开启密码更新提醒
3. 设置提醒周期
4. 返回密码列表，确认显示统计信息
5. 如果有超过提醒天数的密码，确认显示"需要更新"徽章

**Step 3: Commit**

```bash
git add .
git commit -m "test: verify password reminder feature works"
```

---

## 执行方式

**Plan complete and saved to `docs/plans/2026-02-24-password-update-reminder-impl.md`. Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
