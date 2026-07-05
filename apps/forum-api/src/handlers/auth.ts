/**
 * 认证相关 API 处理函数
 * - POST /api/auth/register - 注册
 * - POST /api/auth/login - 登录
 * - GET /api/auth/me - 获取当前用户信息
 */

import { hashPassword, verifyPassword } from '../utils/password.ts';
import { createToken } from '../utils/jwt.ts';
import { requireAuth } from '../middleware/auth.ts';

/**
 * 注册新用户
 */
export async function register(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<{ gameId: string; password: string }>();
    const { gameId, password } = body;

    // 参数验证
    if (!gameId || !password) {
      return Response.json({ error: '游戏 ID 和密码不能为空' }, { status: 400 });
    }

    if (gameId.length < 2 || gameId.length > 32) {
      return Response.json({ error: '游戏 ID 长度应在 2-32 个字符之间' }, { status: 400 });
    }

    if (password.length < 4 || password.length > 64) {
      return Response.json({ error: '密码长度应在 4-64 个字符之间' }, { status: 400 });
    }

    // 检查游戏 ID 是否已存在
    const existing = await env.DB.prepare('SELECT id FROM users WHERE game_id = ?')
      .bind(gameId)
      .first();

    if (existing) {
      return Response.json({ error: '该游戏 ID 已被注册' }, { status: 409 });
    }

    // 创建用户
    const passwordHash = await hashPassword(password);
    const result = await env.DB.prepare(
      'INSERT INTO users (game_id, password_hash, role) VALUES (?, ?, ?)',
    )
      .bind(gameId, passwordHash, 'user')
      .run();

    // 自动登录，返回 token
    const userId = result.meta.last_row_id;
    const token = await createToken(
      { userId: userId as number, gameId, role: 'user' },
      env.JWT_SECRET,
    );

    return Response.json(
      {
        message: '注册成功',
        token,
        user: { id: userId, gameId, role: 'user', avatar: null, bio: null },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Register error:', err);
    return Response.json({ error: '注册失败，请稍后再试' }, { status: 500 });
  }
}

/**
 * 用户登录
 */
export async function login(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<{ gameId: string; password: string }>();
    const { gameId, password } = body;

    if (!gameId || !password) {
      return Response.json({ error: '游戏 ID 和密码不能为空' }, { status: 400 });
    }

    // 查找用户
    const user = await env.DB.prepare(
      'SELECT id, game_id, password_hash, role, avatar, bio FROM users WHERE game_id = ?',
    )
      .bind(gameId)
      .first<{ id: number; game_id: string; password_hash: string; role: string; avatar: string | null; bio: string | null }>();

    if (!user) {
      return Response.json({ error: '游戏 ID 或密码错误' }, { status: 401 });
    }

    // 验证密码
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: '游戏 ID 或密码错误' }, { status: 401 });
    }

    // 签发 token
    const token = await createToken(
      { userId: user.id, gameId: user.game_id, role: user.role },
      env.JWT_SECRET,
    );

    return Response.json({
      message: '登录成功',
      token,
      user: { id: user.id, gameId: user.game_id, role: user.role, avatar: user.avatar, bio: user.bio },
    });
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ error: '登录失败，请稍后再试' }, { status: 500 });
  }
}

/**
 * 获取当前登录用户信息
 */
export async function getMe(request: Request, env: Env): Promise<Response> {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;

  const user = await env.DB.prepare('SELECT id, game_id, role, avatar, bio, created_at FROM users WHERE id = ?')
    .bind(result.userId)
    .first<{ id: number; game_id: string; role: string; avatar: string | null; bio: string | null; created_at: string }>();

  if (!user) {
    return Response.json({ error: '用户不存在' }, { status: 404 });
  }

  return Response.json({
    user: {
      id: user.id,
      gameId: user.game_id,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.created_at,
    },
  });
}

/**
 * 更新用户个人资料 (头像、个人简介)
 */
export async function updateProfile(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json<{ avatar?: string; bio?: string }>();
    const { avatar, bio } = body;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar ? avatar.trim() : '');
    }

    if (bio !== undefined) {
      if (bio.length > 200) {
        return Response.json({ error: '个人简介最多 200 个字' }, { status: 400 });
      }
      updates.push('bio = ?');
      values.push(bio ? bio.trim() : '');
    }

    if (updates.length === 0) {
      return Response.json({ error: '没有需要更新的资料内容' }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(authResult.userId);

    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return Response.json({
      message: '资料更新成功',
      avatar: avatar !== undefined ? (avatar ? avatar.trim() : null) : undefined,
      bio: bio !== undefined ? (bio ? bio.trim() : null) : undefined,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return Response.json({ error: '更新资料失败，请稍后再试' }, { status: 500 });
  }
}

/**
 * 获取任意用户的个人主页资料
 */
export async function getUserProfile(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    const user = await env.DB.prepare('SELECT id, game_id, role, avatar, bio, created_at FROM users WHERE id = ?')
      .bind(id)
      .first<{ id: number; game_id: string; role: string; avatar: string | null; bio: string | null; created_at: string }>();

    if (!user) {
      return Response.json({ error: '用户不存在' }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user.id,
        gameId: user.game_id,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    return Response.json({ error: '获取用户资料失败' }, { status: 500 });
  }
}
