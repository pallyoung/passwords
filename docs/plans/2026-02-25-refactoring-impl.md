# 项目重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构项目文件结构，将文件名改为 kebab-case，组件放入文件夹，拆分 store，优化 useActions 调用

**Architecture:** 采用渐进式重构，先拆分 store，再移动组件文件，最后优化导入和 useActions

**Tech Stack:** React + TypeScript + SCSS + relax-state

---

### Task 1: 提交当前代码

**Files:**
- Modify: N/A

**Step 1: 提交当前代码**

```bash
cd /home/spencer/workspace/passwords
git add -A
git commit -m "chore: save current state before refactoring"
```

**Step 2: 验证提交成功**

```bash
git log --oneline -1
```
Expected: 显示最新提交

---

### Task 2: 拆分 store/index.ts 为 state.ts 和 actions.ts

**Files:**
- Create: `src/store/state.ts`
- Create: `src/store/actions.ts`
- Modify: `src/store/index.ts`

**Step 1: 创建 state.ts**

创建文件 `src/store/state.ts`，包含：
```typescript
// src/store/state.ts

import { state, createStore } from '@relax-state/react';
import { GenerationRule, DEFAULT_RULE, Category, DEFAULT_REMINDER, ReminderSettings } from '../types';

// 创建 Store
export const store = createStore();

// 认证状态
export const isAuthenticatedState = state(false, 'isAuthenticated');
export const isFirstTimeState = state(true, 'isFirstTime');

// 密码列表
export const passwordsState = state<Password[]>([], 'passwords');

// 生成规则
export const ruleState = state<GenerationRule>(DEFAULT_RULE, 'rule');

// 搜索和筛选
export const searchQueryState = state('', 'searchQuery');
export const selectedCategoryState = state<Category | 'all'>('all', 'selectedCategory');

// 提醒设置
export const reminderSettingsState = state<ReminderSettings>(DEFAULT_REMINDER, 'reminderSettings');
```

**Step 2: 创建 actions.ts**

创建文件 `src/store/actions.ts`，包含所有 action 定义（从现有 index.ts 移动）

**Step 3: 修改 index.ts**

修改 `src/store/index.ts` 为：
```typescript
export * from './state';
export * from './actions';
```

**Step 4: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```
Expected: 构建成功，无错误

**Step 5: 提交**

```bash
git add src/store/
git commit -m "refactor: split store into state.ts and actions.ts"
```

---

### Task 3: 重构 components/common/button

**Files:**
- Create: `src/components/common/button/index.tsx`
- Create: `src/components/common/button/index.module.scss`
- Delete: `src/components/common/Button.tsx`
- Delete: `src/components/common/Button.module.scss`
- Modify: `src/App.tsx` (导入路径)

**Step 1: 创建 button 文件夹和文件**

移动 Button.tsx 内容到 `src/components/common/button/index.tsx`
移动 Button.module.scss 内容到 `src/components/common/button/index.module.scss`

**Step 2: 更新导入路径**

在所有使用 Button 的文件中更新导入：
- `src/App.tsx`: `./components/common/Button` → `./components/common/button`

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```
Expected: 构建成功

**Step 4: 提交**

```bash
git add src/components/common/button/ src/App.tsx
git commit -m "refactor: convert Button to button/index"
```

---

### Task 4: 重构 components/common/input

**Files:**
- Create: `src/components/common/input/index.tsx`
- Create: `src/components/common/input/index.module.scss`
- Delete: `src/components/common/Input.tsx`
- Delete: `src/components/common/Input.module.scss`

**Step 1: 创建 input 文件夹和文件**

移动 Input.tsx 内容到 `src/components/common/input/index.tsx`
移动 Input.module.scss 内容到 `src/components/common/input/index.module.scss`

**Step 2: 更新导入路径**

找出所有导入 Input 的文件并更新

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/components/common/input/
git commit -refactor: convert Input to input/index"
```

---

### Task 5: 重构 components/common/modal

**Files:**
- Create: `src/components/common/modal/index.tsx`
- Create: `src/components/common/modal/index.module.scss`
- Delete: `src/components/common/Modal.tsx`
- Delete: `src/components/common/Modal.module.scss`

**Step 1: 创建 modal 文件夹和文件**

移动 Modal.tsx 内容到 `src/components/common/modal/index.tsx`
移动 Modal.module.scss 内容到 `src/components/common/modal/index.module.scss`

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/components/common/modal/
git commit -m "refactor: convert Modal to modal/index"
```

---

### Task 6: 重构 components/layout

**Files:**
- Create: `src/components/layout/layout/index.tsx`
- Create: `src/components/layout/layout/index.module.scss`
- Delete: `src/components/layout/Layout.tsx`
- Delete: `src/components/layout/Layout.module.scss`

**Step 1: 创建 layout 文件夹和文件**

移动 Layout.tsx 内容到 `src/components/layout/layout/index.tsx`
移动 Layout.module.scss 内容到 `src/components/layout/layout/index.module.scss`

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/components/layout/
git commit -m "refactor: convert Layout to layout/index"
```

---

### Task 7: 重构 components/password

**Files:**
- Create: `src/components/password/password-card/index.tsx`
- Create: `src/components/password/password-card/index.module.scss`
- Delete: `src/components/password/PasswordCard.tsx`
- Delete: `src/components/password/PasswordCard.module.scss`

**Step 1: 创建 password-card 文件夹和文件**

移动 PasswordCard.tsx 内容到 `src/components/password/password-card/index.tsx`
移动 PasswordCard.module.scss 内容到 `src/components/password/password-card/index.module.scss`

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/components/password/
git commit -m "refactor: convert PasswordCard to password-card/index"
```

