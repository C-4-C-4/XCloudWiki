/**
 * 图片上传 API
 * - POST /api/upload - 上传图片到 R2
 */

import { requireAuth } from '../middleware/auth.ts';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 上传图片到 R2 对象存储
 */
export async function uploadImage(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: '请选择要上传的图片' }, { status: 400 });
    }

    // 检查文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: '不支持的图片格式，仅支持 JPG、PNG、GIF、WebP' },
        { status: 400 },
      );
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: '图片大小不能超过 5MB' }, { status: 400 });
    }

    // 生成唯一文件名
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const key = `forum/${authResult.userId}/${timestamp}-${random}.${ext}`;

    // 上传到 R2
    await env.R2.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // 返回公开访问 URL
    const url = `${env.R2_PUBLIC_URL}/${key}`;

    return Response.json({
      message: '上传成功',
      url,
      key,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return Response.json({ error: '上传失败，请稍后再试' }, { status: 500 });
  }
}
