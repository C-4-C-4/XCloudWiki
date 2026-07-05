'use client';

/**
 * 个人主页 / 资料页
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, FileText, Loader2, Edit3, Save, X,
  Upload, AlertTriangle, MessageSquare, Shield,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/forum/auth-context';
import { PostCard } from '@/components/forum/post-card';
import { ImageUploader } from '@/components/forum/image-uploader';
import { AlertDialog } from '@/components/ui/alert-dialog';
import {
  apiGetUserProfile, apiUpdateProfile, apiListPosts, apiUploadImage,
  type PostSummary, type UserInfo
} from '@/components/forum/api';

function getMinecraftAvatar(gameId: string) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(gameId)}/96`;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, refreshUser } = useAuth();

  const profileId = Number(searchParams.get('id'));

  const [profile, setProfile] = useState<UserInfo['user'] | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');

  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 错误提示弹窗
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const isOwnProfile = currentUser !== null && currentUser.id === profileId;

  // 获取用户资料
  const fetchProfile = useCallback(async () => {
    if (!profileId) {
      setError('未指定用户 ID');
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    const { data, error: apiError } = await apiGetUserProfile(profileId);
    if (apiError || !data) {
      setError(apiError || '获取用户资料失败');
    } else {
      setProfile(data.user);
      setEditBio(data.user.bio || '');
      setNewAvatar(data.user.avatar);
    }
    setLoadingProfile(false);
  }, [profileId]);

  // 获取该用户发表的所有帖子 (客户端过滤)
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    // 这里我们拉取第 1 页的较多文章，然后进行客户端过滤
    const { data } = await apiListPosts({ limit: 50 });
    if (data && profileId) {
      const filtered = data.posts.filter((post) => post.author.id === profileId);
      setPosts(filtered);
    }
    setLoadingPosts(false);
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // 处理头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const { data, error: uploadError } = await apiUploadImage(file);
    setUploadingAvatar(false);

    if (uploadError || !data) {
      setErrorDialog({ open: true, message: uploadError || '头像上传失败' });
    } else {
      setNewAvatar(data.url);
    }
  };

  // 保存个人资料修改
  const handleSaveProfile = async () => {
    setUpdating(true);
    const { error: updateError } = await apiUpdateProfile({
      bio: editBio,
      avatar: newAvatar || undefined,
    });
    setUpdating(false);

    if (updateError) {
      setErrorDialog({ open: true, message: updateError });
    } else {
      setIsEditing(false);
      await fetchProfile();
      await refreshUser(); // 同步刷新顶部的全局用户信息
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="size-12 text-red-500" />
        <p className="text-fd-muted-foreground text-lg">{error || '用户不存在'}</p>
        <Link href="/forum" className="text-orange-500 hover:text-orange-400 transition-colors font-medium">
          ← 返回论坛
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-12">
      {/* 返回按钮 */}
      <div className="mb-8">
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-fd-border bg-fd-secondary/30 text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          返回论坛
        </Link>
      </div>

      {/* 用户名片区 */}
      <div className="rounded-2xl border border-fd-border bg-fd-card p-6 md:p-8 mb-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-fd-primary" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* 头像展示和编辑 */}
          <div className="relative group">
            <div className="size-24 rounded-2xl overflow-hidden bg-fd-secondary border border-fd-border flex-shrink-0 relative shadow-inner">
              <Image
                src={newAvatar || getMinecraftAvatar(profile.gameId)}
                alt={profile.gameId}
                fill
                className="object-cover"
                unoptimized
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/75 transition-colors">
                  {uploadingAvatar ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="size-5 mb-1" />
                      <span className="text-[10px]">更换头像</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 用户信息与简介 */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5 justify-center md:justify-start">
              <h2 className="text-2xl font-bold text-fd-foreground">{profile.gameId}</h2>
              <div className="flex items-center gap-1.5 justify-center">
                {profile.role === 'admin' && (
                  <span className="text-xs font-bold text-fd-primary bg-fd-primary/10 px-2 py-0.5 rounded-full border border-fd-primary/20">
                    管理员
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-fd-muted-foreground bg-fd-secondary px-2 py-0.5 rounded-full">
                  <Calendar className="size-3" />
                  {new Date(profile.createdAt + 'Z').toLocaleDateString('zh-CN')} 加入
                </span>
              </div>
            </div>

            {/* 简介展示 */}
            {!isEditing ? (
              <p className="text-sm text-fd-muted-foreground leading-relaxed italic max-w-2xl">
                {profile.bio || '这个人很懒，什么都没有写...'}
              </p>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="写点什么介绍一下你自己吧（最多 200 字）..."
                  maxLength={200}
                  className="w-full p-3 rounded-xl border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary resize-none h-20"
                />
                <div className="text-xs text-right text-fd-muted-foreground">
                  {editBio.length}/200
                </div>
              </div>
            )}
          </div>

          {/* 按钮动作 */}
          {isOwnProfile && (
            <div className="flex-shrink-0 mt-2 md:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-fd-border text-fd-foreground hover:bg-fd-accent transition-colors"
                >
                  <Edit3 className="size-4" />
                  编辑资料
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-fd-primary-foreground bg-fd-primary hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Save className="size-4" />
                    {updating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditBio(profile.bio || '');
                      setNewAvatar(profile.avatar);
                    }}
                    className="p-2 rounded-xl border border-fd-border text-fd-muted-foreground hover:bg-fd-accent transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 发表文章列表部分 */}
      <div>
        <div className="flex items-center gap-2 mb-6 border-b border-fd-border pb-3">
          <FileText className="size-5 text-fd-primary" />
          <h3 className="text-lg font-bold text-fd-foreground">
            发表的文章 ({posts.length})
          </h3>
        </div>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 text-orange-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-fd-border rounded-2xl bg-fd-card/50">
            <MessageSquare className="size-8 text-fd-muted-foreground mx-auto mb-2" />
            <p className="text-fd-muted-foreground text-sm">该用户还没有发表过文章</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

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

export default function ProfilePage() {
  return (
    <main className="min-h-screen pt-24 pb-20 text-landing-foreground dark:text-landing-foreground-dark">
      <AuthProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="size-8 text-orange-500 animate-spin" />
          </div>
        }>
          <ProfileContent />
        </Suspense>
      </AuthProvider>
    </main>
  );
}
