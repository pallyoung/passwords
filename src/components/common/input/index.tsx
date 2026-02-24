// src/components/common/input/index.tsx

import { InputHTMLAttributes, useState } from 'react';
import styles from './index.module.scss';

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
