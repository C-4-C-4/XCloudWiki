'use client';

import { useEffect } from 'react';

/**
 * SecurityGuard 组件
 * 全局禁用右键菜单、开发者工具快捷键、查看源代码快捷键
 * 保留正常的左键交互功能
 * 在所有环境下生效
 */
export function SecurityGuard() {
  useEffect(() => {
    // 禁用右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 禁用特定键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 - 开发者工具
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I - 开发者工具
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+J - 控制台
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+C - 元素检查器
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return;
      }

      // Ctrl+U - 查看源代码
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return;
      }

      // Ctrl+S - 保存页面
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
