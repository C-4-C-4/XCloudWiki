'use client';

/**
 * 文章详情页 (使用查询参数 ?id=xxx 兼容静态导出)
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit3, Trash2, Eye, Clock, Loader2, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/forum/auth-context';
import { CategoryBadge, StatusBadge } from '@/components/forum/category-badge';
import { MarkdownRenderer } from '@/components/forum/markdown-renderer';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { apiGetPost, apiDeletePost, type PostDetail } from '@/components/forum/api';

function getMinecraftAvatar(gameId: string) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(gameId)}/64`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z');
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const [postData, setPostData] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const postId = Number(searchParams.get('id'));

  useEffect(() => {
    if (!postId) {
      setError('未指定文章 ID');
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error: apiError } = await apiGetPost(postId);
      if (apiError || !data) {
        setError(apiError || '获取文章失败');
      } else {
        setPostData(data);
      }
      setLoading(false);
    })();
  }, [postId]);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    const { error: apiError } = await apiDeletePost(postId);
    if (apiError) {
      setErrorDialog({ open: true, message: apiError });
      setDeleting(false);
      setDeleteConfirmOpen(false);
    } else {
      router.push('/forum');
    }
  }, [postId, router]);

  // 灯箱键盘控制
  useEffect(() => {
    if (lightboxIndex === null) return;
    const images = postData?.post.images || [];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, postData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="size-12 text-red-500" />
        <p className="text-fd-muted-foreground text-lg">{error || '文章不存在'}</p>
        <Link href="/forum" className="text-fd-primary hover:opacity-90 transition-colors font-medium">
          ← 返回论坛
        </Link>
      </div>
    );
  }

  const { post, canEdit } = postData;

  return (
    <div className="max-w-[800px] mx-auto px-6 md:px-12">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 分区标签 + 审核状态 */}
        <div className="mb-4 flex items-center gap-2">
          <CategoryBadge category={post.category} size="md" />
          {post.status && post.status !== 'approved' && (
            <StatusBadge status={post.status} size="md" />
          )}
        </div>

        {/* 审核状态横幅（仅作者/管理员能看到非 approved 文章，横幅只对他们展示） */}
        {post.status === 'pending' && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
            此文章正在等待管理员审核，仅你和管理员可见。
          </div>
        )}
        {post.status === 'rejected' && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            <p className="font-medium mb-1">此文章未通过审核</p>
            {post.rejectReason && <p>拒绝理由：{post.rejectReason}</p>}
            <p className="mt-2 text-xs">你可以编辑后重新提交审核。</p>
          </div>
        )}

        {/* 标题 */}
        <h1 className="text-3xl md:text-4xl font-bold text-fd-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        {/* 作者信息与操作按钮 */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-fd-border">
          <Link href={`/forum/profile?id=${post.author.id}`} className="flex items-center gap-3 group">
            <Image
              src={post.author.avatar || getMinecraftAvatar(post.author.gameId)}
              alt={post.author.gameId}
              width={44}
              height={44}
              className="rounded-xl bg-fd-secondary group-hover:opacity-85 transition-opacity"
              unoptimized
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-fd-foreground group-hover:text-fd-primary transition-colors">{post.author.gameId}</span>
                {post.author.role === 'admin' && (
                  <span className="text-[10px] font-bold text-fd-primary bg-fd-primary/10 px-1.5 py-0.5 rounded-full border border-fd-primary/20">
                    官方
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-fd-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="size-3" />
                  {post.viewCount} 次浏览
                </span>
              </div>
            </div>
          </Link>

          {/* 操作按钮组：返回按钮始终可见，编辑/删除限作者或管理员 */}
          <div className="flex items-center gap-2">
            <Link
              href="/forum"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
            >
              <ArrowLeft className="size-4" />
              返回论坛
            </Link>
            {canEdit && (
              <>
                <Link
                  href={`/forum/write?edit=${post.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
                >
                  <Edit3 className="size-4" />
                  编辑
                </Link>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                  {deleting ? '删除中...' : '删除'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Markdown 内容 */}
        <div className="mb-8">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* 图片展示 */}
        {post.images && post.images.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-fd-muted-foreground mb-3">附图 ({post.images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="relative aspect-video rounded-xl overflow-hidden bg-fd-secondary cursor-zoom-in group"
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.article>

      {/* 图片灯箱 */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md select-none"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="size-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : post.images.length - 1));
              }}
              className="absolute left-4 p-3 text-gray-400 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="size-8" />
            </button>
            <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={post.images[lightboxIndex]}
                alt=""
                fill
                className="object-contain"
                sizes="90vw"
                unoptimized
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev < post.images.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 p-3 text-gray-400 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="size-8" />
            </button>
            <span className="absolute bottom-4 text-gray-400 text-sm">
              {lightboxIndex + 1} / {post.images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={deleteConfirmOpen}
        title="确定删除这篇文章？"
        description="此操作不可撤销。"
        variant="danger"
        confirmText="删除"
        cancelText="取消"
        showCancel
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteConfirmOpen(false)}
      />

      {/* 错误提示弹窗 */}
      <AlertDialog
        open={errorDialog.open}
        title="操作失败"
        description={errorDialog.message}
        variant="danger"
        onConfirm={() => setErrorDialog({ open: false, message: '' })}
        onCancel={() => setErrorDialog({ open: false, message: '' })}
      />
    </div>
  );
}

export default function PostDetailPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 text-landing-foreground dark:text-landing-foreground-dark">
      <AuthProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="size-8 text-orange-500 animate-spin" />
          </div>
        }>
          <PostContent />
        </Suspense>
      </AuthProvider>
    </main>
  );
}
