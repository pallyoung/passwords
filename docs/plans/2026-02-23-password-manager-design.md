# 密码管理器 - 详细设计文档

**版本**：1.0
**日期**：2026-02-23
**状态**：草稿

---

## 一、技术架构

### 1.1 技术栈

| 层级 | 技术选型 |
|------|----------|
| 框架 | React 18 + TypeScript |
| 状态管理 | @relax-state/react |
| 样式 | SCSS + Module CSS |
| 存储 | localStorage |
| 加密 | Web Crypto API (PBKDF2 + AES-GCM) |
| 构建工具 | Vite |

### 1.2 项目结构

```
src/
├── components/          # React 组件
│   ├── common/         # 通用组件（Button, Input, Modal等）
│   ├── auth/           # 认证相关组件
│   ├── password/       # 密码管理组件
│   ├── generator/      # 密码生成器组件
│   └── layout/         # 布局组件
├── contexts/           # React Context
├── hooks/              # 自定义 Hooks
├── utils/              # 工具函数
│   ├── crypto.ts       # 加密解密
│   ├── generator.ts    # 密码生成
│   └── storage.ts      # localStorage 操作
├── styles/             # 全局样式和变量
├── types/              # TypeScript 类型定义
├── App.tsx
└── main.tsx
```

---

## 二、数据设计

### 2.1 数据类型

```typescript
// 密码分类
type Category = 'social' | 'finance' | 'ecommerce' | 'work' | 'other';

// 密码项
interface Password {
  id: string;
  name: string;
  account: string;
  password: string;
  category: Category;
  url?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// 密码生成规则
interface GenerationRule {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

// 应用数据
interface AppData {
  passwords: Password[];
  generationRule: GenerationRule;
}

// 加密数据（存储用）
interface EncryptedData {
  iv: string;           // AES 初始化向量
  salt: string;          // PBKDF2 盐值
  ciphertext: string;    // 加密内容
}
```

### 2.2 存储结构

localStorage 存储内容：

| Key | 存储内容 |
|-----|----------|
| `pm_master_hash` | 主密码的 PBKDF2 哈希值（用于验证） |
| `pm_salt` | 全局盐值（用于加密密码数据） |
| `pm_data` | 加密后的密码数据（AES-GCM） |
| `pm_rule` | 密码生成规则（明文存储） |

---

## 三、安全设计

### 3.1 加密流程

```
用户设置主密码：
1. 生成随机盐值 salt
2. 用 PBKDF2(100000次迭代) 派生密钥
3. 存储 master_hash = PBKDF2(password, salt)

用户登录：
1. 读取存储的 salt
2. 用输入密码计算 hash
3. 与存储的 master_hash 对比

加密密码数据：
1. 用主密码派生 AES 密钥
2. 生成随机 IV
3. AES-GCM 加密数据
4. 存储 {iv, salt, ciphertext}
```

### 3.2 密钥派生参数

- **PBKDF2**：
  - 迭代次数：100000
  - 哈希算法：SHA-256
  - 派生长度：256位

- **AES-GCM**：
  - 密钥长度：256位
  - IV 长度：12字节

---

## 四、页面设计

### 4.1 页面结构

