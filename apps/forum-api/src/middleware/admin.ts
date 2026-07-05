/**
 * 管理员权限中间件
 */

import { requireAuth } from './auth.ts';
import type { JWTPayload } from '../utils/jwt.ts';

/**
 * 要求管理员权限，否则返回 403
 */
export async function requireAdmin(request: Request, env: Env): Promise<JWTPayload | Response> {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;

  if (result.role !== 'admin') {
    return new Response(JSON.stringify({ error: '需要管理员权限' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return result;
}
