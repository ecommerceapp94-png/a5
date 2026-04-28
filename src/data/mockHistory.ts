import { HistoryEntry } from '@/types';

const TITLES = [
  'GitHub: facebook/react-native',
  'CSS Tricks: Glassmorphism in 2024',
  'Wikipedia: Reanimated',
  'YouTube: Pro Browser walkthrough',
  'Reddit: r/reactnative',
  'Medium: How I built a fast browser',
  'StackOverflow: useMemo vs useCallback',
  'Vercel: pro-browser-elite logs',
  'Notion: Engineering meeting notes',
  'Spotify: Lo-fi beats playlist',
  'Amazon: ANC headphones deal',
  'Hacker News: front page',
  'TechCrunch: AI roundup',
  'The Verge: chrome 124 review',
  'Smashing Magazine: motion design',
  'BBC: World news',
  'NYT: morning briefing',
  'Twitch: live coding stream',
  'Docs: Expo BlurView',
  'Docs: AsyncStorage API',
];

const DOMAINS = [
  'github.com', 'css-tricks.com', 'wikipedia.org', 'youtube.com', 'reddit.com',
  'medium.com', 'stackoverflow.com', 'vercel.com', 'notion.so', 'spotify.com',
  'amazon.in', 'news.ycombinator.com', 'techcrunch.com', 'theverge.com',
  'smashingmagazine.com', 'bbc.com', 'nytimes.com', 'twitch.tv', 'docs.expo.dev',
];

const LOCATIONS = [
  'Mumbai, IN', 'Bengaluru, IN', 'Hyderabad, IN', 'New Delhi, IN', 'Singapore, SG',
  'San Francisco, US', 'Berlin, DE', 'London, UK', 'Tokyo, JP', 'Sydney, AU',
];

const DEVICES = ['iPhone 15 Pro', 'Pixel 8', 'iPad Air', 'MacBook Pro', 'Galaxy S24'];

function pseudo(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export const HISTORY: HistoryEntry[] = (() => {
  const out: HistoryEntry[] = [];
  const now = Date.now();
  let id = 0;
  for (let day = 0; day < 14; day += 1) {
    const dayStart = now - day * 86400000;
    const count = 6 + ((day * 3) % 7);
    for (let i = 0; i < count; i += 1) {
      id += 1;
      const seed = id * 1.7 + day;
      const titleIdx = Math.floor(pseudo(seed) * TITLES.length);
      const domain = DOMAINS[titleIdx % DOMAINS.length];
      const title = TITLES[titleIdx];
      const visitedAt = dayStart - i * 1000 * 60 * 35 - Math.floor(pseudo(seed * 3) * 600000);
      out.push({
        id: `h-${id}`,
        title,
        url: `https://${domain}/page/${title.toLowerCase().split(' ').slice(0, 3).join('-')}-${id}`,
        favicon: '🌐',
        visitedAt,
        durationMs: 30000 + Math.floor(pseudo(seed * 5) * 600000),
        scrollDepth: Math.floor(pseudo(seed * 7) * 100),
        device: DEVICES[Math.floor(pseudo(seed * 9) * DEVICES.length)],
        referer: i === 0 ? 'Speed Dial' : 'Search',
        location: LOCATIONS[Math.floor(pseudo(seed * 11) * LOCATIONS.length)],
        tags: ['recent', domain.split('.')[0]],
      });
    }
  }
  return out;
})();

export function getHistoryById(id: string): HistoryEntry | undefined {
  return HISTORY.find((h) => h.id === id);
}

export function groupHistoryByDay(entries: HistoryEntry[]): Array<{ key: string; label: string; ts: number; entries: HistoryEntry[] }> {
  const map = new Map<string, { key: string; label: string; ts: number; entries: HistoryEntry[] }>();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  entries
    .slice()
    .sort((a, b) => b.visitedAt - a.visitedAt)
    .forEach((e) => {
      const d = new Date(e.visitedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      let label = `${d.toDateString()}`;
      if (e.visitedAt >= today) label = 'Today';
      else if (e.visitedAt >= today - 86400000) label = 'Yesterday';
      else if (e.visitedAt >= today - 7 * 86400000) label = 'Last 7 days';
      const dayBucket = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const existing = map.get(key);
      if (existing) {
        existing.entries.push(e);
      } else {
        map.set(key, { key, label, ts: dayBucket, entries: [e] });
      }
    });
  return Array.from(map.values());
}
