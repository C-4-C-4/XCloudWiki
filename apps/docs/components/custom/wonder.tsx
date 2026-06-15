'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wrench, Crown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// 奇观数据接口
interface WonderData {
  name: string;
  belong: string;     // 归属
  mayor: string;      // 领主
  desc: string;       // 介绍
  themeColor: string; // 专属主题色 (Hex格式)
  images: string[];   // 图片列表
}

// 静态奇观数据
const WONDER_DATA: WonderData[] = [
  {
    name: '圣诞小镇',
    belong: '圣诞小镇全体成员',
    mayor: 'StyleYM',
    desc: '冬雪，松香，老街，一座永不落幕的圣诞温馨小镇。\n钟楼映彩灯，霜雪藏流年。晚风携铃响，落雪赴冬约。\n银白小镇雪中藏，银铃轻依童谣旁。\n一树常青，许愿皆灵。',
    themeColor: '#ff7675',
    images: [
      '/wiki-img/PlayerCommunity/Wonder/sd1.png',
      '/wiki-img/PlayerCommunity/Wonder/sd2.png',
      '/wiki-img/PlayerCommunity/Wonder/sd3.png',
      '/wiki-img/PlayerCommunity/Wonder/sd4.png',
      '/wiki-img/PlayerCommunity/Wonder/sd5.png',
      '/wiki-img/PlayerCommunity/Wonder/sd6.png',
      '/wiki-img/PlayerCommunity/Wonder/sd7.png'
    ]
  },
  {
    name: '晨渊港',
    belong: '金鸢尾兰全体成员',
    mayor: 'M1Ne1Ga',
    desc: '晨渊港之地，乃是超古代帝国海军的后人们所至。\n晨渊锁龙骨，浪涛里永远带着旧战刃的冷意。\n礁石尽是风霜蚀痕，岸边长年吹凛冽北风，据说风里藏着逝去水手的残魂。\n此地水深接幽冥寒渊，能渡千帆归航，也能吞百战孤船，从无例外。',
    themeColor: '#38bdf8',
    images: [
      '/wiki-img/PlayerCommunity/Wonder/cyg1.png',
      '/wiki-img/PlayerCommunity/Wonder/cyg2.png',
      '/wiki-img/PlayerCommunity/Wonder/cyg3.png',
      '/wiki-img/PlayerCommunity/Wonder/cyg4.png',
      '/wiki-img/PlayerCommunity/Wonder/cyg5.png',
      '/wiki-img/PlayerCommunity/Wonder/cyg6.png'
    ]
  },
  {
    name: '寂静庄园',
    belong: 'xiaoapiao',
    mayor: 'xiaoapiao',
    desc: '寂静庄园，隐匿于晨雾之中的古老宅邸。\n藤蔓攀附的石墙上，刻着无人能解的神秘纹路。\n每到午夜，空旷的长廊会响起若有若无的钢琴声。\n传说花园里那株永不凋谢的白玫瑰，藏着庄园的秘密。',
    themeColor: '#fbbf24',
    images: [
      '/wiki-img/PlayerCommunity/Wonder/zy1.png',
      '/wiki-img/PlayerCommunity/Wonder/zy2.png',
      '/wiki-img/PlayerCommunity/Wonder/zy3.png',
      '/wiki-img/PlayerCommunity/Wonder/zy4.png',
      '/wiki-img/PlayerCommunity/Wonder/zy5.png',
      '/wiki-img/PlayerCommunity/Wonder/zy6.png'
    ]
  },
  {
    name: '爱莉希雅',
    belong: 'CccMeow',
    mayor: 'CccMeow',
    desc: '爱莉希雅，是被星辰偏爱的神明，也是被人间温柔留住的存在。\n她的紫晶冠冕垂落柔光，把夜色织成了柔软的怀抱，接住所有漂泊的灵魂。\n她静立在虚无之上，脚下的桥，是她为晚归的人搭的温柔阶梯。\n传说她会记住每一个仰望过她的人，在他们迷茫的时刻，悄悄点亮前方的星光。',
    themeColor: '#f472b6',
    images: [
      '/wiki-img/PlayerCommunity/Wonder/alxy1.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy2.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy3.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy4.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy5.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy6.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy7.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy8.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy9.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy10.png',
      '/wiki-img/PlayerCommunity/Wonder/alxy11.png'
    ]
  }
];

