import type { Metadata } from 'next/types';
import { Page } from './source';

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: 'https://fumadocs.dev',
      images: '/banner.png',
      siteName: 'Fumadocs',
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@fuma_nama',
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: '/banner.png',
      ...override.twitter,
    },
    alternates: {
      types: {
        'application/rss+xml': [
          {
            title: 'Fumadocs Blog',
            url: 'https://fumadocs.dev/blog/rss.xml',
          },
        ],
      },
      ...override.alternates,
    },
  };
}

export function getPageImage(page: Page) {
  const segments = [...page.slugs, 'image.webp'];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  };
}

export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
);