---

### Task 8: 重构 pages/login

**Files:**
- Create: `src/pages/login/index.tsx`
- Create: `src/pages/login/index.module.scss`
- Delete: `src/pages/Login.tsx`
- Delete: `src/pages/Login.module.scss`

**Step 1: 创建 login 文件夹和文件**

移动 Login.tsx 内容到 `src/pages/login/index.tsx`
移动 Login.module.scss 内容到 `src/pages/login/index.module.scss`

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/pages/login/
git commit -m "refactor: convert Login to login/index"
```

---

### Task 9: 重构 pages/password-list

**Files:**
- Create: `src/pages/password-list/index.tsx`
- Create: `src/pages/password-list/index.module.scss`
- Delete: `src/pages/PasswordList.tsx`
- Delete: `src/pages/PasswordList.module.scss`

**Step 1: 创建 password-list 文件夹和文件**

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/pages/password-list/
git commit -m "refactor: convert PasswordList to password-list/index"
```

---

### Task 10: 重构 pages/password-detail

**Files:**
- Create: `src/pages/password-detail/index.tsx`
- Create: `src/pages/password-detail/index.module.scss`
- Delete: `src/pages/PasswordDetail.tsx`
- Delete: `src/pages/PasswordDetail.module.scss`

**Step 1: 创建 password-detail 文件夹和文件**

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/pages/password-detail/
git commit -m "refactor: convert PasswordDetail to password-detail/index"
```

---

### Task 11: 重构 pages/generator

**Files:**
- Create: `src/pages/generator/index.tsx`
- Create: `src/pages/generator/index.module.scss`
- Delete: `src/pages/Generator.tsx`
- Delete: `src/pages/Generator.module.scss`

**Step 1: 创建 generator 文件夹和文件**

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/pages/generator/
git commit -m "refactor: convert Generator to generator/index"
```

---

### Task 12: 重构 pages/settings

**Files:**
- Create: `src/pages/settings/index.tsx`
- Create: `src/pages/settings/index.module.scss`
- Delete: `src/pages/Settings.tsx`
- Delete: `src/pages/Settings.module.scss`

**Step 1: 创建 settings 文件夹和文件**

**Step 2: 更新导入路径**

**Step 3: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 4: 提交**

```bash
git add src/pages/settings/
git commit -m "refactor: convert Settings to settings/index"
```

---

### Task 13: 优化 App.tsx 中的 useActions

**Files:**
- Modify: `src/App.tsx`

**Step 1: 修改 useActions 调用**

将分散的 useActions 调用合并为一个：

```typescript
// 修改前 (10 行)
const [setupMasterPassword] = useActions([setupMasterPasswordAction]);
const [login] = useActions([loginAction]);
const [logout] = useActions([logoutAction]);
const [addPassword] = useActions([addPasswordAction]);
const [updatePassword] = useActions([updatePasswordAction]);
const [deletePassword] = useActions([deletePasswordAction]);
const [updateRule] = useActions([updateRuleAction]);
const [setSearchQuery] = useActions([setSearchQueryAction]);
const [setSelectedCategory] = useActions([setSelectedCategoryAction]);
const [updateReminderSettings] = useActions([updateReminderSettingsAction]);

// 修改后 (1 行)
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

**Step 2: 验证构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```

**Step 3: 提交**

```bash
git add src/App.tsx
git commit -m "refactor: consolidate useActions into single call"
```

---

### Task 14: 添加文件命名规范到 CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (项目根目录)

**Step 1: 检查 CLAUDE.md 是否存在**

```bash
ls -la /home/spencer/workspace/passwords/CLAUDE.md
```

**Step 2: 添加规范内容**

如果文件存在，追加以下内容：

```markdown
## 文件命名规则

- 所有文件名使用 **kebab-case** (中划线命名)
- 组件以文件夹形式存放，主文件名为 `index.tsx`
- 样式文件与组件文件放在同一文件夹内，命名为 `index.module.scss`

## 示例

✅ 正确: `button/index.tsx`, `password-card/index.module.scss`
❌ 错误: `Button.tsx`, `PasswordCard.module.scss`
```

如果文件不存在，创建新文件。

**Step 3: 提交**

```bash
git add CLAUDE.md
git commit -m "docs: add file naming conventions to CLAUDE.md"
```

---

### Task 15: 最终验证

**Files:**
- N/A

**Step 1: 运行构建**

```bash
cd /home/spencer/workspace/passwords && pnpm run build
```
Expected: 构建成功

**Step 2: 运行开发服务器验证**

```bash
cd /home/spencer/workspace/passwords && pnpm run dev
```

**Step 3: 检查 git 状态**

```bash
git status
```

**Step 4: 查看提交历史**

```bash
git log --oneline
```
Expected: 显示所有重构相关的提交

---

## 执行方式

**Plan complete and saved to `docs/plans/2026-02-25-refactoring-impl.md`. Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
