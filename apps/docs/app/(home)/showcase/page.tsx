'use client';

import { useState } from 'react';
import { 
  PlusIcon, 
  Search, 
  MapPin, 
  User, 
  Users, 
  Heart, 
  Calendar, 
  Copy, 
  Check, 
  CheckCircle2,
  Star,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import Design from './design.png';
import initialStores from './stores.json';

const basePath = '';

interface StoreItem {
  id: string;
  name: string;
  owner: string;
  district: string;
  command: string;
  description: string;
  image: string;
  type: 'commercial' | 'charity';
  merchantTypes: ('individual' | 'joint' | 'charity')[];
  verification: 'blue' | 'yellow' | 'red' | 'rainbow';
  createdAt: string;
  tags?: string[];
}

const stores = initialStores as StoreItem[];

// 自定义圆圈包裹五角星组件
function StarInCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6.5l1.62 3.28 3.62.53-2.62 2.55.62 3.6-3.24-1.7-3.24 1.7.62-3.6-2.62-2.55 3.62-.53Z" />
    </svg>
  );
}

// 获取认证信息的配置
const getVerificationConfig = (verification: StoreItem['verification']) => {
  switch (verification) {
    case 'blue':
      return {
        icon: CheckCircle2,
        className: 'text-blue-500 dark:text-blue-400',
        label: '蓝色认证',
        tooltip: '该商户可靠性高，店长可以信赖。',
      };
    case 'yellow':
      return {
        icon: AlertTriangle,
        className: 'text-yellow-500 dark:text-yellow-400',
        label: '黄色认证',
        tooltip: '商户可能存在经常性缺货，是否值得信任有待考究',
      };
    case 'red':
      return {
        icon: HelpCircle,
        className: 'text-red-500 dark:text-red-400',
        label: '红色认证',
        tooltip: '暂未获取更多有价值的信息，真实度有待考究。',
      };
    case 'rainbow':
      return {
        icon: StarInCircleIcon,
        className: '',
        style: {
          stroke: 'url(#rainbow-gradient)',
        },
        label: '星标认证',
        tooltip: '商户人缘极佳，商店补货勤快，口碑优秀。',
      };
  }
};

// 复制按钮组件，管理独立的状态
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
        copied 
          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
          : "bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-neutral-300 border border-white/10"
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-400 animate-scale" />
          <span>已复制</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          <span>复制</span>
        </>
      )}
    </button>
  );
}

