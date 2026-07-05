/**
 * 论坛 API 客户端
 * 封装所有 API 请求，处理 token 和错误
 */

const API_BASE_URL = 'https://forumapi.ccomm.top';

/**
 * 通用请求方法
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: string; status: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('forum_token') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 不要给 FormData 设置 Content-Type，浏览器会自动设置 boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || '请求失败', status: res.status };
    }

    return { data, status: res.status };
  } catch (err) {
    console.error('API request error:', err);
    return { error: '网络连接失败，请检查网络', status: 0 };
  }
}

// ============== 认证 API ==============

export interface AuthResponse {
  message: string;
  token: string;
  user: { id: number; gameId: string; role: string; avatar: string | null; bio: string | null };
}

export interface UserInfo {
  user: { id: number; gameId: string; role: string; avatar: string | null; bio: string | null; createdAt: string };
}

export async function apiRegister(gameId: string, password: string) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ gameId, password }),
  });
}

export async function apiLogin(gameId: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ gameId, password }),
  });
}

export async function apiGetMe() {
  return request<UserInfo>('/api/auth/me');
}

export async function apiUpdateProfile(data: { avatar?: string; bio?: string }) {
  return request<{ message: string; avatar?: string | null; bio?: string | null }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiGetUserProfile(id: number) {
  return request<UserInfo>(`/api/users/${id}`);
}

// ============== 文章 API ==============

export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface PostSummary {
  id: number;
  title: string;
  summary: string;
  category: string;
  author: { id: number; gameId: string; role: string; avatar: string | null };
  images: string[];
  viewCount: number;
  status: PostStatus;
  rejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail {
  post: {
    id: number;
    title: string;
    content: string;
    category: string;
    author: { id: number; gameId: string; role: string; avatar: string | null; bio: string | null };
    images: string[];
    viewCount: number;
    status: PostStatus;
    rejectReason?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  canEdit: boolean;
}

export interface PostListResponse {
  posts: PostSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function apiListPosts(params: { category?: string; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  return request<PostListResponse>(`/api/posts?${searchParams.toString()}`);
}

export async function apiGetPost(id: number) {
  return request<PostDetail>(`/api/posts/${id}`);
}

export async function apiCreatePost(data: {
  title: string;
  content: string;
  category: string;
  images: string[];
}) {
  return request<{ message: string; post: { id: number; status: PostStatus } }>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdatePost(
  id: number,
  data: { title?: string; content?: string; category?: string; images?: string[] },
) {
  return request<{ message: string }>(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeletePost(id: number) {
  return request<{ message: string }>(`/api/posts/${id}`, {
    method: 'DELETE',
  });
}

// ============== 图片上传 API ==============

export interface UploadResponse {
  message: string;
  url: string;
  key: string;
}

export async function apiUploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return request<UploadResponse>('/api/upload', {
    method: 'POST',
    body: formData,
  });
}

// ============== 管理后台 API ==============

export interface AdminStatsResponse {
  stats: { totalUsers: number; totalPosts: number; todayPosts: number; pendingPosts: number };
}

export interface AdminUser {
  id: number;
  gameId: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminPost {
  id: number;
  title: string;
  summary: string;
  category: string;
  author: { id: number; gameId: string; role: string };
  imageCount: number;
  viewCount: number;
  status: PostStatus;
  rejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPostListResponse {
  posts: AdminPost[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function apiGetStats() {
  return request<AdminStatsResponse>('/api/admin/stats');
}

export async function apiAdminListUsers(params: { page?: number; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.search) searchParams.set('search', params.search);

  return request<AdminUserListResponse>(`/api/admin/users?${searchParams.toString()}`);
}

export async function apiAdminCreateUser(data: {
  gameId: string;
  password?: string;
  role?: string;
  avatar?: string;
  bio?: string;
}) {
  return request<{ message: string; user: AdminUser }>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiAdminUpdateUser(
  id: number,
  data: { gameId?: string; password?: string; role?: string; avatar?: string; bio?: string },
) {
  return request<{ message: string }>(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiAdminDeleteUser(id: number) {
  return request<{ message: string }>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  });
}

export async function apiAdminListPosts(params: {
  page?: number;
  search?: string;
  category?: string;
  status?: PostStatus;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.status) searchParams.set('status', params.status);

  return request<AdminPostListResponse>(`/api/admin/posts?${searchParams.toString()}`);
}

export async function apiAdminUpdatePost(
  id: number,
  data: { title?: string; content?: string; category?: string; images?: string[] },
) {
  return request<{ message: string }>(`/api/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiAdminDeletePost(id: number) {
  return request<{ message: string }>(`/api/admin/posts/${id}`, {
    method: 'DELETE',
  });
}

export async function apiAdminApprovePost(id: number) {
  return request<{ message: string }>(`/api/admin/posts/${id}/approve`, {
    method: 'POST',
  });
}

export async function apiAdminRejectPost(id: number, reason: string) {
  return request<{ message: string }>(`/api/admin/posts/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
