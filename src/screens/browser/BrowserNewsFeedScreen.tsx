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
    id: 'item-2133-1',
    title: 'Elite Quest 1',
    description: 'A remaining alive considered on every fluid dark long remaining light while considered fluid. dark with and while fluid or feel every gestures and modes and fluid browsing beautiful dark modes long. A alive tap designed forever dark designed in fast pixel fluid considered',
    icon: 'flame',
    gradient: 'ocean',
    tone: 'danger',
    meta: '68 mins ago',
    stat1: 309,
    stat2: 82,
    stat3: '2.7',
    verb: 'Shared',
  },
  {
    id: 'item-2133-2',
    title: 'Polished Stream 2',
    description: 'remaining alive considered on every fluid dark long remaining light while considered fluid and. and while fluid or feel every gestures and modes and fluid browsing beautiful dark modes long and long. designed forever dark designed in fast pixel fluid considered browsing modes browsing',
    icon: 'rocket',
    gradient: 'aurora',
    tone: 'accent',
    meta: '69 mins ago',
    stat1: 322,
    stat2: 89,
    stat3: '4.6',
    verb: 'Archived',
  },
  {
    id: 'item-2133-3',
    title: 'Crisp Stream 3',
    description: 'alive considered on every fluid dark long remaining light while considered fluid and tap. fluid or feel every gestures and modes and fluid browsing beautiful dark modes long and long beautiful experience. designed in fast pixel fluid considered browsing modes browsing remaining long dark',
    icon: 'briefcase',
    gradient: 'candy',
    tone: 'danger',
    meta: '70 mins ago',
    stat1: 335,
    stat2: 96,
    stat3: '1.5',
    verb: 'Translated',
  },
  {
    id: 'item-2133-4',
    title: 'Crisp Loom 4',
    description: 'considered on every fluid dark long remaining light while considered fluid and tap gestures. feel every gestures and modes and fluid browsing beautiful dark modes long and long beautiful experience or pixel. pixel fluid considered browsing modes browsing remaining long dark remaining fast while',
    icon: 'grid',
    gradient: 'neon',
    tone: 'primary',
    meta: '71 mins ago',
    stat1: 348,
    stat2: 4,
    stat3: '3.4',
    verb: 'Archived',
  },
  {
    id: 'item-2133-5',
    title: 'Punchy Quest 5',
    description: 'on every fluid dark long remaining light while considered fluid and tap gestures fast. gestures and modes and fluid browsing beautiful dark modes long and long beautiful experience or pixel every designed. browsing modes browsing remaining long dark remaining fast while A long forever',
    icon: 'shield',
    gradient: 'midnight',
    tone: 'danger',
    meta: '72 mins ago',
    stat1: 361,
    stat2: 11,
    stat3: '0.3',
    verb: 'Read',
  },
  {
    id: 'item-2133-6',
    title: 'Polished Quest 6',
    description: 'every fluid dark long remaining light while considered fluid and tap gestures fast beautiful. modes and fluid browsing beautiful dark modes long and long beautiful experience or pixel every designed every browsing. remaining long dark remaining fast while A long forever for modes remaining',
    icon: 'musical-notes',
    gradient: 'neon',
    tone: 'success',
    meta: '73 mins ago',
    stat1: 374,
    stat2: 18,
    stat3: '2.2',
    verb: 'Pinned',
  },
  {
    id: 'item-2133-7',
    title: 'Polished Studio 7',
    description: 'fluid dark long remaining light while considered fluid and tap gestures fast beautiful dark. fluid browsing beautiful dark modes long and long beautiful experience or pixel every designed every browsing with experience. remaining fast while A long forever for modes remaining alive press across',
    icon: 'grid',
    gradient: 'amber',
    tone: 'warning',
    meta: '74 mins ago',
    stat1: 387,
    stat2: 25,
    stat3: '4.1',
    verb: 'Searched',
  },
  {
    id: 'item-2133-8',
    title: 'Vibrant Pulse 8',
    description: 'dark long remaining light while considered fluid and tap gestures fast beautiful dark pixel. beautiful dark modes long and long beautiful experience or pixel every designed every browsing with experience considered on. A long forever for modes remaining alive press across designed press designed',
    icon: 'cafe',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '75 mins ago',
    stat1: 400,
    stat2: 32,
    stat3: '1.0',
    verb: 'Shared',
  },
  {
    id: 'item-2133-9',
    title: 'Elite Loom 9',
    description: 'long remaining light while considered fluid and tap gestures fast beautiful dark pixel across. modes long and long beautiful experience or pixel every designed every browsing with experience considered on experience in. for modes remaining alive press across designed press designed forever long every',
    icon: 'speedometer',
    gradient: 'ocean',
    tone: 'accent',
    meta: '76 mins ago',
    stat1: 413,
    stat2: 39,
    stat3: '2.9',
    verb: 'Pinned',
  },
  {
    id: 'item-2133-10',
    title: 'Punchy Drift 10',
    description: 'remaining light while considered fluid and tap gestures fast beautiful dark pixel across or. and long beautiful experience or pixel every designed every browsing with experience considered on experience in light for. alive press across designed press designed forever long every for fluid private',
    icon: 'gift',
    gradient: 'candy',
    tone: 'warning',
    meta: '77 mins ago',
    stat1: 426,
    stat2: 46,
    stat3: '4.8',
    verb: 'Saved',
  },
  {
    id: 'item-2133-11',
    title: 'Dreamy Studio 11',
    description: 'light while considered fluid and tap gestures fast beautiful dark pixel across or every. beautiful experience or pixel every designed every browsing with experience considered on experience in light for forever haptics. designed press designed forever long every for fluid private experience private beautiful',
    icon: 'grid',
    gradient: 'cosmic',
    tone: 'info',
    meta: '78 mins ago',
    stat1: 439,
    stat2: 53,
    stat3: '1.7',
    verb: 'Pinned',
  },
  {
    id: 'item-2133-12',
    title: 'Vibrant Echo 12',
    description: 'while considered fluid and tap gestures fast beautiful dark pixel across or every press. or pixel every designed every browsing with experience considered on experience in light for forever haptics in or. forever long every for fluid private experience private beautiful fast light experience',
    icon: 'flame',
    gradient: 'forest',
    tone: 'warning',
    meta: '79 mins ago',
    stat1: 452,
    stat2: 60,
    stat3: '3.6',
    verb: 'Followed',
  },
  {
    id: 'item-2133-13',
    title: 'Brisk Lens 13',
    description: 'considered fluid and tap gestures fast beautiful dark pixel across or every press that. every designed every browsing with experience considered on experience in light for forever haptics in or that private. for fluid private experience private beautiful fast light experience every beautiful beautiful',
    icon: 'book',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '80 mins ago',
    stat1: 465,
    stat2: 67,
    stat3: '0.5',
    verb: 'Opened',
  },
  {
    id: 'item-2133-14',
    title: 'Glassy Lens 14',
    description: 'fluid and tap gestures fast beautiful dark pixel across or every press that experience. every browsing with experience considered on experience in light for forever haptics in or that private light for. experience private beautiful fast light experience every beautiful beautiful gestures remaining press',
    icon: 'trophy',
    gradient: 'fire',
    tone: 'primary',
    meta: '81 mins ago',
    stat1: 478,
    stat2: 74,
    stat3: '2.4',
    verb: 'Archived',
  },
  {
    id: 'item-2133-15',
    title: 'Glassy Tapestry 15',
    description: 'and tap gestures fast beautiful dark pixel across or every press that experience while. with experience considered on experience in light for forever haptics in or that private light for long dark. fast light experience every beautiful beautiful gestures remaining press feel long beautiful',
    icon: 'heart',
    gradient: 'brand',
    tone: 'danger',
    meta: '82 mins ago',
    stat1: 491,
    stat2: 81,
    stat3: '4.3',
    verb: 'Shared',
  },
  {
    id: 'item-2133-16',
    title: 'Subtle Spark 16',
    description: 'tap gestures fast beautiful dark pixel across or every press that experience while and. considered on experience in light for forever haptics in or that private light for long dark beautiful beautiful. every beautiful beautiful gestures remaining press feel long beautiful private browsing forever',
    icon: 'gift',
    gradient: 'neon',
    tone: 'accent',
    meta: '83 mins ago',
    stat1: 504,
    stat2: 88,
    stat3: '1.2',
    verb: 'Translated',
  },
  {
    id: 'item-2133-17',
    title: 'Soft Tapestry 17',
    description: 'gestures fast beautiful dark pixel across or every press that experience while and remaining. experience in light for forever haptics in or that private light for long dark beautiful beautiful haptics every. gestures remaining press feel long beautiful private browsing forever private and pixel',
    icon: 'sparkles',
    gradient: 'candy',
    tone: 'primary',
    meta: '84 mins ago',
    stat1: 517,
    stat2: 95,
    stat3: '3.1',
    verb: 'Shared',
  },
  {
    id: 'item-2133-18',
    title: 'Subtle Quest 18',
    description: 'fast beautiful dark pixel across or every press that experience while and remaining and. light for forever haptics in or that private light for long dark beautiful beautiful haptics every forever considered. feel long beautiful private browsing forever private and pixel long long long',
    icon: 'cart',
    gradient: 'midnight',
    tone: 'accent',
    meta: '85 mins ago',
    stat1: 530,
    stat2: 3,
    stat3: '0.0',
    verb: 'Visited',
  },
  {
    id: 'item-2133-19',
    title: 'Polished Echo 19',
    description: 'beautiful dark pixel across or every press that experience while and remaining and or. forever haptics in or that private light for long dark beautiful beautiful haptics every forever considered forever every. private browsing forever private and pixel long long long experience feel remaining',
    icon: 'planet',
    gradient: 'candy',
    tone: 'danger',
    meta: '86 mins ago',
    stat1: 543,
    stat2: 10,
    stat3: '1.9',
    verb: 'Read',
  },
  {
    id: 'item-2133-20',
    title: 'Brisk Stream 20',
    description: 'dark pixel across or every press that experience while and remaining and or press. in or that private light for long dark beautiful beautiful haptics every forever considered forever every while gestures. private and pixel long long long experience feel remaining across private forever',
    icon: 'cloud',
    gradient: 'aurora',
    tone: 'success',
    meta: '87 mins ago',
    stat1: 556,
    stat2: 17,
    stat3: '3.8',
    verb: 'Followed',
  },
  {
    id: 'item-2133-21',
    title: 'Crisp Quest 21',
    description: 'pixel across or every press that experience while and remaining and or press experience. that private light for long dark beautiful beautiful haptics every forever considered forever every while gestures experience beautiful. long long long experience feel remaining across private forever gestures forever and',
    icon: 'speedometer',
    gradient: 'amber',
    tone: 'accent',
    meta: '88 mins ago',
    stat1: 569,
    stat2: 24,
    stat3: '0.7',
    verb: 'Searched',
  },
  {
    id: 'item-2133-22',
    title: 'Polished Mosaic 22',
    description: 'across or every press that experience while and remaining and or press experience gestures. light for long dark beautiful beautiful haptics every forever considered forever every while gestures experience beautiful with pixel. experience feel remaining across private forever gestures forever and with for in',
    icon: 'trophy',
    gradient: 'fire',
    tone: 'warning',
    meta: '89 mins ago',
    stat1: 582,
    stat2: 31,
    stat3: '2.6',
    verb: 'Pinned',
  },
  {
    id: 'item-2133-23',
    title: 'Deep Compass 23',
    description: 'or every press that experience while and remaining and or press experience gestures and. long dark beautiful beautiful haptics every forever considered forever every while gestures experience beautiful with pixel remaining beautiful. across private forever gestures forever and with for in fluid across every',
    icon: 'rocket',
    gradient: 'ocean',
    tone: 'warning',
    meta: '90 mins ago',
    stat1: 595,
    stat2: 38,
    stat3: '4.5',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2133-24',
    title: 'Snappy Loom 24',
    description: 'every press that experience while and remaining and or press experience gestures and every. beautiful beautiful haptics every forever considered forever every while gestures experience beautiful with pixel remaining beautiful curated long. gestures forever and with for in fluid across every and feel long',
    icon: 'book',
    gradient: 'cosmic',
    tone: 'success',
    meta: '91 mins ago',
    stat1: 608,
    stat2: 45,
    stat3: '1.4',
    verb: 'Archived',
  },
  {
    id: 'item-2133-25',
    title: 'Punchy Studio 25',
    description: 'press that experience while and remaining and or press experience gestures and every gestures. haptics every forever considered forever every while gestures experience beautiful with pixel remaining beautiful curated long that experience. with for in fluid across every and feel long or designed haptics',
    icon: 'analytics',
    gradient: 'sunset',
    tone: 'danger',
    meta: '92 mins ago',
    stat1: 621,
    stat2: 52,
    stat3: '3.3',
    verb: 'Archived',
  },
  {
    id: 'item-2133-26',
    title: 'Vibrant Beacon 26',
    description: 'that experience while and remaining and or press experience gestures and every gestures browsing. forever considered forever every while gestures experience beautiful with pixel remaining beautiful curated long that experience dark fast. fluid across every and feel long or designed haptics on modes or',
    icon: 'eye',
    gradient: 'neon',
    tone: 'danger',
    meta: '93 mins ago',
    stat1: 634,
    stat2: 59,
    stat3: '0.2',
    verb: 'Shared',
  },
  {
    id: 'item-2133-27',
    title: 'Velvet Quest 27',
    description: 'experience while and remaining and or press experience gestures and every gestures browsing modes. forever every while gestures experience beautiful with pixel remaining beautiful curated long that experience dark fast or or. and feel long or designed haptics on modes or fluid and fast',
    icon: 'eye',
    gradient: 'neon',
    tone: 'accent',
    meta: '94 mins ago',
    stat1: 647,
    stat2: 66,
    stat3: '2.1',
    verb: 'Read',
  },
  {
    id: 'item-2133-28',
    title: 'Polished Echo 28',
    description: 'while and remaining and or press experience gestures and every gestures browsing modes designed. while gestures experience beautiful with pixel remaining beautiful curated long that experience dark fast or or or for. or designed haptics on modes or fluid and fast browsing considered and',
    icon: 'trophy',
    gradient: 'candy',
    tone: 'success',
    meta: '5 mins ago',
    stat1: 660,
    stat2: 73,
    stat3: '4.0',
    verb: 'Searched',
  },
  {
    id: 'item-2133-29',
    title: 'Brisk Forge 29',
    description: 'and remaining and or press experience gestures and every gestures browsing modes designed considered. experience beautiful with pixel remaining beautiful curated long that experience dark fast or or or for while or. on modes or fluid and fast browsing considered and remaining tap and',
    icon: 'shield',
    gradient: 'amber',
    tone: 'warning',
    meta: '6 mins ago',
    stat1: 673,
    stat2: 80,
    stat3: '0.9',
    verb: 'Pinned',
  },
  {
    id: 'item-2133-30',
    title: 'Silky Forge 30',
    description: 'remaining and or press experience gestures and every gestures browsing modes designed considered across. with pixel remaining beautiful curated long that experience dark fast or or or for while or fluid for. fluid and fast browsing considered and remaining tap and modes experience private',
    icon: 'globe',
    gradient: 'ocean',
    tone: 'warning',
    meta: '7 mins ago',
    stat1: 686,
    stat2: 87,
    stat3: '2.8',
    verb: 'Archived',
  },
  {
    id: 'item-2133-31',
    title: 'Silky Aurora 31',
    description: 'and or press experience gestures and every gestures browsing modes designed considered across long. remaining beautiful curated long that experience dark fast or or or for while or fluid for feel long. browsing considered and remaining tap and modes experience private private remaining curated',
    icon: 'flag',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '8 mins ago',
    stat1: 699,
    stat2: 94,
    stat3: '4.7',
    verb: 'Visited',
  },
  {
    id: 'item-2133-32',
    title: 'Sleek Stream 32',
    description: 'or press experience gestures and every gestures browsing modes designed considered across long remaining. curated long that experience dark fast or or or for while or fluid for feel long while and. remaining tap and modes experience private private remaining curated dark and long',
    icon: 'heart',
    gradient: 'neon',
    tone: 'danger',
    meta: '9 mins ago',
    stat1: 712,
    stat2: 2,
    stat3: '1.6',
    verb: 'Pinned',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-36261-1',
    title: 'Elite Spark',
    subtitle: 'across gestures haptics press with modes private that dark while in private modes fast. across private fast A across curated pixel while that alive or beautiful designed in press feel designed A. private or across haptics with across fast while feel long experience private',
    icon: 'flag',
    gradient: 'pastel',
  },
  {
    id: 'section-36261-2',
    title: 'Cosmic Codex',
    subtitle: 'private modes fast A curated on modes press beautiful across modes feel or light. alive across while considered press or tap fast long designed considered that light tap on while or tap. light curated dark fluid light every A browsing while browsing pixel in',
    icon: 'briefcase',
    gradient: 'cosmic',
  },
  {
    id: 'section-36261-3',
    title: 'Frosted Codex',
    subtitle: 'feel or light with with experience haptics press private and across fluid and modes. alive while every in and considered modes in remaining press with in designed considered haptics for beautiful dark. and pixel and haptics for for fast that forever curated gestures with',
    icon: 'pulse',
    gradient: 'midnight',
  },
  {
    id: 'section-36261-4',
    title: 'Crisp Saga',
    subtitle: 'fluid and modes in in feel remaining with gestures A on private feel pixel. modes and experience modes forever across long every tap private dark for every long experience light in press. haptics pixel or fast experience gestures private gestures browsing with forever or',
    icon: 'book',
    gradient: 'neon',
  },
  {
    id: 'section-36261-5',
    title: 'Glassy Pulse',
    subtitle: 'private feel pixel every and considered and and that fluid experience long pixel fluid. experience feel beautiful tap and in modes every browsing or across that modes pixel across dark private browsing. haptics modes press and fluid beautiful remaining curated with fluid on remaining',
    icon: 'star',
    gradient: 'brand',
  },
  {
    id: 'section-36261-6',
    title: 'Crisp Lens',
    subtitle: 'long pixel fluid and experience with tap press while curated and every and forever. in alive designed with fluid press tap fast beautiful A forever every fast while long and that dark. pixel experience press press for or alive tap on curated experience remaining',
    icon: 'image',
    gradient: 'candy',
  },
  {
    id: 'section-36261-7',
    title: 'Sleek Lens',
    subtitle: 'every and forever with press experience press while pixel designed haptics remaining and that. curated light tap haptics browsing for and or experience alive and that every light browsing dark considered beautiful. experience for and every beautiful and designed across or remaining every every',
    icon: 'analytics',
    gradient: 'sunset',
  },
  {
    id: 'section-36261-8',
    title: 'Vibrant Loom',
    subtitle: 'remaining and that private every across tap beautiful every curated feel considered experience long. modes considered fast private and while tap fluid gestures on in fluid long press considered across modes press. pixel or and every every designed while long haptics gestures every every',
    icon: 'school',
    gradient: 'aurora',
  },
  {
    id: 'section-36261-9',
    title: 'Cosmic Beacon',
    subtitle: 'considered experience long while and and for on and browsing fast while across on. tap curated pixel feel browsing pixel forever considered and haptics feel in considered and gestures fluid across alive. curated considered pixel fluid across browsing modes A alive dark every curated',
    icon: 'lock-closed',
    gradient: 'sunset',
  },
  {
    id: 'section-36261-10',
    title: 'Premium Insight',
    subtitle: 'while across on every curated every considered or every dark pixel while modes with. fast beautiful pixel feel for modes fast for experience dark designed haptics press and private considered press that. and remaining fast fast and with in pixel private A and designed',
    icon: 'flag',
    gradient: 'midnight',
  },
  {
    id: 'section-36261-11',
    title: 'Punchy Saga',
    subtitle: 'while modes with in private feel and press long that curated haptics and or. tap considered in every remaining light that on in on and private light gestures forever and light with. dark experience pixel every experience long across considered feel modes private for',
    icon: 'speedometer',
    gradient: 'neon',
  },
  {
    id: 'section-36261-12',
    title: 'Subtle Echo',
    subtitle: 'haptics and or press considered across with curated beautiful pixel with browsing long gestures. A designed remaining while and and fluid every with beautiful light across pixel press with A dark browsing. or for and across every beautiful haptics forever press dark haptics and',
    icon: 'flame',
    gradient: 'fire',
  },
  {
    id: 'section-36261-13',
    title: 'Buttery Mosaic',
    subtitle: 'browsing long gestures light light and browsing and beautiful remaining while modes and or. gestures across alive pixel that that curated feel press pixel across across that and alive considered while designed. considered remaining private A while or remaining haptics forever gestures every A',
    icon: 'bookmark',
    gradient: 'candy',
  },
  {
    id: 'section-36261-14',
    title: 'Polished Halo',
    subtitle: 'modes and or every dark browsing forever with that private remaining beautiful pixel on. with light A on press across for forever fast every modes in or haptics on every dark experience. browsing while A alive and and and or pixel haptics pixel and',
    icon: 'gift',
    gradient: 'neon',
  },
];

const HERO_TITLE = 'News feed';
const HERO_SUBTITLE = 'Headlines from your favourite outlets.';
const FOOTER_TITLE = 'Keep going with News feed';
const FOOTER_BODY = 'A alive tap designed forever dark designed in fast pixel fluid considered browsing modes. light experience light and curated with browsing remaining beautiful browsing fluid across beautiful and press and fluid gestures. in private designed feel dark designed beautiful feel across browsing tap private';

export const BrowserNewsFeedScreen: React.FC = () => {
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
      variant="sunset"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="News feed"
        subtitle="Headlines from your favourite outlets."
        showBack={true}
        rightIcon="newspaper"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="sunset"
        badge="News"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>14%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '14%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>57%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '57%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>10%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '10%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>53%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '53%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>6%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '6%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>49%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '49%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>92%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '92%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>45%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '45%' }]}
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
