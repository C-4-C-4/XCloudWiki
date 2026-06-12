import createBundleAnalyzer from '@next/bundle-analyzer';
import { createMDX } from 'fumadocs-mdx/next';
import { createNextStory } from '@fumadocs/story/next';
import type { NextConfig } from 'next';

const withAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const isProduction = process.env.NODE_ENV === 'production';

const config: NextConfig = {
  // GitHub Pages 静态导出配置（仅生产环境）
  ...(isProduction ? { output: 'export' as const } : {}),
  basePath: isProduction ? '/XCloudWiki' : '',
  // GitHub Pages 不支持图片优化 API
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
    ],
  },
  // 导出为 .html 后缀以兼容 GitHub Pages
  trailingSlash: false,
};

const withStory = createNextStory();
const withMDX = createMDX();

export default withAnalyzer(withStory(withMDX(config)));
