import { ThemeGradients } from '@/types';

export type SettingsControlType = 'toggle' | 'select' | 'slider' | 'static' | 'link';

export interface SettingsEntry {
  id: string;
  groupId: string;
  label: string;
  description: string;
  control: SettingsControlType;
  icon: string;
}

export interface SettingsGroup {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: keyof ThemeGradients;
  entries: SettingsEntry[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Defaults that apply across the entire browser.',
    icon: 'settings',
    gradient: 'brand',
    entries: [
      {
        id: 'default-engine',
        groupId: 'general',
        label: 'Default search engine',
        description: 'Choose between Google, DuckDuckGo, Bing, or Ecosia.',
        control: 'select' as const,
        icon: 'globe',
      },
      {
        id: 'startup-page',
        groupId: 'general',
        label: 'Start-up page',
        description: 'Pick the screen shown when you launch the app.',
        control: 'select' as const,
        icon: 'home',
      },
      {
        id: 'theme',
        groupId: 'general',
        label: 'Theme',
        description: 'Light, dark, or follow system.',
        control: 'select' as const,
        icon: 'contrast',
      },
      {
        id: 'font-scale',
        groupId: 'general',
        label: 'Font scale',
        description: 'Resize all text from 0.8 to 1.4.',
        control: 'slider' as const,
        icon: 'text',
      },
      {
        id: 'language',
        groupId: 'general',
        label: 'Language',
        description: 'Pick from 30+ languages with mock data.',
        control: 'select' as const,
        icon: 'language',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & security',
    description: 'Trackers, ads, and cookies are handled here.',
    icon: 'shield-checkmark',
    gradient: 'forest',
    entries: [
      {
        id: 'block-trackers',
        groupId: 'privacy',
        label: 'Block trackers',
        description: 'Stops 99% of cross-site trackers.',
        control: 'toggle' as const,
        icon: 'shield',
      },
      {
        id: 'block-ads',
        groupId: 'privacy',
        label: 'Block ads',
        description: 'Removes display advertising on most sites.',
        control: 'toggle' as const,
        icon: 'eye-off',
      },
      {
        id: 'do-not-track',
        groupId: 'privacy',
        label: 'Do not track',
        description: 'Sends a DNT signal to every site.',
        control: 'toggle' as const,
        icon: 'finger-print',
      },
      {
        id: 'private-on-launch',
        groupId: 'privacy',
        label: 'Private on launch',
        description: 'Always start in incognito mode.',
        control: 'toggle' as const,
        icon: 'lock-closed',
      },
      {
        id: 'clear-on-exit',
        groupId: 'privacy',
        label: 'Clear on exit',
        description: 'Wipe history & cookies when you quit.',
        control: 'toggle' as const,
        icon: 'trash',
      },
      {
        id: 'safe-browsing',
        groupId: 'privacy',
        label: 'Safe browsing',
        description: 'Warn before visiting risky pages.',
        control: 'toggle' as const,
        icon: 'alert-circle',
      },
    ],
  },
  {
    id: 'downloads',
    title: 'Downloads',
    description: 'Where files go and how they are managed.',
    icon: 'download',
    gradient: 'amber',
    entries: [
      {
        id: 'default-folder',
        groupId: 'downloads',
        label: 'Default folder',
        description: 'Choose the destination for new downloads.',
        control: 'select' as const,
        icon: 'folder',
      },
      {
        id: 'ask-each-time',
        groupId: 'downloads',
        label: 'Ask before download',
        description: 'Prompt for destination on each file.',
        control: 'toggle' as const,
        icon: 'help-circle',
      },
      {
        id: 'parallel-limit',
        groupId: 'downloads',
        label: 'Parallel downloads',
        description: 'Limit to 1, 3, 5 or unlimited.',
        control: 'select' as const,
        icon: 'apps',
      },
      {
        id: 'storage-cap',
        groupId: 'downloads',
        label: 'Storage cap',
        description: 'Hard limit before old downloads are pruned.',
        control: 'slider' as const,
        icon: 'archive',
      },
      {
        id: 'auto-clean',
        groupId: 'downloads',
        label: 'Auto-clean',
        description: 'Remove finished downloads after a window.',
        control: 'select' as const,
        icon: 'sparkles',
      },
    ],
  },
  {
    id: 'gestures',
    title: 'Gestures',
    description: 'Customise tap, swipe, and long-press shortcuts.',
    icon: 'finger-print',
    gradient: 'cosmic',
    entries: [
      {
        id: 'edge-back',
        groupId: 'gestures',
        label: 'Edge swipe back',
        description: 'Swipe from the left to navigate back.',
        control: 'toggle' as const,
        icon: 'chevron-back-circle',
      },
      {
        id: 'pull-tabs',
        groupId: 'gestures',
        label: 'Pull-to-tabs',
        description: 'Pull down on the URL bar to open tabs.',
        control: 'toggle' as const,
        icon: 'albums',
      },
      {
        id: 'shake-undo',
        groupId: 'gestures',
        label: 'Shake to undo',
        description: 'Shake the device to undo the last action.',
        control: 'toggle' as const,
        icon: 'phone-portrait',
      },
      {
        id: 'long-press',
        groupId: 'gestures',
        label: 'Long-press menu',
        description: 'Show context menu on long press anywhere.',
        control: 'toggle' as const,
        icon: 'list',
      },
    ],
  },
  {
    id: 'ai',
    title: 'Elite AI',
    description: 'Tune the floating AI assistant.',
    icon: 'sparkles',
    gradient: 'aurora',
    entries: [
      {
        id: 'ai-summaries',
        groupId: 'ai',
        label: 'Auto summaries',
        description: 'Generate summaries on every article.',
        control: 'toggle' as const,
        icon: 'document-text',
      },
      {
        id: 'ai-translate',
        groupId: 'ai',
        label: 'Auto translate',
        description: 'Translate non-native pages automatically.',
        control: 'toggle' as const,
        icon: 'language',
      },
      {
        id: 'ai-voice',
        groupId: 'ai',
        label: 'Voice replies',
        description: 'Read assistant replies aloud.',
        control: 'toggle' as const,
        icon: 'mic',
      },
      {
        id: 'ai-suggest',
        groupId: 'ai',
        label: 'Suggestions',
        description: 'Show prompt suggestions in the URL bar.',
        control: 'toggle' as const,
        icon: 'bulb',
      },
    ],
  },
  {
    id: 'sync',
    title: 'Sync',
    description: 'Mocked sync between devices.',
    icon: 'sync',
    gradient: 'ocean',
    entries: [
      {
        id: 'sync-bookmarks',
        groupId: 'sync',
        label: 'Sync bookmarks',
        description: 'Mirror bookmarks across devices.',
        control: 'toggle' as const,
        icon: 'bookmark',
      },
      {
        id: 'sync-history',
        groupId: 'sync',
        label: 'Sync history',
        description: 'Mirror history across devices.',
        control: 'toggle' as const,
        icon: 'time',
      },
      {
        id: 'sync-tabs',
        groupId: 'sync',
        label: 'Sync open tabs',
        description: 'See open tabs from your other devices.',
        control: 'toggle' as const,
        icon: 'albums',
      },
      {
        id: 'sync-settings',
        groupId: 'sync',
        label: 'Sync settings',
        description: 'Keep settings consistent across devices.',
        control: 'toggle' as const,
        icon: 'settings',
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    description: 'App version, credits, and licences.',
    icon: 'information-circle',
    gradient: 'midnight',
    entries: [
      {
        id: 'version',
        groupId: 'about',
        label: 'Version',
        description: '1.0.0 (mock build)',
        control: 'static' as const,
        icon: 'pricetag',
      },
      {
        id: 'licences',
        groupId: 'about',
        label: 'Open source licences',
        description: '90+ packages used by this app.',
        control: 'link' as const,
        icon: 'document',
      },
      {
        id: 'credits',
        groupId: 'about',
        label: 'Credits',
        description: 'Designed and built by Pro Browser Elite team.',
        control: 'link' as const,
        icon: 'people',
      },
      {
        id: 'contact',
        groupId: 'about',
        label: 'Contact us',
        description: 'Reach out for press and partnerships.',
        control: 'link' as const,
        icon: 'mail',
      },
    ],
  },
];

export const ALL_SETTINGS_ENTRIES: SettingsEntry[] = SETTINGS_GROUPS.flatMap((g) => g.entries);

export function findSettingsGroupById(id: string): SettingsGroup | undefined {
  return SETTINGS_GROUPS.find((g) => g.id === id);
}