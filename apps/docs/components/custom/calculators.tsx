'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Coins, Gift, RotateCcw, AlertTriangle, Trophy, Eye, Compass } from 'lucide-react';

// 称号等级配置
const RANK_CONFIGS = {
  PLAYER: { name: 'PLAYER', price: 4.5, limit: 150, maxPlots: 3, subPlots: 3, label: '初始称号', color: '#9ca3af' },
  VIP: { name: 'VIP', price: 4, limit: 200, maxPlots: 5, subPlots: 5, label: '高级特权', color: '#3b82f6' },
  MVP: { name: 'MVP', price: 3.5, limit: 300, maxPlots: 7, subPlots: 10, label: '至尊特权', color: '#eab308' },
  PRO: { name: 'PRO', price: 3, limit: 350, maxPlots: 9, subPlots: 15, label: '超凡特权', color: '#c084fc' },
  HERO: { name: 'HERO', price: 2.5, limit: 500, maxPlots: 12, subPlots: 30, label: '英雄特权', color: '#ec4899' },
};

// 1. 领地计算器
export function ResidenceCalculator() {
  const [rank, setRank] = useState<keyof typeof RANK_CONFIGS>('PLAYER');
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [count, setCount] = useState<number>(1);

  const activeConfig = RANK_CONFIGS[rank];
  const area = length * width;
  const singleCost = area * activeConfig.price;
  const totalCost = singleCost * count;
  const isOverLimit = length > activeConfig.limit || width > activeConfig.limit;

  // 一键设为最大
  const setToMax = () => {
    setLength(activeConfig.limit);
    setWidth(activeConfig.limit);
    setCount(1);
  };

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      {/* 标题 */}
      <div className="flex items-baseline gap-3 mb-5">
        <h4 className="text-lg font-bold text-fd-foreground whitespace-nowrap">领地价格计算器</h4>
        <span className="text-xs text-fd-muted-foreground">数据来自<span style={{ color: activeConfig.color }} className="font-semibold">玩家称号</span>参数</span>
      </div>

      {/* 称号选择 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.keys(RANK_CONFIGS).map((key) => {
          const cfg = RANK_CONFIGS[key as keyof typeof RANK_CONFIGS];
          const isActive = rank === key;
          return (
            <button
              key={key}
              onClick={() => setRank(key as keyof typeof RANK_CONFIGS)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                isActive
                  ? 'shadow-sm'
                  : 'bg-fd-muted/60 text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
              }`}
              style={isActive ? {
                backgroundColor: cfg.color,
                color: '#fff',
                borderColor: cfg.color,
              } : {}}
            >
              {cfg.name}
            </button>
          );
        })}
      </div>

      {/* 参数信息卡片区 - 4列布局 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-fd-muted/40 border transition-colors" style={{ borderColor: `${activeConfig.color}30` }}>
          <span className="block text-[10px] text-fd-muted-foreground mb-1">单块最大范围</span>
          <span className="text-sm font-bold text-fd-foreground font-mono">{activeConfig.limit} × {activeConfig.limit}</span>
        </div>
        <div className="p-3 rounded-xl bg-fd-muted/40 border transition-colors" style={{ borderColor: `${activeConfig.color}30` }}>
          <span className="block text-[10px] text-fd-muted-foreground mb-1">领地数量上限</span>
          <span className="text-sm font-bold text-fd-foreground font-mono">{activeConfig.maxPlots} 块</span>
        </div>
        <div className="p-3 rounded-xl bg-fd-muted/40 border transition-colors" style={{ borderColor: `${activeConfig.color}30` }}>
          <span className="block text-[10px] text-fd-muted-foreground mb-1">子领地数量上限</span>
          <span className="text-sm font-bold text-fd-foreground font-mono">{activeConfig.subPlots} 块</span>
        </div>
        <div className="p-3 rounded-xl bg-fd-muted/40 border transition-colors" style={{ borderColor: `${activeConfig.color}30` }}>
          <span className="block text-[10px] text-fd-muted-foreground mb-1">圈地单价</span>
          <span className="text-sm font-bold font-mono" style={{ color: activeConfig.color }}>{activeConfig.price} 币 / 格</span>
        </div>
      </div>

      {/* 圈地尺寸输入区 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-fd-foreground">圈地尺寸（格）</span>
          <button
            onClick={setToMax}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
            style={{
              color: activeConfig.color,
              borderColor: `${activeConfig.color}50`,
              backgroundColor: `${activeConfig.color}10`,
            }}
          >
            一键设为最大
          </button>
        </div>
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-4">
            <label className="block text-[10px] text-fd-muted-foreground mb-1">长度 (X)</label>
            <input
              type="number"
              min={0}
              value={length || ''}
              onChange={(e) => setLength(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border bg-fd-background text-sm text-fd-foreground focus:outline-none transition-colors"
              style={{
                borderColor: isOverLimit ? '#ef4444' : `${activeConfig.color}50`,
                '--tw-ring-color': activeConfig.color,
              } as React.CSSProperties}
              placeholder=""
            />
          </div>
          <div className="col-span-1 text-center text-fd-muted-foreground font-bold pt-5">×</div>
          <div className="col-span-4">
            <label className="block text-[10px] text-fd-muted-foreground mb-1">宽度 (Z)</label>
            <input
              type="number"
              min={0}
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border bg-fd-background text-sm text-fd-foreground focus:outline-none transition-colors"
              style={{
                borderColor: isOverLimit ? '#ef4444' : `${activeConfig.color}50`,
                '--tw-ring-color': activeConfig.color,
              } as React.CSSProperties}
              placeholder=""
            />
          </div>
          <div className="col-span-1 text-center text-fd-muted-foreground font-bold pt-5">×</div>
          <div className="col-span-2">
            <label className="block text-[10px] text-fd-muted-foreground mb-1">数量（块）</label>
            <input
              type="number"
              min={1}
              value={count || 1}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg border bg-fd-background text-sm text-fd-foreground focus:outline-none transition-colors"
              style={{
                borderColor: `${activeConfig.color}50`,
                '--tw-ring-color': activeConfig.color,
              } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* 结果显示区 */}
      <div className="p-5 rounded-xl bg-fd-muted/30 border mb-4 transition-colors" style={{ borderColor: `${activeConfig.color}20` }}>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <span className="block text-xs text-fd-muted-foreground mb-1">单块占地</span>
            <span className="text-xl font-black text-fd-foreground font-mono">{area.toLocaleString()} 格</span>
          </div>
          <div>
            <span className="block text-xs text-fd-muted-foreground mb-1">单块费用</span>
            <span className="text-xl font-black text-fd-foreground font-mono">{singleCost.toLocaleString()} 币</span>
          </div>
          <div>
            <span className="block text-xs text-fd-muted-foreground mb-1">预估费用</span>
            <span className="text-xl font-black font-mono" style={{ color: activeConfig.color }}>{totalCost.toLocaleString()} 币</span>
          </div>
        </div>
        <div className="text-xs text-fd-muted-foreground font-mono">
          计算公式: {length} × {width} × {activeConfig.price} = {singleCost.toLocaleString()} 币
        </div>
      </div>

      {/* 超限警告 */}
      {isOverLimit && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 flex items-center gap-2">
          ⚠️ 长度或宽度已超过该称号的单口上限！
        </div>
      )}

      {/* 单块满额参考 */}
      <div className="p-4 rounded-xl bg-fd-card border transition-colors" style={{ borderColor: `${activeConfig.color}25` }}>
        <span className="block text-xs text-fd-muted-foreground mb-2">单块满额参考 ({activeConfig.limit}×{activeConfig.limit})</span>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-fd-foreground">占地 {(activeConfig.limit ** 2).toLocaleString()} 格</span>
          <span className="text-base font-bold font-mono" style={{ color: activeConfig.color }}>约 {(activeConfig.limit ** 2 * activeConfig.price).toLocaleString()} 币</span>
        </div>
      </div>

      {/* 底部提示 */}
      <p className="mt-4 text-[11px] text-fd-muted-foreground/70 leading-relaxed">
        以上为平面占地估算；Y 轴高度计入领地但不额外计费。实际以游戏内木镐选区后显示的金额为准。
      </p>
    </div>
  );
}

