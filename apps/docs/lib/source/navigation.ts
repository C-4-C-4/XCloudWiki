export function getSection(path: string | undefined) {
  if (!path) return 'framework';
  const [dir] = path.split('/', 1);
  if (!dir) return 'framework';
  return (
    {
      // 文档站点的分类
      BasicInfo: 'basic-info',
      BeginnersGuide: 'beginners-guide',
      Expandedgameplay: 'expanded-gameplay',
      PlayerCommunity: 'player-community',
      Other: 'other',
      // 原有分类
      ui: 'ui',
      mdx: 'mdx',
      cli: 'cli',
      headless: 'headless',
    }[dir] ?? 'framework'
  );
}
