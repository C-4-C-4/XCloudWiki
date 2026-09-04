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
      className="max-w-lg md:max-w-4xl"
      description={
        <div className="flex flex-col md:flex-row gap-5 text-left pt-1 items-center">
          {/* 左侧配图（大幅放大多图细节） */}
          <div className="w-full md:w-[58%] shrink-0 flex items-center justify-center">
            <div className="relative w-full overflow-hidden rounded-xl border border-fd-border/60 shadow-md bg-fd-secondary/30">
              <img
                src="/Gallery/2.png"
                alt="Wiki 公告"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>

          {/* 右侧文本内容与人员列表 */}
          <div className="w-full md:w-[42%] flex flex-col space-y-3 min-w-0">
            {/* 第一部分：卸任人员 */}
            <div>
              <p className="mb-2 font-medium text-fd-foreground">Wiki 相关的维护人员已全部卸任：</p>
              
              <div className="grid grid-cols-2 gap-1.5 p-2 bg-fd-secondary/50 border border-fd-border rounded-xl">
                {retiredTeam.map((member) => (
                  <div key={member.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-fd-background/60 border border-fd-border/40">
                    <div className="size-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-xs text-brand shrink-0 overflow-hidden">
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
            <div className="pt-2 border-t border-fd-border/40">
              <p className="text-xs md:text-sm leading-relaxed">
                如果你擅长编写文章，并且有意愿担任 Wiki 维护职位，请联系服主：
              </p>
              <div className="mt-2 flex justify-center">
                <strong className="text-amber-400 font-bold bg-amber-500/10 px-3 py-0.5 rounded-lg border border-amber-500/20 text-xs md:text-sm tracking-wide shadow-sm">
                  Love_Story
                </strong>
              </div>
            </div>
            
            {/* 第三部分：结语 */}
            <div className="pt-1.5 border-t border-fd-border/30">
              <p className="text-[11px] text-fd-muted-foreground/80">
                我们期待有热情的玩家加入，共同维护闲云 Wiki！
              </p>
            </div>
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