// 2. 转账汇率计算器
export function TransferCalculator() {
  const [amount, setAmount] = useState<number>(100);

  const fee = amount >= 50 ? amount * 0.08 : 0;
  const total = amount + fee;

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-4">💸 转账手续费计算器</h4>
      
      <div className="mb-4">
        <label className="block text-xs font-medium text-fd-muted-foreground mb-1.5">您想转给对方的金额 (金币)</label>
        <div className="relative">
          <input
            type="number"
            min={1}
            value={amount || ''}
            onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full pl-3 pr-10 py-2 rounded-lg border border-fd-border bg-fd-background text-sm text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
          />
          <span className="absolute right-3 top-2.5 text-xs text-fd-muted-foreground font-bold">币</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-fd-muted border border-fd-border mb-4">
        <div>
          <span className="block text-[10px] text-fd-muted-foreground">手续费率 (免税额)</span>
          <span className="text-sm font-semibold text-fd-foreground font-mono">8% (&lt; 50币免税)</span>
        </div>
        <div>
          <span className="block text-[10px] text-fd-muted-foreground">手续费</span>
          <span className="text-sm font-semibold text-red-500 font-mono">+{fee.toFixed(2)} 币</span>
        </div>
      </div>

      <div>
        <span className="text-xs text-fd-muted-foreground">您实际需要转出的总金额:</span>
        <div className="text-2xl font-black text-fd-primary font-mono">{total.toFixed(2)} <span className="text-sm font-normal">金币</span></div>
      </div>
    </div>
  );
}

