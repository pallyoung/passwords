# 密码管理器 - 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个移动端优先的网页密码管理器，具有主密码保护、密码加密存储、密码生成和强度检测功能

**Architecture:** 纯前端 React 应用，使用 localStorage 存储数据，Web Crypto API 加密

**Tech Stack:** React 18 + TypeScript, @relax-state/react, SCSS + Module CSS, Vite, Web Crypto API

---

## 项目初始化

### Task 1: 初始化 Vite 项目

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`

**Step 1: 创建项目配置文件**

```bash
# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "password-manager",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@relax-state/react": "^0.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "sass": "^1.69.0"
  }
}
EOF
```

```bash
# 创建 vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
EOF
```

```bash
# 创建 tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
```

```bash
# 创建 tsconfig.node.json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

```bash
# 创建 index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>密码守护者</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

**Step 2: 安装依赖**

```bash
npm install
```

**Step 3: 提交**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json index.html
git commit -m "chore: initialize Vite project"
```

---

## 类型定义和工具函数

### Task 2: 创建类型定义

**Files:**
- Create: `src/types/index.ts`

**Step 1: 创建类型文件**

```typescript
// src/types/index.ts

// 密码分类
export type Category = 'social' | 'finance' | 'ecommerce' | 'work' | 'other';

// 密码项
export interface Password {
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
export interface GenerationRule {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

// 应用数据
export interface AppData {
  passwords: Password[];
  generationRule: GenerationRule;
}

// 默认生成规则
export const DEFAULT_RULE: GenerationRule = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: true,
};

// 分类配置
export const CATEGORY_CONFIG: Record<Category, { label: string; color: string }> = {
  social: { label: '社交媒体', color: '#1a73e8' },
  finance: { label: '金融', color: '#34a853' },
  ecommerce: { label: '电商', color: '#f97316' },
  work: { label: '工作', color: '#9333ea' },
  other: { label: '其他', color: '#6b7280' },
};

// 密码强度等级
export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  score: number;
  strength: PasswordStrength;
  suggestions: string[];
}
```

**Step 2: 提交**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 3: 创建加密工具

**Files:**
- Create: `src/utils/crypto.ts`

**Step 1: 编写加密工具**

```typescript
// src/utils/crypto.ts

// 生成随机字符串
export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// PBKDF2 派生密钥
async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// AES-GCM 加密
export async function encrypt(plaintext: string, password: string, salt: string): Promise<{ iv: string; ciphertext: string }> {
  const key = await deriveKey(password, salt);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    iv: Array.from(iv, byte => byte.toString(16).padStart(2, '0')).join(''),
    ciphertext: Array.from(new Uint8Array(encrypted), byte => byte.toString(16).padStart(2, '0')).join(''),
  };
}

// AES-GCM 解密
export async function decrypt(encryptedData: { iv: string; ciphertext: string }, password: string, salt: string): Promise<string> {
  const key = await deriveKey(password, salt);
  const decoder = new TextDecoder();

  const iv = new Uint8Array(encryptedData.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const ciphertext = new Uint8Array(encryptedData.ciphertext.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}

// PBKDF2 哈希（用于主密码验证）
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}
```

**Step 2: 提交**

```bash
git add src/utils/crypto.ts
git commit -m "feat: add crypto utilities"
```

---

### Task 4: 创建密码生成工具

**Files:**
- Create: `src/utils/generator.ts`

**Step 1: 编写密码生成器**

