import { NavigatorScreenParams } from '@react-navigation/native';

export type BrowserStackParamList = {
  BrowserHome: undefined;
  BrowserWebView: { dialId: string };
  BrowserUrlEditor: { dialId?: string; suggestionsSeed?: number };
  BrowserContextMenu: { dialId: string; section?: string };
  BrowserExtras: { dialId: string; section: string };
  BrowserCategory: { categoryId: string };
  BrowserNewsFeed: undefined;
  BrowserNewsArticle: { articleId: string };
  BrowserSpeedDialDetail: { dialId: string };
  BrowserHistorySnippet: { snippetId: string };
  BrowserSearchSuggestions: { query: string };
};

export type TabsStackParamList = {
  TabsList: undefined;
  TabsPreview: { tabId: string };
  TabsSettings: { tabId: string };
  TabsAdvanced: { tabId: string };
  TabsGroup: { groupId: string };
  TabsArchive: undefined;
  TabsArchiveItem: { tabId: string };
  TabsCloseAll: undefined;
  TabsAnalytics: undefined;
  TabsAnalyticsDetail: { metricId: string };
};

export type BookmarksStackParamList = {
  BookmarksHome: undefined;
  BookmarksFolder: { folderId: string };
  BookmarksItem: { bookmarkId: string };
  BookmarksOrganize: { folderId: string };
  BookmarksItemEdit: { bookmarkId: string };
  BookmarksFolderEdit: { folderId: string };
  BookmarksSearch: undefined;
  BookmarksImport: undefined;
  BookmarksExport: undefined;
};

export type HistoryStackParamList = {
  HistoryHome: undefined;
  HistoryDay: { dayKey: string };
  HistoryEntry: { entryId: string };
  HistoryEntryOptions: { entryId: string };
  HistorySearch: undefined;
  HistoryClear: undefined;
  HistoryAnalytics: undefined;
  HistoryDeviceDetail: { device: string };
};

export type DownloadsStackParamList = {
  DownloadsList: undefined;
  DownloadsPreview: { downloadId: string };
  DownloadsActions: { downloadId: string };
  DownloadsSettings: undefined;
  DownloadsLocations: undefined;
  DownloadsSchedule: undefined;
  DownloadsAnalytics: undefined;
  DownloadsCategoryDetail: { category: string };
};

export type RootTabParamList = {
  BrowserTab: NavigatorScreenParams<BrowserStackParamList>;
  TabsTab: NavigatorScreenParams<TabsStackParamList>;
  BookmarksTab: NavigatorScreenParams<BookmarksStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  DownloadsTab: NavigatorScreenParams<DownloadsStackParamList>;
};
