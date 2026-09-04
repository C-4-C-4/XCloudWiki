'use client';

import { useState, useEffect } from 'react';
import { AlertDialog } from '@/components/ui/alert-dialog';

/**
 * AnnouncementDialog 公告弹窗组件
 * 在主页加载时自动弹出，展示 Wiki 维护人员招募公告
 * 使用项目原生 AlertDialog 组件，自带 motion/react 开关动画
 */
export function AnnouncementDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 页面加载后短暂延迟再弹出，避免与页面初始化动画冲突
    const timer = setTimeout(() => {
      setOpen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AlertDialog
      open={open}
      variant="warning"
      title="公告"
      description={
        <>
          Wiki 相关的维护人员已全部卸任。
          <br />
          <br />
          如果你擅长编写文章，并且有意愿担任 Wiki 维护职位，
          请联系服主：
          <strong className="text-amber-400"> Love_Story</strong>
          <br />
          <br />
          <span className="text-xs text-fd-muted-foreground/70">
            我们期待有热情的玩家加入，共同维护闲云 Wiki！
          </span>
        </>
      }
      confirmText="我知道了"
      onConfirm={() => setOpen(false)}
      onCancel={() => setOpen(false)}
    />
  );
}
