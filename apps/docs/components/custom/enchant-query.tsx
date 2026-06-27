'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Flame, 
  Shield, 
  Sword, 
  Wrench, 
  Compass, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  X, 
  Info,
  HelpCircle,
  Maximize2,
  Pencil
} from 'lucide-react';
import enchantmentsData from './enchantments.json';

// 定义数据类型
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

// 统一类型声明
const enchantments = enchantmentsData as Enchantment[];

// 品质配置体系
const QUALITY_CONFIGS: Record<string, {
  name: string;
  color: string;
  bgOpacity: string;
  borderClass: string;
  badgeClass: string;
  shadowClass: string;
}> = {
  "白": {
    name: "普通 (白)",
    color: "#9ca3af",
    bgOpacity: "06",
    borderClass: "border-slate-200 dark:border-slate-800",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/30",
    shadowClass: "hover:shadow-slate-500/5 hover:border-slate-400",
  },
  "绿": {
    name: "优秀 (绿)",
    color: "#22c55e",
    bgOpacity: "0c",
    borderClass: "border-green-100 dark:border-green-900/50",
    badgeClass: "bg-green-100/80 text-green-700 dark:bg-green-950/80 dark:text-green-300 border-green-500/20",
    shadowClass: "hover:shadow-green-500/10 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]",
  },
  "紫": {
    name: "史诗 (紫)",
    color: "#a855f7",
    bgOpacity: "0e",
    borderClass: "border-purple-200/60 dark:border-purple-900/40",
    badgeClass: "bg-purple-100/80 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-500/20",
    shadowClass: "hover:shadow-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  },
  "金": {
    name: "传说 (金)",
    color: "#f59e0b",
    bgOpacity: "15",
    borderClass: "border-amber-200 dark:border-amber-900/50",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-500/30",
    shadowClass: "hover:shadow-amber-500/25 hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]",
  },
  "红": {
    name: "神话 (红)",
    color: "#ef4444",
    bgOpacity: "1b",
    borderClass: "border-red-200 dark:border-red-900/50",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-500/30 animate-pulse",
    shadowClass: "hover:shadow-red-500/35 hover:border-red-500/70 hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]",
  }
};

// 默认配置
const DEFAULT_QUALITY = {
  name: "未知",
  color: "#9ca3af",
  bgOpacity: "06",
  borderClass: "border-slate-200 dark:border-slate-800",
  badgeClass: "bg-slate-100 text-slate-600",
  shadowClass: "hover:shadow-md",
};

// 工具分类映射表
const TOOL_CATEGORIES = [
  { label: '全部装备', key: 'ALL', icon: Sparkles },
  { label: '近战武器', key: 'WEAPON', icon: Sword },
  { label: '远程弓弩', key: 'RANGED', icon: Flame },
  { label: '生存工具', key: 'TOOL', icon: Wrench },
  { label: '防具装备', key: 'ARMOR', icon: Shield },
  { label: '其他类型', key: 'OTHER', icon: Compass }
];

export function EnchantmentQuery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedEnchant, setSelectedEnchant] = useState<Enchantment | null>(null);

  // 记录调整的等级状态 (id -> level)
  const [tempLevels, setTempLevels] = useState<Record<string, number>>({});

  // 过滤逻辑
  const filteredEnchants = useMemo(() => {
    return enchantments.filter((item) => {
      // 1. 搜索词匹配 (名称或效果)
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // 2. 品质匹配
      if (selectedQuality !== 'ALL' && item.quality !== selectedQuality) {
        return false;
      }

      // 3. 工具大类过滤
      if (selectedCategory !== 'ALL') {
        const armorList = ['头盔', '胸甲', '护腿', '靴子', '盾牌', '鞘翅'];
        const toolList = ['镐', '斧', '铲', '锄', '剪刀', '刷子', '钓鱼竿'];
        const weaponList = ['剑', '长矛', '重锤', '锤', '三叉戟'];
        const rangedList = ['弓', '弩'];
        
        const hasTool = (list: string[]) => {
          return item.tools.some(t => list.includes(t)) || item.tools.includes('全部');
        };

        if (selectedCategory === 'ARMOR') {
          return hasTool(armorList);
        } else if (selectedCategory === 'TOOL') {
          return hasTool(toolList);
        } else if (selectedCategory === 'WEAPON') {
          return hasTool(weaponList);
        } else if (selectedCategory === 'RANGED') {
          return hasTool(rangedList);
        } else if (selectedCategory === 'OTHER') {
          // 不属于上述所有，且不是“全部”
          const allKnown = [...armorList, ...toolList, ...weaponList, ...rangedList, '全部'];
          return item.tools.some(t => !allKnown.includes(t)) && !item.tools.includes('全部');
        }
      }

      return true;
    });
  }, [searchQuery, selectedQuality, selectedCategory]);

  // 冲突诊断计算
  const selectedConflictsInfo = useMemo(() => {
    if (!selectedEnchant) return null;
    
    // 找出所有与选中的附魔冲突的列表
    const list = enchantments.filter(item => {
      if (item.name === selectedEnchant.name) return false;
      
      // 满足以下任何一个，都视为冲突：
      // 1. 在当前选中附魔的冲突列表里
      // 2. 该附魔的冲突列表里包含当前选中的附魔
      // 3. 任何一方是“一剑开天门”或“一件开天门”
      const isSpecial = selectedEnchant.name === "一剑开天门" || 
                        selectedEnchant.name === "一件开天门" || 
                        item.name === "一剑开天门" || 
                        item.name === "一件开天门";
      return (
        isSpecial ||
        selectedEnchant.conflicts.includes(item.name) ||
        item.conflicts.includes(selectedEnchant.name)
      );
    });

    return {
      name: selectedEnchant.name,
      conflicts: list
    };
  }, [selectedEnchant]);

  // 获取每种品质的数量统计
  const qualityStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: enchantments.length };
    enchantments.forEach(item => {
      stats[item.quality] = (stats[item.quality] || 0) + 1;
    });
    return stats;
  }, []);

  // 重置所有筛选
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedQuality('ALL');
    setSelectedCategory('ALL');
    setSelectedEnchant(null);
  };

  return (
    <div className="my-6 w-full text-fd-foreground font-sans">
      
      {/* 头部微光面板 */}
      <div className="relative p-6 md:p-8 rounded-3xl border border-fd-border bg-gradient-to-br from-fd-muted/30 to-fd-card overflow-hidden shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fd-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* 左侧主要内容 */}
        <div className="relative z-10 md:col-span-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-fd-primary/10 text-fd-primary border border-fd-primary/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> XCloud 附魔书库
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">闲云服务器 · 附魔书图鉴</h2>
          <p className="text-sm text-fd-muted-foreground leading-relaxed">
            服务器特色附魔宝典。本页面整合了游戏内 <strong>{enchantments.length}</strong> 种高阶附魔数据，包含品质、专属效果、属性数值及冷却 CD。支持点击卡片进行智能附魔冲突联动检测。
          </p>
          <div className="mt-3.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>全局冲突规则：所有附魔均与特殊附魔【一剑开天门】冲突，不可共存！</span>
          </div>
        </div>

        {/* 右侧联合编辑区域 */}
        <div className="relative z-10 md:col-span-1 border-t md:border-t-0 md:border-l border-fd-border/30 pt-6 md:pt-0 md:pl-6 flex flex-col justify-center">
          <span className="text-xs font-bold text-fd-muted-foreground mb-4 tracking-wider flex items-center gap-1.5 uppercase">
            <Pencil className="w-3.5 h-3.5 text-fd-primary" /> 联合编辑
          </span>
          <div className="space-y-3.5">
            {/* CCCC4444 */}
            <div className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-fd-border group-hover:border-fd-primary transition-all duration-300 shadow-sm flex-shrink-0">
                <img src="/avatars/CCCC4444.jpg" alt="CCCC4444" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-fd-foreground group-hover:text-fd-primary transition-colors duration-300">CCCC4444</div>
                <div className="text-[10px] text-fd-muted-foreground">页面功能开发</div>
              </div>
            </div>
            {/* satori1024 */}
            <div className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-fd-border group-hover:border-fd-primary transition-all duration-300 shadow-sm flex-shrink-0">
                <img src="/avatars/satori1024.jpg" alt="satori1024" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-fd-foreground group-hover:text-fd-primary transition-colors duration-300">satori1024</div>
                <div className="text-[10px] text-fd-muted-foreground">数据编辑、录入、校验</div>
              </div>
            </div>
            {/* 星 */}
            <div className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-fd-border group-hover:border-fd-primary transition-all duration-300 shadow-sm flex-shrink-0">
                <img src="/avatars/xing.png" alt="星" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-fd-foreground group-hover:text-fd-primary transition-colors duration-300">星</div>
                <div className="text-[10px] text-fd-muted-foreground">协调与建议</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选与搜索控制台 */}
      <div className="p-5 md:p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm mb-6 space-y-5">
        
        {/* 1. 搜索框 */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-fd-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="输入附魔名称、效果关键词、适用工具（例如：锋利、杀手、剑）..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-fd-border bg-fd-background text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 p-0.5 rounded-full hover:bg-fd-muted text-fd-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2. 品质筛选 (药丸按钮) */}
        <div>
          <span className="block text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider mb-2.5">
            按附魔品质筛选
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedQuality('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedQuality === 'ALL'
                  ? 'bg-fd-foreground text-fd-background border-fd-foreground shadow-sm'
                  : 'bg-fd-muted/50 text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
              }`}
            >
              全部品质 ({qualityStats.ALL})
            </button>
            {Object.keys(QUALITY_CONFIGS).map((key) => {
              const cfg = QUALITY_CONFIGS[key];
              const isSelected = selectedQuality === key;
              const count = qualityStats[key] || 0;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedQuality(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'shadow-sm text-white'
                      : 'bg-fd-muted/40 text-fd-foreground/80 border-fd-border hover:bg-fd-accent'
                  }`}
                  style={isSelected ? {
                    backgroundColor: cfg.color,
                    borderColor: cfg.color,
                  } : {}}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {cfg.name.split(' ')[0]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 工具大类筛选 (网格标签) */}
        <div>
          <span className="block text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider mb-2.5">
            按适用装备大类筛选
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {TOOL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-fd-primary text-fd-primary-foreground border-fd-primary shadow-sm'
                      : 'bg-fd-muted/30 text-fd-muted-foreground border-fd-border hover:bg-fd-accent hover:text-fd-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. 冲突诊断高亮提示条 (在选中某个附魔书时出现) */}
      {selectedEnchant && (
        <div className="p-4 md:p-5 rounded-2xl border border-red-500/25 bg-red-500/5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-red-600 dark:text-red-400">
                附魔冲突诊断：您已选择【{selectedEnchant.name}】
              </div>
              <p className="text-xs text-fd-muted-foreground mt-1">
                下方列表中所有与该附魔冲突的条目已自动 <span className="text-red-500 font-semibold underline decoration-wavy">标红警告</span> 并浮现冲突标志。共检测到有 <strong>{selectedConflictsInfo?.conflicts.length || 0}</strong> 个冲突项。
              </p>
              {selectedConflictsInfo && selectedConflictsInfo.conflicts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-fd-muted-foreground self-center">冲突条目:</span>
                  {selectedConflictsInfo.conflicts.map((c) => (
                    <span key={c.id} className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-semibold">
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
              {(!selectedConflictsInfo || selectedConflictsInfo.conflicts.length === 0) && (
                <div className="text-[10px] text-green-500 font-semibold mt-2">
                  ✨ 该附魔在数据库中暂无冲突记录，具有极佳的兼容性！
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedEnchant(null)}
            className="self-end md:self-center px-3.5 py-1.5 rounded-xl border border-fd-border text-xs font-semibold hover:bg-fd-muted transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> 清除选中
          </button>
        </div>
      )}

      {/* 列表头部状态统计 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs text-fd-muted-foreground font-semibold">
          共检索到 <span className="text-fd-primary font-bold font-mono">{filteredEnchants.length}</span> 个附魔数据
        </span>
        {(searchQuery || selectedQuality !== 'ALL' || selectedCategory !== 'ALL') && (
          <button 
            onClick={resetFilters}
            className="text-xs text-fd-primary hover:underline font-semibold flex items-center gap-1"
          >
            重置筛选
          </button>
        )}
      </div>

      {/* 5. 附魔网格列表 */}
      {filteredEnchants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEnchants.map((item) => {
            const isSelected = selectedEnchant?.id === item.id;
            
            // 检测冲突
            const isConflicted = selectedEnchant && (
              selectedEnchant.id !== item.id && (
                selectedEnchant.conflicts.includes(item.name) ||
                item.conflicts.includes(selectedEnchant.name) ||
                selectedEnchant.name === "一剑开天门" ||
                selectedEnchant.name === "一件开天门" ||
                item.name === "一剑开天门" ||
                item.name === "一件开天门"
              )
            );

            const qCfg = QUALITY_CONFIGS[item.quality] || DEFAULT_QUALITY;
            
            // 获取当前调整的等级 (如果支持等级的话)
            const maxLvl = item.level ? parseInt(item.level) || 0 : 0;
            const currentLvl = tempLevels[item.id] !== undefined ? tempLevels[item.id] : maxLvl;

            // 动态数值推算 (如数值中是纯数字)
            const getDisplayValue = () => {
              if (!item.value) return null;
              if (maxLvl <= 1 || currentLvl === maxLvl) return item.value;
              
              // 匹配数值中的数字
              const numMatch = item.value.match(/^([\d.]+)(%?)$/);
              if (numMatch) {
                const baseVal = parseFloat(numMatch[1]);
                const percent = numMatch[2];
                // 线性按等级缩减估算
                const estimated = (baseVal / maxLvl) * currentLvl;
                // 格式化输出，如果是浮点数保留一位
                const formatted = estimated % 1 === 0 ? estimated.toString() : estimated.toFixed(1);
                return `${formatted}${percent}`;
              }
              
              return item.value;
            };
            const displayValue = getDisplayValue();

            // 等级调整逻辑
            const handleLevelChange = (direction: 'up' | 'down', e: React.MouseEvent) => {
              e.stopPropagation(); // 阻止点击卡片选中事件
              if (maxLvl <= 1) return;
              
              let nextLvl = currentLvl;
              if (direction === 'up') {
                nextLvl = Math.min(maxLvl, currentLvl + 1);
              } else {
                nextLvl = Math.max(1, currentLvl - 1);
              }
              setTempLevels(prev => ({ ...prev, [item.id]: nextLvl }));
            };

            return (
              <div
                key={item.id}
                onClick={() => setSelectedEnchant(isSelected ? null : item)}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none bg-fd-card ${qCfg.shadowClass} ${
                  isSelected 
                    ? 'ring-2 ring-offset-2 ring-offset-fd-background scale-[1.01] shadow-lg border-opacity-100 z-10' 
                    : isConflicted
                    ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.08)] bg-red-500/[0.02] dark:bg-red-500/[0.01]'
                    : 'border-fd-border'
                }`}
                style={isSelected ? {
                  borderColor: qCfg.color,
                  '--tw-ring-color': qCfg.color,
                } : {
                  borderColor: isConflicted ? '#ef4444' : undefined,
                  backgroundImage: isConflicted 
                    ? 'linear-gradient(to bottom, rgba(239, 68, 68, 0.03), rgba(239, 68, 68, 0.03))'
                    : `linear-gradient(to bottom, ${qCfg.color}${qCfg.bgOpacity}, ${qCfg.color}${qCfg.bgOpacity})`,
                } as React.CSSProperties}
              >
                
                {/* 冲突红牌警告浮标 */}
                {isConflicted && (
                  <div className="absolute -top-2.5 -right-2 px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md animate-bounce z-20">
                    <AlertTriangle className="w-2.5 h-2.5" /> 冲突
                  </div>
                )}

                {/* 卡片核心内容 */}
                <div>
                  
                  {/* 第一行：名字与品质角标 */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-base text-fd-foreground tracking-tight line-clamp-1">
                      {item.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex-shrink-0 ${qCfg.badgeClass}`}>
                      {qCfg.name.split(' ')[0]}
                    </span>
                  </div>

                  {/* 效果描述 */}
                  <p className="text-xs text-fd-foreground/80 leading-relaxed font-normal mb-3 line-clamp-3 min-h-[2.25rem]">
                    {item.effect}
                  </p>

                  {/* 冲突项展示 */}
                  <div className="text-[10px] text-fd-muted-foreground/70 mb-4 flex items-start gap-1">
                    <span className="text-red-500/70 font-semibold flex-shrink-0">冲突:</span>
                    <span className="line-clamp-2 leading-relaxed text-fd-muted-foreground/85">
                      {[...item.conflicts, "一剑开天门"].join("、")}
                    </span>
                  </div>
                </div>

                {/* 底部参数与标签区域 */}
                <div className="space-y-3.5 pt-2 border-t border-fd-border/40">
                  
                  {/* 数据参数排版 */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-fd-muted-foreground">
                    
                    {/* 数值参数 */}
                    {displayValue && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold px-1 rounded bg-fd-primary/5 text-fd-primary">数值</span>
                        <span className="font-black text-fd-foreground">{displayValue}</span>
                      </div>
                    )}
                    
                    {/* CD 冷却 */}
                    {item.cd && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold px-1 rounded bg-fd-primary/5 text-fd-primary">CD</span>
                        <span className="font-semibold text-fd-foreground flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-fd-muted-foreground" />
                          {item.cd}{!isNaN(Number(item.cd)) && 's'}
                        </span>
                      </div>
                    )}

                    {/* 等级显示/控制 */}
                    {item.level && (
                      <div className="col-span-2 flex items-center justify-between mt-1.5 p-1.5 rounded-xl bg-fd-muted/30 border border-fd-border/30">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">等级</span>
                        
                        {maxLvl > 1 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleLevelChange('down', e)}
                              disabled={currentLvl <= 1}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-sm transition-all border ${
                                currentLvl <= 1 
                                  ? 'opacity-30 cursor-not-allowed border-fd-border bg-fd-muted/10' 
                                  : 'hover:bg-fd-accent active:scale-95 border-fd-border/80 bg-fd-card shadow-sm'
                              }`}
                            >
                              -
                            </button>
                            <span className="font-extrabold text-xs text-fd-foreground min-w-[28px] text-center">{currentLvl} / {maxLvl}</span>
                            <button
                              onClick={(e) => handleLevelChange('up', e)}
                              disabled={currentLvl >= maxLvl}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-sm transition-all border ${
                                currentLvl >= maxLvl 
                                  ? 'opacity-30 cursor-not-allowed border-fd-border bg-fd-muted/10' 
                                  : 'hover:bg-fd-accent active:scale-95 border-fd-border/80 bg-fd-card shadow-sm'
                              }`}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="font-extrabold text-xs text-fd-foreground px-1">最大等级 {item.level}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 适用工具标签 */}
                  <div className="flex flex-wrap gap-1">
                    {item.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-fd-muted text-fd-muted-foreground text-[9px] font-bold border border-fd-border/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* 悬停/点击动作说明 */}
                  <div className="flex items-center justify-between text-[9px] text-fd-muted-foreground/60">
                    <span className="flex items-center gap-0.5">
                      <Info className="w-2.5 h-2.5" />
                      {isSelected ? '点击取消选中' : '点击检测冲突'}
                    </span>
                    {item.conflicts.length > 0 && (
                      <span className="font-semibold text-red-500/60">
                        {item.conflicts.length}个冲突项
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 空状态 UI */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-fd-border bg-fd-muted/10 text-center">
          <div className="w-16 h-16 rounded-full bg-fd-muted flex items-center justify-center mb-4 text-fd-muted-foreground shadow-sm">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-fd-foreground mb-1">未找到匹配的附魔书</h3>
          <p className="text-sm text-fd-muted-foreground max-w-sm mb-5 leading-relaxed">
            没有找到符合当前筛选条件的附魔。请尝试精简搜索词，或切换不同的品质与装备分类。
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-fd-primary text-fd-primary-foreground text-xs font-bold shadow hover:bg-fd-primary/95 transition-colors"
          >
            重置筛选条件
          </button>
        </div>
      )}
    </div>
  );
}
