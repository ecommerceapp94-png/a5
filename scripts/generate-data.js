// Generates additional verbose mock data files used by the app.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'generated');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const ADJ = [
  'Premium', 'Elite', 'Crisp', 'Snappy', 'Velvet', 'Lush', 'Cosmic', 'Sleek',
  'Glassy', 'Silky', 'Vibrant', 'Punchy', 'Dreamy', 'Polished', 'Frosted',
  'Deep', 'Subtle', 'Brisk', 'Buttery', 'Soft', 'Bright', 'Calm', 'Bold',
];
const NOUNS = [
  'Insight', 'Pulse', 'Stream', 'Compass', 'Beacon', 'Atlas', 'Codex',
  'Aurora', 'Lens', 'Forge', 'Studio', 'Loom', 'Drift', 'Quest',
  'Saga', 'Mosaic', 'Tapestry', 'Echo', 'Halo', 'Spark', 'Era',
];
const SOURCES = [
  'Pro Browser Wire', 'Daily Compass', 'Aurora Press', 'Beacon Times', 'Glass Gazette',
  'Cosmic Daily', 'Velvet Chronicle', 'Frosted Post', 'Spark Tribune', 'Mosaic Today',
];
const TOPICS = [
  'AI', 'Cloud', 'Privacy', 'Travel', 'Coffee', 'Cycling', 'Photography', 'Music',
  'Film', 'Cooking', 'Reading', 'Gaming', 'Health', 'Fitness', 'Fashion', 'Design',
  'Architecture', 'Wildlife', 'Climate', 'Space',
];
const GRADIENTS = [
  'brand', 'sunset', 'ocean', 'aurora', 'forest', 'candy',
  'midnight', 'amber', 'cosmic', 'neon', 'pastel', 'fire',
];

function pick(seed, list) {
  return list[Math.abs(Math.floor(Math.sin(seed) * 1e6)) % list.length];
}

