'use client';

/**
 * 管理后台页面
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  ArrowLeft, Users, FileText, BarChart3, Loader2, Search,
  Trash2, Edit3, Shield, ChevronLeft, ChevronRight, AlertTriangle,
  Calendar, Eye, UserPlus, X, Upload, ClipboardCheck, Check,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/forum/auth-context';
import { CategoryBadge, StatusBadge } from '@/components/forum/category-badge';
import { AlertDialog, type AlertDialogVariant } from '@/components/ui/alert-dialog';
import {
  apiGetStats, apiAdminListUsers, apiAdminDeleteUser, apiAdminUpdateUser,
  apiAdminCreateUser, apiAdminListPosts, apiAdminDeletePost, apiUploadImage,
  apiAdminApprovePost, apiAdminRejectPost,
  type AdminUser, type AdminPost, type AdminStatsResponse,
  type PostStatus,
} from '@/components/forum/api';
import Image from 'next/image';

type TabKey = 'stats' | 'users' | 'posts';

function getMinecraftAvatar(gameId: string) {
  return `https://cravatar.eu/avatar/${gameId}/64.png`;
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('stats');

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'stats' || tabParam === 'users' || tabParam === 'posts') {
      setActiveTab(tabParam as TabKey);
    }
  }, [tabParam]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 text-fd-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="size-12 text-red-500" />
        <p className="text-lg text-fd-foreground font-medium">无权限访问</p>
        <p className="text-sm text-fd-muted-foreground">仅管理员可访问此页面</p>
        <Link href="/forum" className="text-fd-primary hover:opacity-90 transition-colors">
          ← 返回论坛
        </Link>
      </div>
    );
  }

  const TABS = [
    { key: 'stats' as TabKey, label: '数据概览', icon: BarChart3 },
    { key: 'users' as TabKey, label: '用户管理', icon: Users },
    { key: 'posts' as TabKey, label: '文章管理', icon: FileText },
  ];

  return (
    <main className="min-h-screen pt-24 pb-20 text-landing-foreground dark:text-landing-foreground-dark">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-fd-border bg-fd-secondary/30 text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            返回论坛
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-fd-primary/10 border border-fd-primary/20 text-fd-primary">
              <Shield className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-fd-foreground">管理后台</h1>
              <p className="text-sm text-fd-muted-foreground">管理用户和文章</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-fd-secondary/50 rounded-xl p-1 mb-8 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-fd-card text-fd-foreground shadow-sm'
                    : 'text-fd-muted-foreground hover:text-fd-foreground'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'stats' && <StatsPanel />}
          {activeTab === 'users' && <UsersPanel />}
          {activeTab === 'posts' && <PostsPanel />}
        </motion.div>
      </div>
    </main>
  );
}

// ============== 数据概览面板 ==============
function StatsPanel() {
  const [stats, setStats] = useState<AdminStatsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await apiGetStats();
      if (data) setStats(data.stats);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="size-6 text-fd-primary animate-spin" />;
  if (!stats) return <p className="text-fd-muted-foreground">加载失败</p>;

  const cards = [
    { label: '总用户数', value: stats.totalUsers, icon: Users, bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/15' },
    { label: '总文章数', value: stats.totalPosts, icon: FileText, bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/15' },
    { label: '今日发布', value: stats.todayPosts, icon: Calendar, bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/15' },
    { label: '待审核', value: stats.pendingPosts, icon: ClipboardCheck, bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/15' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-fd-border bg-fd-card p-6">
          <div className={`inline-flex p-2 rounded-xl border ${card.bg} ${card.text} ${card.border} mb-4`}>
            <card.icon className="size-5" />
          </div>
          <p className="text-3xl font-bold text-fd-foreground">{card.value}</p>
          <p className="text-sm text-fd-muted-foreground mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

// ============== 用户管理面板 ==============
function UsersPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // 提示弹窗
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: AlertDialogVariant;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({ open: false, title: '', variant: 'info', showCancel: false });

  // 删除确认弹窗
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: number | null;
    name: string;
    onConfirm: () => void;
  }>({ open: false, id: null, name: '', onConfirm: () => {} });

  // 表单状态
  const [formGameId, setFormGameId] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'user' | 'admin'>('user');
  const [formAvatar, setFormAvatar] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 处理头像本地文件上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFormError('');
    const { data, error: uploadError } = await apiUploadImage(file);
    setUploadingAvatar(false);

    if (uploadError || !data) {
      setFormError(uploadError || '图片上传失败，请重试');
    } else {
      setFormAvatar(data.url);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await apiAdminListUsers({ page, search });
    if (data) {
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleDeleteUser = (id: number, gameId: string) => {
    if (currentUser?.id === id) {
      setAlertDialog({
        open: true,
        title: '无法删除',
        description: '你不能在后台删除自己当前的账户！',
        variant: 'warning',
      });
      return;
    }
    setDeleteConfirm({
      open: true,
      id,
      name: gameId,
      onConfirm: async () => {
        const { error } = await apiAdminDeleteUser(id);
        if (error) {
          setDeleteConfirm({ open: false, id: null, name: '', onConfirm: () => {} });
          setAlertDialog({ open: true, title: '删除失败', description: error, variant: 'danger' });
        } else {
          setDeleteConfirm({ open: false, id: null, name: '', onConfirm: () => {} });
          fetchUsers();
        }
      },
    });
  };

  // 打开新建弹窗
  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedUser(null);
    setFormGameId('');
    setFormPassword('123456'); // 默认初始密码
    setFormRole('user');
    setFormAvatar('');
    setFormBio('');
    setFormError('');
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (user: AdminUser) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormGameId(user.gameId);
    setFormPassword(''); // 编辑时默认留空
    setFormRole(user.role as 'user' | 'admin');
    setFormAvatar(user.avatar || '');
    setFormBio(user.bio || '');
    setFormError('');
    setModalOpen(true);
  };

  // 提交新建或修改
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formGameId.trim()) {
      setFormError('游戏 ID 不能为空');
      return;
    }

    setSaving(true);

    if (modalType === 'create') {
      const { error } = await apiAdminCreateUser({
        gameId: formGameId.trim(),
        password: formPassword || undefined,
        role: formRole,
        avatar: formAvatar.trim() || undefined,
        bio: formBio.trim() || undefined,
      });

      setSaving(false);
      if (error) {
        setFormError(error);
      } else {
        setModalOpen(false);
        fetchUsers();
      }
    } else if (modalType === 'edit' && selectedUser) {
      const { error } = await apiAdminUpdateUser(selectedUser.id, {
        gameId: formGameId.trim(),
        password: formPassword || undefined, // 留空则不传递，后端不修改
        role: formRole,
        avatar: formAvatar.trim(),
        bio: formBio.trim(),
      });

      setSaving(false);
      if (error) {
        setFormError(error);
      } else {
        setModalOpen(false);
        fetchUsers();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索与新增按钮 */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索游戏 ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fd-border bg-fd-background text-fd-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-fd-primary-foreground bg-fd-primary hover:opacity-90 font-medium text-sm transition-all shadow-sm flex-shrink-0 w-full sm:w-auto justify-center"
        >
          <UserPlus className="size-4" />
          新增用户
        </button>
      </div>

      {/* 用户列表 */}
      {loading ? (
        <Loader2 className="size-6 text-orange-500 animate-spin mx-auto" />
      ) : (
        <div className="rounded-xl border border-fd-border overflow-hidden bg-fd-card">
          <table className="w-full text-sm">
            <thead className="bg-fd-secondary/50 text-fd-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">头像</th>
                <th className="text-left px-4 py-3 font-medium">游戏 ID</th>
                <th className="text-left px-4 py-3 font-medium">权限组</th>
                <th className="text-left px-4 py-3 font-medium">签名简介</th>
                <th className="text-left px-4 py-3 font-medium">注册时间</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-fd-border hover:bg-fd-accent/30 transition-colors">
                  <td className="px-4 py-3 text-fd-muted-foreground">{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="relative size-8 rounded-lg overflow-hidden bg-fd-secondary border border-fd-border">
                      <Image
                        src={u.avatar || getMinecraftAvatar(u.gameId)}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-fd-foreground">{u.gameId}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                        管理员
                      </span>
                    ) : (
                      <span className="text-xs text-fd-muted-foreground bg-fd-secondary px-2 py-0.5 rounded-full">
                        普通用户
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-fd-muted-foreground max-w-[200px] truncate">
                    {u.bio || <span className="opacity-40 italic">暂无简介</span>}
                  </td>
                  <td className="px-4 py-3 text-fd-muted-foreground text-xs">
                    {new Date(u.createdAt + 'Z').toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-fd-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                        title="编辑资料/修改密码"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.gameId)}
                          className="p-1.5 rounded-lg text-fd-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="删除用户"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center py-8 text-fd-muted-foreground">暂无用户</p>
          )}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-fd-border disabled:opacity-30 transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm text-fd-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-fd-border disabled:opacity-30 transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* 用户新增与编辑弹窗 */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg mx-4 bg-fd-card border border-fd-border rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-fd-foreground mb-6">
                  {modalType === 'create' ? '添加新用户' : '编辑用户信息'}
                </h3>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 游戏ID */}
                    <div>
                      <label className="block text-xs font-medium text-fd-foreground mb-1.5">游戏 ID</label>
                      <input
                        type="text"
                        value={formGameId}
                        onChange={(e) => setFormGameId(e.target.value)}
                        placeholder="输入游戏 ID"
                        className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-fd-foreground text-sm focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all"
                        maxLength={32}
                      />
                    </div>

                    {/* 密码 */}
                    <div>
                      <label className="block text-xs font-medium text-fd-foreground mb-1.5">
                        密码 {modalType === 'edit' && <span className="text-[10px] text-fd-muted-foreground font-normal">(留空不修改)</span>}
                      </label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={modalType === 'create' ? '设置初始密码，默认 123456' : '输入新密码'}
                        className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-fd-foreground text-sm focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all"
                        maxLength={64}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 权限组 */}
                    <div>
                      <label className="block text-xs font-medium text-fd-foreground mb-1.5">权限组</label>
                      <select
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value as 'user' | 'admin')}
                        className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-fd-foreground text-sm focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all h-9"
                      >
                        <option value="user">普通用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    </div>

                    {/* 头像 */}
                    <div>
                      <label className="block text-xs font-medium text-fd-foreground mb-1.5">自定义头像</label>
                      <div className="flex gap-2 items-center">
                        {/* 实时预览 */}
                        <div className="relative size-9 rounded-lg overflow-hidden bg-fd-secondary border border-fd-border flex-shrink-0 shadow-inner">
                          <Image
                            src={formAvatar.trim() || getMinecraftAvatar(formGameId || 'default')}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <input
                          type="text"
                          value={formAvatar}
                          onChange={(e) => setFormAvatar(e.target.value)}
                          placeholder="图片 URL 或点击上传"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-fd-foreground text-sm focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('admin-avatar-upload')?.click()}
                          disabled={uploadingAvatar}
                          className="px-3 py-2 rounded-lg border border-fd-border bg-fd-secondary hover:bg-fd-accent text-fd-foreground text-xs font-medium transition-all flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="size-3.5 animate-spin text-fd-primary" />
                          ) : (
                            <Upload className="size-3.5" />
                          )}
                          上传
                        </button>
                        <input
                          id="admin-avatar-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 签名简介 */}
                  <div>
                    <label className="block text-xs font-medium text-fd-foreground mb-1.5">签名简介</label>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      placeholder="编写用户的个人简介/签名..."
                      maxLength={200}
                      className="w-full p-3 rounded-lg border border-fd-border bg-fd-background text-fd-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none h-16"
                    />
                    <p className="text-[10px] text-fd-muted-foreground text-right mt-0.5">{formBio.length}/200</p>
                  </div>

                  {/* 错误提示 */}
                  {formError && (
                    <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                      {formError}
                    </div>
                  )}

                  {/* 表单按钮 */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-fd-border">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-fd-border hover:bg-fd-accent text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 px-6 py-2 rounded-lg text-fd-primary-foreground bg-fd-primary hover:opacity-90 text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        '确定'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={deleteConfirm.open}
        title={`确定删除用户 "${deleteConfirm.name}"？`}
        description="该用户的所有文章也将被删除，此操作不可恢复。"
        variant="danger"
        confirmText="删除"
        cancelText="取消"
        showCancel
        onConfirm={deleteConfirm.onConfirm}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '', onConfirm: () => {} })}
      />

      {/* 提示弹窗 */}
      <AlertDialog
        open={alertDialog.open}
        title={alertDialog.title}
        description={alertDialog.description}
        variant={alertDialog.variant}
        showCancel={alertDialog.showCancel}
        onConfirm={() => {
          alertDialog.onConfirm?.();
          setAlertDialog((prev) => ({ ...prev, open: false }));
        }}
        onCancel={() => setAlertDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// ============== 文章管理面板 ==============
type StatusFilter = 'all' | PostStatus;

const STATUS_FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部状态' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
];

