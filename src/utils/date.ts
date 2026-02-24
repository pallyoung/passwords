// src/utils/date.ts

/**
 * 格式化更新时间显示
 * - 小于 1 天：刚刚更新
 * - 1-30 天：X 天前
 * - 30 天以上：X 月 X 日
 */
export function formatUpdateTime(updatedAt: number): string {
  const now = Date.now();
  const diffMs = now - updatedAt;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return '刚刚更新';
  }

  if (diffDays <= 30) {
    return `更新于 ${diffDays} 天前`;
  }

  const date = new Date(updatedAt);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `更新于 ${month}月${day}日`;
}

/**
 * 检查密码是否需要更新
 */
export function needsUpdate(updatedAt: number, reminderDays: number): boolean {
  const now = Date.now();
  const diffDays = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
  return diffDays > reminderDays;
}