// 3. 拍卖行税率计算器
const AUCTION_TAX_CONFIGS = {
  PLAYER: { name: 'PLAYER', rate: 0.045, color: '#9ca3af' },
  VIP: { name: 'VIP', rate: 0.04, color: '#3b82f6' },
  MVP: { name: 'MVP', rate: 0.035, color: '#eab308' },
  PRO: { name: 'PRO', rate: 0.03, color: '#c084fc' },
  HERO: { name: 'HERO', rate: 0.02, color: '#ec4899' },
};

export function AuctionCalculator() {
  const [rank, setRank] = useState<keyof typeof AUCTION_TAX_CONFIGS>('PLAYER');
  const [price, setPrice] = useState<number>(100);

  const activeConfig = AUCTION_TAX_CONFIGS[rank];
  const tax = price * activeConfig.rate;
  const netIncome = price - tax;
  const ratePercent = (activeConfig.rate * 100).toFixed(1);

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      {/* 标题 */}
      <div className="flex items-baseline gap-3 mb-5">
        <h4 className="text-lg font-bold text-fd-foreground whitespace-nowrap">拍卖行汇率计算器</h4>
        <span className="text-xs text-fd-muted-foreground">税率随称号递减 · 数据来自<span style={{ color: '#eab308' }} className="font-semibold">玩家称号</span></span>
      </div>

      {/* 称号选择 - 显示名称+税率 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.keys(AUCTION_TAX_CONFIGS).map((key) => {
          const cfg = AUCTION_TAX_CONFIGS[key as keyof typeof AUCTION_TAX_CONFIGS];
          const isActive = rank === key;
          return (
            <button
              key={key}
              onClick={() => setRank(key as keyof typeof AUCTION_TAX_CONFIGS)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border flex flex-col items-center justify-center min-w-[72px] ${
                isActive ? 'shadow-sm' : 'bg-fd-muted/60 text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
              }`}
              style={isActive ? {
                backgroundColor: cfg.color,
                color: '#fff',
                borderColor: cfg.color,
              } : {}}
            >
              <span>{cfg.name}</span>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'text-white/80' : ''}`}>
                {(cfg.rate * 100).toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* 上架售价输入 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-fd-foreground mb-2">上架售价（币）</label>
        <input
          type="number"
          min={0}
          value={price || ''}
          onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full px-3 py-2.5 rounded-lg border bg-fd-background text-base text-fd-foreground focus:outline-none transition-colors"
          style={{
            borderColor: `${activeConfig.color}50`,
            '--tw-ring-color': activeConfig.color,
          } as React.CSSProperties}
        />
      </div>

      {/* 结果显示区 */}
      <div className="p-5 rounded-xl bg-fd-muted/30 border mb-4 transition-colors" style={{ borderColor: `${activeConfig.color}20` }}>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="block text-xs text-fd-muted-foreground mb-1">手续费 ({ratePercent}%)</span>
            <span className="text-xl font-black text-red-500 font-mono">- {tax.toFixed(1)} 币</span>
          </div>
          <div>
            <span className="block text-xs text-fd-muted-foreground mb-1">实际到手</span>
            <span className="text-xl font-black font-mono" style={{ color: activeConfig.color }}>{netIncome.toFixed(1)} 币</span>
          </div>
        </div>
        <div className="text-xs text-fd-muted-foreground font-mono">
          计算公式：{price} - ({price} × {ratePercent}%) = {netIncome.toFixed(1)} 币
        </div>
      </div>

      {/* 底部提示 */}
      <p className="text-[11px] text-fd-muted-foreground/70 leading-relaxed">
        拍卖行手续费在物品售出时自动扣除，称号越高税率越低。实际金额以游戏内为准。
      </p>
    </div>
  );
}