function PostsPanel() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // 拒绝弹窗状态
  const [rejectModal, setRejectModal] = useState<{ open: boolean; postId: number | null; reason: string }>({
    open: false,
    postId: null,
    reason: '',
  });
  const [rejecting, setRejecting] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // 提示弹窗
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: AlertDialogVariant;
  }>({ open: false, title: '', variant: 'info' });

  // 删除确认弹窗
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: '' });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await apiAdminListPosts({
      page,
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
    if (data) {
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleDeletePost = (id: number, title: string) => {
    setDeleteConfirm({ open: true, id, name: title });
  };

  const handleConfirmDeletePost = async () => {
    if (deleteConfirm.id === null) return;
    const { error } = await apiAdminDeletePost(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: null, name: '' });
    if (error) {
      setAlertDialog({ open: true, title: '删除失败', description: error, variant: 'danger' });
    } else {
      fetchPosts();
    }
  };

  const handleApprovePost = async (id: number) => {
    setApprovingId(id);
    const { error } = await apiAdminApprovePost(id);
    setApprovingId(null);
    if (error) {
      setAlertDialog({ open: true, title: '操作失败', description: error, variant: 'danger' });
    } else {
      fetchPosts();
    }
  };

  const handleOpenRejectModal = (id: number) => {
    setRejectModal({ open: true, postId: id, reason: '' });
  };

  const handleConfirmReject = async () => {
    if (rejectModal.postId === null) return;
    const reason = rejectModal.reason.trim();
    if (!reason) {
      setAlertDialog({ open: true, title: '请填写拒绝理由', variant: 'warning' });
      return;
    }
    setRejecting(true);
    const { error } = await apiAdminRejectPost(rejectModal.postId, reason);
    setRejecting(false);
    if (error) {
      setAlertDialog({ open: true, title: '操作失败', description: error, variant: 'danger' });
    } else {
      setRejectModal({ open: false, postId: null, reason: '' });
      fetchPosts();
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索 + 状态筛选 */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索标题或作者..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fd-border bg-fd-background text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
          className="px-3 py-2.5 rounded-xl border border-fd-border bg-fd-background text-fd-foreground text-sm focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all h-10 flex-shrink-0"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 文章列表 */}
      {loading ? (
        <Loader2 className="size-6 text-fd-primary animate-spin mx-auto" />
      ) : (
        <div className="rounded-xl border border-fd-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-fd-secondary/50 text-fd-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">标题</th>
                <th className="text-left px-4 py-3 font-medium">分区</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">作者</th>
                <th className="text-left px-4 py-3 font-medium">浏览</th>
                <th className="text-left px-4 py-3 font-medium">时间</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-fd-border hover:bg-fd-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/forum/post?id=${p.id}`} className="font-medium text-fd-foreground hover:text-fd-primary transition-colors line-clamp-1">
                      {p.title}
                    </Link>
                    {p.status === 'rejected' && p.rejectReason && (
                      <p className="text-[10px] text-red-500 mt-0.5 line-clamp-1" title={p.rejectReason}>
                        拒绝理由：{p.rejectReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={p.category} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-fd-muted-foreground">{p.author.gameId}</td>
                  <td className="px-4 py-3 text-fd-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {p.viewCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-fd-muted-foreground text-xs">
                    {new Date(p.createdAt + 'Z').toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* 审核操作：待审核或已拒绝时可点击通过 */}
                      {(p.status === 'pending' || p.status === 'rejected') && (
                        <button
                          onClick={() => handleApprovePost(p.id)}
                          disabled={approvingId === p.id}
                          className="p-1.5 rounded-lg text-fd-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                          title="通过审核"
                        >
                          {approvingId === p.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                        </button>
                      )}
                      {/* 审核操作：待审核或已通过时可点击拒绝 */}
                      {(p.status === 'pending' || p.status === 'approved') && (
                        <button
                          onClick={() => handleOpenRejectModal(p.id)}
                          className="p-1.5 rounded-lg text-fd-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="拒绝审核"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                      <Link
                        href={`/forum/write?edit=${p.id}&from=admin`}
                        className="p-1.5 rounded-lg text-fd-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(p.id, p.title)}
                        className="p-1.5 rounded-lg text-fd-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
            <p className="text-center py-8 text-fd-muted-foreground">暂无文章</p>
          )}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-fd-border disabled:opacity-30 transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm text-fd-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-fd-border disabled:opacity-30 transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* 拒绝理由弹窗 */}
      <AnimatePresence>
        {rejectModal.open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => !rejecting && setRejectModal({ open: false, postId: null, reason: '' })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md mx-4 bg-fd-card border border-fd-border rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !rejecting && setRejectModal({ open: false, postId: null, reason: '' })}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
                disabled={rejecting}
              >
                <X className="size-4" />
              </button>

              <div className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-fd-foreground mb-2">拒绝文章</h3>
                <p className="text-xs text-fd-muted-foreground mb-4">
                  请填写拒绝理由，作者将看到此理由以便修改后重新提交。
                </p>

                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="请填写拒绝理由（必填）"
                  maxLength={500}
                  autoFocus
                  disabled={rejecting}
                  className="w-full p-3 rounded-lg border border-fd-border bg-fd-background text-fd-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-28"
                />
                <p className="text-[10px] text-fd-muted-foreground text-right mt-0.5">
                  {rejectModal.reason.length}/500
                </p>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-fd-border mt-4">
                  <button
                    type="button"
                    onClick={() => setRejectModal({ open: false, postId: null, reason: '' })}
                    disabled={rejecting}
                    className="px-4 py-2 rounded-lg border border-fd-border hover:bg-fd-accent text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    disabled={rejecting || !rejectModal.reason.trim()}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-lg text-fd-primary-foreground bg-red-500 hover:opacity-90 text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {rejecting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      '确认拒绝'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={deleteConfirm.open}
        title={`确定删除文章 "${deleteConfirm.name}"？`}
        description="此操作不可恢复。"
        variant="danger"
        confirmText="删除"
        cancelText="取消"
        showCancel
        onConfirm={handleConfirmDeletePost}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
      />

      {/* 提示弹窗 */}
      <AlertDialog
        open={alertDialog.open}
        title={alertDialog.title}
        description={alertDialog.description}
        variant={alertDialog.variant}
        onConfirm={() => setAlertDialog((prev) => ({ ...prev, open: false }))}
        onCancel={() => setAlertDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="size-8 text-fd-primary animate-spin" />
        </div>
      }>
        <AdminContent />
      </Suspense>
    </AuthProvider>
  );
}