```typescript
// src/utils/generator.ts

import { GenerationRule } from '../types';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = '0O1lI';

// 根据规则生成密码
export function generatePassword(rule: GenerationRule): string {
  let charset = '';
  let required: string[] = [];

  if (rule.includeUppercase) {
    const chars = rule.excludeAmbiguous
      ? UPPERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
      : UPPERCASE;
    charset += chars;
    required.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (rule.includeLowercase) {
    const chars = rule.excludeAmbiguous
      ? LOWERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
      : LOWERCASE;
    charset += chars;
    required.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (rule.includeNumbers) {
    const chars = rule.excludeAmbiguous
      ? NUMBERS.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
      : NUMBERS;
    charset += chars;
    required.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (rule.includeSymbols) {
    charset += SYMBOLS;
    required.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }

  if (!charset) {
    return '';
  }

  // 生成长度减去必含字符的数量，剩余随机填充
  const remainingLength = rule.length - required.length;
  const randomChars: string[] = [];

  for (let i = 0; i < remainingLength; i++) {
    randomChars.push(charset[Math.floor(Math.random() * charset.length)]);
  }

  // 合并并打乱
  const allChars = [...required, ...randomChars];
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join('');
}

// 计算密码强度
export function calculateStrength(password: string): { score: number; strength: 'weak' | 'medium' | 'strong'; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 25;

  // 检查弱密码模式
  if (/^[a-zA-Z]+$/.test(password)) {
    score -= 20;
    suggestions.push('添加数字和特殊字符以增强强度');
  }
  if (/^[0-9]+$/.test(password)) {
    score -= 30;
    suggestions.push('添加字母和特殊字符以增强强度');
  }
  if (password.length < 8) {
    suggestions.push('密码至少需要8个字符');
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push('添加大写字母');
  }
  if (!/[a-z]/.test(password)) {
    suggestions.push('添加小写字母');
  }
  if (!/[0-9]/.test(password)) {
    suggestions.push('添加数字');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    suggestions.push('添加特殊字符');
  }

  score = Math.max(0, Math.min(100, score));

  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 40) strength = 'weak';
  else if (score <= 70) strength = 'medium';
  else strength = 'strong';

  return { score, strength, suggestions: suggestions.slice(0, 3) };
}
```

**Step 2: 提交**

```bash
git add src/utils/generator.ts
git commit -m "feat: add password generator"
```

---

### Task 5: 创建存储工具

**Files:**
- Create: `src/utils/storage.ts`

**Step 1: 编写存储工具**

```typescript
// src/utils/storage.ts

import { AppData, GenerationRule, DEFAULT_RULE } from '../types';
import { encrypt, decrypt, hashPassword, generateRandomString } from './crypto';

const STORAGE_KEYS = {
  MASTER_HASH: 'pm_master_hash',
  SALT: 'pm_salt',
  DATA: 'pm_data',
  RULE: 'pm_rule',
} as const;

// 获取或生成盐值
function getSalt(): string {
  let salt = localStorage.getItem(STORAGE_KEYS.SALT);
  if (!salt) {
    salt = generateRandomString(32);
    localStorage.setItem(STORAGE_KEYS.SALT, salt);
  }
  return salt;
}

// 检查是否已设置主密码
export function hasMasterPassword(): boolean {
  return !!localStorage.getItem(STORAGE_KEYS.MASTER_HASH);
}

// 设置主密码
export async function setMasterPassword(password: string): Promise<void> {
  const salt = getSalt();
  const hash = await hashPassword(password, salt);
  localStorage.setItem(STORAGE_KEYS.MASTER_HASH, hash);
}

// 验证主密码
export async function verifyMasterPassword(password: string): Promise<boolean> {
  const salt = getSalt();
  const storedHash = localStorage.getItem(STORAGE_KEYS.MASTER_HASH);
  if (!storedHash) return false;

  const inputHash = await hashPassword(password, salt);
  return inputHash === storedHash;
}

// 加密保存数据
export async function saveData(data: AppData, password: string): Promise<void> {
  const salt = getSalt();
  const plaintext = JSON.stringify(data);
  const encrypted = await encrypt(plaintext, password, salt);
  localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(encrypted));
}

// 解密加载数据
export async function loadData(password: string): Promise<AppData> {
  const salt = getSalt();
  const encryptedStr = localStorage.getItem(STORAGE_KEYS.DATA);
  if (!encryptedStr) {
    return { passwords: [], generationRule: DEFAULT_RULE };
  }

  const encrypted = JSON.parse(encryptedStr);
  const plaintext = await decrypt(encrypted, password, salt);
  return JSON.parse(plaintext);
}

// 保存生成规则
export function saveRule(rule: GenerationRule): void {
  localStorage.setItem(STORAGE_KEYS.RULE, JSON.stringify(rule));
}

// 加载生成规则
export function loadRule(): GenerationRule {
  const stored = localStorage.getItem(STORAGE_KEYS.RULE);
  if (!stored) return DEFAULT_RULE;
  try {
    return { ...DEFAULT_RULE, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_RULE;
  }
}
```

