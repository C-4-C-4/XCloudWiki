'use client';

/**
 * 发布/编辑文章页面
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/forum/auth-context';
import { MarkdownEditor } from '@/components/forum/markdown-editor';
import { ImageUploader } from '@/components/forum/image-uploader';
import { CATEGORIES, type CategoryKey } from '@/components/forum/category-badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { apiCreatePost, apiGetPost, apiUpdatePost } from '@/components/forum/api';

const CATEGORY_OPTIONS: { key: CategoryKey; label: string; desc: string; adminOnly?: boolean }[] = [
  { key: 'official', label: '官方区', desc: '官方公告与活动（仅管理员）', adminOnly: true },
  { key: 'tutorial', label: '教程区', desc: '游戏攻略与新手指南' },
  { key: 'casual', label: '杂谈区', desc: '自由讨论与分享' },
];

function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isAdmin, isLoading: authLoading } = useAuth();

  const editId = searchParams.get('edit');
  const from = searchParams.get('from');
  const isEditMode = !!editId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryKey>('casual');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);

  // 审核提示弹窗
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'warning' | 'success' | 'info';
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', variant: 'info', onConfirm: () => {} });

  // 编辑模式加载文章数据
  useEffect(() => {
    if (!editId) return;
    (async () => {
      setLoadingPost(true);
      const { data, error: apiError } = await apiGetPost(Number(editId));
      if (data) {
        setTitle(data.post.title);
        setContent(data.post.content);
        setCategory(data.post.category as CategoryKey);
        setImages(data.post.images);
      }
      setLoadingPost(false);
    })();
  }, [editId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!title.trim()) {
        setError('请输入标题');
        return;
      }
      if (!content.trim()) {
        setError('请输入内容');
        return;
      }
      if (content.length > 500) {
        setError('内容超过 500 字限制');
        return;
      }

      setSubmitting(true);

      if (isEditMode) {
        const { error: apiError } = await apiUpdatePost(Number(editId), {
          title: title.trim(),
          content: content.trim(),
          category,
          images,
        });
        if (apiError) {
          setError(apiError);
          setSubmitting(false);
        } else {
          const targetUrl = from === 'admin' ? '/forum/admin?tab=posts' : `/forum/post?id=${editId}`;
          if (!isAdmin) {
            setConfirmDialog({
              open: true,
              title: '修改已保存',
              description: '文章需重新审核通过后才会在论坛展示。',
              variant: 'warning',
              onConfirm: () => router.push(targetUrl),
            });
          } else {
            router.push(targetUrl);
          }
        }
      } else {
        const { data, error: apiError } = await apiCreatePost({
          title: title.trim(),
          content: content.trim(),
          category,
          images,
        });
        if (apiError) {
          setError(apiError);
          setSubmitting(false);
        } else if (data) {
          const targetUrl = `/forum/post?id=${data.post.id}`;
          if (data.post.status === 'pending') {
            setConfirmDialog({
              open: true,
              title: '文章已提交',
              description: '等待管理员审核通过后将在论坛展示。',
              variant: 'info',
              onConfirm: () => router.push(targetUrl),
            });
          } else {
            router.push(targetUrl);
          }
        }
      }
    },
    [title, content, category, images, isEditMode, editId, router, isAdmin],
  );

  // 未登录提示
  if (!authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="size-12 text-fd-primary" />
        <p className="text-lg text-fd-foreground font-medium">请先登录</p>
        <p className="text-sm text-fd-muted-foreground">你需要登录才能发布文章</p>
        <Link href="/forum" className="text-fd-primary hover:opacity-90 transition-colors">
          ← 返回论坛
        </Link>
      </div>
    );
  }

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 text-fd-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 text-landing-foreground dark:text-landing-foreground-dark">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        {/* 返回 */}
        <div className="mb-6">
          <Link
            href={from === 'admin' ? '/forum/admin?tab=posts' : '/forum'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-fd-border bg-fd-secondary/30 text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {from === 'admin' ? '返回后台' : '返回论坛'}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-fd-foreground mb-8">
            {isEditMode ? '编辑文章' : '发布新文章'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-fd-foreground mb-2">文章标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入文章标题"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all text-lg"
              />
              <p className="text-xs text-fd-muted-foreground mt-1.5 text-right">{title.length}/100</p>
            </div>

            {/* 分区选择 */}
            <div>
              <label className="block text-sm font-medium text-fd-foreground mb-2">选择分区</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CATEGORY_OPTIONS.map((opt) => {
                  const disabled = opt.adminOnly && !isAdmin;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setCategory(opt.key)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        category === opt.key
                          ? 'border-fd-primary bg-fd-primary/5 ring-2 ring-fd-primary/20'
                          : disabled
                            ? 'border-fd-border opacity-40 cursor-not-allowed'
                            : 'border-fd-border hover:border-fd-foreground/20 hover:bg-fd-accent/50'
                      }`}
                    >
                      <p className="font-medium text-fd-foreground text-sm flex items-center gap-2">
                        <span className={`size-2 rounded-full flex-shrink-0 ${
                          opt.key === 'official' ? 'bg-red-500' :
                          opt.key === 'tutorial' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        {opt.label}
                      </p>
                      <p className="text-xs text-fd-muted-foreground mt-1.5">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Markdown 编辑器 */}
            <div>
              <label className="block text-sm font-medium text-fd-foreground mb-2">
                文章内容
                <span className="text-fd-muted-foreground font-normal ml-2">支持 Markdown 语法</span>
              </label>
              <MarkdownEditor value={content} onChange={setContent} maxLength={500} />
            </div>

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-fd-foreground mb-2">
                附加图片
                <span className="text-fd-muted-foreground font-normal ml-2">可选，最多 10 张</span>
              </label>
              <ImageUploader images={images} onChange={setImages} maxImages={10} />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-fd-primary-foreground bg-fd-primary hover:opacity-90 font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isEditMode ? '保存中...' : '发布中...'}
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    {isEditMode ? '保存修改' : '发布文章'}
                  </>
                )}
              </button>
              <Link
                href={from === 'admin' ? '/forum/admin?tab=posts' : '/forum'}
                className="px-6 py-3 rounded-xl text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors text-sm"
              >
                取消
              </Link>
            </div>
          </form>
        </motion.div>

        {/* 提示弹窗 */}
        <AlertDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          description={confirmDialog.description}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        />
      </div>
    </main>
  );
}

export default function WritePage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="size-8 text-fd-primary animate-spin" />
        </div>
      }>
        <WriteContent />
      </Suspense>
    </AuthProvider>
  );
}
