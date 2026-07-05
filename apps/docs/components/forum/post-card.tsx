'use client';

/**
 * 文章卡片组件
 */

import Link from 'next/link';
import Image from 'next/image';
import { Eye, Clock, ImageIcon } from 'lucide-react';
import { CategoryBadge, StatusBadge } from './category-badge';
import type { PostSummary } from './api';

function getMinecraftAvatar(gameId: string) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(gameId)}/32`;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr + 'Z');
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
}

export function PostCard({ post }: { post: PostSummary }) {
  const hasImages = post.images && post.images.length > 0;
  const isNotApproved = post.status && post.status !== 'approved';

  return (
    <Link
      href={`/forum/post?id=${post.id}`}
      className={`group block rounded-2xl border border-fd-border bg-fd-card p-5 transition-all duration-300 hover:border-fd-primary/30 hover:bg-fd-accent/10 hover:-translate-y-0.5 ${
        post.status === 'rejected' ? 'opacity-80' : ''
      }`}
    >
      {/* 头部：作者信息 + 分区 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Image
            src={post.author.avatar || getMinecraftAvatar(post.author.gameId)}
            alt={post.author.gameId}
            width={28}
            height={28}
            className="rounded-lg bg-fd-secondary"
            unoptimized
          />
          <div>
            <span className="text-sm font-medium text-fd-foreground">{post.author.gameId}</span>
            {post.author.role === 'admin' && (
              <span className="ml-1.5 text-[10px] font-bold text-fd-primary bg-fd-primary/10 px-1.5 py-0.5 rounded-full">
                官方
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isNotApproved && <StatusBadge status={post.status} />}
          <CategoryBadge category={post.category} />
        </div>
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-fd-foreground mb-2 line-clamp-2 group-hover:text-fd-primary transition-colors">
        {post.title}
      </h3>

      {/* 摘要 */}
      <p className="text-sm text-fd-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {post.summary}
      </p>

      {/* 图片预览 (只展示第一张作为大图) */}
      {hasImages && (
        <div className="relative w-full aspect-video max-h-52 rounded-xl overflow-hidden mb-4 bg-fd-secondary/30 border border-fd-border/50">
          <Image
            src={post.images[0]}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 600px"
            unoptimized
          />
          {post.images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium flex items-center gap-1">
              <ImageIcon className="size-3" />
              1 / {post.images.length}
            </div>
          )}
        </div>
      )}

      {/* 底部：时间 + 浏览数 + 图片数 */}
      <div className="flex items-center gap-4 text-xs text-fd-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatTime(post.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="size-3.5" />
          {post.viewCount}
        </span>
        {hasImages && (
          <span className="flex items-center gap-1">
            <ImageIcon className="size-3.5" />
            {post.images.length}
          </span>
        )}
      </div>
    </Link>
  );
}
