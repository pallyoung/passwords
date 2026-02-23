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