// 4. 附魔书模拟抽奖
import enchantmentsData from './enchantments.json';

interface Enchantment {
  id: string;
  name: string;
  tools: string[];
  quality: string;
  level: string | null;
  effect: string;
  value: string | null;
  cd: string | null;
  conflicts: string[];
  tip: string | null;
}

const enchantments = enchantmentsData as Enchantment[];

const POOL_MAP: Record<string, string> = {
  common: "白",
  uncommon: "绿",
  epic: "紫",
  legendary: "金",
  mythic: "红"
};

const POOL_CONFIGS = {
  all: { name: '全品质随机池', costText: '1 附魔之眼', limit: 20, pityLvl: '6级书', color: '#3b82f6', icon: Sparkles },
  common: { name: '普通品质池', costText: '8000 经验', limit: 10, pityLvl: '6级书', color: '#9ca3af', icon: Coins },
  uncommon: { name: '优秀品质池', costText: '1 附魔之眼', limit: 10, pityLvl: '5级书', color: '#22c55e', icon: Compass },
  epic: { name: '史诗品质池', costText: '4 附魔之眼', limit: 10, pityLvl: '5级书', color: '#a855f7', icon: Trophy },
  legendary: { name: '传说品质池', costText: '10 附魔之眼', limit: 10, pityLvl: '4级书', color: '#f59e0b', icon: Gift },
  mythic: { name: '神话品质池', costText: '15 附魔之眼', limit: 10, pityLvl: '4级书', color: '#ef4444', icon: AlertTriangle },
};

