import { source } from '@/lib/source';
import { getLLMText } from '@/lib/get-llm-text';

export default async function Page() {
  const scan = source.getPages().map(getLLMText);
  const scanned = await Promise.all(scan);

  return <pre>{scanned.join('\n\n')}</pre>;
}

export function generateStaticParams() {
  return [{}];
}
