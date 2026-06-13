'use client';

import React, { useState } from 'react';

// 称号等级配置
const RANK_CONFIGS = {
  PLAYER: { name: 'PLAYER', price: 5, limit: 100, label: '初始称号' },
  VIP: { name: 'VIP', price: 4, limit: 200, label: '高级特权' },
  MVP: { name: 'MVP', price: 3.5, limit: 300, label: '至尊特权' },
  PRO: { name: 'PRO', price: 3, limit: 350, label: '超凡特权' },
  HERO: { name: 'HERO', price: 2.5, limit: 500, label: '英雄特权' },
};

// 1. 领地计算器
export function ResidenceCalculator() {
  const [rank, setRank] = useState<keyof typeof RANK_CONFIGS>('PLAYER');
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(10);

  const activeConfig = RANK_CONFIGS[rank];
  const area = length * width;
  const cost = area * activeConfig.price;
  const isOverLimit = length > activeConfig.limit || width > activeConfig.limit;

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-4">🏠 领地圈地费用估算</h4>
      
      {/* 称号选择 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.keys(RANK_CONFIGS).map((key) => {
          const cfg = RANK_CONFIGS[key as keyof typeof RANK_CONFIGS];
          const isActive = rank === key;
          return (
            <button
              key={key}
              onClick={() => setRank(key as keyof typeof RANK_CONFIGS)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isActive
                  ? 'bg-fd-primary text-fd-primary-foreground border-fd-primary shadow-sm'
                  : 'bg-fd-muted text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
              }`}
            >
              {cfg.name} ({cfg.price}币)
            </button>
          );
        })}
      </div>

      {/* 长宽输入 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-fd-muted-foreground mb-1.5">长度 (格数)</label>
          <input
            type="number"
            min={1}
            value={length || ''}
            onChange={(e) => setLength(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-sm text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-fd-muted-foreground mb-1.5">宽度 (格数)</label>
          <input
            type="number"
            min={1}
            value={width || ''}
            onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-sm text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
          />
        </div>
      </div>

      {/* 结果显示 */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-fd-muted border border-fd-border">
        <div>
          <span className="block text-[10px] text-fd-muted-foreground">最大限制</span>
          <span className="text-sm font-semibold text-fd-foreground font-mono">{activeConfig.limit} * {activeConfig.limit}</span>
        </div>
        <div>
          <span className="block text-[10px] text-fd-muted-foreground">占地格数</span>
          <span className="text-sm font-semibold text-fd-foreground font-mono">{area} 格</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-fd-muted-foreground">估算费用:</span>
          <div className="text-2xl font-black text-fd-primary font-mono">{cost.toFixed(1)} <span className="text-sm font-normal">金币</span></div>
        </div>
        {isOverLimit && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500">
            ⚠️ 长度或宽度已超过该称号的单口上限！
          </div>
        )}
      </div>
    </div>
  );
}

// 2. 转账汇率计算器
export function TransferCalculator() {
  const [amount, setAmount] = useState<number>(100);

  const fee = amount >= 50 ? amount * 0.08 : 0;
  const total = amount + fee;

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all max-w-md">
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
  PLAYER: { name: 'PLAYER', rate: 0.1, label: '10% 税率' },
  VIP: { name: 'VIP', rate: 0.08, label: '8% 税率' },
  MVP: { name: 'MVP', rate: 0.06, label: '6% 税率' },
  PRO: { name: 'PRO', rate: 0.04, label: '4% 税率' },
  HERO: { name: 'HERO', rate: 0.02, label: '2% 税率' },
};

