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

// 提醒设置
export interface ReminderSettings {
  enabled: boolean;
  days: number;
}

// 应用数据
export interface AppData {
  passwords: Password[];
  generationRule: GenerationRule;
  reminderSettings?: ReminderSettings;
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

// 默认提醒设置
export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  days: 90,
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
