-- 迁移脚本：在 users 表中新增头像(avatar)和个人简介(bio)字段
ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL;
