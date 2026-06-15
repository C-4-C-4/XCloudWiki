'use client';

import React, { useState } from 'react';

// NPC 分类类型
type NpcCategory = '功能' | '商业' | '娱乐';
type CategoryKey = NpcCategory | '全部';

// NPC 数据结构
interface NpcData {
  name: string;
  category: NpcCategory;
  logo: string;        // 卡片内显示的 logo 小图路径
  preview: string;     // 灯箱弹窗的预览大图路径
  coord: string;
  tp: string;
  desc: string;
}

// ==================== NPC 数据 ====================
const NPC_DATA: NpcData[] = [
  // ---- 功能类 ----
  {
    name: '经验池',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/经验大师以及经验池logo1.png',
    preview: '/wiki-img/BeginnersGuide/NPC/经验大师以及经验池.png',
    coord: '-193 75 6',
    tp: '/res tp jingyanchi',
    desc: '挂机获取经验瓶升级职业',
  },
  {
    name: '新手签到',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/新手七日签到logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/新手七日签到.png',
    coord: '-62 74 20',
    tp: '/res tp qiandao',
    desc: '每日福利与任务打卡',
  },
  {
    name: '成就大师',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/成就大师logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/成就大师.png',
    coord: '-54 73 -3',
    tp: '/res tp chengjiu',
    desc: '查看与兑换成就积分奖励',
  },
  {
    name: '维护补偿',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/维护补偿logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/维护补偿.png',
    coord: '-69 72 -2',
    tp: '/res tp buchang',
    desc: '领取服务器停机维护奖励',
  },
  {
    name: 'B站兑换',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/Bilibili福利logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/Bilibili福利.png',
    coord: '-115 72 -11',
    tp: '/res tp bilibili',
    desc: 'B站宣传视频及礼包码兑换',
  },
  {
    name: '好友邀请',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/邀请好友[邀请码]logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/邀请好友[邀请码].png',
    coord: '铁匠旁边',
    tp: '/res tp yaoqing',
    desc: '查看并接受好友绑定邀请',
  },
  {
    name: '反馈Bug',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/问题反馈logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/问题反馈.png',
    coord: '-140 72 -44',
    tp: '/res tp bug',
    desc: '提交游玩过程中的异常及漏洞反馈',
  },
  {
    name: '小镇管理员',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/小镇管理员logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/小镇管理员.png',
    coord: '',
    tp: '',
    desc: '小镇相关管理与服务',
  },
  {
    name: '附魔师',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/附魔师logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/附魔师.png',
    coord: '',
    tp: '',
    desc: '消耗附魔之眼抽取附魔书',
  },
  {
    name: '图书管理员',
    category: '功能',
    logo: '/wiki-img/BeginnersGuide/NPC/图书管理员logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/图书管理员.png',
    coord: '',
    tp: '',
    desc: '图书馆管理与知识查询',
  },

  // ---- 商业类 ----
  {
    name: '铁匠（升级武器）',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/铁匠logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/铁匠.png',
    coord: '-133 72 16',
    tp: '/res tp tiejiang',
    desc: '升级、分解、镶嵌武器装备',
  },
  {
    name: '物品回收',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/物品回收logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/物品回收.png',
    coord: '铁匠对面',
    tp: '/res tp huishou',
    desc: '出售杂物给系统赚取金币',
  },
  {
    name: '神秘商店（巴斯克）',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/神秘商店logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/神秘商店.png',
    coord: '-130 72 -6',
    tp: '/res tp mysterious',
    desc: '随机售卖各种稀缺珍稀道具',
  },
  {
    name: '贡献商店',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/贡献商店logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/贡献商店.png',
    coord: '-115 72 38',
    tp: '/res tp gongxian',
    desc: '使用贡献币兑换特殊装备',
  },
  {
    name: '铭牌商人',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/铭牌商人logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/铭牌商人.png',
    coord: '-100 72 -36',
    tp: '/res tp mingpai',
    desc: '定制个性化聊天框和玩家列表铭牌',
  },
  {
    name: '头颅商人',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/头颅商人logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/头颅商人.png',
    coord: '-231 75 -30',
    tp: '/res tp skull',
    desc: '购买玩家、怪物等各类装饰性头颅',
  },
  {
    name: '万象宝库',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/万象宝库logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/万象宝库.png',
    coord: '-135 72 57',
    tp: '/res tp baoku',
    desc: '打开各色品质的活动宝箱',
  },
  {
    name: '家具 & 动物市场',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/动物市场logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/动物市场.png',
    coord: '-212 75 -55',
    tp: '/res tp furniture',
    desc: '买装饰家具和宠物马等坐骑',
  },
  {
    name: '时装商人',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/时装商人logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/时装商人.png',
    coord: '',
    tp: '',
    desc: '购买各类时装皮肤装扮',
  },
  {
    name: '游戏商城',
    category: '商业',
    logo: '/wiki-img/BeginnersGuide/NPC/游戏商城logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/游戏商城.png',
    coord: '',
    tp: '',
    desc: '游戏内虚拟商品购买中心',
  },

  // ---- 娱乐类 ----
  {
    name: '致富乐 / 世界Boss',
    category: '娱乐',
    logo: '/wiki-img/BeginnersGuide/NPC/致富乐logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/致富乐.png',
    coord: '-100 73 22',
    tp: '/res tp zhifule',
    desc: '抽奖、挑战Boss与挑战转转乐',
  },
  {
    name: '渔夫',
    category: '娱乐',
    logo: '/wiki-img/BeginnersGuide/NPC/渔夫logo.png',
    preview: '/wiki-img/BeginnersGuide/NPC/渔夫.png',
    coord: '致富乐左侧临近',
    tp: '/res tp yufu',
    desc: '兑换鱼类、购买鱼竿及饲料',
  },
];

