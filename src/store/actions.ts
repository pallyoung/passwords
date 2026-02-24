// src/store/actions.ts

import { action } from '@relax-state/react';
import { store, passwordsState, ruleState, reminderSettingsState, isAuthenticatedState, isFirstTimeState, searchQueryState, selectedCategoryState } from './state';
import { Password, GenerationRule, DEFAULT_RULE, ReminderSettings, Category, DEFAULT_REMINDER } from '../types';

// 主密码
let masterPassword = '';

// Actions
export const setupMasterPasswordAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (s: any, password: string) => {
    const { setMasterPassword, saveData } = await import('../utils/storage');
    await setMasterPassword(password);
    masterPassword = password;
    const data = { passwords: [], generationRule: s.get(ruleState), reminderSettings: DEFAULT_REMINDER };
    await saveData(data, password);
    s.set(isFirstTimeState, false);
    s.set(isAuthenticatedState, true);
  },
  { name: 'setupMasterPassword' }
);

export const loginAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (s: any, password: string) => {
    const { verifyMasterPassword, loadData } = await import('../utils/storage');
    const isValid = await verifyMasterPassword(password);
    if (isValid) {
      masterPassword = password;
      const data = await loadData(password);
      s.set(passwordsState, data.passwords);
      s.set(ruleState, data.generationRule || DEFAULT_RULE);
      s.set(reminderSettingsState, data.reminderSettings || DEFAULT_REMINDER);
      s.set(isAuthenticatedState, true);
      return true;
    }
    return false;
  },
  { name: 'login' }
);

export const logoutAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (s: any) => {
    masterPassword = '';
    s.set(passwordsState, []);
    s.set(isAuthenticatedState, false);
  },
  { name: 'logout' }
);

export const addPasswordAction = action(
  async (s: typeof store, data: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { generateRandomString } = await import('../utils/crypto');
    const { saveData } = await import('../utils/storage');
    const now = Date.now();
    const newPassword: Password = {
      ...data,
      id: generateRandomString(16),
      createdAt: now,
      updatedAt: now,
    };
    const currentPasswords = s.get(passwordsState);
    const newPasswords = [...currentPasswords, newPassword];
    s.set(passwordsState, newPasswords);
    await saveData(
      { passwords: newPasswords, generationRule: s.get(ruleState), reminderSettings: s.get(reminderSettingsState) },
      masterPassword
    );
  },
  { name: 'addPassword' }
);

export const updatePasswordAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (s: any, { id, data }: { id: string; data: Partial<Password> }) => {
    const { saveData } = await import('../utils/storage');
    const currentPasswords = s.get(passwordsState);
    const newPasswords = currentPasswords.map((p: Password) =>
      p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
    );
    s.set(passwordsState, newPasswords);
    await saveData(
      { passwords: newPasswords, generationRule: s.get(ruleState), reminderSettings: s.get(reminderSettingsState) },
      masterPassword
    );
  },
  { name: 'updatePassword' }
);

export const deletePasswordAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (s: any, id: string) => {
    const { saveData } = await import('../utils/storage');
    const currentPasswords = s.get(passwordsState);
    const newPasswords = currentPasswords.filter((p: Password) => p.id !== id);
    s.set(passwordsState, newPasswords);
    await saveData(
      { passwords: newPasswords, generationRule: s.get(ruleState), reminderSettings: s.get(reminderSettingsState) },
      masterPassword
    );
  },
  { name: 'deletePassword' }
);

export const updateRuleAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (s: any, newRule: GenerationRule) => {
    const { saveData, saveRule } = await import('../utils/storage');
    s.set(ruleState, newRule);
    saveRule(newRule);
    await saveData(
      { passwords: s.get(passwordsState), generationRule: newRule, reminderSettings: s.get(reminderSettingsState) },
      masterPassword
    );
  },
  { name: 'updateRule' }
);

export const updateReminderSettingsAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const setSearchQueryAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (s: any, query: string) => {
    s.set(searchQueryState, query);
  },
  { name: 'setSearchQuery' }
);

export const setSelectedCategoryAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (s: any, category: Category | 'all') => {
    s.set(selectedCategoryState, category);
  },
  { name: 'setSelectedCategory' }
);

// 初始化检查
export const initAppAction = action(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (s: any) => {
    const { hasMasterPassword } = await import('../utils/storage');
    s.set(isFirstTimeState, !hasMasterPassword());
  },
  { name: 'initApp' }
);