**Step 2: 提交**

```bash
git add src/utils/storage.ts
git commit -m "feat: add storage utilities"
```

---

## 状态管理

### Task 6: 创建应用 Context

**Files:**
- Create: `src/contexts/AppContext.tsx`

**Step 1: 创建 Context**

```typescript
// src/contexts/AppContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Password, GenerationRule, AppData, DEFAULT_RULE, Category } from '../types';
import {
  hasMasterPassword,
  setMasterPassword,
  verifyMasterPassword,
  saveData,
  loadData,
  saveRule,
  loadRule
} from '../utils/storage';
import { generateRandomString } from '../utils/crypto';

interface AppContextType {
  // 认证状态
  isAuthenticated: boolean;
  isFirstTime: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setupMasterPassword: (password: string) => Promise<void>;

  // 密码管理
  passwords: Password[];
  addPassword: (password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePassword: (id: string, data: Partial<Password>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;

  // 生成规则
  rule: GenerationRule;
  updateRule: (rule: GenerationRule) => Promise<void>;

  // 搜索和筛选
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'all';
  setSelectedCategory: (category: Category | 'all') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [rule, setRuleState] = useState<GenerationRule>(DEFAULT_RULE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [masterPassword, setMasterPasswordState] = useState<string>('');

  useEffect(() => {
    setIsFirstTime(!hasMasterPassword());
  }, []);

  const setupMasterPassword = async (password: string) => {
    await setMasterPassword(password);
    setMasterPasswordState(password);
    const data: AppData = { passwords: [], generationRule: rule };
    await saveData(data, password);
    setIsFirstTime(false);
    setIsAuthenticated(true);
  };

  const login = async (password: string): Promise<boolean> => {
    const isValid = await verifyMasterPassword(password);
    if (isValid) {
      setMasterPasswordState(password);
      const data = await loadData(password);
      setPasswords(data.passwords);
      setRuleState(data.generationRule || DEFAULT_RULE);
      setIsAuthenticated(true);
    }
    return isValid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPasswords([]);
    setMasterPasswordState('');
  };

  const addPassword = async (data: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newPassword: Password = {
      ...data,
      id: generateRandomString(16),
      createdAt: now,
      updatedAt: now,
    };
    const newPasswords = [...passwords, newPassword];
    setPasswords(newPasswords);
    await saveData({ passwords: newPasswords, generationRule: rule }, masterPassword);
  };

  const updatePassword = async (id: string, data: Partial<Password>) => {
    const newPasswords = passwords.map(p =>
      p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
    );
    setPasswords(newPasswords);
    await saveData({ passwords: newPasswords, generationRule: rule }, masterPassword);
  };

  const deletePassword = async (id: string) => {
    const newPasswords = passwords.filter(p => p.id !== id);
    setPasswords(newPasswords);
    await saveData({ passwords: newPasswords, generationRule: rule }, masterPassword);
  };

  const updateRule = async (newRule: GenerationRule) => {
    setRuleState(newRule);
    saveRule(newRule);
    await saveData({ passwords, generationRule: newRule }, masterPassword);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      isFirstTime,
      login,
      logout,
      setupMasterPassword,
      passwords,
      addPassword,
      updatePassword,
      deletePassword,
      rule,
      updateRule,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

**Step 2: 提交**

```bash
git add src/contexts/AppContext.tsx
git commit -m "feat: add AppContext for state management"
```

---

## 通用组件

### Task 7: 创建通用组件

**Files:**
- Create: `src/components/common/Button.module.scss`
- Create: `src/components/common/Button.tsx`
- Create: `src/components/common/Input.module.scss`
- Create: `src/components/common/Input.tsx`
- Create: `src/components/common/Modal.module.scss`
- Create: `src/components/common/Modal.tsx`

**Step 1: 创建 Button 组件**

```scss
// src/components/common/Button.module.scss

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    background: #1a73e8;
    color: white;

    &:hover:not(:disabled) {
      background: #1557b0;
    }
  }

  &.secondary {
    background: #f1f3f4;
    color: #202124;

    &:hover:not(:disabled) {
      background: #e8eaed;
    }
  }

  &.danger {
    background: #ea4335;
    color: white;

    &:hover:not(:disabled) {
      background: #c5221f;
    }
  }

  &.fullWidth {
    width: 100%;
  }
}
```

```typescript
// src/components/common/Button.tsx

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    fullWidth && styles.fullWidth,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
```

**Step 2: 创建 Input 组件**

```scss
// src/components/common/Input.module.scss

