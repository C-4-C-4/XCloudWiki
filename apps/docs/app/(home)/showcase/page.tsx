import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/button';
import { createMetadata } from '@/lib/metadata';
import Design from './design.png';

export const metadata = createMetadata({
  title: '商会',
  description: '商店与地标展示',
  openGraph: {
    url: 'https://fumadocs.dev/showcase',
  },
});

export default function Showcase() {
  return (
    <main className="px-4 py-12 z-2 w-full max-w-[1400px] mx-auto **:border-neutral-400 dark:**:border-neutral-700">
      <div className="relative overflow-hidden border border-dashed p-6">
        <h1 className="mb-4 text-xl font-medium">商会</h1>
        <p className="text-fd-muted-foreground">
          商店与地标展示
        </p>
        <div className="mt-6">
          <button
            disabled
            className={cn(
              buttonVariants({
                variant: 'outline',
              }),
            )}
          >
            <PlusIcon className="me-2 size-4" />
            申请展示请联系CCCC4444
          </button>
        </div>
        <span className="absolute text-xs left-6 bottom-6 text-fd-muted-foreground font-mono">
          商会系统
        </span>
        <Image
          src={Design}
          alt="preview"
          priority
          className="ml-auto w-[600px] min-w-[600px] -mt-12 -mb-18 pointer-events-none select-none"
        />
      </div>
    </main>
  );
}
