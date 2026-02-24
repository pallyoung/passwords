# 密码更新提醒功能设计

## 概述

为密码管理器添加密码更新时间展示和更新提醒功能，帮助用户定期更新重要密码，提升账户安全。

## 需求

1. 在密码卡片上显示上次更新时间
2. 添加密码更新提醒功能，用户可在设置中开启/关闭
3. 开启后，用户可自定义提醒周期
4. 在密码列表和设置页面显示需要更新的密码数量

## 设计

### 1. 数据模型

在 `src/types/index.ts` 中添加提醒设置类型：

```typescript
// 提醒设置
export interface ReminderSettings {
  enabled: boolean;      // 是否开启提醒
  days: number;          // 提醒周期（天数）
}
```

更新 `AppData` 类型：

```typescript
export interface AppData {
  passwords: Password[];
  generationRule: GenerationRule;
  reminderSettings: ReminderSettings;
}
```

### 2. Store 扩展

在 `src/store/index.ts` 中：

- 添加 `reminderSettingsState` 状态，默认值 `{ enabled: false, days: 90 }`
- 添加 `updateReminderSettingsAction` action 保存设置

### 3. UI 组件

#### 3.1 密码卡片 (PasswordCard.tsx)

- 显示格式："更新于 X月X日" 或 "更新于 X天前"
- 当密码超过提醒天数未更新时，显示橙色"需要更新"徽章

#### 3.2 密码列表 (PasswordList.tsx)

- 在列表顶部显示统计信息：
  - "共 X 个密码，Y 个需要更新"（当有需要更新的密码时）
  - 仅显示"共 X 个密码"（当没有需要更新的密码时）

#### 3.3 设置页面 (Settings.tsx)

新增"密码更新提醒"区块：

```tsx
// UI 结构
<div className={styles.section}>
  <div className={styles.sectionTitle}>密码更新提醒</div>
  <div className={styles.card}>
    {/* 开关 */}
    <div className={styles.item}>
      <span className={styles.itemLabel}>定期提醒</span>
      <Switch checked={reminderEnabled} onChange={...} />
    </div>

    {/* 周期选择（仅当启用时显示） */}
    {reminderEnabled && (
      <>
        <div className={styles.item} onClick={() => setShowReminderModal(true)}>
          <span className={styles.itemLabel}>提醒周期</span>
          <span className={styles.itemValue}>{reminderDays} 天</span>
        </div>
        <div className={styles.statistics}>
          当前有 {needUpdateCount} 个密码需要更新
        </div>
      </>
    )}
  </div>
</div>
```

提醒周期选项：30天、60天、90天、180天、365天

### 4. 数据流程

```
应用启动 → 加载数据（包含 reminderSettings）
     ↓
登录成功 → 渲染密码列表
     ↓
对每个密码计算：Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24))
     ↓
判断：if (reminderSettings.enabled && days > reminderSettings.days)
     ↓
标记为"需要更新" → 在 UI 中显示徽章
```

### 5. 时间显示规则

- 小于 1 天：显示"刚刚更新"
- 1-30 天：显示"更新于 X 天前"
- 30 天以上：显示"更新于 X 月 X 日"

## 边界情况

1. **首次使用无 updatedAt**：新密码创建时自动设置 updatedAt = createdAt
2. **提醒功能关闭时**：不显示任何提醒徽章
3. **提醒天数为 0**：视为未启用
4. **数据迁移**：旧数据没有 reminderSettings 时使用默认值

## 文件修改清单

1. `src/types/index.ts` - 添加 ReminderSettings 类型
2. `src/store/index.ts` - 添加状态和 action
3. `src/components/password/PasswordCard.tsx` - 显示更新时间+徽章
4. `src/pages/PasswordList.tsx` - 显示统计信息
5. `src/pages/Settings.tsx` - 添加提醒设置 UI
6. `src/utils/storage.ts` - 确保保存/加载 reminderSettings
