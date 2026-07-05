'use client';

/**
 * 分区标签组件
 */

const CATEGORIES = {
  official: { label: '官方区', color: 'from-red-500 to-orange-500', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  tutorial: { label: '教程区', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  casual: { label: '杂谈区', color: 'from-green-500 to-teal-500', bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function getCategoryInfo(key: string) {
  return CATEGORIES[key as CategoryKey] || CATEGORIES.casual;
}

export function CategoryBadge({ category, size = 'sm' }: { category: string; size?: 'sm' | 'md' }) {
  const info = getCategoryInfo(category);
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${info.bg} ${info.text} ${info.border} ${sizeClasses}`}>
      {info.label}
    </span>
  );
}

// ============== 文章审核状态徽章 ==============

const POST_STATUSES = {
  pending: { label: '待审核', bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  approved: { label: '已通过', bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
  rejected: { label: '未通过', bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
} as const;

export type PostStatusKey = keyof typeof POST_STATUSES;

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const info = POST_STATUSES[status as PostStatusKey];
  if (!info) return null;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${info.bg} ${info.text} ${info.border} ${sizeClasses}`}>
      {info.label}
    </span>
  );
}

export { CATEGORIES, POST_STATUSES };
