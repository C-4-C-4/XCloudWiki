'use client';
import { Check, Share } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/button';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { useRouter } from 'next/navigation';

export function ShareButton({ url }: { url: string }) {
  const [isChecked, onCopy] = useCopyButton(() => {
    void navigator.clipboard.writeText(`${window.location.origin}${url}`);
  });

  return (
    <button type="button" className={cn(buttonVariants({ className: 'gap-2' }))} onClick={onCopy}>
      {isChecked ? <Check className="size-4" /> : <Share className="size-4" />}
      {isChecked ? 'Copied URL' : 'Share Post'}
    </button>
  );
}

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof document !== 'undefined') {
      const article = document.querySelector('article');
      if (article) {
        article.classList.remove('animate-fade-in-up');
        article.classList.add('animate-fade-out-down');
      }
    }
    setTimeout(() => {
      router.back();
    }, 250);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        buttonVariants({
          size: 'sm',
          variant: 'secondary',
        }),
      )}
    >
      Back
    </button>
  );
}
