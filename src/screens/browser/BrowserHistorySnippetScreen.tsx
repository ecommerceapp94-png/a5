import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { NeumorphicSurface } from '@/components/NeumorphicSurface';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton, SkeletonRow } from '@/components/Skeleton';
import { StatPill } from '@/components/StatPill';
import { TagChip } from '@/components/TagChip';
import { Divider } from '@/components/Divider';
import { IconBadge } from '@/components/IconBadge';
import { InfoRow } from '@/components/InfoRow';
import { MenuRow } from '@/components/MenuRow';
import { SwitchRow } from '@/components/SwitchRow';
import { ProgressBar } from '@/components/ProgressBar';
import { AvatarBadge } from '@/components/AvatarBadge';
import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import { useAIAssistant } from '@/components/ai/AIAssistantContext';
import { triggerHaptic } from '@/utils/haptics';
import { formatRelativeTime, formatBytes, formatNumber, truncate, formatDuration, formatTimeOfDay, domainOf, formatDate, toTitleCase } from '@/utils/format';
import { ThemeGradients } from '@/types';

interface MockEntry {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: keyof ThemeGradients;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  meta: string;
  stat1: number;
  stat2: number;
  stat3: string;
  verb: string;
}

interface SectionConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: keyof ThemeGradients;
}

const HERO_ACTIONS: Array<{ id: string; label: string; icon: string; hint: string }> = [
  { id: 'open', label: 'Open in webview', icon: 'compass', hint: 'Loads mock content with skeletons.' },
  { id: 'pin', label: 'Pin to top', icon: 'pin', hint: 'Pins this surface to the speed dial.' },
  { id: 'share', label: 'Share to AI', icon: 'sparkles', hint: 'Sends context into Elite AI.' },
  { id: 'save', label: 'Save offline', icon: 'cloud-download', hint: 'Saves a stub asset locally.' },
  { id: 'tags', label: 'Edit tags', icon: 'pricetag', hint: 'Open the tag editor sheet.' },
  { id: 'private', label: 'Open private', icon: 'shield-checkmark', hint: 'Opens an isolated session.' },
];

