import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  themeMode: '@pbe/theme-mode',
  favorites: '@pbe/favorites',
  history: '@pbe/history',
  bookmarks: '@pbe/bookmarks',
  bookmarkFolders: '@pbe/bookmark-folders',
  tabs: '@pbe/tabs',
  downloads: '@pbe/downloads',
  settings: '@pbe/settings',
  aiHistory: '@pbe/ai-history',
  notifications: '@pbe/notifications',
  speedDials: '@pbe/speed-dials',
  recentSearches: '@pbe/recent-searches',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
