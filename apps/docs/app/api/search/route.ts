import { source } from '@/lib/source';
import { getSection } from '@/lib/source/navigation';
import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const pages = source.getPages();
  const promises = pages.map(async (page) => {
    if (page.type !== 'docs') return;

    const items = getBreadcrumbItems(page.url, source.getPageTree(), {
      includePage: false,
      includeRoot: true,
    });

    const data = await page.data.load();

    return {
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      structuredData: data.structuredData,
      tag: getSection(page.slugs[0]),
      breadcrumbs: items.flatMap<string>((item, i) =>
        i > 0 && typeof item.name === 'string' ? item.name : [],
      ),
    };
  });

  const documents = (await Promise.all(promises)).filter((v) => v !== undefined);
  return NextResponse.json(documents);
}
