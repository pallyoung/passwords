// src/store/index.ts

import { state, atom, action, createStore, Store } from '@relax-state/react';
import { Password, GenerationRule, DEFAULT_RULE, Category } from '../types';

// 创建 Store
export const store = createStore();

// 认证状态
export const isAuthenticatedState = state(false, 'isAuthenticated');
export const isFirstTimeState = state(true, 'isFirstTime');

// 密码列表
export const passwordsState = atom<Password[]>([], 'passwords');

// 生成规则
export const ruleState = atom<GenerationRule>(DEFAULT_RULE, 'rule');

// 搜索和筛选
export const searchQueryState = state('', 'searchQuery');
export const selectedCategoryState = state<Category | 'all'>('all', 'selectedCategory');

// 主密码
let masterPassword = '';

// Actions
export const setupMasterPasswordAction = action(async (password: string) => {
  const { setMasterPassword, saveData } = await import('../utils/storage');
  await setMasterPassword(password);
  masterPassword = password;
  const data = { passwords: [], generationRule: ruleState.get() };
  await saveData(data, password);
  isFirstTimeState.set(false);
  isAuthenticatedState.set(true);
}, { name: 'setupMasterPassword' });

export const loginAction = action(async (password: string) => {
  const { verifyMasterPassword, loadData } = await import('../utils/storage');
  const isValid = await verifyMasterPassword(password);
  if (isValid) {
    masterPassword = password;
    const data = await loadData(password);
    passwordsState.set(data.passwords);
    ruleState.set(data.generationRule || DEFAULT_RULE);
    isAuthenticatedState.set(true);
    return true;
  }
  return false;
}, { name: 'login' });

export const logoutAction = action(() => {
  masterPassword = '';
  passwordsState.set([]);
  isAuthenticatedState.set(false);
}, { name: 'logout' });

export const addPasswordAction = action(async (data: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { generateRandomString } = await import('../utils/crypto');
  const { saveData } = await import('../utils/storage');
  const now = Date.now();
  const newPassword: Password = {
    ...data,
    id: generateRandomString(16),
    createdAt: now,
    updatedAt: now,
  };
  const newPasswords = [...passwordsState.get(), newPassword];
  passwordsState.set(newPasswords);
  await saveData({ passwords: newPasswords, generationRule: ruleState.get() }, masterPassword);
}, { name: 'addPassword' });

export const updatePasswordAction = action(async (id: string, data: Partial<Password>) => {
  const { saveData } = await import('../utils/storage');
  const newPasswords = passwordsState.get().map(p =>
    p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
  );
  passwordsState.set(newPasswords);
  await saveData({ passwords: newPasswords, generationRule: ruleState.get() }, masterPassword);
}, { name: 'updatePassword' });

export const deletePasswordAction = action(async (id: string) => {
  const { saveData } = await import('../utils/storage');
  const newPasswords = passwordsState.get().filter(p => p.id !== id);
  passwordsState.set(newPasswords);
  await saveData({ passwords: newPasswords, generationRule: ruleState.get() }, masterPassword);
}, { name: 'deletePassword' });

export const updateRuleAction = action(async (newRule: GenerationRule) => {
  const { saveData, saveRule } = await import('../utils/storage');
  ruleState.set(newRule);
  saveRule(newRule);
  await saveData({ passwords: passwordsState.get(), generationRule: newRule }, masterPassword);
}, { name: 'updateRule' });

export const setSearchQueryAction = action((query: string) => {
  searchQueryState.set(query);
}, { name: 'setSearchQuery' });

export const setSelectedCategoryAction = action((category: Category | 'all') => {
  selectedCategoryState.set(category);
}, { name: 'setSelectedCategory' });

// 初始化检查
export const initAppAction = action(async () => {
  const { hasMasterPassword } = await import('../utils/storage');
  isFirstTimeState.set(!hasMasterPassword());
}, { name: 'initApp' });
