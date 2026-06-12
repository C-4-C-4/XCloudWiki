import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';

export default function Page() {
  const content = llms(source).index();
  return <pre>{content}</pre>;
}

export function generateStaticParams() {
  return [{}];
}
