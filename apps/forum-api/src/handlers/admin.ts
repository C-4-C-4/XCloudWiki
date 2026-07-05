/**
 * 管理后台 API 处理函数
 * - GET /api/admin/users - 用户列表
 * - PUT /api/admin/users/:id - 修改用户信息
 * - DELETE /api/admin/users/:id - 删除用户
 * - GET /api/admin/posts - 文章列表
 * - PUT /api/admin/posts/:id - 修改文章
 * - DELETE /api/admin/posts/:id - 删除文章
 * - GET /api/admin/stats - 统计数据
 */

import { requireAdmin } from '../middleware/admin.ts';
import { hashPassword } from '../utils/password.ts';

/**
 * 获取统计数据
 */
export async function getStats(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const [usersCount, postsCount, todayPosts, pendingPosts] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
      env.DB.prepare('SELECT COUNT(*) as count FROM posts').first<{ count: number }>(),
      env.DB.prepare(
        "SELECT COUNT(*) as count FROM posts WHERE created_at >= datetime('now', '-1 day')",
      ).first<{ count: number }>(),
      env.DB.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'pending'").first<{ count: number }>(),
    ]);

    return Response.json({
      stats: {
        totalUsers: usersCount?.count || 0,
        totalPosts: postsCount?.count || 0,
        todayPosts: todayPosts?.count || 0,
        pendingPosts: pendingPosts?.count || 0,
      },
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return Response.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}

/**
 * 获取用户列表（管理员）
 */
export async function listUsers(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT id, game_id, role, avatar, bio, created_at, updated_at FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const bindValues: string[] = [];

    if (search) {
      query += ' WHERE game_id LIKE ?';
      countQuery += ' WHERE game_id LIKE ?';
      bindValues.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    let countStmt = env.DB.prepare(countQuery);
    if (bindValues.length > 0) {
      countStmt = countStmt.bind(...bindValues);
    }
    const countResult = await countStmt.first<{ total: number }>();
    const total = countResult?.total || 0;

    let listStmt = env.DB.prepare(query);
    if (bindValues.length > 0) {
      listStmt = listStmt.bind(...bindValues, limit, offset);
    } else {
      listStmt = listStmt.bind(limit, offset);
    }
    const { results } = await listStmt.all<{
      id: number;
      game_id: string;
      role: string;
      avatar: string | null;
      bio: string | null;
      created_at: string;
      updated_at: string;
    }>();

    const users = results.map((row) => ({
      id: row.id,
      gameId: row.game_id,
      role: row.role,
      avatar: row.avatar,
      bio: row.bio,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return Response.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('List users error:', err);
    return Response.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}

/**
 * 修改用户信息（管理员）
 */
export async function updateUser(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;
    const body = await request.json<{
      gameId?: string;
      password?: string;
      role?: string;
      avatar?: string;
      bio?: string;
    }>();

    const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return Response.json({ error: '用户不存在' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (body.gameId !== undefined) {
      const gameIdTrimmed = body.gameId.trim();
      if (gameIdTrimmed.length < 2 || gameIdTrimmed.length > 32) {
        return Response.json({ error: '游戏 ID 长度应在 2-32 个字符之间' }, { status: 400 });
      }
      // 检查新 gameId 是否已被使用
      const duplicate = await env.DB.prepare(
        'SELECT id FROM users WHERE game_id = ? AND id != ?',
      )
        .bind(gameIdTrimmed, id)
        .first();
      if (duplicate) {
        return Response.json({ error: '该游戏 ID 已被使用' }, { status: 409 });
      }
      updates.push('game_id = ?');
      values.push(gameIdTrimmed);
    }

    if (body.password !== undefined) {
      const passwordTrimmed = body.password;
      if (passwordTrimmed.length < 4 || passwordTrimmed.length > 64) {
        return Response.json({ error: '密码长度应在 4-64 个字符之间' }, { status: 400 });
      }
      const newHash = await hashPassword(passwordTrimmed);
      updates.push('password_hash = ?');
      values.push(newHash);
    }

    if (body.role !== undefined) {
      if (!['user', 'admin'].includes(body.role)) {
        return Response.json({ error: '无效的角色' }, { status: 400 });
      }
      updates.push('role = ?');
      values.push(body.role);
    }

    if (body.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(body.avatar.trim() || '');
    }

    if (body.bio !== undefined) {
      if (body.bio.length > 200) {
        return Response.json({ error: '个人简介最多 200 个字符' }, { status: 400 });
      }
      updates.push('bio = ?');
      values.push(body.bio.trim() || '');
    }

    if (updates.length === 0) {
      return Response.json({ error: '没有需要更新的内容' }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(parseInt(id));

    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return Response.json({ message: '更新成功' });
  } catch (err) {
    console.error('Update user error:', err);
    return Response.json({ error: '更新失败' }, { status: 500 });
  }
}

/**
 * 删除用户（管理员）
 */
export async function deleteUser(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;

    const existing = await env.DB.prepare('SELECT id, role FROM users WHERE id = ?')
      .bind(id)
      .first<{ id: number; role: string }>();

    if (!existing) {
      return Response.json({ error: '用户不存在' }, { status: 404 });
    }

    // 不允许删除管理员账户
    if (existing.role === 'admin') {
      return Response.json({ error: '不能删除管理员账户' }, { status: 403 });
    }

    // 同时删除该用户的所有文章
    await env.DB.batch([
      env.DB.prepare('DELETE FROM posts WHERE author_id = ?').bind(id),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id),
    ]);

    return Response.json({ message: '删除成功' });
  } catch (err) {
    console.error('Delete user error:', err);
    return Response.json({ error: '删除失败' }, { status: 500 });
  }
}

/**
 * 管理员文章列表（可搜索）
 */
export async function adminListPosts(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const bindValues: (string | number)[] = [];

    if (search) {
      conditions.push('(p.title LIKE ? OR u.game_id LIKE ?)');
      bindValues.push(`%${search}%`, `%${search}%`);
    }

    if (category && ['official', 'tutorial', 'casual'].includes(category)) {
      conditions.push('p.category = ?');
      bindValues.push(category);
    }

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      conditions.push('p.status = ?');
      bindValues.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM posts p JOIN users u ON p.author_id = u.id ${whereClause}`,
    )
      .bind(...bindValues)
      .first<{ total: number }>();

    const total = countResult?.total || 0;

    const { results } = await env.DB.prepare(
      `SELECT p.id, p.title, p.content, p.category, p.author_id, p.images,
              p.view_count, p.status, p.reject_reason, p.created_at, p.updated_at,
              u.game_id as author_game_id, u.role as author_role
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(...bindValues, limit, offset)
      .all<{
        id: number;
        title: string;
        content: string;
        category: string;
        author_id: number;
        images: string;
        view_count: number;
        status: string;
        reject_reason: string | null;
        created_at: string;
        updated_at: string;
        author_game_id: string;
        author_role: string;
      }>();

    const posts = results.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.content.substring(0, 80),
      category: row.category,
      author: { id: row.author_id, gameId: row.author_game_id, role: row.author_role },
      imageCount: JSON.parse(row.images).length,
      viewCount: row.view_count,
      status: row.status,
      rejectReason: row.reject_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return Response.json({
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Admin list posts error:', err);
    return Response.json({ error: '获取文章列表失败' }, { status: 500 });
  }
}

/**
 * 管理员修改文章
 */
export async function adminUpdatePost(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;

    const existing = await env.DB.prepare('SELECT id FROM posts WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }

    const body = await request.json<{
      title?: string;
      content?: string;
      category?: string;
      images?: string[];
    }>();

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title.trim());
    }
    if (body.content !== undefined) {
      updates.push('content = ?');
      values.push(body.content.trim());
    }
    if (body.category !== undefined && ['official', 'tutorial', 'casual'].includes(body.category)) {
      updates.push('category = ?');
      values.push(body.category);
    }
    if (body.images !== undefined) {
      updates.push('images = ?');
      values.push(JSON.stringify(body.images));
    }

    if (updates.length === 0) {
      return Response.json({ error: '没有需要更新的内容' }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(parseInt(id));

    await env.DB.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return Response.json({ message: '更新成功' });
  } catch (err) {
    console.error('Admin update post error:', err);
    return Response.json({ error: '更新失败' }, { status: 500 });
  }
}

/**
 * 管理员删除文章
 */
export async function adminDeletePost(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;

    const existing = await env.DB.prepare('SELECT id FROM posts WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }

    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();

    return Response.json({ message: '删除成功' });
  } catch (err) {
    console.error('Admin delete post error:', err);
    return Response.json({ error: '删除失败' }, { status: 500 });
  }
}

/**
 * 管理员通过文章审核
 */
export async function adminApprovePost(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;

    const existing = await env.DB.prepare('SELECT id FROM posts WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }

    await env.DB.prepare(
      "UPDATE posts SET status = 'approved', reject_reason = NULL, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(id)
      .run();

    return Response.json({ message: '已通过审核' });
  } catch (err) {
    console.error('Admin approve post error:', err);
    return Response.json({ error: '审核操作失败' }, { status: 500 });
  }
}

/**
 * 管理员拒绝文章审核（必填理由）
 */
export async function adminRejectPost(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;
    const body = await request.json<{ reason: string }>();
    const reason = body.reason?.trim();

    if (!reason) {
      return Response.json({ error: '请填写拒绝理由' }, { status: 400 });
    }
    if (reason.length > 500) {
      return Response.json({ error: '拒绝理由最多 500 字' }, { status: 400 });
    }

    const existing = await env.DB.prepare('SELECT id FROM posts WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }

    await env.DB.prepare(
      "UPDATE posts SET status = 'rejected', reject_reason = ?, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(reason, id)
      .run();

    return Response.json({ message: '已拒绝' });
  } catch (err) {
    console.error('Admin reject post error:', err);
    return Response.json({ error: '审核操作失败' }, { status: 500 });
  }
}

/**
 * 管理员新增用户
 */
export async function createUser(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json<{
      gameId: string;
      password?: string;
      role?: string;
      avatar?: string;
      bio?: string;
    }>();

    const { gameId, password = '123456', role = 'user', avatar = '', bio = '' } = body;

    const gameIdTrimmed = gameId ? gameId.trim() : '';
    if (!gameIdTrimmed) {
      return Response.json({ error: '游戏 ID 不能为空' }, { status: 400 });
    }

    if (gameIdTrimmed.length < 2 || gameIdTrimmed.length > 32) {
      return Response.json({ error: '游戏 ID 长度应在 2-32 个字符之间' }, { status: 400 });
    }

    if (password.length < 4 || password.length > 64) {
      return Response.json({ error: '密码长度应在 4-64 个字符之间' }, { status: 400 });
    }

    if (!['user', 'admin'].includes(role)) {
      return Response.json({ error: '无效的角色' }, { status: 400 });
    }

    // 检查 gameId 是否已注册
    const existing = await env.DB.prepare('SELECT id FROM users WHERE game_id = ?')
      .bind(gameIdTrimmed)
      .first();

    if (existing) {
      return Response.json({ error: '该游戏 ID 已已被注册' }, { status: 409 });
    }

    // 哈希密码并入库
    const passwordHash = await hashPassword(password);
    const result = await env.DB.prepare(
      'INSERT INTO users (game_id, password_hash, role, avatar, bio) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(gameIdTrimmed, passwordHash, role, avatar.trim(), bio.trim())
      .run();

    return Response.json(
      {
        message: '创建成功',
        user: {
          id: result.meta.last_row_id,
          gameId: gameIdTrimmed,
          role,
          avatar: avatar.trim() || null,
          bio: bio.trim() || null,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Admin create user error:', err);
    return Response.json({ error: '创建用户失败' }, { status: 500 });
  }
}
