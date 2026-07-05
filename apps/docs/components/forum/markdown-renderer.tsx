'use client';

/**
 * Markdown 渲染器（客户端）
 * 轻量级 Markdown 解析，无需服务端渲染
 */

import { useMemo } from 'react';

/**
 * 将 Markdown 文本转换为 HTML
 * 支持：标题、粗体、斜体、代码块、行内代码、链接、图片、列表、引用、分割线
 */
function parseMarkdown(md: string): string {
  let html = md;

  // 转义 HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 代码块 (```code```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="forum-code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code class="forum-inline-code">$1</code>');

  // 图片 ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="forum-img" loading="lazy" />');

  // 链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="forum-link" target="_blank" rel="noopener noreferrer">$1</a>');

  // 标题
  html = html.replace(/^#### (.+)$/gm, '<h4 class="forum-h4">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="forum-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="forum-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="forum-h1">$1</h1>');

  // 粗体 + 斜体
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // 斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // 删除线
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // 引用
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="forum-blockquote">$1</blockquote>');

  // 无序列表
  html = html.replace(/^[*\-+] (.+)$/gm, '<li class="forum-li">$1</li>');
  html = html.replace(/(<li class="forum-li">.*<\/li>\n?)+/g, (match) => `<ul class="forum-ul">${match}</ul>`);

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="forum-li-ol">$1</li>');
  html = html.replace(/(<li class="forum-li-ol">.*<\/li>\n?)+/g, (match) => `<ol class="forum-ol">${match}</ol>`);

  // 分割线
  html = html.replace(/^---$/gm, '<hr class="forum-hr" />');

  // 段落（将连续的非标签文本包裹在 <p> 中）
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="forum-p">$1</p>');

  // 合并相邻的 blockquote
  html = html.replace(/<\/blockquote>\n<blockquote class="forum-blockquote">/g, '\n');

  return html;
}

export function MarkdownRenderer({ content, className = '' }: { content: string; className?: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className={`forum-markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
