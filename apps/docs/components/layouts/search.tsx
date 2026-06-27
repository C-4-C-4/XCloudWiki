'use client';

import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SearchItemType,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useMemo, useState, useEffect, ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import type { Item, Node } from 'fumadocs-core/page-tree';
import { useRouter } from 'next/navigation';

interface StaticDoc {
  id: string;
  title: string;
  description?: string;
  url: string;
  breadcrumbs?: string[];
  tag?: string;
  structuredData: {
    headings: Array<{ id: string; content: string }>;
    contents: Array<{ content: string; heading?: string }>;
  };
}

const items = [
  {
    name: '全部',
    value: undefined,
  },
  {
    name: '基础信息',
    description: '服务器基础信息相关内容',
    value: 'basic-info',
  },
  {
    name: '新手教程',
    description: '新手入门指南',
    value: 'beginners-guide',
  },
  {
    name: '拓展玩法',
    description: '拓展玩法相关内容',
    value: 'expanded-gameplay',
  },
  {
    name: '玩家社区',
    description: '玩家社区相关内容',
    value: 'player-community',
  },
  {
    name: '工具',
    description: '各类实用工具',
    value: 'tools',
  },
  {
    name: '其他',
    description: '其他内容',
    value: 'other',
  },
];

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, keyword: string): ReactNode {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(keyword)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-fd-primary/20 text-fd-primary rounded-sm px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function getExcerpt(text: string, keyword: string, maxLength = 100) {
  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return text.slice(0, maxLength);
  
  const start = Math.max(0, index - Math.floor(maxLength / 2));
  const end = Math.min(text.length, start + maxLength);
  
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  return excerpt;
}

export default function CustomSearchDialog(props: SharedProps) {
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<StaticDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 挂载时拉取本地搜索的全部文章索引
  useEffect(() => {
    fetch('/api/search')
      .then((res) => res.json())
      .then((data) => {
        setDocs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch search index:', err);
        setIsLoading(false);
      });
  }, []);

  const { full } = useTreeContext();
  const router = useRouter();
  const searchMap = useMemo(() => {
    const map = new Map<string, Item>();

    function onNode(node: Node) {
      if (node.type === 'page' && typeof node.name === 'string') {
        map.set(node.name.toLowerCase(), node);
      } else if (node.type === 'folder') {
        if (node.index) onNode(node.index);
        for (const item of node.children) onNode(item);
      }
    }

    for (const item of full.children) onNode(item);
    return map;
  }, [full]);

  const pageTreeAction = useMemo<SearchItemType | undefined>(() => {
    if (search.length === 0) return;

    const normalized = search.toLowerCase();
    for (const [k, page] of searchMap) {
      if (!k.startsWith(normalized)) continue;

      return {
        id: 'quick-action',
        type: 'action',
        node: (
          <div className="inline-flex items-center gap-2 text-fd-muted-foreground">
            <ArrowRight className="size-4" />
            <p>
              Jump to <span className="font-medium text-fd-foreground">{page.name}</span>
            </p>
          </div>
        ),
        onSelect: () => router.push(page.url),
      };
    }
  }, [router, search, searchMap]);

  // 本地中文模糊搜索实现
  const searchResults = useMemo(() => {
    if (!search || docs.length === 0) return undefined;
    const q = search.trim().toLowerCase();
    if (!q) return undefined;

    const results: Array<{ item: any; score: number }> = [];
    const filteredDocs = tag ? docs.filter((d) => d.tag === tag) : docs;

    for (const doc of filteredDocs) {
      // 1. 匹配文章标题
      const titleLower = doc.title.toLowerCase();
      if (titleLower.includes(q)) {
        let score = 100;
        if (titleLower.startsWith(q)) score += 50;

        results.push({
          item: {
            id: doc.url,
            url: doc.url,
            type: 'page',
            content: highlightText(doc.title, q),
            breadcrumbs: doc.breadcrumbs || [],
          },
          score,
        });
      }

      // 2. 匹配文章描述
      if (doc.description) {
        const descLower = doc.description.toLowerCase();
        if (descLower.includes(q)) {
          const excerpt = getExcerpt(doc.description, q, 100);
          results.push({
            item: {
              id: `${doc.url}-desc`,
              url: doc.url,
              type: 'text',
              content: highlightText(excerpt, q),
              breadcrumbs: [...(doc.breadcrumbs || []), doc.title],
            },
            score: 80,
          });
        }
      }

      // 3. 匹配各级大标题 (Headings)
      if (doc.structuredData?.headings) {
        for (const heading of doc.structuredData.headings) {
          const hLower = heading.content.toLowerCase();
          if (hLower.includes(q)) {
            let score = 70;
            if (hLower.startsWith(q)) score += 20;

            results.push({
              item: {
                id: `${doc.url}#${heading.id}`,
                url: `${doc.url}#${heading.id}`,
                type: 'heading',
                content: highlightText(heading.content, q),
                breadcrumbs: [...(doc.breadcrumbs || []), doc.title],
              },
              score,
            });
          }
        }
      }

      // 4. 匹配正文具体内容 (Contents)
      if (doc.structuredData?.contents) {
        for (const content of doc.structuredData.contents) {
          const cLower = content.content.toLowerCase();
          if (cLower.includes(q)) {
            const excerpt = getExcerpt(content.content, q, 100);
            results.push({
              item: {
                id: `${doc.url}-content-${Math.random()}`,
                url: content.heading ? `${doc.url}#${content.heading}` : doc.url,
                type: 'text',
                content: highlightText(excerpt, q),
                breadcrumbs: [...(doc.breadcrumbs || []), doc.title],
              },
              score: 50,
            });
          }
        }
      }
    }

    // 权重排序并输出
    return results
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item)
      .slice(0, 25);
  }, [docs, search, tag]);

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        {searchResults !== undefined && searchResults.length === 0 && !pageTreeAction ? (
          <div className="py-12 text-center text-sm text-fd-muted-foreground">
            没有找到相关结果
          </div>
        ) : (
          <SearchDialogList
            items={
              searchResults && (searchResults.length > 0 || pageTreeAction)
                ? [
                    ...(pageTreeAction ? [pageTreeAction] : []),
                    ...searchResults,
                  ]
                : null
            }
          />
        )}
        <SearchDialogFooter className="flex flex-row flex-wrap gap-2 items-center">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              className={buttonVariants({
                size: 'sm',
                color: 'ghost',
                className: '-m-1.5 me-auto',
              })}
            >
              <span className="text-fd-muted-foreground/80 me-2">筛选</span>
              {items.find((item) => item.value === tag)?.name}
              <ChevronDown className="size-3.5 text-fd-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col p-1 gap-1" align="start">
              {items.map((item, i) => {
                const isSelected = item.value === tag;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setTag(item.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'rounded-lg text-start px-2 py-1.5',
                      isSelected
                        ? 'text-fd-primary bg-fd-primary/10'
                        : 'hover:text-fd-accent-foreground hover:bg-fd-accent',
                    )}
                  >
                    <p className="font-medium mb-0.5">{item.name}</p>
                    <p className="text-xs opacity-70">{item.description}</p>
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
