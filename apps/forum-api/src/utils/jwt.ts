/**
 * JWT 工具
 * 使用 Web Crypto API（兼容 Cloudflare Workers 环境）
 * 实现 HS256 签名的 JWT token
 */

export interface JWTPayload {
  userId: number;
  gameId: string;
  role: string;
  exp: number;
  iat: number;
}

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

async function sign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

async function verify(message: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await sign(message, secret);
  return signature === expectedSignature;
}

/**
 * 创建 JWT token
 * @param payload 用户信息
 * @param secret JWT 密钥
 * @param expiresInHours token 过期时间（小时），默认 72 小时
 */
export async function createToken(
  payload: Omit<JWTPayload, 'exp' | 'iat'>,
  secret: string,
  expiresInHours: number = 72,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInHours * 3600,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await sign(`${header}.${body}`, secret);

  return `${header}.${body}.${signature}`;
}

/**
 * 验证并解析 JWT token
 */
export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const isValid = await verify(`${header}.${body}`, signature, secret);
    if (!isValid) return null;

    const payload: JWTPayload = JSON.parse(base64UrlDecode(body));

    // 检查是否过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}
