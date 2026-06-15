'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, Terminal, MapPin, Globe, Coins, User, ShieldAlert, ArrowRightLeft, Plane } from 'lucide-react';

export interface CommandItem {
  cmd: string;
  desc: string;
}

export interface CommandCategory {
  name: string;
  icon: React.ReactNode;
  subCategories?: {
    name: string;
    icon?: React.ReactNode;
    commands: CommandItem[];
  }[];
  commands?: CommandItem[];
}

interface CommandListProps {
  categories: CommandCategory[];
  /** 隐藏顶部标题栏和搜索框（用于多实例拼接场景） */
  hideHeader?: boolean;
}

export function CommandList({ categories, hideHeader = false }: CommandListProps) {
  const [search, setSearch] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  // 全局搜索过滤：匹配指令文本和说明
  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      subCategories: cat.subCategories
        ?.map((sub) => ({
          ...sub,
          commands: sub.commands.filter(
            (cmd) =>
              cmd.cmd.toLowerCase().includes(search.toLowerCase()) ||
              cmd.desc.toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((sub) => sub.commands.length > 0),
      commands: cat.commands?.filter(
        (cmd) =>
          cmd.cmd.toLowerCase().includes(search.toLowerCase()) ||
          cmd.desc.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter(
      (cat) =>
        (cat.subCategories && cat.subCategories.length > 0) ||
        (cat.commands && cat.commands.length > 0),
    );

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      // fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx(null), 1500);
    }
  };

  const totalCommands = filteredCategories.reduce(
    (acc, cat) =>
      acc +
      (cat.commands?.length || 0) +
      (cat.subCategories?.reduce((s, sub) => s + sub.commands.length, 0) || 0),
    0,
  );

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      {/* 搜索框 */}
      {!hideHeader && (
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-fd-muted-foreground" />
          <input
            type="text"
            placeholder="搜索指令或说明..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-fd-border bg-fd-background text-sm text-fd-foreground placeholder:text-fd-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-fd-primary/50 focus:border-fd-primary transition-all"
          />
        </div>
      </div>
      )}

      {/* 结果计数 */}
      {search && (
        <p className="text-xs text-fd-muted-foreground mb-4">
          找到 <span className="font-bold text-fd-foreground">{totalCommands}</span> 条匹配指令
        </p>
      )}

      {/* 分类列表 */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-8">
          {filteredCategories.map((cat, catIdx) => (
            <section key={catIdx}>
              {/* 分类标题（多分类时或未隐藏头部时显示） */}
              {(filteredCategories.length > 1 || !hideHeader) && (
              <h5 className="text-sm font-bold text-fd-foreground mb-3 flex items-center gap-1.5 pb-2 border-b border-fd-border">
                {cat.icon}
                {cat.name}
              </h5>
              )}

              {/* 有子分类时渲染子分类 */}
              {cat.subCategories && cat.subCategories.length > 0 && (
                <div className="space-y-6">
                  {cat.subCategories.map((sub, subIdx) => (
                    <div key={subIdx}>
                      {/* 子分类标题 */}
                      {sub.name && (
                        <h6 className="text-xs font-semibold text-fd-muted-foreground mb-2.5 flex items-center gap-1.5">
                          {sub.icon}
                          {sub.name}
                        </h6>
                      )}
                      {/* 指令卡片网格 */}
                      <CommandGrid
                        commands={sub.commands}
                        copiedIdx={copiedIdx}
                        onCopy={handleCopy}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 无子分类时直接渲染指令 */}
              {cat.commands && cat.commands.length > 0 && !cat.subCategories && (
                <CommandGrid
                  commands={cat.commands}
                  copiedIdx={copiedIdx}
                  onCopy={handleCopy}
                />
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-fd-muted-foreground">
          <p className="mb-1">没有找到匹配的指令</p>
          <p className="text-fd-muted-foreground/60">试试其他关键词吧</p>
        </div>
      )}
    </div>
  );
}

/** 指令卡片网格 */
function CommandGrid({
  commands,
  copiedIdx,
  onCopy,
}: {
  commands: CommandItem[];
  copiedIdx: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {commands.map((item, idx) => {
        const key = `${item.cmd}-${idx}`;
        const isCopied = copiedIdx === key;
        return (
          <div
            key={key}
            className="group flex flex-col justify-between gap-2.5 p-4 rounded-xl bg-fd-muted/60 border border-fd-border hover:bg-fd-accent/10 hover:border-fd-primary/20 transition-all duration-200"
          >
            {/* 指令文本 + 复制按钮 */}
            <div className="flex items-start justify-between gap-2">
              <code className="text-xs font-bold font-mono text-fd-foreground bg-fd-card px-2 py-1 rounded-md border border-fd-border select-all leading-relaxed break-all">
                {item.cmd}
              </code>
              <button
                onClick={() => onCopy(item.cmd, key)}
                className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md border transition-all ${
                  isCopied
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-fd-card border-fd-border text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent opacity-0 group-hover:opacity-100'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="size-3" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    复制
                  </>
                )}
              </button>
            </div>

            {/* 说明文字 */}
            <p className="text-[11px] text-fd-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
