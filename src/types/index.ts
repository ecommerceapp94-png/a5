export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceAlt: string;
  glass: string;
  glassBorder: string;
  neuLight: string;
  neuDark: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  border: string;
  divider: string;
  overlay: string;
  shadow: string;
  ripple: string;
}

export interface ThemeGradients {
  brand: string[];
  sunset: string[];
  ocean: string[];
  aurora: string[];
  forest: string[];
  candy: string[];
  midnight: string[];
  amber: string[];
  cosmic: string[];
  neon: string[];
  pastel: string[];
  fire: string[];
}

export interface ThemeRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
  round: number;
}

export interface ThemeSpacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  display: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  body: number;
  bodySm: number;
  caption: number;
  micro: number;
}

export interface AppTheme {
  mode: ThemeMode;
  colors: ThemeColors;
  gradients: ThemeGradients;
  radius: ThemeRadius;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
}

export interface SpeedDialItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  gradient: keyof ThemeGradients;
  category: string;
  description: string;
  visits: number;
  rating: number;
  tags: string[];
  trending: boolean;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon: string;
  active: boolean;
  isPrivate: boolean;
  loadProgress: number;
  createdAt: number;
  lastVisitedAt: number;
  scrollY: number;
  cookiesEnabled: boolean;
  jsEnabled: boolean;
  zoom: number;
  desktopSite: boolean;
  notes: string;
  pinned: boolean;
  group: string | null;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  icon: string;
  gradient: keyof ThemeGradients;
  description: string;
  bookmarkIds: string[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  color: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  folderId: string;
  favicon: string;
  tags: string[];
  rating: number;
  notes: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  visitCount: number;
}

export interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  favicon: string;
  visitedAt: number;
  durationMs: number;
  scrollDepth: number;
  device: string;
  referer: string;
  location: string;
  tags: string[];
}

export interface DownloadItem {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  downloadedAt: number;
  status: 'completed' | 'in_progress' | 'paused' | 'failed';
  progress: number;
  destinationPath: string;
  source: string;
  description: string;
  tags: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}

export interface BrowserSettings {
  defaultSearchEngine: 'google' | 'bing' | 'duckduckgo' | 'yahoo' | 'ecosia';
  blockTrackers: boolean;
  blockAds: boolean;
  doNotTrack: boolean;
  saveHistory: boolean;
  privateModeOnLaunch: boolean;
  autoFillPasswords: boolean;
  showSuggestions: boolean;
  fontScale: number;
  themePreference: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
  motionReduce: boolean;
  downloadFolder: string;
  askBeforeDownload: boolean;
  prefetchEnabled: boolean;
  storageLimitMB: number;
}

export interface AnalyticsBucket {
  label: string;
  value: number;
  trend: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  receivedAt: number;
  read: boolean;
  source: string;
  category: 'system' | 'download' | 'security' | 'ai' | 'tip';
}