const QUALITY_STYLES: Record<string, {
  name: string;
  color: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  glowClass: string;
}> = {
  "白": {
    name: "普通 (白)",
    color: "#9ca3af",
    bgClass: "bg-slate-500/5 dark:bg-slate-500/10",
    borderClass: "border-slate-200 dark:border-slate-800",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/30",
    glowClass: "shadow-sm hover:shadow-slate-500/10",
  },
  "绿": {
    name: "优秀 (绿)",
    color: "#22c55e",
    bgClass: "bg-green-500/5 dark:bg-green-500/10",
    borderClass: "border-green-200 dark:border-green-900/30",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-300 border-green-500/20",
    glowClass: "shadow-sm hover:shadow-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]",
  },
  "紫": {
    name: "史诗 (紫)",
    color: "#a855f7",
    bgClass: "bg-purple-500/5 dark:bg-purple-500/10",
    borderClass: "border-purple-200 dark:border-purple-900/30",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-500/20",
    glowClass: "shadow-md hover:shadow-purple-500/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
  },
  "金": {
    name: "传说 (金)",
    color: "#f59e0b",
    bgClass: "bg-amber-500/5 dark:bg-amber-500/10",
    borderClass: "border-amber-200 dark:border-amber-900/40",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-500/30",
    glowClass: "shadow-lg hover:shadow-amber-500/30 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/20",
  },
  "红": {
    name: "神话 (红)",
    color: "#ef4444",
    bgClass: "bg-red-500/5 dark:bg-red-500/10",
    borderClass: "border-red-200 dark:border-red-900/40",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-500/30",
    glowClass: "shadow-xl hover:shadow-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.35)] ring-2 ring-red-500/30 animate-pulse",
  }
};

function getRandomEnchant(poolKey: string, isPity: boolean): Enchantment {
  if (poolKey === 'all') {
    if (isPity) {
      const pityPool = enchantments.filter(e => e.level === "6");
      if (pityPool.length > 0) {
        return pityPool[Math.floor(Math.random() * pityPool.length)];
      }
    }
    const rand = Math.random() * 100;
    let targetQuality = "白";
    if (rand < 1) targetQuality = "红";
    else if (rand < 5) targetQuality = "金";
    else if (rand < 20) targetQuality = "紫";
    else if (rand < 50) targetQuality = "绿";
    else targetQuality = "白";

    const qualityPool = enchantments.filter(e => e.quality === targetQuality);
    if (qualityPool.length > 0) {
      return qualityPool[Math.floor(Math.random() * qualityPool.length)];
    }
    return enchantments[Math.floor(Math.random() * enchantments.length)];
  } else {
    const qValue = POOL_MAP[poolKey];
    const qualityPool = enchantments.filter(e => e.quality === qValue);
    
    if (isPity) {
      let pityLevel = "6";
      if (poolKey === 'uncommon' || poolKey === 'epic') pityLevel = "5";
      else if (poolKey === 'legendary' || poolKey === 'mythic') pityLevel = "4";

      const pityPool = qualityPool.filter(e => e.level === pityLevel);
      if (pityPool.length > 0) {
        return pityPool[Math.floor(Math.random() * pityPool.length)];
      }
    }

    if (qualityPool.length > 0) {
      return qualityPool[Math.floor(Math.random() * qualityPool.length)];
    }
    return enchantments[Math.floor(Math.random() * enchantments.length)];
  }
}

