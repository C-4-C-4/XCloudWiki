/**
 * Workers 环境类型定义
 */

interface Env {
  // D1 数据库绑定
  DB: D1Database;
  // R2 对象存储绑定
  R2: R2Bucket;
  // 环境变量
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string;
  R2_PUBLIC_URL: string;
}
