import Link from 'next/link';
import { blog } from '@/lib/source';
import { PathUtils } from 'fumadocs-core/source';
import BannerImage from './banner.png';
import Image from 'next/image';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: '日志',
  description: '实时记录闲云服务器的运行状态、版本迭代以及 Wiki 的更新与维护日志。',
});

function getName(path: string) {
  return PathUtils.basename(path, PathUtils.extname(path));
}

export default function Page() {
  const posts = [...blog.getPages()]
    .filter((post) => post.slugs[0] !== 'placeholder')
    .sort(
      (a, b) =>
        new Date(b.data.date ?? getName(b.path)).getTime() -
        new Date(a.data.date ?? getName(a.path)).getTime(),
    );

  return (
    <main className="mx-auto w-full max-w-page px-4 pb-12 md:py-12 animate-fade-in-up">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="relative dark mb-4 aspect-[3.2] p-8 z-2 md:p-12">
        <Image
          src={BannerImage}
          priority
          alt="banner"
          className="absolute inset-0 size-full -z-1 object-cover"
        />
        <h1 className="mb-4 text-3xl text-landing-foreground font-mono font-medium">
          日志
        </h1>
        <p className="text-sm font-mono text-landing-foreground-200">
          实时记录闲云服务器的运行状态、版本迭代以及 Wiki 的更新与维护日志。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="flex flex-col bg-fd-card rounded-2xl border shadow-sm p-4 transition-all duration-300 hover:bg-fd-accent hover:text-fd-accent-foreground hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
          >
            <p className="font-medium">{post.data.title}</p>
            <p className="text-sm text-fd-muted-foreground">{post.data.description}</p>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <span className="text-xs text-brand">
                {new Date(post.data.date ?? getName(post.path)).toDateString()}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                post.data.type === 'server'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
              }`}>
                {post.data.type === 'server' ? '服务器' : 'Wiki'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