const MOCK_PRIMARY: MockEntry[] = [
  {
    id: 'item-2841-1',
    title: 'Brisk Pulse 1',
    description: 'pixel or alive and and for beautiful with private feel long browsing alive every. beautiful considered experience A and considered with long modes tap long tap and alive browsing with dark long. designed tap designed and in gestures every remaining every light press private',
    icon: 'lock-closed',
    gradient: 'cosmic',
    tone: 'info',
    meta: '56 mins ago',
    stat1: 693,
    stat2: 88,
    stat3: '2.9',
    verb: 'Opened',
  },
  {
    id: 'item-2841-2',
    title: 'Elite Pulse 2',
    description: 'or alive and and for beautiful with private feel long browsing alive every tap. experience A and considered with long modes tap long tap and alive browsing with dark long curated designed. and in gestures every remaining every light press private haptics remaining curated',
    icon: 'planet',
    gradient: 'forest',
    tone: 'primary',
    meta: '57 mins ago',
    stat1: 706,
    stat2: 95,
    stat3: '4.8',
    verb: 'Read',
  },
  {
    id: 'item-2841-3',
    title: 'Elite Tapestry 3',
    description: 'alive and and for beautiful with private feel long browsing alive every tap in. and considered with long modes tap long tap and alive browsing with dark long curated designed haptics haptics. every remaining every light press private haptics remaining curated long for every',
    icon: 'extension-puzzle',
    gradient: 'brand',
    tone: 'success',
    meta: '58 mins ago',
    stat1: 719,
    stat2: 3,
    stat3: '1.7',
    verb: 'Highlighted',
  },
  {
    id: 'item-2841-4',
    title: 'Subtle Beacon 4',
    description: 'and and for beautiful with private feel long browsing alive every tap in feel. with long modes tap long tap and alive browsing with dark long curated designed haptics haptics haptics browsing. light press private haptics remaining curated long for every every forever across',
    icon: 'cafe',
    gradient: 'amber',
    tone: 'info',
    meta: '59 mins ago',
    stat1: 732,
    stat2: 10,
    stat3: '3.6',
    verb: 'Opened',
  },
  {
    id: 'item-2841-5',
    title: 'Velvet Lens 5',
    description: 'and for beautiful with private feel long browsing alive every tap in feel feel. modes tap long tap and alive browsing with dark long curated designed haptics haptics haptics browsing across experience. haptics remaining curated long for every every forever across tap press browsing',
    icon: 'flag',
    gradient: 'pastel',
    tone: 'primary',
    meta: '60 mins ago',
    stat1: 745,
    stat2: 17,
    stat3: '0.5',
    verb: 'Translated',
  },
  {
    id: 'item-2841-6',
    title: 'Glassy Compass 6',
    description: 'for beautiful with private feel long browsing alive every tap in feel feel light. long tap and alive browsing with dark long curated designed haptics haptics haptics browsing across experience and that. long for every every forever across tap press browsing for pixel that',
    icon: 'shield',
    gradient: 'brand',
    tone: 'primary',
    meta: '61 mins ago',
    stat1: 758,
    stat2: 24,
    stat3: '2.4',
    verb: 'Translated',
  },
  {
    id: 'item-2841-7',
    title: 'Snappy Halo 7',
    description: 'beautiful with private feel long browsing alive every tap in feel feel light that. and alive browsing with dark long curated designed haptics haptics haptics browsing across experience and that haptics curated. every forever across tap press browsing for pixel that gestures and browsing',
    icon: 'musical-notes',
    gradient: 'midnight',
    tone: 'primary',
    meta: '62 mins ago',
    stat1: 771,
    stat2: 31,
    stat3: '4.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2841-8',
    title: 'Buttery Beacon 8',
    description: 'with private feel long browsing alive every tap in feel feel light that in. browsing with dark long curated designed haptics haptics haptics browsing across experience and that haptics curated while fluid. tap press browsing for pixel that gestures and browsing curated beautiful fluid',
    icon: 'musical-notes',
    gradient: 'midnight',
    tone: 'success',
    meta: '63 mins ago',
    stat1: 784,
    stat2: 38,
    stat3: '1.2',
    verb: 'Saved',
  },
  {
    id: 'item-2841-9',
    title: 'Velvet Studio 9',
    description: 'private feel long browsing alive every tap in feel feel light that in remaining. dark long curated designed haptics haptics haptics browsing across experience and that haptics curated while fluid alive designed. for pixel that gestures and browsing curated beautiful fluid A and fast',
    icon: 'eye',
    gradient: 'sunset',
    tone: 'info',
    meta: '64 mins ago',
    stat1: 797,
    stat2: 45,
    stat3: '3.1',
    verb: 'Saved',
  },
  {
    id: 'item-2841-10',
    title: 'Vibrant Studio 10',
    description: 'feel long browsing alive every tap in feel feel light that in remaining and. curated designed haptics haptics haptics browsing across experience and that haptics curated while fluid alive designed fluid pixel. gestures and browsing curated beautiful fluid A and fast tap browsing curated',
    icon: 'musical-notes',
    gradient: 'forest',
    tone: 'info',
    meta: '65 mins ago',
    stat1: 810,
    stat2: 52,
    stat3: '0.0',
    verb: 'Visited',
  },
  {
    id: 'item-2841-11',
    title: 'Vibrant Atlas 11',
    description: 'long browsing alive every tap in feel feel light that in remaining and fluid. haptics haptics haptics browsing across experience and that haptics curated while fluid alive designed fluid pixel and fast. curated beautiful fluid A and fast tap browsing curated forever and pixel',
    icon: 'rocket',
    gradient: 'forest',
    tone: 'danger',
    meta: '66 mins ago',
    stat1: 823,
    stat2: 59,
    stat3: '1.9',
    verb: 'Opened',
  },
  {
    id: 'item-2841-12',
    title: 'Lush Insight 12',
    description: 'browsing alive every tap in feel feel light that in remaining and fluid pixel. haptics browsing across experience and that haptics curated while fluid alive designed fluid pixel and fast fast every. A and fast tap browsing curated forever and pixel in forever fast',
    icon: 'shield',
    gradient: 'aurora',
    tone: 'primary',
    meta: '67 mins ago',
    stat1: 836,
    stat2: 66,
    stat3: '3.8',
    verb: 'Opened',
  },
  {
    id: 'item-2841-13',
    title: 'Premium Beacon 13',
    description: 'alive every tap in feel feel light that in remaining and fluid pixel long. across experience and that haptics curated while fluid alive designed fluid pixel and fast fast every that every. tap browsing curated forever and pixel in forever fast haptics designed pixel',
    icon: 'cart',
    gradient: 'brand',
    tone: 'primary',
    meta: '68 mins ago',
    stat1: 849,
    stat2: 73,
    stat3: '0.7',
    verb: 'Read',
  },
  {
    id: 'item-2841-14',
    title: 'Velvet Mosaic 14',
    description: 'every tap in feel feel light that in remaining and fluid pixel long curated. and that haptics curated while fluid alive designed fluid pixel and fast fast every that every for gestures. forever and pixel in forever fast haptics designed pixel alive curated tap',
    icon: 'extension-puzzle',
    gradient: 'brand',
    tone: 'success',
    meta: '69 mins ago',
    stat1: 862,
    stat2: 80,
    stat3: '2.6',
    verb: 'Followed',
  },
  {
    id: 'item-2841-15',
    title: 'Deep Beacon 15',
    description: 'tap in feel feel light that in remaining and fluid pixel long curated and. haptics curated while fluid alive designed fluid pixel and fast fast every that every for gestures light haptics. in forever fast haptics designed pixel alive curated tap remaining press on',
    icon: 'school',
    gradient: 'amber',
    tone: 'accent',
    meta: '70 mins ago',
    stat1: 875,
    stat2: 87,
    stat3: '4.5',
    verb: 'Visited',
  },
  {
    id: 'item-2841-16',
    title: 'Velvet Lens 16',
    description: 'in feel feel light that in remaining and fluid pixel long curated and that. while fluid alive designed fluid pixel and fast fast every that every for gestures light haptics A for. haptics designed pixel alive curated tap remaining press on in browsing fast',
    icon: 'star',
    gradient: 'fire',
    tone: 'danger',
    meta: '71 mins ago',
    stat1: 888,
    stat2: 94,
    stat3: '1.4',
    verb: 'Archived',
  },
  {
    id: 'item-2841-17',
    title: 'Glassy Mosaic 17',
    description: 'feel feel light that in remaining and fluid pixel long curated and that that. alive designed fluid pixel and fast fast every that every for gestures light haptics A for haptics every. alive curated tap remaining press on in browsing fast for pixel haptics',
    icon: 'speedometer',
    gradient: 'aurora',
    tone: 'danger',
    meta: '72 mins ago',
    stat1: 901,
    stat2: 2,
    stat3: '3.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2841-18',
    title: 'Deep Compass 18',
    description: 'feel light that in remaining and fluid pixel long curated and that that browsing. fluid pixel and fast fast every that every for gestures light haptics A for haptics every for private. remaining press on in browsing fast for pixel haptics while fluid fluid',
    icon: 'book',
    gradient: 'neon',
    tone: 'success',
    meta: '73 mins ago',
    stat1: 914,
    stat2: 9,
    stat3: '0.2',
    verb: 'Shared',
  },
  {
    id: 'item-2841-19',
    title: 'Snappy Compass 19',
    description: 'light that in remaining and fluid pixel long curated and that that browsing forever. and fast fast every that every for gestures light haptics A for haptics every for private curated and. in browsing fast for pixel haptics while fluid fluid fast light private',
    icon: 'musical-notes',
    gradient: 'sunset',
    tone: 'accent',
    meta: '74 mins ago',
    stat1: 927,
    stat2: 16,
    stat3: '2.1',
    verb: 'Shared',
  },
  {
    id: 'item-2841-20',
    title: 'Snappy Quest 20',
    description: 'that in remaining and fluid pixel long curated and that that browsing forever gestures. fast every that every for gestures light haptics A for haptics every for private curated and for considered. for pixel haptics while fluid fluid fast light private press beautiful modes',
    icon: 'cafe',
    gradient: 'candy',
    tone: 'accent',
    meta: '75 mins ago',
    stat1: 940,
    stat2: 23,
    stat3: '4.0',
    verb: 'Translated',
  },
  {
    id: 'item-2841-21',
    title: 'Polished Forge 21',
    description: 'in remaining and fluid pixel long curated and that that browsing forever gestures experience. that every for gestures light haptics A for haptics every for private curated and for considered on across. while fluid fluid fast light private press beautiful modes with curated considered',
    icon: 'pulse',
    gradient: 'candy',
    tone: 'primary',
    meta: '76 mins ago',
    stat1: 953,
    stat2: 30,
    stat3: '0.9',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2841-22',
    title: 'Silky Echo 22',
    description: 'remaining and fluid pixel long curated and that that browsing forever gestures experience curated. for gestures light haptics A for haptics every for private curated and for considered on across considered designed. fast light private press beautiful modes with curated considered with in pixel',
    icon: 'gift',
    gradient: 'midnight',
    tone: 'success',
    meta: '77 mins ago',
    stat1: 966,
    stat2: 37,
    stat3: '2.8',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2841-23',
    title: 'Brisk Quest 23',
    description: 'and fluid pixel long curated and that that browsing forever gestures experience curated haptics. light haptics A for haptics every for private curated and for considered on across considered designed every forever. press beautiful modes with curated considered with in pixel dark or and',
    icon: 'layers',
    gradient: 'sunset',
    tone: 'success',
    meta: '78 mins ago',
    stat1: 979,
    stat2: 44,
    stat3: '4.7',
    verb: 'Followed',
  },
  {
    id: 'item-2841-24',
    title: 'Polished Saga 24',
    description: 'fluid pixel long curated and that that browsing forever gestures experience curated haptics modes. A for haptics every for private curated and for considered on across considered designed every forever long dark. with curated considered with in pixel dark or and haptics light A',
    icon: 'flame',
    gradient: 'sunset',
    tone: 'accent',
    meta: '79 mins ago',
    stat1: 992,
    stat2: 51,
    stat3: '1.6',
    verb: 'Followed',
  },
  {
    id: 'item-2841-25',
    title: 'Frosted Atlas 25',
    description: 'pixel long curated and that that browsing forever gestures experience curated haptics modes across. haptics every for private curated and for considered on across considered designed every forever long dark modes on. with in pixel dark or and haptics light A considered every feel',
    icon: 'eye',
    gradient: 'fire',
    tone: 'accent',
    meta: '80 mins ago',
    stat1: 25,
    stat2: 58,
    stat3: '3.5',
    verb: 'Translated',
  },
  {
    id: 'item-2841-26',
    title: 'Lush Quest 26',
    description: 'long curated and that that browsing forever gestures experience curated haptics modes across light. for private curated and for considered on across considered designed every forever long dark modes on while browsing. dark or and haptics light A considered every feel across alive experience',
    icon: 'globe',
    gradient: 'fire',
    tone: 'primary',
    meta: '81 mins ago',
    stat1: 38,
    stat2: 65,
    stat3: '0.4',
    verb: 'Followed',
  },
  {
    id: 'item-2841-27',
    title: 'Polished Mosaic 27',
    description: 'curated and that that browsing forever gestures experience curated haptics modes across light for. curated and for considered on across considered designed every forever long dark modes on while browsing tap curated. haptics light A considered every feel across alive experience gestures for tap',
    icon: 'trophy',
    gradient: 'midnight',
    tone: 'accent',
    meta: '82 mins ago',
    stat1: 51,
    stat2: 72,
    stat3: '2.3',
    verb: 'Pinned',
  },
  {
    id: 'item-2841-28',
    title: 'Deep Mosaic 28',
    description: 'and that that browsing forever gestures experience curated haptics modes across light for pixel. for considered on across considered designed every forever long dark modes on while browsing tap curated beautiful designed. considered every feel across alive experience gestures for tap pixel designed fluid',
    icon: 'compass',
    gradient: 'fire',
    tone: 'warning',
    meta: '83 mins ago',
    stat1: 64,
    stat2: 79,
    stat3: '4.2',
    verb: 'Searched',
  },
  {
    id: 'item-2841-29',
    title: 'Deep Halo 29',
    description: 'that that browsing forever gestures experience curated haptics modes across light for pixel private. on across considered designed every forever long dark modes on while browsing tap curated beautiful designed and on. across alive experience gestures for tap pixel designed fluid gestures experience in',
    icon: 'speedometer',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '84 mins ago',
    stat1: 77,
    stat2: 86,
    stat3: '1.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2841-30',
    title: 'Buttery Aurora 30',
    description: 'that browsing forever gestures experience curated haptics modes across light for pixel private fluid. considered designed every forever long dark modes on while browsing tap curated beautiful designed and on and curated. gestures for tap pixel designed fluid gestures experience in modes on with',
    icon: 'film',
    gradient: 'ocean',
    tone: 'success',
    meta: '85 mins ago',
    stat1: 90,
    stat2: 93,
    stat3: '3.0',
    verb: 'Highlighted',
  },
  {
    id: 'item-2841-31',
    title: 'Sleek Lens 31',
    description: 'browsing forever gestures experience curated haptics modes across light for pixel private fluid every. every forever long dark modes on while browsing tap curated beautiful designed and on and curated beautiful or. pixel designed fluid gestures experience in modes on with for long A',
    icon: 'compass',
    gradient: 'sunset',
    tone: 'info',
    meta: '86 mins ago',
    stat1: 103,
    stat2: 1,
    stat3: '4.9',
    verb: 'Highlighted',
  },
  {
    id: 'item-2841-32',
    title: 'Glassy Halo 32',
    description: 'forever gestures experience curated haptics modes across light for pixel private fluid every considered. long dark modes on while browsing tap curated beautiful designed and on and curated beautiful or long long. gestures experience in modes on with for long A browsing private while',
    icon: 'lock-closed',
    gradient: 'pastel',
    tone: 'info',
    meta: '87 mins ago',
    stat1: 116,
    stat2: 8,
    stat3: '1.8',
    verb: 'Translated',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-48297-1',
    title: 'Frosted Forge',
    subtitle: 'tap while beautiful long or feel press curated haptics remaining forever every every in. long every with light haptics on haptics curated considered gestures A modes private long considered fluid beautiful remaining. beautiful that tap curated private in curated fast beautiful and while gestures',
    icon: 'cart',
    gradient: 'aurora',
  },
  {
    id: 'section-48297-2',
    title: 'Subtle Loom',
    subtitle: 'every every in fluid gestures tap private haptics tap while pixel and press fluid. or and for haptics browsing tap every tap that for and every every dark across curated browsing in. private alive browsing haptics tap browsing with or that A every long',
    icon: 'book',
    gradient: 'neon',
  },
  {
    id: 'section-48297-3',
    title: 'Dreamy Studio',
    subtitle: 'and press fluid and and across press and and and and experience for with. pixel A press fluid light remaining alive in light A haptics long feel that on or private for. and alive gestures curated pixel designed light and haptics fast modes forever',
    icon: 'newspaper',
    gradient: 'cosmic',
  },
  {
    id: 'section-48297-4',
    title: 'Cosmic Loom',
    subtitle: 'experience for with alive every modes A beautiful with on gestures for feel and. alive A every while or forever forever across and dark with haptics designed long feel while designed in. modes tap alive considered private modes every tap remaining curated in fast',
    icon: 'heart',
    gradient: 'neon',
  },
  {
    id: 'section-48297-5',
    title: 'Frosted Tapestry',
    subtitle: 'for feel and in every dark every beautiful modes beautiful alive every alive that. haptics forever across every and press alive pixel fast every and beautiful browsing fast every for or while. tap fast dark with gestures across gestures pixel every alive on press',
    icon: 'heart',
    gradient: 'ocean',
  },
  {
    id: 'section-48297-6',
    title: 'Lush Mosaic',
    subtitle: 'every alive that light with every experience for gestures designed and A across A. on light considered pixel and alive every press dark fast tap pixel tap remaining private that light and. browsing light fluid beautiful browsing fluid on every in browsing on light',
    icon: 'lock-closed',
    gradient: 'brand',
  },
  {
    id: 'section-48297-7',
    title: 'Subtle Studio',
    subtitle: 'A across A pixel for or designed with tap A every considered on A. pixel every gestures remaining every on with browsing with every pixel private A or forever modes browsing experience. press considered long and while fluid and light modes and remaining dark',
    icon: 'compass',
    gradient: 'aurora',
  },
  {
    id: 'section-48297-8',
    title: 'Silky Spark',
    subtitle: 'considered on A considered press designed and long on considered alive forever fluid alive. every private with light press considered private while every browsing curated browsing considered browsing every browsing or considered. experience and for designed remaining fluid every long and gestures curated considered',
    icon: 'flag',
    gradient: 'brand',
  },
  {
    id: 'section-48297-9',
    title: 'Snappy Forge',
    subtitle: 'forever fluid alive in gestures remaining and forever beautiful designed that for that on. feel tap across press tap that considered across and pixel curated every and every for every beautiful fast. feel feel and in feel modes fast beautiful dark gestures and and',
    icon: 'compass',
    gradient: 'ocean',
  },
  {
    id: 'section-48297-10',
    title: 'Elite Forge',
    subtitle: 'for that on across considered in modes and across gestures designed forever gestures experience. every gestures forever beautiful feel gestures tap dark dark alive dark or every with dark modes light dark. private curated beautiful beautiful curated while every for haptics pixel in and',
    icon: 'leaf',
    gradient: 'aurora',
  },
  {
    id: 'section-48297-11',
    title: 'Punchy Saga',
    subtitle: 'forever gestures experience and light fluid for and fast experience with tap curated every. in experience pixel fluid experience on light light and every remaining gestures experience press that long dark tap. long A browsing browsing and tap private considered haptics gestures modes press',
    icon: 'pizza',
    gradient: 'cosmic',
  },
  {
    id: 'section-48297-12',
    title: 'Brisk Insight',
    subtitle: 'tap curated every and across and in gestures or beautiful modes for browsing forever. and across gestures designed considered forever pixel private while designed for across tap fast with press forever alive. considered while on tap forever considered experience every or considered dark alive',
    icon: 'grid',
    gradient: 'ocean',
  },
  {
    id: 'section-48297-13',
    title: 'Velvet Compass',
    subtitle: 'for browsing forever press forever gestures tap designed haptics every modes pixel remaining browsing. forever fast alive feel gestures across tap and A with every browsing A beautiful beautiful modes light while. tap press press and every remaining curated and for haptics gestures fast',
    icon: 'layers',
    gradient: 'brand',
  },
  {
    id: 'section-48297-14',
    title: 'Premium Tapestry',
    subtitle: 'pixel remaining browsing light every tap fluid remaining every and light haptics and gestures. across tap designed A and fluid remaining beautiful or gestures remaining on private long beautiful every in browsing. alive A and fluid and and remaining pixel beautiful fast private for',
    icon: 'star',
    gradient: 'forest',
  },
];

