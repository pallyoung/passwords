// src/pages/Generator.tsx

import { useState, useEffect } from 'react';
import { useApp } from '../App';
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
