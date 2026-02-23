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