export default function Showcase() {
  const [activeTab, setActiveTab] = useState<'all' | 'commercial' | 'charity'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyStars, setOnlyStars] = useState(false);

  // 过滤商店
  const filteredStores = stores.filter((store) => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'commercial' && store.type === 'commercial') ||
      (activeTab === 'charity' && (store.type === 'charity' || store.merchantTypes.includes('charity')));
    const matchesStar = !onlyStars || store.verification === 'rainbow';
    const matchesSearch = 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.tags && store.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesTab && matchesStar && matchesSearch;
  });

  return (
    <main className="px-4 py-12 z-2 w-full max-w-[1400px] mx-auto **:border-neutral-400 dark:**:border-neutral-800">
      {/* 彩色认证图标的渐变定义 */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF007A" />
            <stop offset="50%" stopColor="#7928CA" />
            <stop offset="100%" stopColor="#00DFD8" />
          </linearGradient>
        </defs>
      </svg>

      {/* 头部 Hero 展示区域 */}
      <div className="relative overflow-hidden border border-dashed rounded-2xl p-6 md:p-8 bg-neutral-50/50 dark:bg-neutral-900/30 backdrop-blur-sm mb-12 pb-16 md:pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 w-full">
            <h1 className="mb-4 text-3xl md:text-4xl font-bold tracking-tight">商会</h1>
            <p className="text-fd-muted-foreground text-sm md:text-base max-w-lg leading-relaxed mb-6">
              汇集全服优质商家，提供便捷的传送定位与透明的商户可信度认证，助力您的云端冒险之旅。
            </p>
            
            {/* 标识与标签图例 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-200/40 dark:bg-black/20 border border-neutral-300/30 dark:border-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl backdrop-blur-sm">
              {/* 认证标识说明 */}
              <div className="space-y-2.5">
                <div className="font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-300/40 dark:border-neutral-800/60 pb-1.5 mb-2 flex items-center gap-1.5">
                  <span>认证标识说明</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-500 shrink-0" />
                  <span><strong className="text-neutral-700 dark:text-neutral-300">蓝色认证</strong>：可靠性高，店长可信赖。</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-yellow-500 shrink-0" />
                  <span><strong className="text-neutral-700 dark:text-neutral-300">黄色认证</strong>：缺货，是否信任有待考究。</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-4 text-red-500 shrink-0" />
                  <span><strong className="text-neutral-700 dark:text-neutral-300">红色认证</strong>：缺乏足够信息，有待考究。</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarInCircleIcon className="size-4 shrink-0" style={{ stroke: 'url(#rainbow-gradient)' }} />
                  <span><strong className="text-neutral-700 dark:text-neutral-300">星标认证</strong>：人缘好，补货勤，口碑优秀。</span>
                </div>
              </div>
              
              {/* 运营标签说明 */}
              <div className="space-y-2.5">
                <div className="font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-300/40 dark:border-neutral-800/60 pb-1.5 mb-2 flex items-center gap-1.5">
                  <span>标签标识说明</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                    <User className="size-2.5" />
                    <span>个体商户</span>
                  </span>
                  <span>通常是个人商家运营。</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
                    <Users className="size-2.5" />
                    <span>联合商户</span>
                  </span>
                  <span>通常是多人一起运营。</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                    <Heart className="size-2.5" />
                    <span>公益商户</span>
                  </span>
                  <span>通常是存在公益行为。</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full lg:w-auto flex justify-center lg:justify-end shrink-0">
            <Image
              src={Design}
              alt="preview"
              priority
              className="w-[450px] lg:w-[500px] xl:w-[600px] pointer-events-none select-none drop-shadow-2xl"
            />
          </div>
        </div>

        {/* 底部靠左申请展示按钮 */}
        <div className="mt-8 flex justify-start relative z-10">
          <button
            disabled
            className={cn(
              buttonVariants({
                variant: 'outline',
              }),
              "border-dashed opacity-80"
            )}
          >
            <PlusIcon className="me-2 size-4" />
            申请展示请联系CCCC4444
          </button>
        </div>

        <span className="absolute text-xs left-6 bottom-6 text-fd-muted-foreground font-mono select-none">
          商户内容随机展示
        </span>
      </div>

      {/* 交互控制条：分类切换与搜索 */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-neutral-100/50 dark:bg-neutral-900/20 p-4 border rounded-xl backdrop-blur-md">
        
        {/* 分类切换 */}
        <div className="relative flex p-1 bg-neutral-200/50 dark:bg-neutral-900 border rounded-lg overflow-hidden w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "relative z-10 px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2 flex-1 md:flex-initial",
              activeTab === 'all' 
                ? "text-neutral-900 dark:text-white" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            {activeTab === 'all' && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-white dark:bg-neutral-800 shadow-sm border border-neutral-300/50 dark:border-neutral-700 rounded-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-20">全部商户</span>
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={cn(
              "relative z-10 px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2 flex-1 md:flex-initial",
              activeTab === 'commercial' 
                ? "text-neutral-900 dark:text-white" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            {activeTab === 'commercial' && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-white dark:bg-neutral-800 shadow-sm border border-neutral-300/50 dark:border-neutral-700 rounded-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-20">商业类商户</span>
          </button>
          <button
            onClick={() => setActiveTab('charity')}
            className={cn(
              "relative z-10 px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2 flex-1 md:flex-initial",
              activeTab === 'charity' 
                ? "text-neutral-900 dark:text-white" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            {activeTab === 'charity' && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-white dark:bg-neutral-800 shadow-sm border border-neutral-300/50 dark:border-neutral-700 rounded-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-20">公益类商户</span>
          </button>
        </div>

        {/* 星标筛选按钮 + 搜索框 */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* 星标筛选按钮 */}
          <button
            onClick={() => setOnlyStars(!onlyStars)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 w-full sm:w-auto shrink-0",
              onlyStars
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-500/20"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            )}
          >
            <StarInCircleIcon 
              className="size-4" 
              style={onlyStars ? { stroke: 'url(#rainbow-gradient)' } : undefined} 
            />
            <span>只看星标商户</span>
          </button>

          {/* 搜索框 */}
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索商店名、店长、所在区、传送点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
            />
          </div>
        </div>
      </div>

      {/* 商家卡片展示列表 */}
      <AnimatePresence mode="wait">
        {filteredStores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-20 border border-dashed rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/10"
          >
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">暂未找到符合条件的商家卡片</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredStores.map((store) => {
              const vConfig = getVerificationConfig(store.verification);
              return (
                <motion.div
                  key={store.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4 }}
                  className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md shadow-md"
                >
                  <div>
                    {/* 卡片头部大图 */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-800/60">
                      <Image
                        src={store.image.startsWith('/') ? `${basePath}${store.image}` : store.image}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                      
                      {/* 左下角：所在区 */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm">
                        <MapPin className="size-3 text-brand" />
                        <span>{store.district}</span>
                      </div>

                      {/* 右下角：创建时间 */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm">
                        <Calendar className="size-3 text-neutral-300" />
                        <span>创建于 {store.createdAt.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* 卡片内部正文 */}
                    <div className="p-6">
                      {/* 第一行：标题 + 认证标志 */}
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">{store.name}</h2>
                        
                        {/* 认证 Badge 容器与悬停气泡解释 */}
                        <div className="relative group/tooltip flex items-center">
                          {(() => {
                            const IconComponent = vConfig.icon;
                            return (
                              <IconComponent 
                                className={cn("size-5 cursor-help", vConfig.className)}
                                style={vConfig.style}
                              />
                            );
                          })()}
                          {/* 精致的 Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-neutral-900 dark:bg-neutral-800 text-white text-xs rounded-lg shadow-xl border border-neutral-700/50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible translate-y-1 group-hover/tooltip:translate-y-0 transition-all duration-200 z-50 pointer-events-none">
                            <div className="relative font-medium leading-relaxed">
                              <span className="font-bold block text-brand border-b border-neutral-700/60 pb-1 mb-1">{vConfig.label}</span>
                              {vConfig.tooltip}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 dark:bg-neutral-800 border-r border-b border-neutral-700/50 rotate-45 -mt-[5px]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 第二行：所有者/店长 */}
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        <User className="size-3.5" />
                        <span>店长：</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{store.owner}</span>
                      </div>

                      {/* 第三行：商户类别多选标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {store.merchantTypes.map((type) => {
                          if (type === 'individual') {
                            return (
                              <span key={type} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                <User className="size-3" />
                                <span>个体商户</span>
                              </span>
                            );
                          }
                          if (type === 'joint') {
                            return (
                              <span key={type} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                <Users className="size-3" />
                                <span>联合商户</span>
                              </span>
                            );
                          }
                          if (type === 'charity') {
                            return (
                              <span key={type} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                <Heart className="size-3" />
                                <span>公益商户</span>
                              </span>
                            );
                          }
                          return null;
                        })}

                        {/* 自定义特色标签 */}
                        {store.tags && store.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* 第四行：简介描述 */}
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
                        {store.description}
                      </p>
                    </div>
                  </div>

                  {/* 卡片底部操作：传送指令与复制 */}
                  <div className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800/40 mt-auto bg-neutral-50/50 dark:bg-neutral-900/10">
                    <div className="flex items-center justify-between gap-3 p-3 bg-neutral-100/60 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/80 rounded-xl mt-4">
                      <div className="flex items-center gap-2 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 overflow-x-auto scrollbar-none whitespace-nowrap">
                        <span className="text-neutral-400 select-none text-xs">&gt;_</span>
                        <span>{store.command}</span>
                      </div>
                      <CopyButton text={store.command} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
