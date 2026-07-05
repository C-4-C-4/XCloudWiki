-- 迁移脚本：文章审核功能 - 新增状态与拒绝理由字段
-- status: pending(待审核) / approved(已通过) / rejected(已拒绝)
-- 历史数据默认 approved，避免现有文章全部消失
ALTER TABLE posts ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'
  CHECK(status IN ('pending', 'approved', 'rejected'));
ALTER TABLE posts ADD COLUMN reject_reason TEXT DEFAULT NULL;

-- 审核状态索引（加速待审核列表查询）
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
