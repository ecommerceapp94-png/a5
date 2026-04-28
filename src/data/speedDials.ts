import { SpeedDialItem, ThemeGradients } from '@/types';

const tagPool = [
  'news', 'tech', 'shopping', 'video', 'music', 'social', 'reading', 'finance', 'work',
  'travel', 'food', 'fitness', 'science', 'space', 'gaming', 'design', 'kids', 'study',
  'photos', 'security', 'productivity', 'finance', 'tools', 'audio',
];

interface RawDial {
  title: string;
  url: string;
  icon: string;
  gradient: keyof ThemeGradients;
  category: string;
  description: string;
}

const RAW: RawDial[] = [
  { title: 'News', url: 'https://news.example.com', icon: 'newspaper', gradient: 'sunset', category: 'News', description: 'Top stories from around the globe in a single feed.' },
  { title: 'YouTube', url: 'https://youtube.com', icon: 'logo-youtube', gradient: 'fire', category: 'Video', description: 'Watch trending videos, music and tutorials.' },
  { title: 'Amazon', url: 'https://amazon.in', icon: 'cart', gradient: 'amber', category: 'Shopping', description: 'Best deals across millions of products.' },
  { title: 'Twitter', url: 'https://twitter.com', icon: 'logo-twitter', gradient: 'ocean', category: 'Social', description: 'Real-time pulse of the internet.' },
  { title: 'Instagram', url: 'https://instagram.com', icon: 'logo-instagram', gradient: 'candy', category: 'Social', description: 'Photos, reels and stories from people you follow.' },
  { title: 'Reddit', url: 'https://reddit.com', icon: 'logo-reddit', gradient: 'fire', category: 'Community', description: 'Front page of the internet.' },
  { title: 'Wikipedia', url: 'https://wikipedia.org', icon: 'book', gradient: 'midnight', category: 'Reference', description: 'Free encyclopedia maintained by volunteers.' },
  { title: 'GitHub', url: 'https://github.com', icon: 'logo-github', gradient: 'cosmic', category: 'Developer', description: 'Code hosting, collaboration and CI.' },
  { title: 'Spotify', url: 'https://spotify.com', icon: 'musical-notes', gradient: 'forest', category: 'Music', description: 'Streaming music for every mood.' },
  { title: 'Netflix', url: 'https://netflix.com', icon: 'film', gradient: 'fire', category: 'Entertainment', description: 'Movies and TV shows on demand.' },
  { title: 'LinkedIn', url: 'https://linkedin.com', icon: 'briefcase', gradient: 'ocean', category: 'Work', description: 'Professional network and job board.' },
  { title: 'StackOverflow', url: 'https://stackoverflow.com', icon: 'code-slash', gradient: 'amber', category: 'Developer', description: 'Q&A for programmers worldwide.' },
];

function tagsFor(seed: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const t = tagPool[(seed * 31 + i * 7) % tagPool.length];
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

export const SPEED_DIALS: SpeedDialItem[] = RAW.map((r, idx) => ({
  id: `dial-${idx + 1}`,
  title: r.title,
  url: r.url,
  icon: r.icon,
  gradient: r.gradient,
  category: r.category,
  description: r.description,
  visits: 1200 + idx * 213 + ((idx * 17) % 800),
  rating: 3.6 + ((idx * 13) % 12) / 10,
  tags: tagsFor(idx + 1),
  trending: idx % 3 === 0,
}));

export function getSpeedDialById(id: string): SpeedDialItem | undefined {
  return SPEED_DIALS.find((s) => s.id === id);
}
