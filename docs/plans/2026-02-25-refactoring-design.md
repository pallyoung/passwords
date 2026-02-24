# 项目重构设计方案

**日期**: 2026-02-25
**目标**: 重构项目文件结构和代码组织

## 1. 背景

当前项目存在以下问题：
- 文件命名不统一（PascalCase 与 kebab-case 混用）
- 组件和样式文件分散存放
- store 和 action 都在一个文件中，职责不清晰
- useActions 调用存在重复代码

## 2. 重构目标

1. 文件名使用 kebab-case 命名规范
2. 组件以文件夹形式存放
3. 拆分 store/index.ts 为 state.ts 和 actions.ts
4. 优化 useActions 调用，减少重复代码

## 3. 详细设计

### 3.1 文件命名规范

**规则**:
- 所有文件名使用 kebab-case (中划线命名)
- 组件以文件夹形式存放，主文件为 `index.tsx`
- 样式文件与组件文件同目录，命名为 `index.module.scss`

### 3.2 目录结构重构

**当前结构**:
```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Button.module.scss
│   │   ├── Input.tsx
│   │   ├── Input.module.scss
│   │   ├── Modal.tsx
│   │   └── Modal.module.scss
│   ├── layout/
│   │   ├── Layout.tsx
│   │   └── Layout.module.scss
│   └── password/
│       ├── PasswordCard.tsx
│       └── PasswordCard.module.scss
├── pages/
│   ├── Login.tsx, Login.module.scss
│   ├── PasswordList.tsx, PasswordList.module.scss
│   ├── PasswordDetail.tsx, PasswordDetail.module.scss
│   ├── Generator.tsx, Generator.module.scss
│   └── Settings.tsx, Settings.module.scss
└── store/
    └── index.ts (包含 state 和 action)
```

**重构后结构**:
```
src/
├── components/
│   ├── common/
│   │   ├── button/index.tsx, index.module.scss
│   │   ├── input/index.tsx, index.module.scss
│   │   └── modal/index.tsx, index.module.scss
│   ├── layout/layout/index.tsx, index.module.scss
│   └── password/password-card/index.tsx, index.module.scss
├── pages/
│   ├── login/index.tsx, index.module.scss
│   ├── password-list/index.tsx, index.module.scss
│   ├── password-detail/index.tsx, index.module.scss
│   ├── generator/index.tsx, index.module.scss
│   └── settings/index.tsx, index.module.scss
└── store/
    ├── index.ts (导出所有)
    ├── state.ts (state 定义)
    └── actions.ts (action 定义)
```

### 3.3 Store 拆分

将 `src/store/index.ts` 拆分为三个文件：

**state.ts**:
- `createStore()`
- 所有 state 定义（isAuthenticatedState, passwordsState, ruleState 等）

**actions.ts**:
- 导入 state.ts 中的 store 和 states
- 所有 action 定义

**index.ts**:
- 重新导出 state.ts 和 actions.ts 的所有内容

### 3.4 useActions 优化

**当前代码 (App.tsx)**:
```typescript
const [setupMasterPassword] = useActions([setupMasterPasswordAction]);
const [login] = useActions([loginAction]);
const [logout] = useActions([logoutAction]);
// ... 共 10 行
```

**优化后**:
```typescript
const [
  setupMasterPassword,
  login,
  logout,
  addPassword,
  updatePassword,
  deletePassword,
  updateRule,
  setSearchQuery,
  setSelectedCategory,
  updateReminderSettings
] = useActions([
  setupMasterPasswordAction,
  loginAction,
  logoutAction,
  addPasswordAction,
  updatePasswordAction,
  deletePasswordAction,
  updateRuleAction,
  setSearchQueryAction,
  setSelectedCategoryAction,
  updateReminderSettingsAction
]);
```

### 3.5 导入路径更新

所有组件和页面的导入路径需要更新：

| 原路径 | 新路径 |
|--------|--------|
| `./components/common/Button` | `./components/common/button` |
| `./components/common/Modal` | `./components/common/modal` |
| `./pages/Login` | `./pages/login` |
| `./pages/PasswordList` | `./pages/password-list` |

### 3.6 项目规范文档

在项目根目录创建/更新 `CLAUDE.md`，添加文件命名规范：

```markdown
# 项目规范

## 文件命名规则

- 所有文件名使用 **kebab-case** (中划线命名)
- 组件以文件夹形式存放，主文件名为 `index.tsx`
- 样式文件与组件文件放在同一文件夹内，命名为 `index.module.scss`

## 示例

✅ 正确: `button/index.tsx`, `password-card/index.module.scss`
❌ 错误: `Button.tsx`, `PasswordCard.module.scss`
```

## 4. 影响范围

- 所有组件文件需要重命名和移动
- 所有导入路径需要更新
- App.tsx 中的 useActions 调用需要优化
- CLAUDE.md 需要添加规范

## 5. 风险与回滚

- 所有更改都在本地完成，可通过 git 快速回滚
- 建议在重构前提交当前代码
