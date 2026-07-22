'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'fumadocs-core/framework';

/**
 * 彩虹进度条组件
 * 在页面导航时显示一个彩虹渐变的顶部进度条
 */
export function RainbowProgressBar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathnameRef = useRef(pathname);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    clearTimers();
    setProgress(0);
    setVisible(true);
    setIsLoading(true);

    // 模拟进度增长，使用递减速率逐渐变慢
    let currentProgress = 0;
    timerRef.current = setInterval(() => {
      currentProgress += Math.max(0.5, (95 - currentProgress) * 0.03);
      if (currentProgress >= 95) {
        currentProgress = 95;
      }
      setProgress(currentProgress);
    }, 50);
  }, [clearTimers]);

  const finishProgress = useCallback(() => {
    clearTimers();
    setProgress(100);
    setIsLoading(false);

    // 完成后短暂显示再隐藏
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, [clearTimers]);

  // 监听路径变化来完成进度
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (isLoading) {
        finishProgress();
      }
    }
  }, [pathname, isLoading, finishProgress]);

  // 拦截链接点击事件启动进度条
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // 忽略外部链接、锚点链接、新窗口链接
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // 忽略当前页面的链接
      const url = new URL(href, window.location.origin);
      if (url.pathname === pathname) return;

      startProgress();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, startProgress]);

  // 组件卸载时清理
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return (
    <div
      className="rainbow-progress-bar"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background:
            'linear-gradient(90deg, #ff0000, #ff8800, #ffdd00, #00cc44, #0088ff, #6644ff, #cc44cc)',
          backgroundSize: '400% 100%',
          animation: 'rainbow-shift 2s linear infinite',
          borderRadius: '0 2px 2px 0',
          transition: isLoading
            ? 'width 0.15s ease'
            : 'width 0.25s ease-out',
          boxShadow: visible
            ? '0 0 8px rgba(255, 136, 0, 0.5), 0 0 4px rgba(0, 136, 255, 0.4)'
            : 'none',
        }}
      />
    </div>
  );
}
