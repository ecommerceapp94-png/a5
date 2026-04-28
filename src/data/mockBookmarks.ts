import { BookmarkFolder, BookmarkItem, ThemeGradients } from '@/types';

const FOLDER_DEFS: Array<{
  name: string;
  icon: string;
  gradient: keyof ThemeGradients;
  description: string;
  color: string;
}> = [
  { name: 'Reading List', icon: 'book', gradient: 'sunset', description: 'Articles to read tonight', color: '#ff7e5f' },
  { name: 'Developer Tools', icon: 'code-slash', gradient: 'cosmic', description: 'Useful dev resources', color: '#5b5cff' },
  { name: 'Shopping', icon: 'cart', gradient: 'amber', description: 'Wishlist & deals', color: '#f7971e' },
  { name: 'Travel', icon: 'airplane', gradient: 'ocean', description: 'Trips, places, restaurants', color: '#2193b0' },
  { name: 'Recipes', icon: 'restaurant', gradient: 'forest', description: 'Cooking ideas', color: '#11998e' },
  { name: 'Work', icon: 'briefcase', gradient: 'midnight', description: 'Office links and dashboards', color: '#414345' },
  { name: 'Inspiration', icon: 'color-palette', gradient: 'aurora', description: 'Design and art', color: '#a18cd1' },
  { name: 'Music', icon: 'musical-notes', gradient: 'candy', description: 'Playlists and reviews', color: '#ff9a9e' },
];

const TITLE_TEMPLATES = [
  'How to master {topic} in 2024',
  'A definitive guide to {topic}',
  'The hidden cost of {topic}',
  'Why everyone is talking about {topic}',
  '{topic}: A field guide for beginners',
  'Top 25 resources on {topic}',
  '{topic} explained in 7 minutes',
  'A beautifully designed essay on {topic}',
  'Everything you need to know about {topic}',
  '{topic} for busy people',
];

const TOPICS = [
  'React Native', 'TypeScript', 'animation', 'home espresso', 'Tokyo restaurants',
  'budget travel', 'productivity', 'freelance contracts', 'AI tools', 'macro photography',
  'mechanical keyboards', 'sleep hygiene', 'design systems', 'DIY home repair', 'side projects',
  'cooking with miso', 'low-fi music', 'street style', 'mindful work', 'vintage cameras',
  'minimal living', 'cold brew coffee', 'cycling', 'hiking gear', 'open source funding',
];

const DOMAINS = [
  'medium.com', 'dev.to', 'css-tricks.com', 'smashingmagazine.com', 'theverge.com',
  'wired.com', 'arstechnica.com', 'nytimes.com', 'bbc.com', 'aljazeera.com',
  'vox.com', 'lifehacker.com', 'youtube.com', 'spotify.com', 'github.com',
];

function pseudo(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const BOOKMARK_FOLDERS: BookmarkFolder[] = FOLDER_DEFS.map((f, i) => ({
  id: `folder-${i + 1}`,
  name: f.name,
  icon: f.icon,
  gradient: f.gradient,
  description: f.description,
  color: f.color,
  createdAt: Date.now() - (i + 1) * 86400000,
  updatedAt: Date.now() - i * 3600000,
  pinned: i < 3,
  bookmarkIds: [],
}));

export const BOOKMARKS: BookmarkItem[] = [];

let bId = 0;
BOOKMARK_FOLDERS.forEach((folder, fIdx) => {
  const count = 12 + (fIdx % 4) * 4;
  const ids: string[] = [];
  for (let i = 0; i < count; i += 1) {
    bId += 1;
    const seed = bId * 1.7 + fIdx;
    const topic = TOPICS[Math.floor(pseudo(seed) * TOPICS.length)];
    const tmpl = TITLE_TEMPLATES[Math.floor(pseudo(seed * 2) * TITLE_TEMPLATES.length)];
    const domain = DOMAINS[Math.floor(pseudo(seed * 3) * DOMAINS.length)];
    const title = tmpl.replace('{topic}', topic);
    const id = `bm-${bId}`;
    ids.push(id);
    BOOKMARKS.push({
      id,
      folderId: folder.id,
      title,
      url: `https://${domain}/articles/${topic.replace(/\s+/g, '-').toLowerCase()}-${bId}`,
      description: `${title}. Saved while browsing ${domain} for ${folder.name}.`,
      favicon: '🔖',
      tags: [folder.name.toLowerCase().split(' ')[0], topic.split(' ')[0].toLowerCase(), 'saved'],
      rating: 3 + Math.floor(pseudo(seed * 5) * 30) / 10,
      notes: i % 3 === 0 ? 'Re-read on weekend.' : '',
      createdAt: Date.now() - (i + fIdx) * 7200000,
      updatedAt: Date.now() - i * 3600000,
      pinned: i < 2,
      visitCount: 1 + Math.floor(pseudo(seed * 7) * 40),
    });
  }
  folder.bookmarkIds = ids;
});

export function getFolderById(id: string): BookmarkFolder | undefined {
  return BOOKMARK_FOLDERS.find((f) => f.id === id);
}
export function getBookmarkById(id: string): BookmarkItem | undefined {
  return BOOKMARKS.find((b) => b.id === id);
}
export function getBookmarksForFolder(folderId: string): BookmarkItem[] {
  return BOOKMARKS.filter((b) => b.folderId === folderId);
}
