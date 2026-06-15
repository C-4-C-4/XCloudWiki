'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Users, TreePine, Star, Calendar, Terminal, Copy, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/XCloudWiki' : '';

// 小镇数据接口
interface TownData {
  name: string;
  mayor: string;      // 镇长
  zone: string;       // 所在区
  population: string; // 总人数
  treeLevel: string;  // 神树等级
  townLevel: number;  // 小镇等级
  createDate: string; // 创建时间
  status: '人数已满' | '招新中';
  tpCommand: string;  // 传送指令
  desc: string;       // 介绍
  images: string[];   // 图片列表
}

// 真实小镇数据定义
const TOWN_DATA: TownData[] = [
  {
    name: '圣诞小镇',
    mayor: 'StyleYM',
    zone: '一区',
    population: '25 人',
    treeLevel: 'Lv.1',
    townLevel: 3,
    createDate: '2026-05-10',
    status: '人数已满',
    tpCommand: '/res tp sdxz',
    desc: '1.20.1的传奇，lsp袭击塔',
    images: [
      '/wiki-img/PlayerCommunity/Smalltown/sd1.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd2.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd3.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd4.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd5.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd6.jpeg',
      '/wiki-img/PlayerCommunity/Smalltown/sd7.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd8.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd9.png',
      '/wiki-img/PlayerCommunity/Smalltown/sd10.jpeg'
    ]
  },
  {
    name: '云朵小镇',
    mayor: 'YunDuo_BB',
    zone: '一区',
    population: '13 人',
    treeLevel: 'Lv.0',
    townLevel: 2,
    createDate: '2026-05-20',
    status: '招新中',
    tpCommand: '/res tp YunDuo_BB',
    desc: '云朵的好朋友们',
    images: [
      '/wiki-img/PlayerCommunity/Smalltown/yd1.png',
      '/wiki-img/PlayerCommunity/Smalltown/yd2.png',
      '/wiki-img/PlayerCommunity/Smalltown/yd3.png',
      '/wiki-img/PlayerCommunity/Smalltown/yd4.png',
      '/wiki-img/PlayerCommunity/Smalltown/yd5.png',
      '/wiki-img/PlayerCommunity/Smalltown/yd6.png'
    ]
  },
  {
    name: '金鸢尾兰',
    mayor: 'M1Ne1Ga',
    zone: '二区',
    population: '25 人',
    treeLevel: 'Lv.1',
    townLevel: 3,
    createDate: '2026-05-12',
    status: '人数已满',
    tpCommand: '/res tp OUZHEN',
    desc: '招收一起玩的活跃萌萌人玩家想加入游戏里 msg 或者群里 at我目前主要在二区 res tp OUZHEN',
    images: [
      '/wiki-img/PlayerCommunity/Smalltown/jylw1.png',
      '/wiki-img/PlayerCommunity/Smalltown/jylw2.png',
      '/wiki-img/PlayerCommunity/Smalltown/jylw3.png',
      '/wiki-img/PlayerCommunity/Smalltown/jylw4.png',
      '/wiki-img/PlayerCommunity/Smalltown/jylw5.jpeg'
    ]
  },
  {
    name: '尤克特拉希尔',
    mayor: 'kakaxi',
    zone: '二区',
    population: '20 人',
    treeLevel: 'Lv.0',
    townLevel: 2,
    createDate: '2026-05-18',
    status: '人数已满',
    tpCommand: '/res tp yinluogu',
    desc: '暂无介绍',
    images: [
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu1.png',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu2.jpeg',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu3.jpeg',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu4.jpeg',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu5.jpeg',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu6.png',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu7.png',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu8.jpeg',
      '/wiki-img/PlayerCommunity/Smalltown/yinluogu9.jpeg'
    ]
  },
  {
    name: '噶拿给木小镇',
    mayor: 'xiaoapiao',
    zone: '一区',
    population: '20 人',
    treeLevel: 'Lv.1',
    townLevel: 2,
    createDate: '2026-05-10',
    status: '人数已满',
    tpCommand: '/res tp apiao',
    desc: '一区领地apiao为小镇驻地，一起开发环境~',
    images: [
      '/wiki-img/PlayerCommunity/Smalltown/ap1.jpeg',
      '/wiki-img/PlayerCommunity/Smalltown/ap2.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap3.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap4.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap5.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap6.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap7.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap8.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap9.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap10.png',
      '/wiki-img/PlayerCommunity/Smalltown/ap11.png'
    ]
  }
];

// 多播搜索订阅者系统
type SearchSubscriber = (query: string) => void;
const searchSubscribers = new Set<SearchSubscriber>();
const notifySubscribers = (query: string) => {
  searchSubscribers.forEach((sub) => sub(query));
};

// 检索输入组件
export function TownSearch() {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    notifySubscribers(val);
  };

  return (
    <div className="relative my-6 max-w-2xl mx-auto w-full">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-fd-muted-foreground">
        <Search className="size-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="搜索小镇名称或介绍..."
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fd-border bg-fd-card text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary focus:border-transparent transition-all shadow-sm"
      />
    </div>
  );
}

