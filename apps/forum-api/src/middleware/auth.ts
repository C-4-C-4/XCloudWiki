/**
 * JWT 认证中间件
 * 从 Authorization header 中提取并验证 JWT token
 */

import { verifyToken, type JWTPayload } from '../utils/jwt.ts';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * 验证 token 并返回用户信息，未登录返回 null
 */
export async function getUser(request: Request, env: Env): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7);
  return verifyToken(token, env.JWT_SECRET);
}

/**
 * 要求用户必须登录，否则返回 401
 */
export async function requireAuth(request: Request, env: Env): Promise<JWTPayload | Response> {
  const user = await getUser(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: '请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return user;
}