export function AuctionCalculator() {
  const [rank, setRank] = useState<keyof typeof AUCTION_TAX_CONFIGS>('PLAYER');
  const [price, setPrice] = useState<number>(1000);

  const activeConfig = AUCTION_TAX_CONFIGS[rank];
  const tax = price * activeConfig.rate;
  const netIncome = price - tax;

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all max-w-md">
      <h4 className="text-base font-bold text-fd-foreground mb-4">🏷️ 拍卖行到手金额计算器</h4>
      
      {/* 称号选择 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.keys(AUCTION_TAX_CONFIGS).map((key) => {
          const cfg = AUCTION_TAX_CONFIGS[key as keyof typeof AUCTION_TAX_CONFIGS];
          return (
            <button
              key={key}
              onClick={() => setRank(key as keyof typeof AUCTION_TAX_CONFIGS)}
              className={`px-2 py-1 rounded text-[10px] font-extrabold transition-all border ${
                rank === key
                  ? 'bg-fd-primary text-fd-primary-foreground border-fd-primary shadow-sm'
                  : 'bg-fd-muted text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
              }`}
            >
              {cfg.name}
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-fd-muted-foreground mb-1.5">物品上架售价</label>
        <div className="relative">
          <input
            type="number"
            min={1}
            value={price || ''}
            onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full pl-3 pr-10 py-2 rounded-lg border border-fd-border bg-fd-background text-sm text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary"
          />
          <span className="absolute right-3 top-2.5 text-xs text-fd-muted-foreground font-bold">金币</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-fd-muted border border-fd-border mb-4">
        <div>
          <span className="block text-[10px] text-fd-muted-foreground">系统手续费 ({activeConfig.label})</span>
          <span className="text-sm font-semibold text-red-500 font-mono">-{tax.toFixed(1)} 币</span>
        </div>
        <div>
          <span className="block text-[10px] text-fd-muted-foreground">税后实际到手</span>
          <span className="text-sm font-semibold text-emerald-500 font-mono">+{netIncome.toFixed(1)} 币</span>
        </div>
      </div>
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

const QUALITY_INFO = {
  common: { name: '普通', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
  uncommon: { name: '优秀', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  epic: { name: '史诗', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  legendary: { name: '传说', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  mythic: { name: '神话', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
};

export function EnchantLottery() {
  const [quality, setQuality] = useState<keyof typeof ENCHANT_BOOKS | 'all'>('all');
  const [pity, setPity] = useState<number>(0);
  const [result, setResult] = useState<{ name: string; quality: keyof typeof ENCHANT_BOOKS } | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ name: string; quality: keyof typeof ENCHANT_BOOKS }>>([]);

  const roll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setResult(null);

    let currentPity = pity + 1;
    setPity(currentPity);

    // 模拟品质掉落率
    let q: keyof typeof ENCHANT_BOOKS = 'common';
    
    if (quality !== 'all') {
      q = quality;
    } else {
      // 保底机制：第 10 次必出 史诗/传说/神话 级别的书
      if (currentPity >= 10) {
        const rand = Math.random();
        if (rand < 0.05) q = 'mythic';
        else if (rand < 0.25) q = 'legendary';
        else q = 'epic';
        setPity(0);
      } else {
        const rand = Math.random();
        if (rand < 0.005) { q = 'mythic'; setPity(0); }
        else if (rand < 0.04) { q = 'legendary'; setPity(0); }
        else if (rand < 0.15) { q = 'epic'; setPity(0); }
        else if (rand < 0.40) q = 'uncommon';
        else q = 'common';
      }
    }

    const pool = ENCHANT_BOOKS[q];
    const rolledItem = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      setResult({ name: rolledItem.name, quality: q });
      setHistory((prev) => [{ name: rolledItem.name, quality: q }, ...prev.slice(0, 4)]);
      setIsRolling(false);
    }, 800);
  };

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-4">🎲 附魔书模拟抽取器</h4>
      
      {/* 筛选品质 */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button
          onClick={() => setQuality('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
            quality === 'all'
              ? 'bg-fd-primary text-fd-primary-foreground border-fd-primary'
              : 'bg-fd-muted text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
          }`}
        >
          全品质 (真实概率)
        </button>
        {Object.keys(ENCHANT_BOOKS).map((key) => (
          <button
            key={key}
            onClick={() => setQuality(key as keyof typeof ENCHANT_BOOKS)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              quality === key
                ? 'bg-fd-primary text-fd-primary-foreground border-fd-primary'
                : 'bg-fd-muted text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
            }`}
          >
            仅{QUALITY_INFO[key as keyof typeof QUALITY_INFO].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* 抽奖展示框 */}
        <div className="h-32 flex flex-col items-center justify-center rounded-xl bg-fd-muted border border-fd-border border-dashed p-4 relative overflow-hidden">
          {isRolling ? (
            <div className="flex flex-col items-center gap-2">
              <div className="size-6 rounded-full border-2 border-fd-primary border-t-transparent animate-spin" />
              <span className="text-xs text-fd-muted-foreground animate-pulse font-medium">翻阅附魔之书中...</span>
            </div>
          ) : result ? (
            <div className="text-center animate-in fade-in zoom-in-95 duration-200">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1.5 ${QUALITY_INFO[result.quality].color}`}>
                {QUALITY_INFO[result.quality].name}
              </span>
              <div className="text-lg font-black text-fd-foreground font-mono">{result.name}</div>
            </div>
          ) : (
            <div className="text-xs text-fd-muted-foreground text-center">
              点击右侧按钮，进行模拟测试<br />
              <span className="text-[10px] text-fd-muted-foreground/60">(保底机制：连续10次全品质必得 史诗 级别以上)</span>
            </div>
          )}
        </div>

        {/* 交互按钮与保底 */}
        <div className="flex flex-col gap-4">
          <button
            onClick={roll}
            disabled={isRolling}
            className="w-full py-3 bg-fd-primary hover:bg-fd-primary/90 disabled:opacity-50 text-fd-primary-foreground font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>✨ 消耗附魔之眼抽取一次</span>
          </button>

          {quality === 'all' && (
            <div>
              <div className="flex justify-between text-xs text-fd-muted-foreground mb-1.5 font-medium">
                <span>保底进度 (史诗+)</span>
                <span className="font-mono">{pity}/10 次</span>
              </div>
              <div className="w-full h-2 rounded-full bg-fd-muted overflow-hidden border border-fd-border">
                <div
                  className="h-full bg-fd-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, pity * 10)}%` }}
                />
              </div>
            </div>
          )}

          {/* 最近抽取历史 */}
          {history.length > 0 && (
            <div>
              <span className="block text-[10px] font-bold text-fd-muted-foreground mb-1.5 uppercase tracking-wider">最近抽取历史</span>
              <div className="flex flex-wrap gap-1.5">
                {history.map((item, index) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${QUALITY_INFO[item.quality].color}`}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
