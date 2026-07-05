/**
 * 文章相关 API 处理函数
 * - GET /api/posts - 文章列表（支持分区筛选、分页）
 * - GET /api/posts/:id - 文章详情
 * - POST /api/posts - 发布文章
 * - PUT /api/posts/:id - 更新文章
 * - DELETE /api/posts/:id - 删除文章
 */

import { requireAuth, getUser } from '../middleware/auth.ts';

interface PostRow {
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
  author_game_id?: string;
  author_role?: string;
  author_avatar?: string | null;
}

const VALID_CATEGORIES = ['official', 'tutorial', 'casual'];
const MAX_CONTENT_LENGTH = 500;
const MAX_IMAGES = 10;

/**
 * 获取文章列表
 * 可见性：游客仅 approved；登录用户 approved + 自己的 pending/rejected
 */
export async function listPosts(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const user = await getUser(request, env);

    const conditions: string[] = [];
    const bindValues: (string | number)[] = [];

    if (user) {
      // 登录用户：已通过 + 自己的待审核/已拒绝
      conditions.push(
        "(p.status = 'approved' OR (p.author_id = ? AND p.status IN ('pending', 'rejected')))",
      );
      bindValues.push(user.userId);
    } else {
      // 游客：仅已通过
      conditions.push("p.status = 'approved'");
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      conditions.push('p.category = ?');
      bindValues.push(category);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const query = `
      SELECT p.id, p.title, p.content, p.category, p.author_id, p.images,
             p.view_count, p.status, p.reject_reason, p.created_at, p.updated_at,
             u.game_id as author_game_id, u.role as author_role, u.avatar as author_avatar
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC LIMIT ? OFFSET ?
    `;
    const countQuery = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;

    // 获取总数
    const countResult = await env.DB.prepare(countQuery)
      .bind(...bindValues)
      .first<{ total: number }>();
    const total = countResult?.total || 0;

    // 获取列表
    const { results } = await env.DB.prepare(query)
      .bind(...bindValues, limit, offset)
      .all<PostRow>();

    const posts = results.map((row) => ({
      id: row.id,
      title: row.title,
      // 列表中只返回内容摘要
      summary: row.content.substring(0, 120) + (row.content.length > 120 ? '...' : ''),
      category: row.category,
      author: {
        id: row.author_id,
        gameId: row.author_game_id,
        role: row.author_role,
        avatar: row.author_avatar,
      },
      images: JSON.parse(row.images),
      viewCount: row.view_count,
      status: row.status,
      rejectReason: row.reject_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return Response.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('List posts error:', err);
    return Response.json({ error: '获取文章列表失败' }, { status: 500 });
  }
}

/**
 * 获取文章详情
 * 可见性：approved 任何人可看；pending/rejected 仅作者或管理员可看
 */
export async function getPost(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;

    const row = await env.DB.prepare(
      `SELECT p.id, p.title, p.content, p.category, p.author_id, p.images,
              p.view_count, p.status, p.reject_reason, p.created_at, p.updated_at,
              u.game_id as author_game_id, u.role as author_role, u.avatar as author_avatar
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
    )
      .bind(id)
      .first<PostRow>();

    if (!row) {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }

    // 获取当前用户信息（用于权限判断）
    const user = await getUser(request, env);

    // 非 approved 文章仅作者或管理员可看
    if (row.status !== 'approved') {
      const isAuthor = user !== null && user.userId === row.author_id;
      const isAdmin = user !== null && user.role === 'admin';
      if (!isAuthor && !isAdmin) {
        return Response.json({ error: '该文章暂不可见' }, { status: 403 });
      }
    }

    // 仅 approved 文章才增加浏览计数（避免作者反复查看刷量）
    if (row.status === 'approved') {
      await env.DB.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?')
        .bind(id)
        .run();
    }

    const canEdit =
      user !== null && (user.userId === row.author_id || user.role === 'admin');

    return Response.json({
      post: {
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category,
        author: {
          id: row.author_id,
          gameId: row.author_game_id,
          role: row.author_role,
          avatar: row.author_avatar,
        },
        images: JSON.parse(row.images),
        viewCount: row.status === 'approved' ? row.view_count + 1 : row.view_count,
        status: row.status,
        rejectReason: row.reject_reason,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      canEdit,
    });
  } catch (err) {
    console.error('Get post error:', err);
    return Response.json({ error: '获取文章失败' }, { status: 500 });
  }
}

function extractImagesFromContent(content: string): string[] {
  const urls: string[] = [];
  const regex = /!\[.*?\]\((.*?)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const url = match[1].trim();
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }
  return urls;
}

/**
 * 发布文章
 */
export async function createPost(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json<{
      title: string;
      content: string;
      category: string;
      images: string[];
    }>();

    const { title, content, category, images = [] } = body;

    // 参数验证
    if (!title || !title.trim()) {
      return Response.json({ error: '标题不能为空' }, { status: 400 });
    }

    if (title.length > 100) {
      return Response.json({ error: '标题最多 100 个字符' }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return Response.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return Response.json(
        { error: `内容最多 ${MAX_CONTENT_LENGTH} 个字符` },
        { status: 400 },
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return Response.json({ error: '无效的分区' }, { status: 400 });
    }

    // 若未上传附图，自动解析正文中的图片作为附图头图
    let finalImages = [...images];
    if (finalImages.length === 0 && content) {
      finalImages = extractImagesFromContent(content).slice(0, MAX_IMAGES);
    }

    if (finalImages.length > MAX_IMAGES) {
      return Response.json({ error: `最多上传 ${MAX_IMAGES} 张图片` }, { status: 400 });
    }

    // 官方区权限检查
    if (category === 'official' && authResult.role !== 'admin') {
      return Response.json({ error: '只有官方账户才能在官方区发布' }, { status: 403 });
    }

    // 管理员发布直接通过审核，普通用户进入待审核
    const status = authResult.role === 'admin' ? 'approved' : 'pending';

    const result = await env.DB.prepare(
      'INSERT INTO posts (title, content, category, author_id, images, status) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(title.trim(), content.trim(), category, authResult.userId, JSON.stringify(finalImages), status)
      .run();

    return Response.json(
      {
        message: status === 'approved' ? '发布成功' : '文章已提交，等待审核',
        post: { id: result.meta.last_row_id, status },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Create post error:', err);
    return Response.json({ error: '发布失败，请稍后再试' }, { status: 500 });
  }
}

/**
 * 更新文章
 */
export async function updatePost(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;

    // 检查文章是否存在
    const existing = await env.DB.prepare('SELECT author_id, category FROM posts WHERE id = ?')
      .bind(id)
      .first<{ author_id: number; category: string }>();

    if (!existing) {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }

    // 权限检查：作者或管理员
    if (existing.author_id !== authResult.userId && authResult.role !== 'admin') {
      return Response.json({ error: '无权编辑此文章' }, { status: 403 });
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
      if (body.title.length > 100) {
        return Response.json({ error: '标题最多 100 个字符' }, { status: 400 });
      }
      updates.push('title = ?');
      values.push(body.title.trim());
    }

    if (body.content !== undefined) {
      if (body.content.length > MAX_CONTENT_LENGTH) {
        return Response.json(
          { error: `内容最多 ${MAX_CONTENT_LENGTH} 个字符` },
          { status: 400 },
        );
      }
      updates.push('content = ?');
      values.push(body.content.trim());
    }

    if (body.category !== undefined) {
      if (!VALID_CATEGORIES.includes(body.category)) {
        return Response.json({ error: '无效的分区' }, { status: 400 });
      }
      if (body.category === 'official' && authResult.role !== 'admin') {
        return Response.json({ error: '只有官方账户才能在官方区发布' }, { status: 403 });
      }
      updates.push('category = ?');
      values.push(body.category);
    }

    if (body.images !== undefined) {
      let finalImages = [...body.images];
      if (finalImages.length === 0) {
        const contentToParse = body.content !== undefined ? body.content : '';
        if (contentToParse) {
          finalImages = extractImagesFromContent(contentToParse).slice(0, MAX_IMAGES);
        }
      }

      if (finalImages.length > MAX_IMAGES) {
        return Response.json({ error: `最多上传 ${MAX_IMAGES} 张图片` }, { status: 400 });
      }
      updates.push('images = ?');
      values.push(JSON.stringify(finalImages));
    }

    if (updates.length === 0) {
      return Response.json({ error: '没有需要更新的内容' }, { status: 400 });
    }

    // 普通用户编辑后需重新审核，重置状态为 pending 并清空拒绝理由；管理员编辑保持原状态
    if (authResult.role !== 'admin') {
      updates.push("status = 'pending'");
      updates.push('reject_reason = NULL');
    }

    updates.push("updated_at = datetime('now')");
    values.push(parseInt(id));

    await env.DB.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return Response.json({ message: '更新成功' });
  } catch (err) {
    console.error('Update post error:', err);
    return Response.json({ error: '更新失败，请稍后再试' }, { status: 500 });
  }
}

/**
 * 删除文章
 */
export async function deletePost(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = params;

    const existing = await env.DB.prepare('SELECT author_id FROM posts WHERE id = ?')
      .bind(id)
      .first<{ author_id: number }>();

    if (!existing) {
      return Response.json({ error: '文章不存在' }, { status: 404 });
    }

    // 权限检查：作者或管理员
    if (existing.author_id !== authResult.userId && authResult.role !== 'admin') {
      return Response.json({ error: '无权删除此文章' }, { status: 403 });
    }

    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();

    return Response.json({ message: '删除成功' });
  } catch (err) {
    console.error('Delete post error:', err);
    return Response.json({ error: '删除失败，请稍后再试' }, { status: 500 });
  }
}
