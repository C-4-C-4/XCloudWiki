'use client';

/**
 * 论坛首页 - 文章列表
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Shield, LogOut, Loader2, MessageSquare, Users, FileText, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/components/forum/auth-context';
import { AuthModal } from '@/components/forum/auth-modal';
import { PostCard } from '@/components/forum/post-card';
import { CATEGORIES, type CategoryKey } from '@/components/forum/category-badge';
import { apiListPosts, type PostSummary } from '@/components/forum/api';

const TABS = [
  { key: 'all', label: '全部', icon: MessageSquare },
  { key: 'official', label: '官方区', icon: Shield },
  { key: 'tutorial', label: '教程区', icon: FileText },
  { key: 'casual', label: '杂谈区', icon: Users },
] as const;

function ForumContent() {
  const { user, isLoggedIn, isAdmin, logout, isLoading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params: { category?: string; page?: number } = { page };
    if (activeTab !== 'all') params.category = activeTab;

    const { data } = await apiListPosts(params);
    if (data) {
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    }
    setLoading(false);
  }, [activeTab, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 text-landing-foreground dark:text-landing-foreground-dark">
      {/* 头部 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="text-xs text-fd-primary font-medium tracking-wider uppercase bg-fd-primary/10 px-3 py-1 rounded-full border border-fd-primary/20">
            XCloud 社区
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4 mb-4">
            论坛社区 / <span className="text-fd-primary">Forum</span>
          </h1>
          <p className="text-sm md:text-base text-fd-muted-foreground max-w-xl mx-auto">
            分享你的游戏攻略、展示精彩瞬间、讨论游戏心得
          </p>
        </motion.div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          {/* 分区 Tabs */}
          <div className="flex items-center gap-1 bg-fd-secondary/50 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-fd-card text-fd-foreground shadow-sm'
                    : 'text-fd-muted-foreground hover:text-fd-foreground'
                }`}
              >
                <tab.icon className="size-4" />
                <span className="max-sm:hidden">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 用户操作 */}
          <div className="flex items-center gap-3">
            {authLoading ? null : isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/forum/admin"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-fd-border text-fd-foreground hover:bg-fd-accent transition-colors"
                  >
                    <Shield className="size-4" />
                    管理后台
                  </Link>
                )}
                <Link
                  href={`/forum/profile?id=${user?.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-fd-border text-fd-foreground hover:bg-fd-accent transition-colors"
                >
                  <User className="size-4" />
                  {user?.gameId}
                </Link>
                <Link
                  href="/forum/write"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium text-fd-primary-foreground bg-fd-primary hover:opacity-90 transition-all shadow-sm"
                >
                  <PenLine className="size-4" />
                  发布文章
                </Link>
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group p-2 rounded-lg text-fd-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium text-fd-primary-foreground bg-fd-primary hover:opacity-90 transition-all shadow-sm"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>

        {/* 文章列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 text-fd-primary animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-fd-border rounded-2xl bg-fd-card/50"
          >
            <MessageSquare className="size-12 text-fd-muted-foreground mx-auto mb-4" />
            <p className="text-fd-muted-foreground text-lg mb-2">暂时还没有文章</p>
            <p className="text-fd-muted-foreground text-sm">
              {isLoggedIn ? '成为第一个发布文章的人吧！' : '登录后即可发布文章'}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="wait">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-fd-border text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <span className="text-sm text-fd-muted-foreground px-4">
                  {page} / {totalPages}
                  <span className="ml-2 text-xs">共 {total} 篇</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-fd-border text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 登录弹窗 */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  );
}

export default function ForumPage() {
  return (
    <AuthProvider>
      <ForumContent />
    </AuthProvider>
  );
}
