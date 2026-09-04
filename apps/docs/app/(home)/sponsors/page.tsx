import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Shield, PenTool, Sparkles, Cpu, BookOpen, Users } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { managementTeam, wikiEditors, retiredTeam, type TeamMember } from './data';

// 页面 SEO 优化
export const metadata = {
  title: '关于我们 - XCloud Wiki',
  description: '闲云 Wiki 制作组成员与内容贡献者荣誉殿堂。致敬每一位为闲云服务器发展倾注心血与热爱的建设者。',
};

const basePath = '';

function getIcon(iconName: string) {
  switch (iconName) {
    case 'Crown':
      return <Crown className="size-4.5" />;
    case 'Shield':
      return <Shield className="size-4.5" />;
    case 'Book':
      return <BookOpen className="size-4.5" />;
    case 'PenTool':
      return <PenTool className="size-4.5" />;
    case 'Sparkles':
      return <Sparkles className="size-4.5" />;
    case 'Cpu':
      return <Cpu className="size-4.5" />;
    default:
      return <Sparkles className="size-4.5" />;
  }
}

export default function Page() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 py-20 px-4 md:px-8">
      {/* 嵌入的微动画和高级 CSS 样式 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-logo {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        @keyframes slow-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float-logo 6s ease-in-out infinite;
        }
        .animate-glow-slow-1 {
          animation: pulse-glow 8s ease-in-out infinite;
        }
        .animate-glow-slow-2 {
          animation: pulse-glow 12s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-rotate-slow {
          animation: slow-rotate 40s linear infinite;
        }
        
        /* 扫光效果 */
        .member-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .member-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transform: skewX(-25deg);
          transition: all 0.75s ease;
          pointer-events: none;
          z-index: 10;
        }
        .member-card:hover::before {
          left: 150%;
        }
        
        /* 网格背景线 */
        .grid-pattern {
          background-image: radial-gradient(rgba(0, 0, 0, 0.05) 1.2px, transparent 1.2px);
          background-size: 24px 24px;
        }
        .dark .grid-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px);
        }
      `}} />

      {/* 极光渐变背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 左上角极光 */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-brand/30 to-violet-500/20 blur-[130px] rounded-full opacity-20 dark:opacity-50 animate-glow-slow-1 animate-rotate-slow" />
        {/* 右下角极光 */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-rose-500/20 to-amber-500/30 blur-[130px] rounded-full opacity-15 dark:opacity-40 animate-glow-slow-2 animate-rotate-slow" />
        {/* 顶部放射光芒 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[350px] bg-gradient-to-b from-brand/5 dark:from-brand/10 via-transparent to-transparent blur-3xl opacity-40 dark:opacity-60" />
        {/* 点状网格背景 */}
        <div className="absolute inset-0 grid-pattern opacity-60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
        
        {/* 头部标题区域 */}
        <div className="text-center mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/5 backdrop-blur-md mb-6 animate-float">
            <Users className="size-4 text-brand" />
            <span className="text-xs font-semibold tracking-wider uppercase text-brand">About Us & Staff</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-600 dark:from-neutral-100 dark:via-neutral-200 dark:to-neutral-400">
            制作组与内容贡献者
          </h1>
          
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg leading-relaxed mb-8">
            闲云 Wiki 的诞生与繁荣，离不开每一位倾注心血的创作者与建设者。
            特设立此荣誉之殿，感恩并铭记为本站点建设、数据整理及系统维护付出智慧的全体成员。
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/docs"
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  className: 'rounded-full border-neutral-200 bg-neutral-50/50 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/50 backdrop-blur-sm dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white transition-all duration-300'
                })
              )}
            >
              <BookOpen className="size-4 mr-2" />
              进入文档中心
            </Link>
          </div>
        </div>

        {/* 板块一：核心管理团队 */}
        <div className="w-full mb-24">
          <div className="flex items-center gap-3 mb-10 border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <Crown className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">核心管理团队</h2>
              <p className="text-xs text-neutral-500 mt-1">负责服务器架构设计、核心技术维护及站点总体运营决策</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {managementTeam.map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
          </div>
        </div>

        {/* 板块二：维基内容编辑者 */}
        <div className="w-full mb-16">
          <div className="flex items-center gap-3 mb-10 border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">内容贡献者</h2>
              <p className="text-xs text-neutral-500 mt-1">热衷于文档编写、内容修正与玩家攻略整理的优秀贡献者</p>
            </div>
          </div>

          {wikiEditors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {wikiEditors.map((member) => (
                <MemberCard key={member.name} member={member} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative w-full max-w-md p-8 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/30 dark:bg-neutral-900/20 text-center">
                <div className="inline-flex p-3 rounded-xl bg-amber-500/10 text-amber-500 mb-5">
                  <BookOpen className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-3">
                  所有 Wiki 编辑成员已全部卸任
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  如果你热爱写作，并有意愿成为 Wiki 编辑者，
                  <br />
                  请联系服主 <strong className="text-amber-500">Love_Story</strong> 加入我们！
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 板块三：已卸任成员 */}
        {retiredTeam.length > 0 && (
          <div className="w-full mb-16">
            <div className="flex items-center gap-3 mb-10 border-b border-neutral-200 dark:border-neutral-900 pb-4">
              <div className="p-2 rounded-lg bg-gray-500/10 text-gray-500 border border-gray-500/20">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-wide">已卸任成员</h2>
                <p className="text-xs text-neutral-500 mt-1">感谢曾经为闲云 Wiki 站点及社区生态付出心血与努力的贡献者</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {retiredTeam.map((member) => (
                <MemberCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        )}

        {/* 底部致谢与声明 */}
        <div className="w-full text-center py-10 border-t border-neutral-200 dark:border-neutral-900 mt-10">
          <p className="text-xs text-neutral-500 dark:text-neutral-600 font-mono">
            &copy; {new Date().getFullYear()} XCloud Wiki &bull; 致敬热爱 &bull; 再次感谢所有默默付出的伙伴们！
          </p>
        </div>

      </div>
    </main>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const isInitial = member.avatar.length === 1;
  const isRelativePath = member.avatar.startsWith('/');
  const avatarSrc = isRelativePath 
    ? `${basePath}${member.avatar}`
    : `${basePath}/wiki-img/member/${member.avatar}.jpg`;

  return (
    <div className={cn(
      "member-card group relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl",
      "bg-neutral-50/50 border border-neutral-200 backdrop-blur-md dark:bg-neutral-900/30 dark:border-neutral-900",
      "hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300",
      member.borderColor
    )}>
      {/* 背景悬停发光斑点 */}
      <div className={cn(
        "absolute inset-0 -z-10 bg-gradient-to-br blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        member.glowColor
      )} />

      {/* 已卸任印章标记 */}
      {member.retired && (
        <div className="absolute top-4 right-4 z-20 select-none pointer-events-none">
          <div
            className="flex items-center justify-center px-3 py-1.5 rounded-md border-2 border-dashed border-red-500/60 dark:border-red-400/50"
            style={{ transform: 'rotate(12deg)' }}
          >
            <span className="text-xs font-black tracking-widest uppercase text-red-500/70 dark:text-red-400/60">
              已卸任
            </span>
          </div>
        </div>
      )}

      {/* 头像容器 */}
      <div className="relative mb-6">
        {/* 外圈装饰呼吸灯效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand to-violet-500 blur-sm opacity-40 group-hover:scale-105 transition-all duration-500" />
        <div className="relative size-24 md:size-28 rounded-full border-2 border-neutral-200 dark:border-neutral-800/80 overflow-hidden bg-white dark:bg-neutral-950 p-1 group-hover:border-brand/40 transition-all duration-500 flex items-center justify-center">
          {isInitial ? (
            <span className="text-4xl font-bold text-neutral-400 dark:text-neutral-500 font-mono select-none">{member.avatar}</span>
          ) : (
            <Image
              src={avatarSrc}
              alt={member.name}
              width={110}
              height={110}
              className="rounded-full object-cover size-full group-hover:scale-110 transition-transform duration-500"
            />
          )}
        </div>
      </div>

      {/* 徽章 */}
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-4 shadow-sm",
        member.badgeBg,
        member.badgeText
      )}>
        {getIcon(member.iconName)}
        <span>{member.badge}</span>
      </div>

      {/* 姓名与角色 */}
      <h3 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 group-hover:text-brand dark:group-hover:text-white transition-colors">
        {member.name}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 mb-4 font-medium uppercase tracking-wider">
        {member.role}
      </p>

      {/* 贡献描述 */}
      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed text-center group-hover:text-neutral-800 dark:group-hover:text-neutral-300 transition-colors">
        {member.description}
      </p>
    </div>
  );
}