// 独立的单个小镇卡片组件
export function TownCard({ name }: { name: string }) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const town = TOWN_DATA.find((t) => t.name === name);

  // 订阅搜索关键词变化
  useEffect(() => {
    if (!town) return;
    const handler = (q: string) => {
      const match =
        q.trim() === '' ||
        town.name.toLowerCase().includes(q.toLowerCase()) ||
        town.desc.toLowerCase().includes(q.toLowerCase());
      setVisible(match);
    };

    searchSubscribers.add(handler);
    return () => {
      searchSubscribers.delete(handler);
    };
  }, [town]);

  // 控制前置 H2 标题的显示与隐藏
  useEffect(() => {
    const heading = cardRef.current?.previousElementSibling;
    if (heading && heading.tagName === 'H2') {
      if (visible) {
        (heading as HTMLElement).style.display = '';
      } else {
        (heading as HTMLElement).style.display = 'none';
      }
    }
  }, [visible]);

  if (!town) {
    return (
      <div className="border border-fd-border rounded-2xl p-5 text-center text-xs text-fd-muted-foreground max-w-2xl mx-auto w-full mb-6">
        未找到对应小镇数据
      </div>
    );
  }

  const imagesCount = town.images.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === 0 ? imagesCount - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === imagesCount - 1 ? 0 : prev + 1));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(town.tpCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`flex flex-col border border-fd-border rounded-2xl overflow-hidden bg-fd-card shadow-sm hover:shadow-md transition-shadow max-w-2xl mx-auto w-full mb-6 ${
        visible ? 'block' : 'hidden'
      }`}
    >
      {/* 顶部图片轮播容器 - 采用 16:9 比例，利用 absolute 叠加实现渐变 */}
      <div className="relative w-full aspect-video bg-fd-muted overflow-hidden group">
        {imagesCount > 0 ? (
          <>
            {town.images.map((imgUrl, i) => (
              <img
                key={i}
                src={`${basePath}${imgUrl}`}
                alt={`${town.name}-${i}`}
                className={`absolute inset-0 w-full h-full object-cover select-none transition-all duration-500 ease-in-out !m-0 ${
                  currentImgIdx === i
                    ? 'opacity-100 scale-100 pointer-events-auto z-10'
                    : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
                style={{ margin: 0 }}
              />
            ))}
            {/* 左右向切换箭头（多于1张图时显示） */}
            {imagesCount > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
                >
                  <ChevronRight className="size-5" />
                </button>
                {/* 底部点状指示器 */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 z-20">
                  {town.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        currentImgIdx === i ? 'bg-white scale-125' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-fd-muted-foreground">
            暂无图片展示
          </div>
        )}
      </div>

      {/* 下部详细信息区域 */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* 小镇名称 + 招新状态 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-fd-foreground m-0 leading-none">
              {town.name}
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                town.status === '招新中'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
              }`}
            >
              {town.status}
            </span>
          </div>

          {/* 小镇属性数据网格 (2列) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] border-b border-fd-border pb-4 mb-4">
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <User className="size-3.5 shrink-0 text-fd-primary" />
              <span className="truncate">
                镇长: <strong className="text-fd-foreground">{town.mayor}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <MapPin className="size-3.5 shrink-0 text-fd-primary" />
              <span className="truncate">
                所在区: <strong className="text-fd-foreground">{town.zone}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <Users className="size-3.5 shrink-0 text-fd-primary" />
              <span className="truncate">
                总人数: <strong className="text-fd-foreground">{town.population}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <TreePine className="size-3.5 shrink-0 text-fd-primary" />
              <span className="truncate">
                神树等级: <strong className="text-fd-foreground">{town.treeLevel}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <Star className="size-3.5 shrink-0 text-fd-primary" />
              <span className="truncate">
                小镇等级: <strong className="text-fd-foreground">{town.townLevel}级</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <Calendar className="size-3.5 shrink-0 text-fd-primary" />
              <span className="truncate">
                创建时间: <strong className="text-fd-foreground">{town.createDate}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 传送指令与小镇介绍 */}
        <div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-fd-muted border border-fd-border mb-3">
            <div className="flex items-center gap-1.5 min-w-0 text-[10px] text-fd-muted-foreground">
              <Terminal className="size-3.5 shrink-0 text-fd-primary" />
              <span className="font-mono text-fd-foreground truncate">{town.tpCommand}</span>
            </div>
            <button
              onClick={handleCopy}
              className="px-2 py-0.5 text-[10px] font-bold rounded bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/95 active:scale-95 transition-all flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              <span>{copied ? '已复制' : '复制指令'}</span>
            </button>
          </div>

          <div className="text-[11px] text-fd-muted-foreground bg-fd-accent/5 p-3 rounded-xl border-l-2 border-fd-primary">
            <div className="font-bold text-fd-foreground mb-1">小镇介绍</div>
            <p className="m-0 leading-relaxed line-clamp-2">{town.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
