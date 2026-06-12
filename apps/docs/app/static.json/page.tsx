import { source } from '@/lib/source';
import type { OramaDocument } from 'fumadocs-core/search/orama-cloud';
import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';
import { getSection } from '@/lib/source/navigation';

export default async function Page() {
  const pages = source.getPages();
  const promises = pages.map(async (page) => {
    if (page.type !== 'docs') return;

    const items = getBreadcrumbItems(page.url, source.getPageTree(), {
      includePage: false,
      includeRoot: true,
    });

    return {
      id: page.url,
      structured: (await page.data.load()).structuredData,
      tag: getSection(page.slugs[0]),
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      breadcrumbs: items.flatMap<string>((item, i) =>
        i > 0 && typeof item.name === 'string' ? item.name : [],
      ),
    } as OramaDocument;
  });

  const documents = (await Promise.all(promises)).filter((v) => v !== undefined) as OramaDocument[];

  return <pre>{JSON.stringify(documents)}</pre>;
}

export function generateStaticParams() {
  return [{}];
}