function escape(value) {
  return value.replace(/'/g, "\\'");
}

// 1) News corpus
function emitNewsCorpus() {
  const lines = [];
  lines.push("import { ThemeGradients } from '@/types';");
  lines.push('');
  lines.push('export interface NewsArticle {');
  lines.push('  id: string;');
  lines.push('  headline: string;');
  lines.push('  excerpt: string;');
  lines.push('  source: string;');
  lines.push('  topic: string;');
  lines.push('  gradient: keyof ThemeGradients;');
  lines.push('  publishedAt: number;');
  lines.push('  durationMinutes: number;');
  lines.push('  reactions: number;');
  lines.push('  comments: number;');
  lines.push('  shares: number;');
  lines.push('  tags: string[];');
  lines.push('  trending: boolean;');
  lines.push('}');
  lines.push('');
  lines.push('export const NEWS_CORPUS: NewsArticle[] = [');
  for (let i = 0; i < 220; i += 1) {
    const seed = i + 1;
    const adj = pick(seed, ADJ);
    const noun = pick(seed * 2, NOUNS);
    const topic = pick(seed * 3, TOPICS);
    const source = pick(seed * 5, SOURCES);
    const gradient = pick(seed * 7, GRADIENTS);
    const headline = `${adj} ${noun}: how ${topic.toLowerCase()} is reshaping daily routines #${i + 1}`;
    const excerpt = `An in-depth look at the ${adj.toLowerCase()} side of ${topic}, with quotes from designers, engineers, and curious browsers worldwide.`;
    lines.push('  {');
    lines.push(`    id: 'news-${i + 1}',`);
    lines.push(`    headline: '${escape(headline)}',`);
    lines.push(`    excerpt: '${escape(excerpt)}',`);
    lines.push(`    source: '${escape(source)}',`);
    lines.push(`    topic: '${topic}',`);
    lines.push(`    gradient: '${gradient}',`);
    lines.push(`    publishedAt: ${Date.now() - i * 60 * 60 * 1000},`);
    lines.push(`    durationMinutes: ${(i % 9) + 2},`);
    lines.push(`    reactions: ${(i * 17) % 4000 + 32},`);
    lines.push(`    comments: ${(i * 31) % 240 + 4},`);
    lines.push(`    shares: ${(i * 13) % 800 + 8},`);
    lines.push(`    tags: ['${topic.toLowerCase()}', '${adj.toLowerCase()}', '${noun.toLowerCase()}', 'recent'],`);
    lines.push(`    trending: ${i % 4 === 0 ? 'true' : 'false'},`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  lines.push('export function getNewsArticleById(id: string): NewsArticle | undefined {');
  lines.push('  return NEWS_CORPUS.find((n) => n.id === id);');
  lines.push('}');
  lines.push('');
  lines.push('export function getNewsByTopic(topic: string): NewsArticle[] {');
  lines.push('  return NEWS_CORPUS.filter((n) => n.topic === topic);');
  lines.push('}');
  return lines.join('\n');
}

// 2) Settings catalog
function emitSettingsCatalog() {
  const groups = [
    {
      id: 'general',
      title: 'General',
      icon: 'settings',
      gradient: 'brand',
      description: 'Defaults that apply across the entire browser.',
      entries: [
        ['default-engine', 'Default search engine', 'Choose between Google, DuckDuckGo, Bing, or Ecosia.', 'select', 'globe'],
        ['startup-page', 'Start-up page', 'Pick the screen shown when you launch the app.', 'select', 'home'],
        ['theme', 'Theme', 'Light, dark, or follow system.', 'select', 'contrast'],
        ['font-scale', 'Font scale', 'Resize all text from 0.8 to 1.4.', 'slider', 'text'],
        ['language', 'Language', 'Pick from 30+ languages with mock data.', 'select', 'language'],
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & security',
      icon: 'shield-checkmark',
      gradient: 'forest',
      description: 'Trackers, ads, and cookies are handled here.',
      entries: [
        ['block-trackers', 'Block trackers', 'Stops 99% of cross-site trackers.', 'toggle', 'shield'],
        ['block-ads', 'Block ads', 'Removes display advertising on most sites.', 'toggle', 'eye-off'],
        ['do-not-track', 'Do not track', 'Sends a DNT signal to every site.', 'toggle', 'finger-print'],
        ['private-on-launch', 'Private on launch', 'Always start in incognito mode.', 'toggle', 'lock-closed'],
        ['clear-on-exit', 'Clear on exit', 'Wipe history & cookies when you quit.', 'toggle', 'trash'],
        ['safe-browsing', 'Safe browsing', 'Warn before visiting risky pages.', 'toggle', 'alert-circle'],
      ],
    },
    {
      id: 'downloads',
      title: 'Downloads',
      icon: 'download',
      gradient: 'amber',
      description: 'Where files go and how they are managed.',
      entries: [
        ['default-folder', 'Default folder', 'Choose the destination for new downloads.', 'select', 'folder'],
        ['ask-each-time', 'Ask before download', 'Prompt for destination on each file.', 'toggle', 'help-circle'],
        ['parallel-limit', 'Parallel downloads', 'Limit to 1, 3, 5 or unlimited.', 'select', 'apps'],
        ['storage-cap', 'Storage cap', 'Hard limit before old downloads are pruned.', 'slider', 'archive'],
        ['auto-clean', 'Auto-clean', 'Remove finished downloads after a window.', 'select', 'sparkles'],
      ],
    },
    {
      id: 'gestures',
      title: 'Gestures',
      icon: 'finger-print',
      gradient: 'cosmic',
      description: 'Customise tap, swipe, and long-press shortcuts.',
      entries: [
        ['edge-back', 'Edge swipe back', 'Swipe from the left to navigate back.', 'toggle', 'chevron-back-circle'],
        ['pull-tabs', 'Pull-to-tabs', 'Pull down on the URL bar to open tabs.', 'toggle', 'albums'],
        ['shake-undo', 'Shake to undo', 'Shake the device to undo the last action.', 'toggle', 'phone-portrait'],
        ['long-press', 'Long-press menu', 'Show context menu on long press anywhere.', 'toggle', 'list'],
      ],
    },
    {
      id: 'ai',
      title: 'Elite AI',
      icon: 'sparkles',
      gradient: 'aurora',
      description: 'Tune the floating AI assistant.',
      entries: [
        ['ai-summaries', 'Auto summaries', 'Generate summaries on every article.', 'toggle', 'document-text'],
        ['ai-translate', 'Auto translate', 'Translate non-native pages automatically.', 'toggle', 'language'],
        ['ai-voice', 'Voice replies', 'Read assistant replies aloud.', 'toggle', 'mic'],
        ['ai-suggest', 'Suggestions', 'Show prompt suggestions in the URL bar.', 'toggle', 'bulb'],
      ],
    },
    {
      id: 'sync',
      title: 'Sync',
      icon: 'sync',
      gradient: 'ocean',
      description: 'Mocked sync between devices.',
      entries: [
        ['sync-bookmarks', 'Sync bookmarks', 'Mirror bookmarks across devices.', 'toggle', 'bookmark'],
        ['sync-history', 'Sync history', 'Mirror history across devices.', 'toggle', 'time'],
        ['sync-tabs', 'Sync open tabs', 'See open tabs from your other devices.', 'toggle', 'albums'],
        ['sync-settings', 'Sync settings', 'Keep settings consistent across devices.', 'toggle', 'settings'],
      ],
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle',
      gradient: 'midnight',
      description: 'App version, credits, and licences.',
      entries: [
        ['version', 'Version', '1.0.0 (mock build)', 'static', 'pricetag'],
        ['licences', 'Open source licences', '90+ packages used by this app.', 'link', 'document'],
        ['credits', 'Credits', 'Designed and built by Pro Browser Elite team.', 'link', 'people'],
        ['contact', 'Contact us', 'Reach out for press and partnerships.', 'link', 'mail'],
      ],
    },
  ];

  const lines = [];
  lines.push("import { ThemeGradients } from '@/types';");
  lines.push('');
  lines.push('export type SettingsControlType = ' +
    "'toggle' | 'select' | 'slider' | 'static' | 'link';");
  lines.push('');
  lines.push('export interface SettingsEntry {');
  lines.push('  id: string;');
  lines.push('  groupId: string;');
  lines.push('  label: string;');
  lines.push('  description: string;');
  lines.push('  control: SettingsControlType;');
  lines.push('  icon: string;');
  lines.push('}');
  lines.push('');
  lines.push('export interface SettingsGroup {');
  lines.push('  id: string;');
  lines.push('  title: string;');
  lines.push('  description: string;');
  lines.push('  icon: string;');
  lines.push('  gradient: keyof ThemeGradients;');
  lines.push('  entries: SettingsEntry[];');
  lines.push('}');
  lines.push('');
  lines.push('export const SETTINGS_GROUPS: SettingsGroup[] = [');
  groups.forEach((group) => {
    lines.push('  {');
    lines.push(`    id: '${group.id}',`);
    lines.push(`    title: '${escape(group.title)}',`);
    lines.push(`    description: '${escape(group.description)}',`);
    lines.push(`    icon: '${group.icon}',`);
    lines.push(`    gradient: '${group.gradient}',`);
    lines.push('    entries: [');
    group.entries.forEach(([id, label, description, control, icon]) => {
      lines.push('      {');
      lines.push(`        id: '${id}',`);
      lines.push(`        groupId: '${group.id}',`);
      lines.push(`        label: '${escape(label)}',`);
      lines.push(`        description: '${escape(description)}',`);
      lines.push(`        control: '${control}' as const,`);
      lines.push(`        icon: '${icon}',`);
      lines.push('      },');
    });
    lines.push('    ],');
    lines.push('  },');
  });
  lines.push('];');
  lines.push('');
  lines.push('export const ALL_SETTINGS_ENTRIES: SettingsEntry[] = SETTINGS_GROUPS.flatMap((g) => g.entries);');
  lines.push('');
  lines.push('export function findSettingsGroupById(id: string): SettingsGroup | undefined {');
  lines.push('  return SETTINGS_GROUPS.find((g) => g.id === id);');
  lines.push('}');
  return lines.join('\n');
}

// 3) Suggestions corpus
function emitSuggestions() {
  const lines = [];
  lines.push("import { ThemeGradients } from '@/types';");
  lines.push('');
  lines.push('export interface Suggestion {');
  lines.push('  id: string;');
  lines.push('  query: string;');
  lines.push('  description: string;');
  lines.push("  type: 'history' | 'speed-dial' | 'ai' | 'web' | 'bookmark';");
  lines.push('  gradient: keyof ThemeGradients;');
  lines.push('}');
  lines.push('');
  lines.push('export const SUGGESTION_CORPUS: Suggestion[] = [');
  const types = ['history', 'speed-dial', 'ai', 'web', 'bookmark'];
  for (let i = 0; i < 180; i += 1) {
    const seed = i + 1;
    const adj = pick(seed, ADJ);
    const noun = pick(seed * 2, NOUNS);
    const topic = pick(seed * 3, TOPICS);
    const type = types[i % types.length];
    const gradient = pick(seed * 5, GRADIENTS);
    const query = `${adj.toLowerCase()} ${topic.toLowerCase()} ${noun.toLowerCase()}`;
    const description = `${type === 'history' ? 'Visited' : type === 'speed-dial' ? 'Speed dial' : type === 'ai' ? 'Ask AI' : type === 'bookmark' ? 'Saved' : 'Search the web'} for ${query}.`;
    lines.push('  {');
    lines.push(`    id: 'sg-${i + 1}',`);
    lines.push(`    query: '${escape(query)}',`);
    lines.push(`    description: '${escape(description)}',`);
    lines.push(`    type: '${type}' as const,`);
    lines.push(`    gradient: '${gradient}',`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  lines.push('export function filterSuggestions(query: string): Suggestion[] {');
  lines.push('  const q = query.trim().toLowerCase();');
  lines.push('  if (!q) return SUGGESTION_CORPUS.slice(0, 20);');
  lines.push('  return SUGGESTION_CORPUS.filter((s) => s.query.includes(q) || s.description.toLowerCase().includes(q)).slice(0, 30);');
  lines.push('}');
  return lines.join('\n');
}

// 4) Notifications corpus
function emitNotifications() {
  const lines = [];
  lines.push("import { NotificationItem } from '@/types';");
  lines.push('');
  lines.push('const SAMPLE_TITLES = [');
  for (let i = 0; i < 40; i += 1) {
    const adj = pick(i + 1, ADJ);
    const noun = pick(i * 7 + 3, NOUNS);
    lines.push(`  '${escape(`${adj} ${noun} update`)}',`);
  }
  lines.push('];');
  lines.push('');
  lines.push("const CATEGORIES: NotificationItem['category'][] = ['system', 'download', 'security', 'ai', 'tip'];");
  lines.push('');
  lines.push('export const NOTIFICATIONS: NotificationItem[] = SAMPLE_TITLES.map((title, i) => ({');
  lines.push('  id: `notif-${i + 1}`,');
  lines.push('  title,');
  lines.push('  body: `Tap to learn more about ${title.toLowerCase()} #${i + 1}.`,');
  lines.push('  receivedAt: Date.now() - i * 1000 * 60 * 17,');
  lines.push('  read: i % 4 !== 0,');
  lines.push("  source: 'pro-browser-elite',");
  lines.push('  category: CATEGORIES[i % CATEGORIES.length],');
  lines.push('}));');
  return lines.join('\n');
}

const files = [
  ['newsCorpus.ts', emitNewsCorpus()],
  ['settingsCatalog.ts', emitSettingsCatalog()],
  ['suggestions.ts', emitSuggestions()],
  ['notifications.ts', emitNotifications()],
];

let total = 0;
files.forEach(([name, content]) => {
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, content);
  const lines = content.split('\n').length;
  total += lines;
  console.log(`  ${name}\t${lines} lines`);
});
console.log(`\nTotal generated data lines: ${total}`);
