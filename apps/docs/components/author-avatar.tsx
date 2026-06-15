'use client';

import Image from 'next/image';

const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/XCloudWiki' : '';

export function AuthorAvatar({ name }: { name: string }) {
  const avatarSrc = `${basePath}/wiki-img/member/${name}`;

  return (
    <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-fd-muted">
      <Image
        src={`${avatarSrc}.jpg`}
        alt={name}
        fill
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.dataset.fallback) {
            target.dataset.fallback = '1';
            target.src = `${avatarSrc}.png`;
          }
          if (target.dataset.fallback === '1') {
            target.style.display = 'none';
            target.nextElementSibling!.classList.remove('hidden');
          }
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center bg-fd-muted text-[10px] font-bold text-fd-muted-foreground">
        {name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}

