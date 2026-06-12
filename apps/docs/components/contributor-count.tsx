import type { HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

const localAvatars = [
  '/avatars/LoveStory.jpg',
  '/avatars/CCCC4444.jpg',
  '/avatars/xuan562.jpg',
  '/avatars/84531.jpg',
  '/avatars/Sa1nt_Hal0.jpg',
  '/avatars/Yep.jpg',
  '/avatars/abnormalclarke.jpg',
  '/avatars/sickle.jpg',
  '/avatars/laccket.jpg',
  '/avatars/xing.png',
];

export interface ContributorCounterProps extends HTMLAttributes<HTMLDivElement> {
  repoOwner?: string;
  repoName?: string;
  displayCount?: number;
}

export default async function ContributorCounter({
  displayCount = 20,
  repoOwner,
  repoName,
  ...props
}: ContributorCounterProps): Promise<React.ReactElement> {
  const avatars = localAvatars.slice(0, displayCount);

  return (
    <div {...props} className={cn('flex flex-col items-center gap-4', props.className)}>
      <div className="flex flex-row flex-wrap items-center justify-center md:pe-4">
        {avatars.map((src, i) => (
          <div
            key={src}
            className="size-10 overflow-hidden rounded-full border-4 border-fd-background bg-fd-background md:-mr-4 md:size-12"
            style={{
              zIndex: avatars.length - i,
            }}
          >
            <Image
              src={src}
              alt="avatar"
              width={48}
              height={48}
            />
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-fd-muted-foreground">
        感谢你们的付出和努力
      </div>
    </div>
  );
}