.inputWrapper {
  position: relative;
  width: 100%;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #1a73e8;
  }

  &.error {
    border-color: #ea4335;
  }
}

.toggleVisibility {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #5f6368;
  padding: 4px;
}

.errorMessage {
  color: #ea4335;
  font-size: 12px;
  margin-top: 4px;
}
```

```typescript
// src/components/common/Input.tsx

import { InputHTMLAttributes, useState } from 'react';
import styles from './Input.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showToggle?: boolean;
}

export function Input({
  error,
  showToggle = false,
  className = '',
  type = 'text',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={styles.inputWrapper}>
      <input
        type={isPassword && showPassword ? 'text' : type}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        {...props}
      />
      {showToggle && isPassword && (
        <button
          type="button"
          className={styles.toggleVisibility}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}
```

**Step 3: 创建 Modal 组件**

```scss
// src/components/common/Modal.module.scss

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 360px;
  padding: 24px;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #202124;
}

.content {
  margin-bottom: 20px;
  color: #5f6368;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

```typescript
// src/components/common/Modal.tsx

import { ReactNode, useEffect } from 'react';
import { Button } from './Button';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>{children}</div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 4: 提交**

```bash
git add src/components/common/
git commit -m "feat: add common UI components"
```

---

## 页面组件

### Task 8: 创建登录页

**Files:**
- Create: `src/pages/Login.module.scss`
- Create: `src/pages/Login.tsx`

**Step 1: 创建登录页**

```scss
// src/pages/Login.module.scss

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8f9fa;
}

.card {
  width: 100%;
  max-width: 360px;
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
  color: #1a73e8;
}

.subtitle {
  text-align: center;
  color: #5f6368;
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error {
  color: #ea4335;
  text-align: center;
  font-size: 14px;
}
```

```typescript
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
```

**Step 2: 提交**

```bash
git add src/pages/Login.module.scss src/pages/Login.tsx
git commit -m "feat: add LoginPage"
```

---

### Task 9: 创建主布局和导航

**Files:**
- Create: `src/components/layout/Layout.module.scss`
- Create: `src/components/layout/Layout.tsx`
- Create: `src/App.module.scss`

**Step 1: 创建布局**

```scss
// src/components/layout/Layout.module.scss

.container {
  min-height: 100vh;
  background: #f8f9fa;
}

.content {
  max-width: 480px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .content {
    margin: 40px auto;
    min-height: auto;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .container {
    padding-bottom: 40px;
  }
}

.nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #dadce0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 100;

  @media (min-width: 768px) {
    position: sticky;
    border-radius: 0 0 12px 12px;
  }
}

.navItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  color: #5f6368;
  text-decoration: none;
  font-size: 12px;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;

  &.active {
    color: #1a73e8;
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

.navIcon {
  font-size: 20px;
}

.main {
  padding: 16px;
  padding-bottom: 80px;

  @media (min-width: 768px) {
    padding: 24px;
    padding-bottom: 24px;
  }
}
```

```typescript
// src/components/layout/Layout.tsx

import { ReactNode } from 'react';
import { useApp } from '../../contexts/AppContext';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'passwords' | 'generator' | 'settings';
  onTabChange: (tab: 'passwords' | 'generator' | 'settings') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <main className={styles.main}>
          {children}
        </main>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === 'passwords' ? styles.active : ''}`}
            onClick={() => onTabChange('passwords')}
          >
            <span className={styles.navIcon}>🔐</span>
            密码
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'generator' ? styles.active : ''}`}
            onClick={() => onTabChange('generator')}
          >
            <span className={styles.navIcon}>⚡</span>
            生成
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => onTabChange('settings')}
          >
            <span className={styles.navIcon}>⚙️</span>
            设置
          </button>
        </nav>
      </div>
    </div>
  );
}
```

**Step 2: 创建 App 样式**

```scss
// src/App.module.scss

