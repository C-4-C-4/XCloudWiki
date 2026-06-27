import { ReactNode } from 'react';

export interface TeamMember {
  name: string;
  role: string;
  badge: string;
  iconName: 'Crown' | 'Shield' | 'PenTool' | 'Sparkles' | 'Cpu' | 'Book';
  avatar: string;
  description: string;
  glowColor: string; // 用于发光效果的渐变颜色配置
  borderColor: string; // 悬停时的边框颜色
  badgeBg: string; // 徽章背景色
  badgeText: string; // 徽章文本色
}

export const managementTeam: TeamMember[] = [
  {
    name: 'Love_Story',
    role: '创始人 / 服主',
    badge: '服主',
    iconName: 'Crown',
    avatar: '/avatars/LoveStory.jpg',
    description: '伟大无需多言！全资倾注毕生心力，创立并带领服务器走向繁荣昌盛的绝对领袖与掌舵核心。',
    glowColor: 'from-red-500/20 to-orange-500/10',
    borderColor: 'group-hover:border-red-500/50',
    badgeBg: 'bg-red-500/10 dark:bg-red-500/20 border-red-500/30',
    badgeText: 'text-red-600 dark:text-red-400',
  },
  {
    name: 'CCCC4444',
    role: 'WIKI 创建者 & 开发者',
    badge: 'WIKI 编辑',
    iconName: 'Book',
    avatar: '/avatars/CCCC4444.jpg',
    description: '深度负责开发并编辑拓展附魔书快速查询系统，倾注海量心血设计、构建、美化并全方位技术性维护本 Wiki 站点。',
    glowColor: 'from-amber-500/20 to-yellow-500/10',
    borderColor: 'group-hover:border-amber-500/50',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30',
    badgeText: 'text-amber-600 dark:text-amber-400',
  },
  {
    name: 'xuan562',
    role: 'SPVR 闲云服务器管理员',
    badge: '管理员',
    iconName: 'Shield',
    avatar: '/avatars/xuan562.jpg',
    description: '深得信赖的服务器守护者。负责协调管理事务，用心保障服务器日常的稳定运营与社区生态的良好运转。',
    glowColor: 'from-purple-500/20 to-pink-500/10',
    borderColor: 'group-hover:border-purple-500/50',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30',
    badgeText: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'sickle',
    role: '服务器活动管理员',
    badge: '活动管理',
    iconName: 'Sparkles',
    avatar: '/avatars/sickle.jpg',
    description: '富有热情的趣味缔造者。负责服务器大型活动、节日庆典的方案策划与落地，为闲云服务器注入无尽活力。',
    glowColor: 'from-cyan-500/20 to-blue-500/10',
    borderColor: 'group-hover:border-cyan-500/50',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/30',
    badgeText: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    name: 'abnormalclarke',
    role: '游戏服务器UI设计',
    badge: '游戏服务器UI设计',
    iconName: 'PenTool',
    avatar: '/avatars/abnormalclarke.jpg',
    description: '极具匠心的美学工程师。深度参与游戏服务器交互界面的UI美术设计与排版，提升游戏内的视觉表现与交互品质。',
    glowColor: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'group-hover:border-blue-500/50',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Yep',
    role: '游戏服务器UI设计',
    badge: '游戏服务器UI设计',
    iconName: 'PenTool',
    avatar: '/avatars/Yep.jpg',
    description: '追求完美的细节雕琢者。专注于游戏服务器内各种UI视觉要素的美化及优化，致力于打造极佳的用户使用体验。',
    glowColor: 'from-blue-500/20 to-indigo-500/10',
    borderColor: 'group-hover:border-blue-500/50',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'XiaoLiYu777',
    role: 'bilibili 宣传视频制作',
    badge: '视频制作',
    iconName: 'Sparkles',
    avatar: 'X',
    description: '才华横溢的内容传播者。用心创作并剪辑精美的 bilibili 宣传视频，在多平台传递闲云服务器的独特魅力与温度。',
    glowColor: 'from-pink-500/20 to-rose-500/10',
    borderColor: 'group-hover:border-pink-500/50',
    badgeBg: 'bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/30',
    badgeText: 'text-pink-600 dark:text-pink-400',
  },
];

export const wikiEditors: TeamMember[] = [
  {
    name: 'Sa1nt_Hal0',
    role: '维基主编',
    badge: '主编',
    iconName: 'PenTool',
    avatar: '/avatars/Sa1nt_Hal0.jpg',
    description: '深度参与服务器拓展附魔书核心配置编写，并全权主导整理、编写、校核与维护极其繁杂的附魔书指南文档。',
    glowColor: 'from-orange-500/20 to-amber-500/10',
    borderColor: 'group-hover:border-orange-500/50',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/30',
    badgeText: 'text-orange-600 dark:text-orange-400',
  },
  {
    name: '84531',
    role: '维基编辑者',
    badge: '核心编辑',
    iconName: 'Sparkles',
    avatar: '/avatars/84531.jpg',
    description: '主动且极富热诚地积极参与编辑、修正、润色与完善 Wiki 站点各大基础玩法文档及日常系统更新的修订工作。',
    glowColor: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    name: '星',
    role: '副编',
    badge: '副编',
    iconName: 'Sparkles',
    avatar: '/avatars/xing.png',
    description: '爱好书写的星星，用生动的文字记录服务器的点点滴滴，编写并润色了大量的基础玩法介绍与趣味内容。',
    glowColor: 'from-blue-500/20 to-indigo-500/10',
    borderColor: 'group-hover:border-blue-500/50',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'laccket',
    role: '维基编辑者',
    badge: '核心编辑',
    iconName: 'Sparkles',
    avatar: '/avatars/laccket.jpg',
    description: '主动且极富热诚地积极参与编辑、修正、润色与完善 Wiki 站点各大基础玩法文档及日常系统更新的修订工作。',
    glowColor: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'satori1024',
    role: '维基编辑者',
    badge: '核心编辑',
    iconName: 'Sparkles',
    avatar: '/avatars/satori1024.jpg',
    description: '全权负责新版附魔书数据编写。',
    glowColor: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
  },
];

