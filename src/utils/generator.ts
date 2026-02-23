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
