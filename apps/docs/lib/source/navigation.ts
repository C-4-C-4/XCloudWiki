export function getSection(path: string | undefined) {
  if (!path) return 'basic-info';
  const [dir] = path.split('/', 1);
  if (!dir) return 'basic-info';
  return (
    {
      BasicInfo: 'basic-info',
      BeginnersGuide: 'beginners-guide',
      Expandedgameplay: 'expanded-gameplay',
      PlayerCommunity: 'player-community',
      Tools: 'tools',
      Other: 'other',
    }[dir] ?? 'basic-info'
  );
}