.app {
  min-height: 100vh;
}
```

**Step 3: 提交**

```bash
git add src/components/layout/Layout.module.scss src/components/layout/Layout.tsx src/App.module.scss
git commit -m "feat: add Layout component"
```

---

### Task 10: 创建密码列表页

**Files:**
- Create: `src/pages/PasswordList.module.scss`
- Create: `src/pages/PasswordList.tsx`
- Create: `src/components/password/PasswordCard.module.scss`
- Create: `src/components/password/PasswordCard.tsx`

**Step 1: 创建密码卡片**

```scss
// src/components/password/PasswordCard.module.scss

.card {
  background: white;
  border: 1px solid #dadce0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1a73e8;
    box-shadow: 0 2px 8px rgba(26, 115, 232, 0.1);
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account {
  font-size: 14px;
  color: #5f6368;
}

.category {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.strength {
  font-size: 12px;

  &.weak { color: #ea4335; }
  &.medium { color: #fbbc04; }
  &.strong { color: #34a853; }
}

.actions {
  display: flex;
  gap: 8px;
}

.actionBtn {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  color: #5f6368;
  border-radius: 4px;

  &:hover {
    background: #f1f3f4;
  }
}
```

```typescript
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
```

**Step 2: 创建密码列表页**

```scss
// src/pages/PasswordList.module.scss

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
}

.searchWrapper {
  position: relative;
  margin-bottom: 16px;
}

.searchInput {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #dadce0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #1a73e8;
  }
}

.searchIcon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #5f6368;
}

.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 12px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #dadce0;
  background: white;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: #1a73e8;
    color: white;
    border-color: #1a73e8;
  }
}

.list {
  min-height: 200px;
}

.empty {
  text-align: center;
  padding: 48px 16px;
  color: #5f6368;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .text {
    font-size: 16px;
  }
}

.fab {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #1a73e8;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  @media (min-width: 768px) {
    bottom: 100px;
  }
}
```

```typescript
// src/pages/PasswordList.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { PasswordCard } from '../components/password/PasswordCard';
import { Modal } from '../components/common/Modal';
import { Category, CATEGORY_CONFIG } from '../types';
import styles from './PasswordList.module.scss';

type TabCategory = Category | 'all';

const CATEGORIES: TabCategory[] = ['all', 'social', 'finance', 'ecommerce', 'work', 'other'];