```
┌─────────────────────────────┐
│         登录页              │  ← 首次访问/每次打开
├─────────────────────────────┤
│        主应用布局            │
│  ┌─────────────────────┐   │
│  │      顶部导航        │   │
│  ├─────────────────────┤   │
│  │                     │   │
│  │     内容区域        │   │
│  │                     │   │
│  ├─────────────────────┤   │
│  │      底部导航       │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### 4.2 页面列表

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | `/login` | 主密码输入/设置 |
| 密码列表 | `/` | 首页，显示所有密码 |
| 密码详情 | `/password/:id` | 查看/编辑单个密码 |
| 添加密码 | `/password/new` | 新增密码 |
| 密码生成器 | `/generator` | 生成密码页面 |
| 设置页 | `/settings` | 修改规则、关于等 |

### 4.3 底部导航

- **密码** (`/`) - 密码列表入口
- **生成** (`/generator`) - 密码生成器
- **设置** (`/settings`) - 设置页面

---

## 五、组件设计

### 5.1 通用组件

| 组件 | 功能 |
|------|------|
| Button | 按钮，支持 primary/secondary/danger 样式 |
| Input | 输入框，支持密码输入（带显示/隐藏） |
| Select | 下拉选择，用于分类选择 |
| Modal | 模态框，确认删除等操作 |
| Tabs | 标签页，分类筛选 |
| SearchBar | 搜索框 |
| PasswordStrength | 密码强度指示器 |

### 5.2 业务组件

| 组件 | 功能 |
|------|------|
| PasswordCard | 密码卡片，显示名称、账号、分类、强度 |
| PasswordForm | 密码表单，新增/编辑用 |
| GeneratorPanel | 密码生成面板 |
| RuleEditor | 生成规则编辑器 |

---

## 六、功能流程

### 6.1 首次使用流程

```
1. 打开应用 → 检测无主密码 → 跳转设置主密码页
2. 用户输入主密码 → 确认主密码
3. 验证通过 → 初始化空数据 → 跳转密码列表（空）
```

### 6.2 日常使用流程

```
1. 打开应用 → 检测有主密码 → 跳转登录页
2. 输入主密码 → 验证
3. 验证通过 → 跳转密码列表
4. 浏览/搜索/添加/编辑密码
5. 关闭浏览器 → 数据已加密保存在 localStorage
```

### 6.3 添加密码流程

```
1. 点击底部导航"+"或添加按钮
2. 选择手动输入或自动生成
3. 填写密码信息
4. 点击保存 → 加密存储 → 返回列表
```

### 6.4 密码生成流程

```
1. 进入生成器页面
2. 选择或自定义规则
3. 点击生成 → 显示密码
4. 可选择：
   - 复制到剪贴板
   - 再次生成
   - 保存为新密码
```

---

## 七、UI/UX 设计

### 7.1 色彩方案

```scss
// 变量定义
$primary: #1a73e8;        // 主色 - 蓝色
$primary-dark: #1557b0;    // 主色深色
$success: #34a853;         // 成功 - 绿色
$danger: #ea4335;          // 危险 - 红色
$warning: #fbbc04;         // 警告 - 黄色
$text-primary: #202124;    // 主文字
$text-secondary: #5f6368; // 次要文字
$background: #f8f9fa;      // 背景
$surface: #ffffff;         // 卡片表面
$border: #dadce0;          // 边框
```

### 7.2 密码强度颜色

| 强度 | 分数 | 颜色 |
|------|------|------|
| 弱 | 0-40 | 红色 #ea4335 |
| 中 | 41-70 | 黄色 #fbbc04 |
| 强 | 71-100 | 绿色 #34a853 |

### 7.3 分类颜色

| 分类 | 颜色 |
|------|------|
| 社交媒体 | 蓝色 #1a73e8 |
| 金融 | 绿色 #34a853 |
| 电商 | 橙色 #f97316 |
| 工作 | 紫色 #9333ea |
| 其他 | 灰色 #6b7280 |

### 7.4 响应式布局

```scss
// 移动端（默认）
.container {
  max-width: 100%;
  padding: 16px;
}

// PC端
@media (min-width: 768px) {
  .app-wrapper {
    max-width: 480px;
    margin: 40px auto;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}
```

---

## 八、错误处理

| 场景 | 处理方式 |
|------|----------|
| 主密码错误 | 显示错误提示，允许重试 |
| 加密失败 | 提示用户，阻止保存 |
| 解密失败 | 提示数据可能损坏，建议重置 |
| localStorage 满 | 提示存储空间不足 |
| 剪贴板复制失败 | 显示降级提示（手动复制） |

---

## 九、验收标准

### 9.1 功能验收

- [ ] 可以设置和验证主密码
- [ ] 可以添加、查看、编辑、删除密码
- [ ] 密码按分类显示和筛选
- [ ] 可以搜索密码
- [ ] 可以按名称、更新时间排序
- [ ] 可以生成符合规则的密码
- [ ] 可以自定义生成规则
- [ ] 密码可以显示/隐藏
- [ ] 密码可以一键复制
- [ ] 显示密码强度，弱密码有建议

### 9.2 视觉验收

- [ ] 移动端正常显示
- [ ] PC端居中显示（最大宽度480px）
- [ ] 底部导航可用
- [ ] 分类标签页可用
- [ ] 密码强度颜色正确显示

### 9.3 安全验收

- [ ] 主密码不会明文存储
- [ ] 密码数据加密存储
- [ ] 刷新页面需要重新登录

---

## 十、后续迭代（不在MVP范围）

- 云端同步
- 密码导入/导出
- 密码过期提醒
- 双因素认证支持
- 生物识别（指纹、面容）
- 浏览器插件