const HERO_TITLE = 'History snippet';
const HERO_SUBTITLE = 'Mini history detail surfaced from any tab.';
const FOOTER_TITLE = 'Keep going with History snippet';
const FOOTER_BODY = 'designed tap designed and in gestures every remaining every light press private haptics remaining. modes and haptics designed every that and in feel forever pixel press gestures forever modes on designed press. every and with dark forever curated and experience curated dark across for';

export const BrowserHistorySnippetScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const ai = useAIAssistant();

  const stats = useMemo(
    () => [
      { label: 'sessions', value: `${formatNumber(MOCK_PRIMARY.length * 12)}`, tone: 'primary' as const, icon: 'analytics' as const },
      { label: 'minutes', value: `${formatNumber(MOCK_PRIMARY.length * 7)}`, tone: 'success' as const, icon: 'time' as const },
      { label: 'bookmarks', value: `${formatNumber(MOCK_PRIMARY.length * 3 + 12)}`, tone: 'info' as const, icon: 'bookmark' as const },
      { label: 'devices', value: `${5}`, tone: 'warning' as const, icon: 'phone-portrait' as const },
      { label: 'private', value: `${MOCK_PRIMARY.filter((m) => m.stat2 % 2 === 0).length}`, tone: 'accent' as const, icon: 'shield-checkmark' as const },
    ],
    [],
  );


  const FILTER_TABS = useMemo(
    () => ['All', 'Today', 'This week', 'Pinned', 'Recent', 'Trending'],
    [],
  );
  const [activeFilter, setActiveFilter] = useState(0);
  const filteredItems = useMemo(() => {
    if (activeFilter === 0) return MOCK_PRIMARY;
    if (activeFilter === 3) return MOCK_PRIMARY.filter((_, i) => i % 3 === 0);
    if (activeFilter === 4) return MOCK_PRIMARY.slice(0, Math.min(32, 18));
    if (activeFilter === 5) return MOCK_PRIMARY.filter((_, i) => i % 5 === 0);
    return MOCK_PRIMARY.slice(0, 21);
  }, [activeFilter]);


  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerHaptic('selection');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRefreshing(false);
    Toast.show({ type: 'success', text1: 'Refreshed', text2: 'Mock data reloaded.' });
  }, []);


  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, []);


  const goNext = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('BrowserSpeedDialDetail', { dialId: 'dial-1' });
    },
    [navigation],
  );
  const goAlt = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('BrowserWebView', { dialId: 'dial-1' });
    },
    [navigation],
  );
  const goDeep = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('BrowserUrlEditor', { dialId: 'dial-1' });
    },
    [navigation],
  );

  return (
    <ScreenContainer
      variant="forest"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="History snippet"
        subtitle="Mini history detail surfaced from any tab."
        showBack={true}
        rightIcon="time"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="forest"
        badge="Snippet"
      />

        <Animated.View entering={FadeInDown.delay(80)} style={styles.heroCard}>
          <NeumorphicSurface intensity="strong" radius={28}>
            <View style={styles.heroRow}>
              <IconBadge name="sparkles" variant="cosmic" size={56} iconSize={26} />
              <View style={styles.heroTextWrap}>
                <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{HERO_TITLE}</Text>
                <Text style={[styles.heroSubtitle, { color: theme.colors.textMuted }]}>{HERO_SUBTITLE}</Text>
              </View>
            </View>
            <View style={styles.heroActions}>
              {HERO_ACTIONS.map((action, idx) => (
                <PressableScale
                  key={action.id}
                  haptic="selection"
                  onPress={() => {
                    Toast.show({ type: 'info', text1: action.label, text2: action.hint });
                  }}
                  style={[
                    styles.actionPill,
                    { backgroundColor: theme.colors.primarySoft },
                  ]}
                >
                  <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={14} color={theme.colors.primary} />
                  <Text style={[styles.actionPillLabel, { color: theme.colors.primary }]}>{action.label}</Text>
                </PressableScale>
              ))}
            </View>
          </NeumorphicSurface>
        </Animated.View>


        <Animated.View entering={FadeInDown.delay(140)} style={styles.statRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statPillWrap}>
              <StatPill label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
            </View>
          ))}
        </Animated.View>


        <Animated.View entering={FadeInDown.delay(180)} style={styles.filterRow}>
          {FILTER_TABS.map((label, i) => (
            <TagChip
              key={label}
              label={label.toLowerCase()}
              tone="info"
              active={activeFilter === i}
              onPress={() => {
                triggerHaptic('selection');
                setActiveFilter(i);
              }}
            />
          ))}
        </Animated.View>


        <Animated.View entering={FadeIn.delay(180)}>
          <SectionHeader
            title="Quick access"
            subtitle="Tappable tiles that push a deeper screen with mock context."
            actionLabel="See more"
            onAction={() => {
              if (filteredItems[0]) goNext(filteredItems[0]);
            }}
            icon="grid"
          />
          <View style={styles.gridRow}>
            {filteredItems.slice(0, 8).map((entry) => (
              <PressableScale
                key={entry.id}
                haptic="medium"
                onPress={() => goNext(entry)}
                onLongPress={() => goAlt(entry)}
                style={styles.gridCellWrap}
              >
                <View style={[styles.gridCell, { backgroundColor: theme.colors.surface }]}> 
                  <LinearGradient
                    colors={theme.gradients[entry.gradient] as unknown as string[]}
                    style={[styles.heroBackground, { opacity: 0.18 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <IconBadge name={entry.icon} variant={entry.gradient} size={44} iconSize={22} />
                  <Text style={[styles.gridCellTitle, { color: theme.colors.text }]}>{entry.title}</Text>
                  <Text style={[styles.gridCellMeta, { color: theme.colors.textMuted }]} numberOfLines={2}>
                    {entry.description}
                  </Text>
                  <View style={styles.accentRow}>
                    <View style={[styles.accentDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.gridCellMeta, { color: theme.colors.textMuted, marginLeft: 6 }]}>
                      {entry.meta}
                    </Text>
                  </View>
                </View>
              </PressableScale>
            ))}
          </View>
        </Animated.View>


        <Animated.View entering={FadeIn.delay(220)}>
          <SectionHeader
            title="Continue exploring"
            subtitle="Every row opens a fully detailed screen with deeper context."
            actionLabel="Open all"
            onAction={() => {
              if (filteredItems[0]) goAlt(filteredItems[0]);
            }}
            icon="layers"
          />
          {(loading ? Array.from({ length: 5 }) : filteredItems).map((entry, i) => {
            if (loading) {
              return (
                <View key={`sk-${i}`} style={{ marginBottom: 12 }}>
                  <Skeleton height={84} radius={20} />
                </View>
              );
            }
            const item = entry as MockEntry;
            return (
              <PressableScale
                key={item.id}
                haptic="light"
                onPress={() => goNext(item)}
                onLongPress={() => goDeep(item)}
              >
                <GlassCard padded contentStyle={{ padding: 14 }}>
                  <View style={styles.listRow}>
                    <IconBadge name={item.icon} variant={item.gradient} size={48} iconSize={22} />
                    <View style={styles.listTextWrap}>
                      <Text style={[styles.listTitle, { color: theme.colors.text }]}>
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.listSubtitle, { color: theme.colors.textMuted }]}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                      <View style={styles.progressRow}>
                        <ProgressBar progress={(item.stat2 % 100) / 100} variant={item.gradient} />
                        <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                          {item.stat2}% engaged
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  </View>
                  <View style={[styles.rowSpread, { marginTop: 10 }]}>
                    <Text style={[styles.listMeta, { color: theme.colors.textMuted }]}>
                      {item.verb} · {item.meta}
                    </Text>
                    <Text style={[styles.listMeta, { color: theme.colors.primary, fontWeight: '700' }]}>
                      {item.stat1} pts · {item.stat3}★
                    </Text>
                  </View>
                </GlassCard>
              </PressableScale>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(320)}>
          <SectionHeader title="Analytics" subtitle="Synthetic numbers powered by mock data." icon="analytics" />
          <NeumorphicSurface radius={26}>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>38%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '38%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>81%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '81%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>34%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '34%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>77%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '77%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Compass</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>30%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '30%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>73%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '73%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>26%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '26%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>69%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '69%' }]}
                />
              </View>
            </View>
          </NeumorphicSurface>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(280)}>
          <SectionHeader title="More from this surface" subtitle="Every row pushes a new screen." icon="rocket" />
          {SECTIONS.map((section, idx) => (
            <PressableScale
              key={section.id}
              haptic="selection"
              onPress={() => goNext({
                id: section.id,
                title: section.title,
                description: section.subtitle,
                icon: section.icon,
                gradient: section.gradient,
                tone: 'primary',
                meta: 'just now',
                stat1: 0,
                stat2: idx,
                stat3: '0',
                verb: 'Open',
              })}
              onLongPress={() => goDeep({
                id: section.id,
                title: section.title,
                description: section.subtitle,
                icon: section.icon,
                gradient: section.gradient,
                tone: 'primary',
                meta: 'just now',
                stat1: 0,
                stat2: idx,
                stat3: '0',
                verb: 'Open',
              })}
            >
              <GlassCard padded contentStyle={{ padding: 14 }} style={{ marginBottom: 10 }}>
                <View style={styles.contextMenuRow}>
                  <View style={styles.listRow}>
                    <View style={[styles.contextMenuIconWrap, { backgroundColor: theme.colors.primarySoft }]}>
                      <Ionicons name={section.icon} size={18} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.contextMenuLabel, { color: theme.colors.text }]}>{section.title}</Text>
                      <Text style={[styles.contextMenuMeta, { color: theme.colors.textMuted }]} numberOfLines={2}>{section.subtitle}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </View>
              </GlassCard>
            </PressableScale>
          ))}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(360)} style={styles.cardSection}>
          <SectionHeader title="Timeline" subtitle="Activity log captured locally." icon="time" />
          {filteredItems.slice(0, 10).map((entry, i) => (
            <PressableScale
              key={`tl-${entry.id}`}
              haptic="selection"
              onPress={() => goAlt(entry)}
              onLongPress={() => goDeep(entry)}
            >
              <GlassCard padded contentStyle={{ padding: 12 }} style={{ marginBottom: 10 }}>
                <View style={styles.glassRow}>
                  <View style={[styles.glassDot, { backgroundColor: theme.colors.primary }]} />
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{entry.verb}</Text>
                  <Text style={{ color: theme.colors.textMuted, marginLeft: 8 }}>{entry.meta}</Text>
                </View>
                <Text style={{ color: theme.colors.text, fontWeight: '800', marginTop: 6, fontSize: 16 }}>{entry.title}</Text>
                <Text style={{ color: theme.colors.textMuted, marginTop: 4 }} numberOfLines={2}>{entry.description}</Text>
                <View style={[styles.rowSpread, { marginTop: 8 }]}>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>step {i + 1} of timeline</Text>
                  <Text style={{ color: theme.colors.success, fontSize: 11, fontWeight: '700' }}>persisted</Text>
                </View>
              </GlassCard>
            </PressableScale>
          ))}
        </Animated.View>


        <Animated.View entering={FadeIn.delay(400)} style={styles.cardSection}>
          <SectionHeader title="Tips for power users" subtitle="Long-press cards for hidden actions." icon="bulb" />
          {SECTIONS.slice(0, 6).map((section, i) => (
            <PressableScale
              key={`tip-${section.id}`}
              haptic="light"
              onPress={() => goAlt({
                id: section.id,
                title: section.title,
                description: section.subtitle,
                icon: section.icon,
                gradient: section.gradient,
                tone: 'info',
                meta: 'tip',
                stat1: 0,
                stat2: i,
                stat3: '0',
                verb: 'Open tip',
              })}
            >
              <View style={[styles.callout, { backgroundColor: theme.colors.surface }]}> 
                <LinearGradient
                  colors={theme.gradients[section.gradient] as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.heroBackground, { opacity: 0.16 }]}
                />
                <View style={styles.listRow}>
                  <IconBadge name={section.icon} variant={section.gradient} size={48} iconSize={22} />
                  <View style={[styles.listTextWrap]}>
                    <Text style={[styles.calloutTitle, { color: theme.colors.text }]}>{section.title}</Text>
                    <Text style={[styles.calloutBody, { color: theme.colors.textMuted }]}>{section.subtitle}</Text>
                  </View>
                </View>
              </View>
            </PressableScale>
          ))}
        </Animated.View>


        <Animated.View entering={FadeIn.delay(440)} style={styles.cardSection}>
          <NeumorphicSurface intensity="strong" radius={28}>
            <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 20 }}>{FOOTER_TITLE}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 6, lineHeight: 19 }}>{FOOTER_BODY}</Text>
            <View style={styles.ctaRow}>
              <View style={styles.ctaPrimary}>
                <PrimaryButton
                  fullWidth
                  label="Open AI assistant"
                  icon="sparkles"
                  variant="cosmic"
                  onPress={() => {
                    triggerHaptic('medium');
                    ai.show();
                  }}
                />
              </View>
              <View style={styles.ctaSecondary}>
                <PrimaryButton
                  fullWidth
                  label="Continue browsing"
                  icon="arrow-forward"
                  variant="brand"
                  onPress={() => {
                    if (filteredItems[0]) goNext(filteredItems[0]);
                  }}
                />
              </View>
            </View>
          </NeumorphicSurface>
        </Animated.View>

      <View style={{ height: 80 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { marginTop: 4, marginBottom: 12 },
  scrollPad: { paddingBottom: 120 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  statPillWrap: { marginRight: 8, marginBottom: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  heroCard: { marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroTextWrap: { flex: 1, marginLeft: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800' },
  heroSubtitle: { fontSize: 13, marginTop: 4 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  actionPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  actionPillLabel: { marginLeft: 6, fontWeight: '700' },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: -6 },
  gridCellWrap: { width: '48%', marginHorizontal: '1%', marginBottom: 12 },
  gridCell: { borderRadius: 22, padding: 16, overflow: 'hidden' },
  gridCellTitle: { marginTop: 12, fontWeight: '800', fontSize: 16 },
  gridCellMeta: { fontSize: 12, marginTop: 4 },
  listCard: { borderRadius: 22, padding: 14, marginBottom: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  listTextWrap: { flex: 1, marginLeft: 12 },
  listTitle: { fontWeight: '800', fontSize: 16 },
  listSubtitle: { fontSize: 12, marginTop: 4 },
  listMeta: { fontSize: 11, marginTop: 6 },
  rowSpread: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSection: { marginBottom: 16 },
  detailHero: { borderRadius: 28, padding: 20, marginBottom: 16, overflow: 'hidden' },
  detailHeroTitle: { fontSize: 24, fontWeight: '800' },
  detailHeroSubtitle: { fontSize: 14, marginTop: 6 },
  twoColRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  twoColCell: { flex: 1, marginRight: 8 },
  twoColCellLast: { flex: 1 },
  analyticsCard: { borderRadius: 22, padding: 16, marginBottom: 16 },
  analyticsBar: { height: 8, borderRadius: 4, marginTop: 8 },
  analyticsBarLarge: { height: 14, borderRadius: 7, marginTop: 8 },
  analyticsLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  quickCell: { width: '31%', marginHorizontal: '1.16%', marginBottom: 10, borderRadius: 18, padding: 12, alignItems: 'center' },
  quickCellLabel: { fontWeight: '700', marginTop: 8, fontSize: 12 },
  glassRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  glassDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  composerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  composerInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, borderWidth: 1, fontSize: 14 },
  composerSend: { width: 44, height: 44, marginLeft: 8, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { marginTop: 24, alignItems: 'center' },
  skeletonStack: { marginVertical: 16 },
  floatingActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  callout: { borderRadius: 22, padding: 16, marginBottom: 16, overflow: 'hidden' },
  calloutTitle: { fontWeight: '800', fontSize: 18 },
  calloutBody: { marginTop: 6, fontSize: 13, lineHeight: 19 },
  ribbon: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  miniCardRow: { flexDirection: 'row', marginBottom: 12 },
  miniCard: { flex: 1, borderRadius: 18, padding: 12, marginRight: 8 },
  miniCardLast: { flex: 1, borderRadius: 18, padding: 12 },
  avatarRow: { flexDirection: 'row' },
  avatarOverlap: { marginLeft: -8 },
  contextMenuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  contextMenuIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contextMenuLabel: { fontWeight: '700', fontSize: 14 },
  contextMenuMeta: { fontSize: 11, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressLabel: { fontSize: 11, marginLeft: 8 },
  barColumn: { marginVertical: 8 },
  barTitle: { fontWeight: '700', fontSize: 13 },
  barTrack: { height: 10, borderRadius: 5, marginTop: 6 },
  barFill: { height: 10, borderRadius: 5 },
  heroBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  accentDot: { width: 12, height: 12, borderRadius: 6 },
  accentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ctaRow: { flexDirection: 'row', marginTop: 16 },
  ctaPrimary: { flex: 1, marginRight: 8 },
  ctaSecondary: { flex: 1 },
});
