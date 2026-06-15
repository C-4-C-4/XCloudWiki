import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { blog } from '@/lib/source';
import { createMetadata } from '@/lib/metadata';
import { buttonVariants } from '@/components/ui/button';
import { ShareButton, BackButton } from '@/app/(home)/blog/[slug]/page.client';
import { getMDXComponents } from '@/components/mdx';
import path from 'node:path';
import { cn } from '@/lib/cn';

const avatarMap: Record<string, string> = {
  'CCCC4444': '/avatars/CCCC4444.jpg',
  'Love_Story': '/avatars/LoveStory.jpg',
  'LoveStory': '/avatars/LoveStory.jpg',
  'Sa1nt_Hal0': '/avatars/Sa1nt_Hal0.jpg',
  'StyleYM': '/avatars/StyleYM.jpg',
  'Yep': '/avatars/Yep.jpg',
  'abnormalclarke': '/avatars/abnormalclarke.jpg',
  'laccket': '/avatars/laccket.jpg',
  'sickle': '/avatars/sickle.jpg',
  '星': '/avatars/xing.png',
  'xing': '/avatars/xing.png',
  'xuan562': '/avatars/xuan562.jpg',
  '84531': '/avatars/84531.jpg',
};

function getAvatar(author: string) {
  if (avatarMap[author]) return avatarMap[author];
  const clean = author.replace(/_/g, '').toLowerCase();
  for (const [key, value] of Object.entries(avatarMap)) {
    if (key.replace(/_/g, '').toLowerCase() === clean) {
      return value;
    }
  }
  return '/avatars/Yep.jpg';
}

export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  const components = getMDXComponents();

  if (!page) notFound();
  const { body: Mdx, toc } = await page.data.load();

  return (
    <article className="flex flex-col mx-auto w-full max-w-[800px] px-4 py-8 animate-fade-in-up">
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
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(10px);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-out-down {
          animation: fadeOutDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="flex flex-row gap-6 text-sm mb-8 items-center">
        <div className="flex items-center gap-3">
          <img
            src={getAvatar(page.data.author)}
            alt={page.data.author}
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <p className="mb-0.5 text-xs text-fd-muted-foreground">Written by</p>
            <p className="font-medium text-fd-foreground">{page.data.author}</p>
          </div>
        </div>
        <div className="border-l pl-6 py-1">
          <p className="mb-0.5 text-xs text-fd-muted-foreground">At</p>
          <p className="font-medium text-fd-foreground">
            {new Date(
              page.data.date ?? path.basename(page.path, path.extname(page.path)),
            ).toDateString()}
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-4">{page.data.title}</h1>
      <p className="text-fd-muted-foreground mb-8">{page.data.description}</p>

      <div className="prose min-w-0 flex-1">
        <div className="flex flex-row gap-2 mb-8 not-prose">
          <ShareButton url={page.url} />
          <BackButton />
        </div>

        <div className="mb-8">
          <InlineTOC items={toc} />
        </div>
        <Mdx components={components} />
      </div>
    </article>
  );
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  return createMetadata({
    title: page.data.title,
    description: page.data.description ?? 'The library for building documentation sites',
  });
}

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}
