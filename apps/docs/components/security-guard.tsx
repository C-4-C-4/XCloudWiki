'use client';

import { useEffect } from 'react';

/**
 * SecurityGuard 组件
 * 全局禁用右键菜单、开发者工具快捷键、查看源代码快捷键
 * 禁用文本选择与复制操作
 * 在所有环境下生效
 */
export function SecurityGuard() {
  useEffect(() => {
    // 禁用右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 禁用复制
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 禁用剪切
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 禁用文本选择
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // 禁用拖拽（防止拖拽文本到其他地方）
    const handleDragStart = (e: DragEvent) => {
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

      // Ctrl+C - 复制
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return;
      }

      // Ctrl+X - 剪切
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        return;
      }

      // Ctrl+A - 全选
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return;
      }
    };

    // CSS 层面：禁止文本选择
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
