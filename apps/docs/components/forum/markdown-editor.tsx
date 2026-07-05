'use client';

/**
 * Markdown 编辑器（编辑 + 实时预览）
 */

import { useState, useCallback } from 'react';
import { Eye, Pencil, Type, Bold, Italic, Code, ImageIcon, Link2, List, Quote, Minus, Loader2 } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import { apiUploadImage } from './api';
import { AlertDialog } from '@/components/ui/alert-dialog';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  maxLength = 500,
  placeholder = '输入 Markdown 内容...',
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const charCount = value.length;
  const isOverLimit = charCount > maxLength;

  const insertText = useCallback(
    (before: string, after: string = '') => {
      const textarea = document.getElementById('forum-editor') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const newText = value.substring(0, start) + before + selected + after + value.substring(end);
      onChange(newText);

      // 恢复光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selected.length;
      }, 0);
    },
    [value, onChange],
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data, error } = await apiUploadImage(file);
    setUploading(false);

    if (error || !data) {
      setErrorDialog({ open: true, message: error || '图片上传失败，请重试' });
    } else {
      insertText(`![图片](${data.url})`);
    }
    // 清空以便允许重新选择相同文件
    e.target.value = '';
  };

  const toolbar = [
    { icon: Bold, title: '粗体', action: () => insertText('**', '**'), disabled: uploading },
    { icon: Italic, title: '斜体', action: () => insertText('*', '*'), disabled: uploading },
    { icon: Code, title: '代码', action: () => insertText('`', '`'), disabled: uploading },
    { icon: Link2, title: '链接', action: () => insertText('[', '](url)'), disabled: uploading },
    {
      icon: ImageIcon,
      title: '图片上传并插入',
      action: () => document.getElementById('editor-image-file-input')?.click(),
      disabled: uploading,
      loading: uploading,
    },
    { icon: List, title: '列表', action: () => insertText('- '), disabled: uploading },
    { icon: Quote, title: '引用', action: () => insertText('> '), disabled: uploading },
    { icon: Minus, title: '分割线', action: () => insertText('\n---\n'), disabled: uploading },
  ];

  return (
    <div className="rounded-2xl border border-fd-border bg-fd-card overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-2 bg-fd-secondary/30">
        <div className="flex items-center gap-0.5">
          {toolbar.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={item.action}
              disabled={item.disabled}
              title={item.title}
              className="p-1.5 rounded-lg text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors disabled:opacity-40"
            >
              {item.loading ? (
                <Loader2 className="size-4 animate-spin text-fd-primary" />
              ) : (
                <item.icon className="size-4" />
              )}
            </button>
          ))}
          <input
            id="editor-image-file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${isOverLimit ? 'text-red-500 font-bold' : 'text-fd-muted-foreground'}`}>
            {charCount}/{maxLength}
          </span>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              preview
                ? 'bg-fd-primary/10 text-fd-primary'
                : 'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent'
            }`}
          >
            {preview ? <Eye className="size-3.5" /> : <Pencil className="size-3.5" />}
            {preview ? '预览' : '编辑'}
          </button>
        </div>
      </div>

      {/* 编辑/预览区域 */}
      {preview ? (
        <div className="min-h-[300px] max-h-[500px] overflow-y-auto p-6">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-fd-muted-foreground text-sm italic">暂无内容</p>
          )}
        </div>
      ) : (
        <textarea
          id="forum-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[300px] max-h-[500px] p-6 bg-transparent text-fd-foreground placeholder:text-fd-muted-foreground resize-y focus:outline-none font-mono text-sm leading-relaxed"
        />
      )}

      {/* 错误提示弹窗 */}
      <AlertDialog
        open={errorDialog.open}
        title="图片上传失败"
        description={errorDialog.message}
        variant="danger"
        onConfirm={() => setErrorDialog({ open: false, message: '' })}
        onCancel={() => setErrorDialog({ open: false, message: '' })}
      />
    </div>
  );
}