export function PasswordListPage() {
  const navigate = useNavigate();
  const {
    passwords,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    deletePassword,
    logout,
  } = useApp();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copyText, setCopyText] = useState('');

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.account.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyText('复制成功');
      setTimeout(() => setCopyText(''), 2000);
    } catch {
      setCopyText('复制失败');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePassword(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryLabel = (cat: TabCategory) => {
    if (cat === 'all') return '全部';
    return CATEGORY_CONFIG[cat].label;
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>密码</h1>
        <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
          🚪
        </button>
      </div>

      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索密码..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.tabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.tab} ${selectedCategory === cat ? styles.active : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filteredPasswords.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.icon}>🔐</div>
            <div className={styles.text}>
              {passwords.length === 0 ? '还没有密码，点击下方添加' : '没有找到匹配的密码'}
            </div>
          </div>
        ) : (
          filteredPasswords.map(p => (
            <PasswordCard
              key={p.id}
              password={p}
              onClick={() => navigate(`/password/${p.id}`)}
              onCopy={() => handleCopy(p.password)}
              onDelete={() => setDeleteId(p.id)}
            />
          ))
        )}
      </div>

      <button className={styles.fab} onClick={() => navigate('/password/new')}>
        +
      </button>

      {copyText && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#34a853',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
        }}>
          {copyText}
        </div>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="确认删除"
        onConfirm={handleDelete}
        confirmText="删除"
        danger
      >
        确定要删除这个密码吗？此操作无法撤销。
      </Modal>
    </div>
  );
}
```

**Step 3: 提交**

```bash
git add src/pages/PasswordList.module.scss src/pages/PasswordList.tsx
git add src/components/password/PasswordCard.module.scss src/components/password/PasswordCard.tsx
git commit -m "feat: add PasswordListPage"
```

---

### Task 11: 创建密码详情/编辑页

**Files:**
- Create: `src/pages/PasswordDetail.module.scss`
- Create: `src/pages/PasswordDetail.tsx`

**Step 1: 创建密码详情页**

```scss
// src/pages/PasswordDetail.module.scss

.container {
  padding-bottom: 24px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.backBtn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  flex: 1;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
}

.passwordWrapper {
  display: flex;
  gap: 8px;

  input {
    flex: 1;
  }
}

.generateBtn {
  background: #f1f3f4;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  font-size: 18px;

  &:hover {
    background: #e8eaed;
  }
}

.select {
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
}

.strengthIndicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.strengthBar {
  flex: 1;
  height: 4px;
  background: #e8eaed;
  border-radius: 2px;
  overflow: hidden;

  .fill {
    height: 100%;
    transition: all 0.3s ease;

    &.weak { background: #ea4335; }
    &.medium { background: #fbbc04; }
    &.strong { background: #34a853; }
  }
}

.strengthText {
  font-size: 12px;

  &.weak { color: #ea4335; }
  &.medium { color: #fbbc04; }
  &.strong { color: #34a853; }
}

.suggestions {
  margin-top: 8px;

  .suggestion {
    font-size: 12px;
    color: #ea4335;
    margin-bottom: 4px;
  }
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
```

```typescript
// src/pages/PasswordDetail.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Category, CATEGORY_CONFIG, DEFAULT_RULE } from '../types';
import { generatePassword, calculateStrength } from '../utils/generator';
import styles from './PasswordDetail.module.scss';

const CATEGORIES: Category[] = ['social', 'finance', 'ecommerce', 'work', 'other'];

export function PasswordDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { passwords, addPassword, updatePassword, rule } = useApp();

  const isNew = id === 'new';
  const existing = !isNew ? passwords.find(p => p.id === id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [account, setAccount] = useState(existing?.account || '');
  const [password, setPassword] = useState(existing?.password || '');
  const [category, setCategory] = useState<Category>(existing?.category || 'other');
  const [url, setUrl] = useState(existing?.url || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [showPassword, setShowPassword] = useState(false);

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
      await updatePassword(existing.id, { name, account, password, category, url, notes });
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
```

**Step 2: 提交**

```bash
git add src/pages/PasswordDetail.module.scss src/pages/PasswordDetail.tsx
git commit -m "feat: add PasswordDetailPage"
```

---

### Task 12: 创建密码生成器页

**Files:**
- Create: `src/pages/Generator.module.scss`
- Create: `src/pages/Generator.tsx`

**Step 1: 创建生成器页**

```scss
// src/pages/Generator.module.scss

.container {
  padding-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 24px;
}

.passwordDisplay {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
}

.passwordText {
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  word-break: break-all;
  font-family: monospace;
  margin-bottom: 16px;
  min-height: 28px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.actionBtn {
  background: white;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #f1f3f4;
  }
}

.section {
  margin-bottom: 24px;
}

.sectionTitle {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 16px;
}

.ruleGrid {
  display: grid;
  gap: 12px;
}

.ruleItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 8px;
}

.ruleLabel {
  font-size: 14px;
  color: #202124;
}

.toggle {
  position: relative;
  width: 48px;
  height: 24px;
  background: #dadce0;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &.active {
    background: #1a73e8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  &.active::after {
    transform: translateX(24px);
  }
}

.rangeWrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  background: #dadce0;
  border-radius: 2px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #1a73e8;
    border-radius: 50%;
    cursor: pointer;
  }
}

.rangeValue {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  min-width: 32px;
  text-align: center;
}
```

```typescript
// src/pages/Generator.tsx

import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/common/Button';
import { generatePassword } from '../utils/generator';
import { GenerationRule } from '../types';
import styles from './Generator.module.scss';

export function GeneratorPage() {
  const { rule, updateRule } = useApp();
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPassword(generatePassword(rule));
  }, []);

  const handleGenerate = () => {
    setPassword(generatePassword(rule));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleToggle = (key: keyof GenerationRule) => {
    if (key === 'length' || key === 'excludeAmbiguous') return;
    updateRule({ ...rule, [key]: !rule[key] } as GenerationRule);
  };

  const handleLengthChange = (value: number) => {
    updateRule({ ...rule, length: value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>密码生成器</h1>

      <div className={styles.passwordDisplay}>
        <div className={styles.passwordText}>{password}</div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleGenerate}>
            🔄 重新生成
          </button>
          <button className={styles.actionBtn} onClick={handleCopy}>
            {copied ? '✅ 已复制' : '📋 复制'}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>生成规则</h2>
        <div className={styles.ruleGrid}>
          <div className={styles.ruleItem}>
            <span className={styles.ruleLabel}>密码长度</span>
            <div className={styles.rangeWrapper}>
              <input
                type="range"
                className={styles.range}
                min="6"
                max="32"
                value={rule.length}
                onChange={e => handleLengthChange(Number(e.target.value))}
              />
              <span className={styles.rangeValue}>{rule.length}</span>
            </div>
          </div>

          <div className={styles.ruleItem}>
            <span className={styles.ruleLabel}>大写字母 (A-Z)</span>
            <button
              className={`${styles.toggle} ${rule.includeUppercase ? styles.active : ''}`}
              onClick={() => handleToggle('includeUppercase')}
            />
          </div>

          <div className={styles.ruleItem}>
            <span className={styles.ruleLabel}>小写字母 (a-z)</span>
            <button
              className={`${styles.toggle} ${rule.includeLowercase ? styles.active : ''}`}
              onClick={() => handleToggle('includeLowercase')}
            />
          </div>

          <div className={styles.ruleItem}>
            <span className={styles.ruleLabel}>数字 (0-9)</span>
            <button
              className={`${styles.toggle} ${rule.includeNumbers ? styles.active : ''}`}
              onClick={() => handleToggle('includeNumbers')}
            />
          </div>

          <div className={styles.ruleItem}>
            <span className={styles.ruleLabel}>特殊字符 (!@#$%)</span>
            <button
              className={`${styles.toggle} ${rule.includeSymbols ? styles.active : ''}`}
              onClick={() => handleToggle('includeSymbols')}
            />
          </div>

          <div className={styles.ruleItem}>
            <span className={styles.ruleLabel}>排除易混淆字符 (0O1lI)</span>
            <button
              className={`${styles.toggle} ${rule.excludeAmbiguous ? styles.active : ''}`}
              onClick={() => updateRule({ ...rule, excludeAmbiguous: !rule.excludeAmbiguous })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 提交**

```bash
git add src/pages/Generator.module.scss src/pages/Generator.tsx
git commit -m "feat: add GeneratorPage"
```

---

### Task 13: 创建设置页

**Files:**
- Create: `src/pages/Settings.module.scss`
- Create: `src/pages/Settings.tsx`

**Step 1: 创建设置页**

```scss
// src/pages/Settings.module.scss

.container {
  padding-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 24px;
}

.section {
  margin-bottom: 24px;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 600;
  color: #5f6368;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card {
  background: white;
  border: 1px solid #dadce0;
  border-radius: 12px;
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #dadce0;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }
}

.itemLabel {
  font-size: 16px;
  color: #202124;
}

.itemValue {
  font-size: 14px;
  color: #5f6368;
}

.version {
  text-align: center;
  color: #5f6368;
  font-size: 12px;
  margin-top: 24px;
}
```

```typescript
// src/pages/Settings.tsx

import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { setMasterPassword } from '../utils/storage';
import styles from './Settings.module.scss';

export function SettingsPage() {
  const { rule, updateRule, logout } = useApp();
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
      logout();
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
    </div>
  );
}
```

**Step 2: 提交**

```bash
git add src/pages/Settings.module.scss src/pages/Settings.tsx
git commit -m "feat: add SettingsPage"
```

---

## 主应用和路由

### Task 14: 创建 App.tsx 和 main.tsx

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/styles/global.scss`

**Step 1: 创建全局样式**

```scss
// src/styles/global.scss

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f8f9fa;
  color: #202124;
}

input, button, select, textarea {
  font-family: inherit;
}

button {
  border: none;
  background: none;
  padding: 0;
}

a {
  text-decoration: none;
  color: inherit;
}
```

**Step 2: 创建 App.tsx**

```typescript
// src/App.tsx

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginPage } from './pages/Login';
import { PasswordListPage } from './pages/PasswordList';
import { PasswordDetailPage } from './pages/PasswordDetail';
import { GeneratorPage } from './pages/Generator';
import { SettingsPage } from './pages/Settings';
import { Layout } from './components/layout/Layout';
import './styles/global.scss';
import styles from './App.module.scss';

function AppContent() {
  const { isAuthenticated, isFirstTime } = useApp();
  const [activeTab, setActiveTab] = useState<'passwords' | 'generator' | 'settings'>('passwords');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Routes>
        <Route path="/" element={<PasswordListPage />} />
        <Route path="/password/new" element={<PasswordDetailPage />} />
        <Route path="/password/:id" element={<PasswordDetailPage />} />
        <Route path="/generator" element={<GeneratorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className={styles.app}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
```

**Step 3: 创建 main.tsx**

```typescript
// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 4: 安装 react-router-dom**

```bash
npm install react-router-dom
```

**Step 5: 提交**

```bash
git add src/App.tsx src/main.tsx src/styles/global.scss
git commit -m "feat: add App component and routing"
```

---

## 验证构建

### Task 15: 验证构建

**Step 1: 构建项目**

```bash
npm run build
```

如果遇到类型错误，修复后重新构建。

**Step 2: 启动开发服务器**

```bash
npm run dev
```

访问 http://localhost:5173 验证应用。

**Step 3: 最终提交**

```bash
git add .
git commit -m "feat: complete password manager MVP"
```

---

## 完成

实现计划已完成。

**Plan complete and saved to `docs/plans/2026-02-23-password-manager-design.md`（设计文档）和实现计划（在工作树中）。**

### 两个执行选项：

1. **Subagent-Driven (本会话)** - 我为每个任务分派一个新的 subagent，任务之间进行审查，快速迭代

2. **Parallel Session (独立会话)** - 在新会话中使用 executing-plans，分批执行带检查点

你选择哪种方式？