// 发布订阅式多端搜索体系
type SearchSubscriber = (query: string) => void;
const searchSubscribers = new Set<SearchSubscriber>();
const notifySubscribers = (query: string) => {
  searchSubscribers.forEach((sub) => sub(query));
};

// 奇观检索框组件 (宽度对齐为 max-w-2xl)
export function WonderSearch() {
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
        placeholder="搜索奇观名称或介绍..."
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fd-border bg-fd-card text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary focus:border-transparent transition-all shadow-sm"
      />
    </div>
  );
}

// 独立的单个奇观卡片组件 (样式与 TownCard 保持一致，支持内联图片轮播与动画，去除了弹窗查看)
export function WonderCard({ name }: { name: string }) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const wonder = WONDER_DATA.find((w) => w.name === name);

  // 订阅搜索关键词变化
  useEffect(() => {
    if (!wonder) return;
    const handler = (q: string) => {
      const match =
        q.trim() === '' ||
        wonder.name.toLowerCase().includes(q.toLowerCase()) ||
        wonder.desc.toLowerCase().includes(q.toLowerCase());
      setVisible(match);
    };

    searchSubscribers.add(handler);
    return () => {
      searchSubscribers.delete(handler);
    };
  }, [wonder]);

  // 控制前置 H2 标题的显示与隐藏，从而使得大纲在隐藏卡片时也可以做到同步效果
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

  if (!wonder) {
    return (
      <div className="border border-fd-border rounded-2xl p-5 text-center text-xs text-fd-muted-foreground max-w-2xl mx-auto w-full mb-6">
        未找到对应奇观数据
      </div>
    );
  }

  const imagesCount = wonder.images.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === 0 ? imagesCount - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === imagesCount - 1 ? 0 : prev + 1));
  };

  return (
    <div
      ref={cardRef}
      className={`flex flex-col border border-fd-border rounded-2xl overflow-hidden bg-fd-card shadow-sm hover:shadow-md transition-shadow max-w-2xl mx-auto w-full mb-6 ${
        visible ? 'block' : 'hidden'
      }`}
    >
      {/* 顶部图片轮播区 (包含平滑的渐变缩放动画，与小镇样式保持一致) */}
      <div className="relative w-full aspect-video bg-fd-muted overflow-hidden group">
        {imagesCount > 0 ? (
          <>
            {wonder.images.map((imgUrl, i) => (
              <img
                key={i}
                src={imgUrl}
                alt={`${wonder.name}-${i}`}
                className={`absolute inset-0 w-full h-full object-cover select-none transition-all duration-500 ease-in-out !m-0 ${
                  currentImgIdx === i
                    ? 'opacity-100 scale-100 pointer-events-auto z-10'
                    : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
                style={{ margin: 0 }}
              />
            ))}

            {/* 左右向切换箭头（多于1张图时悬浮显示） */}
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
                  {wonder.images.map((_, i) => (
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
          {/* 奇观名称 */}
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-base font-bold m-0 leading-none select-none"
              style={{ color: wonder.themeColor }}
            >
              {wonder.name}
            </h3>
          </div>

          {/* 属性数据网格 (2列) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] border-b border-fd-border pb-4 mb-4">
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <Wrench className="size-3.5 shrink-0" style={{ color: wonder.themeColor }} />
              <span className="truncate">
                归属: <strong className="text-fd-foreground">{wonder.belong}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-fd-muted-foreground min-w-0">
              <Crown className="size-3.5 shrink-0" style={{ color: wonder.themeColor }} />
              <span className="truncate">
                领主: <strong className="text-fd-foreground">{wonder.mayor}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 奇观介绍部分 */}
        <div 
          className="text-[11px] text-fd-muted-foreground bg-fd-accent/5 p-3 rounded-xl border-l-2"
          style={{ borderLeftColor: wonder.themeColor }}
        >
          <div className="font-bold text-fd-foreground mb-1 select-none">奇观介绍</div>
          <p className="m-0 leading-relaxed whitespace-pre-line">{wonder.desc}</p>
        </div>
      </div>
    </div>
  );
}
