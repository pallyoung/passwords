// src/store/state.ts

import { state, createStore } from '@relax-state/react';
import { GenerationRule, DEFAULT_RULE, Category, DEFAULT_REMINDER, ReminderSettings, Password } from '../types';

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
