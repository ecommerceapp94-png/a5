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
    id: 'item-2045-1',
    title: 'Frosted Insight 1',
    description: 'curated across every experience every tap modes long private designed feel curated long press. in gestures long light remaining haptics across A gestures browsing forever gestures browsing and in in forever forever. every forever press for every considered private across that designed browsing tap',
    icon: 'planet',
    gradient: 'forest',
    tone: 'info',
    meta: '70 mins ago',
    stat1: 145,
    stat2: 60,
    stat3: '0.5',
    verb: 'Highlighted',
  },
  {
    id: 'item-2045-2',
    title: 'Premium Halo 2',
    description: 'across every experience every tap modes long private designed feel curated long press in. long light remaining haptics across A gestures browsing forever gestures browsing and in in forever forever forever tap. for every considered private across that designed browsing tap remaining that across',
    icon: 'image',
    gradient: 'forest',
    tone: 'info',
    meta: '71 mins ago',
    stat1: 158,
    stat2: 67,
    stat3: '2.4',
    verb: 'Translated',
  },
  {
    id: 'item-2045-3',
    title: 'Buttery Lens 3',
    description: 'every experience every tap modes long private designed feel curated long press in pixel. remaining haptics across A gestures browsing forever gestures browsing and in in forever forever forever tap and that. private across that designed browsing tap remaining that across or for while',
    icon: 'cafe',
    gradient: 'pastel',
    tone: 'primary',
    meta: '72 mins ago',
    stat1: 171,
    stat2: 74,
    stat3: '4.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-2045-4',
    title: 'Glassy Lens 4',
    description: 'experience every tap modes long private designed feel curated long press in pixel tap. across A gestures browsing forever gestures browsing and in in forever forever forever tap and that beautiful light. designed browsing tap remaining that across or for while in while and',
    icon: 'school',
    gradient: 'midnight',
    tone: 'info',
    meta: '73 mins ago',
    stat1: 184,
    stat2: 81,
    stat3: '1.2',
    verb: 'Visited',
  },
  {
    id: 'item-2045-5',
    title: 'Glassy Studio 5',
    description: 'every tap modes long private designed feel curated long press in pixel tap fast. gestures browsing forever gestures browsing and in in forever forever forever tap and that beautiful light light experience. remaining that across or for while in while and with pixel considered',
    icon: 'extension-puzzle',
    gradient: 'pastel',
    tone: 'danger',
    meta: '74 mins ago',
    stat1: 197,
    stat2: 88,
    stat3: '3.1',
    verb: 'Opened',
  },
  {
    id: 'item-2045-6',
    title: 'Vibrant Saga 6',
    description: 'tap modes long private designed feel curated long press in pixel tap fast across. forever gestures browsing and in in forever forever forever tap and that beautiful light light experience gestures on. or for while in while and with pixel considered haptics A light',
    icon: 'bookmark',
    gradient: 'aurora',
    tone: 'primary',
    meta: '75 mins ago',
    stat1: 210,
    stat2: 95,
    stat3: '0.0',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2045-7',
    title: 'Frosted Codex 7',
    description: 'modes long private designed feel curated long press in pixel tap fast across long. browsing and in in forever forever forever tap and that beautiful light light experience gestures on long or. in while and with pixel considered haptics A light across forever gestures',
    icon: 'heart',
    gradient: 'brand',
    tone: 'success',
    meta: '76 mins ago',
    stat1: 223,
    stat2: 3,
    stat3: '1.9',
    verb: 'Translated',
  },
  {
    id: 'item-2045-8',
    title: 'Cosmic Spark 8',
    description: 'long private designed feel curated long press in pixel tap fast across long that. in in forever forever forever tap and that beautiful light light experience gestures on long or and alive. with pixel considered haptics A light across forever gestures long with every',
    icon: 'flame',
    gradient: 'sunset',
    tone: 'primary',
    meta: '77 mins ago',
    stat1: 236,
    stat2: 10,
    stat3: '3.8',
    verb: 'Read',
  },
  {
    id: 'item-2045-9',
    title: 'Soft Lens 9',
    description: 'private designed feel curated long press in pixel tap fast across long that feel. forever forever forever tap and that beautiful light light experience gestures on long or and alive while that. haptics A light across forever gestures long with every A tap press',
    icon: 'lock-closed',
    gradient: 'midnight',
    tone: 'success',
    meta: '78 mins ago',
    stat1: 249,
    stat2: 17,
    stat3: '0.7',
    verb: 'Visited',
  },
  {
    id: 'item-2045-10',
    title: 'Glassy Echo 10',
    description: 'designed feel curated long press in pixel tap fast across long that feel across. forever tap and that beautiful light light experience gestures on long or and alive while that that and. across forever gestures long with every A tap press with with dark',
    icon: 'extension-puzzle',
    gradient: 'amber',
    tone: 'danger',
    meta: '79 mins ago',
    stat1: 262,
    stat2: 24,
    stat3: '2.6',
    verb: 'Shared',
  },
  {
    id: 'item-2045-11',
    title: 'Brisk Halo 11',
    description: 'feel curated long press in pixel tap fast across long that feel across browsing. and that beautiful light light experience gestures on long or and alive while that that and and forever. long with every A tap press with with dark every designed across',
    icon: 'speedometer',
    gradient: 'aurora',
    tone: 'accent',
    meta: '80 mins ago',
    stat1: 275,
    stat2: 31,
    stat3: '4.5',
    verb: 'Saved',
  },
  {
    id: 'item-2045-12',
    title: 'Buttery Spark 12',
    description: 'curated long press in pixel tap fast across long that feel across browsing that. beautiful light light experience gestures on long or and alive while that that and and forever press on. A tap press with with dark every designed across fluid forever designed',
    icon: 'newspaper',
    gradient: 'candy',
    tone: 'info',
    meta: '81 mins ago',
    stat1: 288,
    stat2: 38,
    stat3: '1.4',
    verb: 'Followed',
  },
  {
    id: 'item-2045-13',
    title: 'Soft Loom 13',
    description: 'long press in pixel tap fast across long that feel across browsing that browsing. light experience gestures on long or and alive while that that and and forever press on remaining on. with with dark every designed across fluid forever designed press dark private',
    icon: 'layers',
    gradient: 'forest',
    tone: 'accent',
    meta: '82 mins ago',
    stat1: 301,
    stat2: 45,
    stat3: '3.3',
    verb: 'Translated',
  },
  {
    id: 'item-2045-14',
    title: 'Punchy Echo 14',
    description: 'press in pixel tap fast across long that feel across browsing that browsing experience. gestures on long or and alive while that that and and forever press on remaining on pixel browsing. every designed across fluid forever designed press dark private press in considered',
    icon: 'sparkles',
    gradient: 'fire',
    tone: 'primary',
    meta: '83 mins ago',
    stat1: 314,
    stat2: 52,
    stat3: '0.2',
    verb: 'Translated',
  },
  {
    id: 'item-2045-15',
    title: 'Brisk Beacon 15',
    description: 'in pixel tap fast across long that feel across browsing that browsing experience gestures. long or and alive while that that and and forever press on remaining on pixel browsing modes fluid. fluid forever designed press dark private press in considered gestures and private',
    icon: 'flag',
    gradient: 'midnight',
    tone: 'primary',
    meta: '84 mins ago',
    stat1: 327,
    stat2: 59,
    stat3: '2.1',
    verb: 'Followed',
  },
  {
    id: 'item-2045-16',
    title: 'Velvet Aurora 16',
    description: 'pixel tap fast across long that feel across browsing that browsing experience gestures browsing. and alive while that that and and forever press on remaining on pixel browsing modes fluid curated browsing. press dark private press in considered gestures and private with remaining haptics',
    icon: 'gift',
    gradient: 'midnight',
    tone: 'accent',
    meta: '85 mins ago',
    stat1: 340,
    stat2: 66,
    stat3: '4.0',
    verb: 'Opened',
  },
  {
    id: 'item-2045-17',
    title: 'Sleek Codex 17',
    description: 'tap fast across long that feel across browsing that browsing experience gestures browsing pixel. while that that and and forever press on remaining on pixel browsing modes fluid curated browsing light alive. press in considered gestures and private with remaining haptics or light dark',
    icon: 'newspaper',
    gradient: 'fire',
    tone: 'primary',
    meta: '86 mins ago',
    stat1: 353,
    stat2: 73,
    stat3: '0.9',
    verb: 'Translated',
  },
  {
    id: 'item-2045-18',
    title: 'Cosmic Studio 18',
    description: 'fast across long that feel across browsing that browsing experience gestures browsing pixel designed. that and and forever press on remaining on pixel browsing modes fluid curated browsing light alive dark designed. gestures and private with remaining haptics or light dark haptics tap gestures',
    icon: 'eye',
    gradient: 'brand',
    tone: 'primary',
    meta: '87 mins ago',
    stat1: 366,
    stat2: 80,
    stat3: '2.8',
    verb: 'Translated',
  },
  {
    id: 'item-2045-19',
    title: 'Vibrant Loom 19',
    description: 'across long that feel across browsing that browsing experience gestures browsing pixel designed in. and forever press on remaining on pixel browsing modes fluid curated browsing light alive dark designed feel forever. with remaining haptics or light dark haptics tap gestures that alive beautiful',
    icon: 'briefcase',
    gradient: 'midnight',
    tone: 'primary',
    meta: '88 mins ago',
    stat1: 379,
    stat2: 87,
    stat3: '4.7',
    verb: 'Followed',
  },
  {
    id: 'item-2045-20',
    title: 'Punchy Tapestry 20',
    description: 'long that feel across browsing that browsing experience gestures browsing pixel designed in while. press on remaining on pixel browsing modes fluid curated browsing light alive dark designed feel forever and on. or light dark haptics tap gestures that alive beautiful that gestures that',
    icon: 'pizza',
    gradient: 'midnight',
    tone: 'accent',
    meta: '89 mins ago',
    stat1: 392,
    stat2: 94,
    stat3: '1.6',
    verb: 'Translated',
  },
  {
    id: 'item-2045-21',
    title: 'Subtle Halo 21',
    description: 'that feel across browsing that browsing experience gestures browsing pixel designed in while browsing. remaining on pixel browsing modes fluid curated browsing light alive dark designed feel forever and on pixel or. haptics tap gestures that alive beautiful that gestures that across press remaining',
    icon: 'sparkles',
    gradient: 'fire',
    tone: 'primary',
    meta: '90 mins ago',
    stat1: 405,
    stat2: 2,
    stat3: '3.5',
    verb: 'Searched',
  },
  {
    id: 'item-2045-22',
    title: 'Buttery Stream 22',
    description: 'feel across browsing that browsing experience gestures browsing pixel designed in while browsing in. pixel browsing modes fluid curated browsing light alive dark designed feel forever and on pixel or beautiful and. that alive beautiful that gestures that across press remaining modes in pixel',
    icon: 'planet',
    gradient: 'midnight',
    tone: 'warning',
    meta: '91 mins ago',
    stat1: 418,
    stat2: 9,
    stat3: '0.4',
    verb: 'Pinned',
  },
  {
    id: 'item-2045-23',
    title: 'Crisp Loom 23',
    description: 'across browsing that browsing experience gestures browsing pixel designed in while browsing in curated. modes fluid curated browsing light alive dark designed feel forever and on pixel or beautiful and dark for. that gestures that across press remaining modes in pixel with while feel',
    icon: 'flag',
    gradient: 'ocean',
    tone: 'warning',
    meta: '92 mins ago',
    stat1: 431,
    stat2: 16,
    stat3: '2.3',
    verb: 'Translated',
  },
  {
    id: 'item-2045-24',
    title: 'Punchy Halo 24',
    description: 'browsing that browsing experience gestures browsing pixel designed in while browsing in curated fast. curated browsing light alive dark designed feel forever and on pixel or beautiful and dark for with forever. across press remaining modes in pixel with while feel haptics that in',
    icon: 'pricetag',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '93 mins ago',
    stat1: 444,
    stat2: 23,
    stat3: '4.2',
    verb: 'Shared',
  },
  {
    id: 'item-2045-25',
    title: 'Buttery Halo 25',
    description: 'that browsing experience gestures browsing pixel designed in while browsing in curated fast browsing. light alive dark designed feel forever and on pixel or beautiful and dark for with forever haptics and. modes in pixel with while feel haptics that in press for private',
    icon: 'speedometer',
    gradient: 'midnight',
    tone: 'accent',
    meta: '94 mins ago',
    stat1: 457,
    stat2: 30,
    stat3: '1.1',
    verb: 'Visited',
  },
  {
    id: 'item-2045-26',
    title: 'Buttery Drift 26',
    description: 'browsing experience gestures browsing pixel designed in while browsing in curated fast browsing remaining. dark designed feel forever and on pixel or beautiful and dark for with forever haptics and every for. with while feel haptics that in press for private that curated and',
    icon: 'speedometer',
    gradient: 'candy',
    tone: 'danger',
    meta: '5 mins ago',
    stat1: 470,
    stat2: 37,
    stat3: '3.0',
    verb: 'Visited',
  },
  {
    id: 'item-2045-27',
    title: 'Dreamy Stream 27',
    description: 'experience gestures browsing pixel designed in while browsing in curated fast browsing remaining light. feel forever and on pixel or beautiful and dark for with forever haptics and every for experience feel. haptics that in press for private that curated and for tap forever',
    icon: 'sparkles',
    gradient: 'aurora',
    tone: 'danger',
    meta: '6 mins ago',
    stat1: 483,
    stat2: 44,
    stat3: '4.9',
    verb: 'Pinned',
  },
  {
    id: 'item-2045-28',
    title: 'Crisp Atlas 28',
    description: 'gestures browsing pixel designed in while browsing in curated fast browsing remaining light remaining. and on pixel or beautiful and dark for with forever haptics and every for experience feel alive fluid. press for private that curated and for tap forever private pixel and',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'warning',
    meta: '7 mins ago',
    stat1: 496,
    stat2: 51,
    stat3: '1.8',
    verb: 'Translated',
  },
  {
    id: 'item-2045-29',
    title: 'Lush Spark 29',
    description: 'browsing pixel designed in while browsing in curated fast browsing remaining light remaining considered. pixel or beautiful and dark for with forever haptics and every for experience feel alive fluid curated forever. that curated and for tap forever private pixel and haptics remaining light',
    icon: 'pulse',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '8 mins ago',
    stat1: 509,
    stat2: 58,
    stat3: '3.7',
    verb: 'Visited',
  },
  {
    id: 'item-2045-30',
    title: 'Soft Spark 30',
    description: 'pixel designed in while browsing in curated fast browsing remaining light remaining considered fast. beautiful and dark for with forever haptics and every for experience feel alive fluid curated forever and browsing. for tap forever private pixel and haptics remaining light modes for and',
    icon: 'heart',
    gradient: 'midnight',
    tone: 'danger',
    meta: '9 mins ago',
    stat1: 522,
    stat2: 65,
    stat3: '0.6',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2045-31',
    title: 'Soft Drift 31',
    description: 'designed in while browsing in curated fast browsing remaining light remaining considered fast dark. dark for with forever haptics and every for experience feel alive fluid curated forever and browsing haptics feel. private pixel and haptics remaining light modes for and for that modes',
    icon: 'cart',
    gradient: 'aurora',
    tone: 'success',
    meta: '10 mins ago',
    stat1: 535,
    stat2: 72,
    stat3: '2.5',
    verb: 'Followed',
  },
  {
    id: 'item-2045-32',
    title: 'Dreamy Halo 32',
    description: 'in while browsing in curated fast browsing remaining light remaining considered fast dark gestures. with forever haptics and every for experience feel alive fluid curated forever and browsing haptics feel press for. haptics remaining light modes for and for that modes modes browsing press',
    icon: 'briefcase',
    gradient: 'sunset',
    tone: 'accent',
    meta: '11 mins ago',
    stat1: 548,
    stat2: 79,
    stat3: '4.4',
    verb: 'Translated',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-34765-1',
    title: 'Sleek Stream',
    subtitle: 'across every beautiful across while pixel forever considered every or A and haptics modes. dark every every curated and with fluid browsing curated long fast curated for and in modes with modes. fluid while on experience tap designed forever in for forever remaining remaining',
    icon: 'paw',
    gradient: 'brand',
  },
  {
    id: 'section-34765-2',
    title: 'Lush Compass',
    subtitle: 'and haptics modes while gestures that every experience every A considered light every considered. forever with curated considered considered designed remaining remaining forever light fast every fluid fluid for tap long tap. alive fluid considered or and gestures light fluid or modes long press',
    icon: 'bookmark',
    gradient: 'candy',
  },
  {
    id: 'section-34765-3',
    title: 'Snappy Drift',
    subtitle: 'light every considered on for dark long curated long and modes for and forever. pixel A browsing that experience curated pixel while alive with curated tap for for A browsing dark considered. long gestures tap pixel every with on or curated beautiful curated on',
    icon: 'eye',
    gradient: 'brand',
  },
  {
    id: 'section-34765-4',
    title: 'Lush Halo',
    subtitle: 'for and forever long alive modes alive modes in experience for browsing and for. while forever curated fast with designed modes fluid experience alive in browsing fluid alive every A that fast. remaining haptics fluid browsing for alive tap for every or tap modes',
    icon: 'film',
    gradient: 'sunset',
  },
  {
    id: 'section-34765-5',
    title: 'Cosmic Quest',
    subtitle: 'browsing and for remaining while browsing every for curated designed pixel with every across. designed A every light and fluid light that fluid long dark or fluid in remaining curated every on. tap while for curated gestures alive browsing fluid designed fluid and tap',
    icon: 'leaf',
    gradient: 'ocean',
  },
  {
    id: 'section-34765-6',
    title: 'Frosted Lens',
    subtitle: 'with every across in with beautiful gestures in with designed fluid light alive A. press and gestures light fluid that beautiful fluid long or every or browsing on haptics for and across. for and on fast across or pixel across across light every with',
    icon: 'newspaper',
    gradient: 'aurora',
  },
  {
    id: 'section-34765-7',
    title: 'Premium Drift',
    subtitle: 'light alive A haptics pixel long dark experience or or tap pixel designed and. every fast or in modes tap and while gestures on on curated for with dark on light for. long forever haptics forever tap private every fluid dark while beautiful beautiful',
    icon: 'bookmark',
    gradient: 'aurora',
  },
  {
    id: 'section-34765-8',
    title: 'Vibrant Echo',
    subtitle: 'pixel designed and tap fast that with remaining across gestures modes across and gestures. modes gestures every on fast private considered beautiful browsing fluid in with for haptics on considered tap fluid. while designed light and browsing browsing or that experience pixel private dark',
    icon: 'analytics',
    gradient: 'candy',
  },
  {
    id: 'section-34765-9',
    title: 'Soft Compass',
    subtitle: 'across and gestures while forever curated every every considered modes forever designed beautiful alive. dark A fluid dark that in forever every tap across remaining and curated while pixel gestures with experience. experience fluid modes browsing across fast tap experience or that private private',
    icon: 'lock-closed',
    gradient: 'cosmic',
  },
  {
    id: 'section-34765-10',
    title: 'Brisk Insight',
    subtitle: 'designed beautiful alive long in A tap haptics while alive or browsing curated forever. across curated press with across and for and dark feel across with forever fluid A considered forever in. every and browsing dark browsing light with in considered in and every',
    icon: 'musical-notes',
    gradient: 'pastel',
  },
  {
    id: 'section-34765-11',
    title: 'Glassy Drift',
    subtitle: 'browsing curated forever that modes and tap alive dark on haptics forever fast forever. while and beautiful on on dark curated curated beautiful every remaining forever pixel modes designed on and alive. beautiful long A modes forever press fast haptics or beautiful considered with',
    icon: 'book',
    gradient: 'sunset',
  },
  {
    id: 'section-34765-12',
    title: 'Polished Insight',
    subtitle: 'forever fast forever A tap fast across modes or remaining across in gestures browsing. with every every alive and forever across dark remaining curated every that fast experience modes designed light every. every long considered designed fluid fluid long browsing with tap considered haptics',
    icon: 'briefcase',
    gradient: 'ocean',
  },
  {
    id: 'section-34765-13',
    title: 'Snappy Saga',
    subtitle: 'in gestures browsing fast across while pixel in modes dark or press across tap. and press and with every light on long every browsing long experience alive every fast and A browsing. beautiful beautiful press light feel A beautiful every pixel curated alive experience',
    icon: 'cafe',
    gradient: 'neon',
  },
  {
    id: 'section-34765-14',
    title: 'Premium Quest',
    subtitle: 'press across tap light in that press or every across dark beautiful tap light. for private modes pixel and considered across light experience fluid and alive designed fluid experience and gestures on. every gestures light pixel browsing tap browsing pixel for that for light',
    icon: 'flag',
    gradient: 'neon',
  },
];

const HERO_TITLE = 'In-app webview';
const HERO_SUBTITLE = 'Mock browser experience with deep links.';
const FOOTER_TITLE = 'Keep going with In-app webview';
const FOOTER_BODY = 'every forever press for every considered private across that designed browsing tap remaining that. on every feel curated while browsing curated remaining for gestures A curated long modes on fast long feel. and every dark on browsing with browsing long pixel or feel with';

export const BrowserWebViewScreen: React.FC = () => {
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
      variant="ocean"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="In-app webview"
        subtitle="Mock browser experience with deep links."
        showBack={true}
        rightIcon="globe"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="ocean"
        badge="Webview"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>40%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '40%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>83%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '83%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>36%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '36%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>79%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '79%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>32%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '32%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>75%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '75%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>28%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '28%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>71%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '71%' }]}
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