export function EnchantmentSimulator() {
  const [pool, setPool] = useState<keyof typeof POOL_CONFIGS>('all');
  const [results, setResults] = useState<Enchantment[]>([]);
  const [pityCounts, setPityCounts] = useState<Record<string, number>>({
    all: 0, common: 0, uncommon: 0, epic: 0, legendary: 0, mythic: 0
  });
  const [expSpent, setExpSpent] = useState<number>(0);
  const [eyesSpent, setEyesSpent] = useState<number>(0);
  const [stats, setStats] = useState<Record<string, number>>({
    "白": 0, "绿": 0, "紫": 0, "金": 0, "红": 0
  });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const activePool = POOL_CONFIGS[pool];
  const pityCount = pityCounts[pool];
  
  const totalDraws = useMemo(() => {
    return Object.values(stats).reduce((a, b) => a + b, 0);
  }, [stats]);

  const handleDraw = (count: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setResults([]);

    setTimeout(() => {
      const newResults: Enchantment[] = [];
      let currentPity = pityCounts[pool];
      let newExp = expSpent;
      let newEyes = eyesSpent;
      const newStats = { ...stats };

      for (let i = 0; i < count; i++) {
        currentPity += 1;
        const limit = POOL_CONFIGS[pool].limit;
        const isPityTriggered = currentPity >= limit;

        const item = getRandomEnchant(pool, isPityTriggered);
        newResults.push(item);

        if (pool === 'common') {
          newExp += 8000;
        } else {
          const costVal = pool === 'all' ? 1 
                        : pool === 'uncommon' ? 1 
                        : pool === 'epic' ? 4 
                        : pool === 'legendary' ? 10 
                        : 15;
          newEyes += costVal;
        }

        if (isPityTriggered) {
          currentPity = 0;
        }

        newStats[item.quality] = (newStats[item.quality] || 0) + 1;
      }

      setResults(newResults);
      setPityCounts(prev => ({ ...prev, [pool]: currentPity }));
      setExpSpent(newExp);
      setEyesSpent(newEyes);
      setStats(newStats);
      setIsAnimating(false);
    }, 500);
  };

  const handleReset = () => {
    setResults([]);
    setPityCounts({ all: 0, common: 0, uncommon: 0, epic: 0, legendary: 0, mythic: 0 });
    setExpSpent(0);
    setEyesSpent(0);
    setStats({ "白": 0, "绿": 0, "紫": 0, "金": 0, "红": 0 });
  };

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all text-fd-foreground font-sans">
      {/* 头部介绍 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 border-b border-fd-border/30 pb-4">
        <div>
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-fd-primary animate-bounce" /> 附魔书模拟抽奖系统
          </h4>
          <p className="text-xs text-fd-muted-foreground mt-1">
            根据服务器真实规则模拟，数据源已和最新 {enchantments.length} 本附魔书图鉴完全同步。
          </p>
        </div>
        <button
          onClick={handleReset}
          className="self-start md:self-center px-3.5 py-1.5 rounded-xl border border-fd-border hover:bg-fd-accent text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 重置所有统计
        </button>
      </div>

      {/* 1. 池子选择 */}
      <div className="mb-5">
        <span className="block text-xs font-bold text-fd-muted-foreground uppercase mb-2.5 tracking-wider">
          选择抽奖卡池
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.keys(POOL_CONFIGS).map((key) => {
            const cfg = POOL_CONFIGS[key as keyof typeof POOL_CONFIGS];
            const isActive = pool === key;
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => {
                  setPool(key as keyof typeof POOL_CONFIGS);
                  setResults([]);
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isActive 
                    ? 'text-white' 
                    : 'bg-fd-muted/30 hover:bg-fd-accent text-fd-muted-foreground border-fd-border'
                }`}
                style={isActive ? {
                  backgroundColor: cfg.color,
                  borderColor: cfg.color,
                  boxShadow: `0 4px 12px ${cfg.color}25`
                } : {}}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                <span className="truncate">{cfg.name}</span>
                <span className={`text-[9px] font-medium ${isActive ? 'text-white/80' : 'text-fd-muted-foreground/80'}`}>
                  {cfg.costText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 保底与累计消耗看板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 保底条 */}
        <div className="p-4 rounded-xl bg-fd-muted/30 border border-fd-border/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-fd-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: activePool.color }} /> 保底进度
            </span>
            <span className="text-xs font-mono font-black" style={{ color: activePool.color }}>
              {pityCount} / {activePool.limit} 抽
            </span>
          </div>
          <div className="w-full bg-fd-muted rounded-full h-2.5 overflow-hidden border border-fd-border/30">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${(pityCount / activePool.limit) * 100}%`,
                backgroundColor: activePool.color
              }}
            />
          </div>
          <div className="text-[10px] text-fd-muted-foreground mt-2 leading-relaxed">
            保底规则：连续 <strong style={{ color: activePool.color }}>{activePool.limit}抽</strong> 必出 {activePool.pityLvl}。
          </div>
        </div>

        {/* 累计消耗统计 */}
        <div className="p-4 rounded-xl bg-fd-muted/30 border border-fd-border/50 col-span-2 grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold text-fd-muted-foreground flex items-center gap-1.5 mb-1">
              <Coins className="w-3.5 h-3.5 text-fd-primary" /> 累计消耗经验
            </span>
            <span className="text-xl font-black font-mono text-fd-foreground">
              {expSpent.toLocaleString()} <span className="text-xs font-semibold text-fd-muted-foreground">EXP</span>
            </span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold text-fd-muted-foreground flex items-center gap-1.5 mb-1">
              <Eye className="w-3.5 h-3.5 text-red-500" /> 累计消耗附魔之眼
            </span>
            <span className="text-xl font-black font-mono text-fd-foreground">
              {eyesSpent.toLocaleString()} <span className="text-xs font-semibold text-fd-muted-foreground">个</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. 历史品质汇总统计 */}
      {totalDraws > 0 && (
        <div className="mb-6 p-3 rounded-xl bg-fd-muted/20 border border-fd-border/30 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-fd-muted-foreground flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> 累计出卡统计 ({totalDraws} 抽)：
          </span>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold font-mono">
            {Object.keys(QUALITY_STYLES).map(q => {
              const count = stats[q] || 0;
              const ratio = totalDraws > 0 ? ((count / totalDraws) * 100).toFixed(1) : '0.0';
              const s = QUALITY_STYLES[q];
              return (
                <span key={q} className="px-2 py-0.5 rounded border flex items-center gap-1 bg-fd-card border-fd-border" style={{ color: s.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name.split(' ')[0]}: {count} ({ratio}%)
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 操作按钮 */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleDraw(1)}
          disabled={isAnimating}
          className="flex-1 py-3 px-4 rounded-xl bg-fd-muted border border-fd-border text-sm font-bold active:scale-95 transition-all text-fd-foreground hover:bg-fd-accent disabled:opacity-50 disabled:pointer-events-none"
        >
          单次抽取
        </button>
        <button
          onClick={() => handleDraw(10)}
          disabled={isAnimating}
          className="flex-1 py-3 px-4 rounded-xl text-white font-extrabold text-sm active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${activePool.color}, ${activePool.color}ee)`,
            boxShadow: `0 4px 12px ${activePool.color}30`
          }}
        >
          十连抽取
        </button>
      </div>

      {/* 5. 抽卡结果区域 */}
      {isAnimating ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-fd-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-fd-muted-foreground animate-pulse">正在沟通NPC附魔师，抽取宝典中...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <span className="block text-xs font-bold text-fd-muted-foreground uppercase tracking-wider mb-2">
            抽取结果
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {results.map((item, idx) => {
              const style = QUALITY_STYLES[item.quality] || QUALITY_STYLES["白"];
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between group transition-all duration-300 ${style.bgClass} ${style.borderClass} ${style.glowClass} hover:scale-[1.02]`}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: style.color
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-1 mb-2">
                      <span className="font-extrabold text-sm text-fd-foreground line-clamp-1 group-hover:text-fd-primary transition-colors">
                        {item.name}
                      </span>
                      {item.level && (
                        <span className="text-[10px] font-bold font-mono px-1 py-0.2 rounded bg-fd-muted border border-fd-border text-fd-muted-foreground">
                          Lvl {item.level}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-fd-foreground/80 leading-relaxed line-clamp-3 mb-3">
                      {item.effect}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-fd-border/30 flex justify-between items-center">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border ${style.badgeClass}`}>
                      {style.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-fd-muted-foreground/75 truncate max-w-[70px]">
                      {item.tools[0] === '全部' ? '通用' : item.tools[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-fd-border rounded-xl p-12 text-center text-fd-muted-foreground text-xs flex flex-col items-center justify-center bg-fd-muted/5">
          <Compass className="w-8 h-8 text-fd-muted-foreground/40 mb-3 animate-pulse" />
          <span>请点击上方抽取按钮开始模拟，池子概率与保底逻辑与游戏内同步。</span>
        </div>
      )}
    </div>
  );
}
