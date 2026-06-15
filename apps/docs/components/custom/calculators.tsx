'use client';

import React, { useState } from 'react';

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
const ENCHANT_BOOKS = {
  common: [
    { name: '保护 I', label: '普通' },
    { name: '锋利 I', label: '普通' },
    { name: '效率 I', label: '普通' },
    { name: '力量 I', label: '普通' },
  ],
  uncommon: [
    { name: '保护 III', label: '优秀' },
    { name: '锋利 III', label: '优秀' },
    { name: '效率 III', label: '优秀' },
    { name: '时运 II', label: '优秀' },
  ],
  epic: [
    { name: '保护 IV', label: '史诗' },
    { name: '锋利 V', label: '史诗' },
    { name: '效率 V', label: '史诗' },
    { name: '时运 III', label: '史诗' },
    { name: '无限 I', label: '史诗' },
  ],
  legendary: [
    { name: '经验修补 I', label: '传说' },
    { name: '时运 IV', label: '传说' },
    { name: '横扫之刃 IV', label: '传说' },
    { name: '精准采集 II', label: '传说' },
  ],
  mythic: [
    { name: '锋利 VI', label: '神话' },
    { name: '保护 V', label: '神话' },
    { name: '时运 V', label: '神话' },
    { name: '抢夺 IV', label: '神话' },
  ],
};
