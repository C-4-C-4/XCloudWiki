import { source } from '@/lib/source';
import { getLLMText } from '@/lib/get-llm-text';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const slug = (await params).slug;
  const page = source.getPage(slug);
  if (!page) notFound();

  const content = await getLLMText(page);
  return <pre>{content}</pre>;
}

export function generateStaticParams() {
  return source.generateParams();
}
