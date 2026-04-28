import { BrowserTab } from '@/types';

const titles = [
  'Pro Browser Elite — Welcome',
  'Latest News — World Edition',
  'YouTube — Trending today',
  'Amazon — Today only deals',
  'Reddit — r/javascript',
  'Wikipedia — React Native',
  'GitHub — facebook/react-native',
  'Spotify — Daily Mix 1',
  'Netflix — Continue watching',
  'Twitter — Home',
  'Instagram — Stories',
  'StackOverflow — TypeScript questions',
  'LinkedIn — Recommended jobs',
  'BBC News — Asia',
  'Hacker News — front page',
  'Bing — search results for "react native gallery"',
  'Google Docs — Pro Browser specs',
  'Notion — Travel planning',
  'Figma — Browser UI v3',
  'Vercel — pro-browser-elite project',
];

const groups = ['Work', 'Reading', 'Shopping', 'Personal', 'Travel'];

export const MOCK_TABS: BrowserTab[] = titles.map((title, idx) => ({
  id: `tab-${idx + 1}`,
  title,
  url: `https://${title.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com/page-${idx + 1}`,
  favicon: '🌐',
  active: idx === 0,
  isPrivate: idx % 5 === 4,
  loadProgress: 1,
  createdAt: Date.now() - (idx + 1) * 1000 * 60 * 7,
  lastVisitedAt: Date.now() - idx * 1000 * 60 * 3,
  scrollY: idx * 120,
  cookiesEnabled: idx % 3 !== 0,
  jsEnabled: true,
  zoom: 1,
  desktopSite: idx % 4 === 0,
  notes: idx % 2 === 0 ? 'Saved snippet for later' : '',
  pinned: idx < 2,
  group: idx % 4 === 3 ? null : groups[idx % groups.length],
}));

export function getTabById(id: string): BrowserTab | undefined {
  return MOCK_TABS.find((t) => t.id === id);
}
