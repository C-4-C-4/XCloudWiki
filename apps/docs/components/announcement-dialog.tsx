'use client';

import { useState, useEffect } from 'react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { retiredTeam } from '@/app/(home)/sponsors/data';

/**
 * AnnouncementDialog 公告弹窗组件
 * 在主页加载时自动弹出，展示 Wiki 维护人员招募公告及已卸任成员
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
      className="max-w-lg"
      description={
        <div className="space-y-4 text-left pt-1">
          {/* 第一部分：卸任人员 */}
          <div>
            <p className="mb-2.5 font-medium text-fd-foreground">Wiki 相关的维护人员已全部卸任：</p>
            
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-fd-secondary/50 border border-fd-border rounded-xl">
              {retiredTeam.map((member) => (
                <div key={member.name} className="flex items-center gap-2 p-2 rounded-lg bg-fd-background/60 border border-fd-border/40">
                  <div className="size-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-xs text-brand shrink-0 overflow-hidden">
                    {member.avatar.startsWith('/') ? (
                      <img src={member.avatar} alt={member.name} className="size-full object-cover" />
                    ) : (
                      member.name.slice(0, 1)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-fd-foreground truncate">{member.name}</p>
                    <p className="text-[10px] text-fd-muted-foreground/70 truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 第二部分：招募提示 */}
          <div className="pt-3 border-t border-fd-border/40">
            <p className="leading-relaxed">
              如果你擅长编写文章，并且有意愿担任 Wiki 维护职位，请联系服主：
            </p>
            <div className="mt-2.5 flex justify-center">
              <strong className="text-amber-400 font-bold bg-amber-500/10 px-3.5 py-1 rounded-lg border border-amber-500/20 text-sm tracking-wide shadow-sm">
                Love_Story
              </strong>
            </div>
          </div>
          
          {/* 第三部分：结语 */}
          <div className="pt-2 border-t border-fd-border/30">
            <p className="text-xs text-fd-muted-foreground/80">
              我们期待有热情的玩家加入，共同维护闲云 Wiki！
            </p>
          </div>
        </div>
      }
      confirmText="我知道了"
      showSecondary={true}
      secondaryText="别走"
      secondaryClassName="border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-300 font-semibold px-4 transition-all"
      onSecondary={() => {
        window.dispatchEvent(new CustomEvent('play-bg-music-with-lyrics'));
        setOpen(false);
      }}
      onConfirm={() => {
        window.dispatchEvent(new CustomEvent('play-bg-music-with-lyrics'));
        setOpen(false);
      }}
      onCancel={() => {
        window.dispatchEvent(new CustomEvent('play-bg-music-with-lyrics'));
        setOpen(false);
      }}
    />
  );
}