// 分类配置
const CATEGORY_CONFIG: Record<CategoryKey, { label: string; color: string }> = {
  全部: { label: '全部', color: '#9ca3af' },
  功能: { label: '功能', color: '#3b82f6' },
  商业: { label: '商业', color: '#eab308' },
  娱乐: { label: '娱乐', color: '#ec4899' },
};

// ==================== 主组件 ====================
export function NpcDirectory() {
  const [search, setSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('全部');
  const [lightboxNpc, setLightboxNpc] = useState<NpcData | null>(null);

  // 组合筛选：搜索 + 分类
  const filteredNpc = NPC_DATA.filter((npc) => {
    const matchSearch =
      search === '' ||
      npc.name.toLowerCase().includes(search.toLowerCase()) ||
      npc.desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === '全部' || npc.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      {/* ====== 标题栏 + 筛选区 ====== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h4 className="text-base font-bold text-fd-foreground flex items-center gap-2">
          <span className="text-pink-400">📍</span>
          主城 NPC 快捷查找手册
        </h4>
        <input
          type="text"
          placeholder="搜索 NPC 名字或功能..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-fd-border bg-fd-background text-xs text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary max-w-xs w-full"
        />
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
          const cfg = CATEGORY_CONFIG[key];
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                isActive ? 'shadow-sm' : 'bg-fd-muted/60 text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
              }`}
              style={
                isActive
                  ? { backgroundColor: cfg.color, color: '#fff', borderColor: cfg.color }
                  : undefined
              }
            >
              {cfg.label}
              <span className={`ml-1 text-[10px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                ({key === '全部' ? NPC_DATA.length : NPC_DATA.filter((n) => n.category === key).length})
              </span>
            </button>
          );
        })}
      </div>

      {/* ====== 卡片网格 ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredNpc.length > 0 ? (
          filteredNpc.map((npc, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxNpc(npc)}
              className="flex items-start gap-3 p-3 rounded-xl bg-fd-muted/50 border border-fd-border hover:bg-fd-accent/10 cursor-pointer transition-colors group"
            >
              {/* Logo 图片 */}
              <img
                src={npc.logo}
                alt={npc.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-fd-border group-hover:border-fd-primary/30 transition-colors"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />

              {/* 信息区 */}
              <div className="flex-1 min-w-0">
                {/* 名称 + 分类标签 */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-fd-foreground leading-none truncate">
                    {npc.name}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                    style={{
                      color: CATEGORY_CONFIG[npc.category].color,
                      backgroundColor: `${CATEGORY_CONFIG[npc.category].color}15`,
                    }}
                  >
                    {npc.category}
                  </span>
                </div>

                {/* 描述 */}
                <p className="text-[10px] text-fd-muted-foreground truncate mb-1.5">{npc.desc}</p>

                {/* 坐标 */}
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-fd-card border border-fd-border font-mono text-[9px] text-fd-foreground">
                    XYZ: {npc.coord || '--'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-fd-muted-foreground">
            没有找到匹配的 NPC，换个关键词或分类试试吧 (✿◡‿◡)
          </div>
        )}
      </div>

      {/* ====== 毛玻璃灯箱弹窗 ====== */}
      {lightboxNpc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxNpc(null)}
        >
          {/* 背景遮罩 - 毛玻璃效果 */}
          <div
            className="absolute inset-0 backdrop-blur-xl bg-black/50"
            onClick={() => setLightboxNpc(null)}
          />

          {/* 弹窗内容 */}
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: 'rgba(24, 24, 27, 0.85)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 预览大图 */}
            <div className="relative w-full aspect-video bg-black/40 flex items-center justify-center">
              <img
                src={lightboxNpc.preview}
                alt={lightboxNpc.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* 关闭按钮 */}
              <button
                onClick={() => setLightboxNpc(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* 详情信息 */}
            <div className="p-5 space-y-3">
              {/* 名称 + 分类 */}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-fd-foreground">{lightboxNpc.name}</h3>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold"
                  style={{
                    color: CATEGORY_CONFIG[lightboxNpc.category].color,
                    backgroundColor: `${CATEGORY_CONFIG[lightboxNpc.category].color}20`,
                  }}
                >
                  {lightboxNpc.category}
                </span>
              </div>

              {/* 描述 */}
              <p className="text-sm text-fd-muted-foreground leading-relaxed">{lightboxNpc.desc}</p>

              {/* 坐标信息 */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                {lightboxNpc.coord && (
                  <div className="flex items-center gap-1.5 text-xs text-fd-muted-foreground">
                    <span>坐标:</span>
                    <code className="px-2 py-0.5 rounded bg-white/5 font-mono text-fd-foreground">
                      {lightboxNpc.coord}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
