import type { Metadata } from 'next';
import { type ComponentProps, type FC, type ReactNode } from 'react';
import * as Twoslash from 'fumadocs-twoslash/ui';
import { Callout } from 'fumadocs-ui/components/callout';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import * as Preview from '@/components/preview';
import { createMetadata, getPageImage } from '@/lib/metadata';
import { source } from '@/lib/source';
import { Wrapper } from '@/components/preview/wrapper';
import { Mermaid } from '@/components/mdx/mermaid';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Link from 'fumadocs-core/link';
import { findSiblings } from 'fumadocs-core/page-tree';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { getMDXComponents } from '@/components/mdx';
import { Banner } from 'fumadocs-ui/components/banner';
import { Installation } from '@/components/preview/installation';
import { Customization } from '@/components/preview/customization';
import {
  DocsBody,
  DocsPage,
  PageLastUpdate,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import { Calendar, Info, BookOpen, Gamepad2, Users, Wrench, Pencil } from 'lucide-react';
import { AuthorAvatar } from '@/components/author-avatar';
import { NotFound } from '@/components/layouts/not-found';
import { getSuggestions } from './suggestions';
import { PathUtils } from 'fumadocs-core/source';
import { AsyncAPIPageLazy, OpenAPIPageLazy } from './lazy';

const owner = 'fuma-nama';
const repo = 'fumadocs';

// Stub for static export - server actions not supported
const stubAction = () => Promise.resolve({ githubUrl: '' });

const categories = [
  {
    title: '基础信息',
    description: '关于闲云服务器的基础指南与说明，包括服务器规则、处罚规则、称谓系统等',
    icon: <Info />,
    href: '/docs/BasicInfo/ServerRules',
  },
  {
    title: '新手教程',
    description: '新手入门指南与教学，包含旅行提示、指令功能、NPC介绍、领地地标等',
    icon: <BookOpen />,
    href: '/docs/BeginnersGuide/TravelTips',
  },
  {
    title: '拓展玩法',
    description: '闲云服务器的拓展玩法与特色系统，如世界Boss、铁匠系统、职业系统、钓鱼系统等',
    icon: <Gamepad2 />,
    href: '/docs/Expandedgameplay/BlacksmithSystem',
  },
  {
    title: '玩家社区',
    description: '玩家社区内容，了解社区动态与玩家互动',
    icon: <Users />,
    href: '/docs/PlayerCommunity/PlayerCommunity',
  },
  {
    title: '工具',
    description: '实用工具集合，包括换肤工具、计算器、投影工具等',
    icon: <Wrench />,
    href: '/docs/Tools/Changeskin',
  },
  {
    title: '其他',
    description: '其他内容，如服务器规则、处罚规则、称谓系统等',
    icon: <Pencil />,
    href: '/docs/Other/InvestitureoftheGods',
  },
];

function PreviewRenderer({ preview }: { preview: string }): ReactNode {
  if (preview && preview in Preview) {
    const Comp = Preview[preview as keyof typeof Preview];
    return <Comp />;
  }

  return null;
}

export const revalidate = false;

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const slug = params.slug ?? [];

  if (slug.length === 0) {
    return (
      <DocsPage>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
          {/* 标题区域 */}
          <div className="text-center mb-12 max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-fd-foreground">
              文档中心
            </h1>
            <p className="text-lg text-fd-muted-foreground leading-relaxed">
              欢迎来到闲云 Wiki 文档中心，选择下方分类开始探索
            </p>
          </div>

          {/* 分类卡片网格 */}
          <Cards className="w-full max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card
                key={category.title}
                icon={category.icon}
                title={category.title}
                description={category.description}
                href={category.href}
                className="p-6"
              />
            ))}
          </Cards>

          {/* 底部提示 */}
          <p className="mt-12 text-sm text-fd-muted-foreground/60">
            找不到需要的内容？尝试使用左上角的搜索功能
          </p>
        </div>
      </DocsPage>
    );
  }

  const page = source.getPage(slug);

  if (!page)
    return (
      <NotFound
        getSuggestions={async () => getSuggestions(slug.join(' '))}
      />
    );

  if (page.type === 'openapi') {
    return (
      <DocsPage full>
        <h1 className="text-[1.75em] font-semibold">{page.data.title}</h1>

        <DocsBody>
          <OpenAPIPageLazy {...page.data.getOpenAPIPageProps()} />
        </DocsBody>
      </DocsPage>
    );
  }

  if (page.type === 'asyncapi') {
    return (
      <DocsPage full>
        <h1 className="text-[1.75em] font-semibold">{page.data.title}</h1>

        <DocsBody>
          <AsyncAPIPageLazy {...page.data.getAsyncAPIPageProps()} />
        </DocsBody>
      </DocsPage>
    );
  }

  const { body: Mdx, toc, lastModified } = await page.data.load();

  return (
    <DocsPage
      toc={toc}
      tableOfContent={{
        style: 'clerk',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-2 max-sm:flex-col max-sm:items-center">
        <div>
          <h1 className="text-[1.75em] font-semibold">{page.data.title}</h1>
          {'subtitle' in page.data && page.data.subtitle && (
            <p className="text-base font-medium text-fd-primary mt-1">{page.data.subtitle as string}</p>
          )}
          <p className="text-lg text-fd-muted-foreground mt-1">{page.data.description}</p>
        </div>
      </div>
      {'publishedAt' in page.data || 'authors' in page.data ? (
        <div className="flex flex-wrap items-center gap-4 mt-3 mb-2">
          {'publishedAt' in page.data && page.data.publishedAt && (
            <div className="flex items-center gap-2 rounded-lg border bg-fd-muted/30 px-3 py-2 text-sm text-fd-muted-foreground">
              <Calendar className="size-4 shrink-0" />
              <span>最后更新于: {String(page.data.publishedAt).slice(0, 10)}</span>
            </div>
          )}
          {'authors' in page.data && page.data.authors && (
            <div className="flex items-center gap-2 rounded-lg border bg-fd-muted/30 px-3 py-2 text-sm text-fd-muted-foreground">
              <span className="text-xs font-medium shrink-0">制作人员:</span>
              <div className="flex items-center gap-2">
                {(page.data.authors as string).split(/[,，、]/).map((author) => {
                  const name = author.trim();
                  return (
                    <div key={name} className="flex items-center gap-1.5">
                      <AuthorAvatar name={name} />
                      <span className="text-xs">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
      <div className="border-b pb-6" />
      <div className="prose flex-1 text-fd-foreground/90">
        {page.data.preview && <PreviewRenderer preview={page.data.preview} />}
        <Mdx
          components={getMDXComponents({
            ...Twoslash,
            a({ href, ...props }) {
              const found = source.getPageByHref(href ?? '', {
                dir: PathUtils.dirname(page.path),
              });

              if (!found) return <Link href={href} {...props} />;

              return (
                <HoverCard>
                  <HoverCardTrigger
                    href={found.hash ? `${found.page.url}#${found.hash}` : found.page.url}
                    {...props}
                  >
                    {props.children}
                  </HoverCardTrigger>
                  <HoverCardContent className="text-sm">
                    <p className="font-medium">{found.page.data.title}</p>
                    <p className="text-fd-muted-foreground">{found.page.data.description}</p>
                  </HoverCardContent>
                </HoverCard>
              );
            },
            Banner,
            Mermaid,
            TypeTable,
            Wrapper,
            blockquote: Callout as unknown as FC<ComponentProps<'blockquote'>>,
            DocsCategory: ({ url }) => {
              return <DocsCategory url={url ?? page.url} />;
            },
            Installation,
            Customization,
          })}
        />
        {page.data.index ? <DocsCategory url={page.url} /> : null}
      </div>
      {lastModified && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
          <MarkdownCopyButton markdownUrl={`${page.url}.mdx`} />
          <PageLastUpdate date={lastModified} />
        </div>
      )}
    </DocsPage>
  );
}

function DocsCategory({ url }: { url: string }) {
  return (
    <Cards>
      {findSiblings(source.getPageTree(), url).map((item) => {
        if (item.type === 'separator') return;
        if (item.type === 'folder') {
          if (!item.index) return;
          item = item.index;
        }

        return (
          <Card key={item.url} title={item.name} href={item.url}>
            {item.description}
          </Card>
        );
      })}
    </Cards>
  );
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const { slug = [] } = await props.params;
  if (slug.length === 0) {
    return createMetadata({
      title: '文档中心',
      description: '欢迎来到闲云 Wiki 文档中心',
    });
  }
  const page = source.getPage(slug);
  if (!page)
    return createMetadata({
      title: 'Not Found',
    });

  const description = page.data.description ?? 'The library for building documentation sites';

  const image = {
    url: getPageImage(page).url,
    width: 1200,
    height: 630,
  };

  return createMetadata({
    title: page.data.title,
    description,
    openGraph: {
      url: `/docs/${page.slugs.join('/')}`,
      images: [image],
    },
    twitter: {
      images: [image],
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
