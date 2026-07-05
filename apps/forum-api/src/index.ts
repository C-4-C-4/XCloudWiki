/**
 * XCloud Forum API - 主入口
 * Cloudflare Workers + D1 + R2
 */

import { Router } from './router.ts';
import { register, login, getMe, updateProfile, getUserProfile } from './handlers/auth.ts';
import { listPosts, getPost, createPost, updatePost, deletePost } from './handlers/posts.ts';
import { uploadImage } from './handlers/upload.ts';
import {
  getStats,
  listUsers,
  updateUser,
  deleteUser,
  createUser,
  adminListPosts,
  adminUpdatePost,
  adminDeletePost,
  adminApprovePost,
  adminRejectPost,
} from './handlers/admin.ts';
import { hashPassword } from './utils/password.ts';

const router = new Router();

// 认证与个人资料路由
router.post('/api/auth/register', register);
router.post('/api/auth/login', login);
router.get('/api/auth/me', getMe);
router.put('/api/auth/profile', updateProfile);
router.get('/api/users/:id', getUserProfile);

// 文章路由
router.get('/api/posts', listPosts);
router.get('/api/posts/:id', getPost);
router.post('/api/posts', createPost);
router.put('/api/posts/:id', updatePost);
router.delete('/api/posts/:id', deletePost);

// 图片上传
router.post('/api/upload', uploadImage);

// 管理后台路由
router.get('/api/admin/stats', getStats);
router.get('/api/admin/users', listUsers);
router.post('/api/admin/users', createUser);
router.put('/api/admin/users/:id', updateUser);
router.delete('/api/admin/users/:id', deleteUser);
router.get('/api/admin/posts', adminListPosts);
router.put('/api/admin/posts/:id', adminUpdatePost);
router.delete('/api/admin/posts/:id', adminDeletePost);
router.post('/api/admin/posts/:id/approve', adminApprovePost);
router.post('/api/admin/posts/:id/reject', adminRejectPost);

/**
 * 处理 CORS
 */
function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

  // 本地开发或允许的域名
  const isAllowed = allowedOrigins.includes(origin) || origin.startsWith('http://localhost');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * 初始化默认管理员账户（如果不存在）
 */
async function ensureAdminExists(env: Env): Promise<void> {
  const existing = await env.DB.prepare("SELECT id FROM users WHERE game_id = 'admin'").first();
  if (!existing) {
    const passwordHash = await hashPassword('admin');
    await env.DB.prepare('INSERT INTO users (game_id, password_hash, role) VALUES (?, ?, ?)')
      .bind('admin', passwordHash, 'admin')
      .run();
    console.log('默认管理员账户已创建: admin/admin');
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = getCorsHeaders(request, env);

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 初始化管理员账户（仅在首次请求时执行）
    ctx.waitUntil(ensureAdminExists(env));

    try {
      // 路由匹配
      const response = await router.handle(request, env);

      if (response) {
        // 给所有响应添加 CORS 头
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      // 未匹配到路由
      return new Response(JSON.stringify({ error: '接口不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      console.error('Server error:', err);
      return new Response(JSON.stringify({ error: '服务器内部错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
