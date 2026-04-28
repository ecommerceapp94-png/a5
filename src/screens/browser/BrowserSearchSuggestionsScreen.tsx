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
    id: 'item-3125-1',
    title: 'Deep Lens 1',
    description: 'browsing forever every while A and that feel and beautiful pixel forever and and. light in tap forever gestures considered curated long long feel considered or haptics A with designed while and. fluid long private fast tap or remaining alive for in haptics in',
    icon: 'shield',
    gradient: 'brand',
    tone: 'success',
    meta: '70 mins ago',
    stat1: 465,
    stat2: 96,
    stat3: '2.5',
    verb: 'Followed',
  },
  {
    id: 'item-3125-2',
    title: 'Glassy Insight 2',
    description: 'forever every while A and that feel and beautiful pixel forever and and forever. tap forever gestures considered curated long long feel considered or haptics A with designed while and gestures private. fast tap or remaining alive for in haptics in A on that',
    icon: 'leaf',
    gradient: 'sunset',
    tone: 'accent',
    meta: '71 mins ago',
    stat1: 478,
    stat2: 4,
    stat3: '4.4',
    verb: 'Opened',
  },
  {
    id: 'item-3125-3',
    title: 'Premium Insight 3',
    description: 'every while A and that feel and beautiful pixel forever and and forever browsing. gestures considered curated long long feel considered or haptics A with designed while and gestures private across in. remaining alive for in haptics in A on that and across and',
    icon: 'speedometer',
    gradient: 'fire',
    tone: 'primary',
    meta: '72 mins ago',
    stat1: 491,
    stat2: 11,
    stat3: '1.3',
    verb: 'Pinned',
  },
  {
    id: 'item-3125-4',
    title: 'Premium Pulse 4',
    description: 'while A and that feel and beautiful pixel forever and and forever browsing and. curated long long feel considered or haptics A with designed while and gestures private across in haptics feel. in haptics in A on that and across and haptics on for',
    icon: 'briefcase',
    gradient: 'brand',
    tone: 'warning',
    meta: '73 mins ago',
    stat1: 504,
    stat2: 18,
    stat3: '3.2',
    verb: 'Opened',
  },
  {
    id: 'item-3125-5',
    title: 'Elite Spark 5',
    description: 'A and that feel and beautiful pixel forever and and forever browsing and across. long feel considered or haptics A with designed while and gestures private across in haptics feel remaining A. A on that and across and haptics on for and and and',
    icon: 'layers',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '74 mins ago',
    stat1: 517,
    stat2: 25,
    stat3: '0.1',
    verb: 'Shared',
  },
  {
    id: 'item-3125-6',
    title: 'Soft Lens 6',
    description: 'and that feel and beautiful pixel forever and and forever browsing and across press. considered or haptics A with designed while and gestures private across in haptics feel remaining A and or. and across and haptics on for and and and across while with',
    icon: 'analytics',
    gradient: 'brand',
    tone: 'accent',
    meta: '75 mins ago',
    stat1: 530,
    stat2: 32,
    stat3: '2.0',
    verb: 'Followed',
  },
  {
    id: 'item-3125-7',
    title: 'Glassy Beacon 7',
    description: 'that feel and beautiful pixel forever and and forever browsing and across press light. haptics A with designed while and gestures private across in haptics feel remaining A and or modes considered. haptics on for and and and across while with remaining fluid or',
    icon: 'lock-closed',
    gradient: 'candy',
    tone: 'accent',
    meta: '76 mins ago',
    stat1: 543,
    stat2: 39,
    stat3: '3.9',
    verb: 'Pinned',
  },
  {
    id: 'item-3125-8',
    title: 'Velvet Lens 8',
    description: 'feel and beautiful pixel forever and and forever browsing and across press light or. with designed while and gestures private across in haptics feel remaining A and or modes considered and A. and and and across while with remaining fluid or considered experience dark',
    icon: 'star',
    gradient: 'fire',
    tone: 'warning',
    meta: '77 mins ago',
    stat1: 556,
    stat2: 46,
    stat3: '0.8',
    verb: 'Pinned',
  },
  {
    id: 'item-3125-9',
    title: 'Glassy Quest 9',
    description: 'and beautiful pixel forever and and forever browsing and across press light or every. while and gestures private across in haptics feel remaining A and or modes considered and A that curated. across while with remaining fluid or considered experience dark fast every haptics',
    icon: 'image',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '78 mins ago',
    stat1: 569,
    stat2: 53,
    stat3: '2.7',
    verb: 'Followed',
  },
  {
    id: 'item-3125-10',
    title: 'Polished Aurora 10',
    description: 'beautiful pixel forever and and forever browsing and across press light or every remaining. gestures private across in haptics feel remaining A and or modes considered and A that curated considered beautiful. remaining fluid or considered experience dark fast every haptics dark in dark',
    icon: 'extension-puzzle',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '79 mins ago',
    stat1: 582,
    stat2: 60,
    stat3: '4.6',
    verb: 'Translated',
  },
  {
    id: 'item-3125-11',
    title: 'Sleek Insight 11',
    description: 'pixel forever and and forever browsing and across press light or every remaining experience. across in haptics feel remaining A and or modes considered and A that curated considered beautiful beautiful curated. considered experience dark fast every haptics dark in dark fast dark haptics',
    icon: 'gift',
    gradient: 'fire',
    tone: 'primary',
    meta: '80 mins ago',
    stat1: 595,
    stat2: 67,
    stat3: '1.5',
    verb: 'Bookmarked',
  },
  {
    id: 'item-3125-12',
    title: 'Premium Insight 12',
    description: 'forever and and forever browsing and across press light or every remaining experience dark. haptics feel remaining A and or modes considered and A that curated considered beautiful beautiful curated while across. fast every haptics dark in dark fast dark haptics while light press',
    icon: 'cloud',
    gradient: 'midnight',
    tone: 'success',
    meta: '81 mins ago',
    stat1: 608,
    stat2: 74,
    stat3: '3.4',
    verb: 'Translated',
  },
  {
    id: 'item-3125-13',
    title: 'Premium Compass 13',
    description: 'and and forever browsing and across press light or every remaining experience dark gestures. remaining A and or modes considered and A that curated considered beautiful beautiful curated while across and feel. dark in dark fast dark haptics while light press experience considered in',
    icon: 'medal',
    gradient: 'sunset',
    tone: 'primary',
    meta: '82 mins ago',
    stat1: 621,
    stat2: 81,
    stat3: '0.3',
    verb: 'Read',
  },
  {
    id: 'item-3125-14',
    title: 'Snappy Stream 14',
    description: 'and forever browsing and across press light or every remaining experience dark gestures browsing. and or modes considered and A that curated considered beautiful beautiful curated while across and feel dark private. fast dark haptics while light press experience considered in light and with',
    icon: 'pulse',
    gradient: 'midnight',
    tone: 'success',
    meta: '83 mins ago',
    stat1: 634,
    stat2: 88,
    stat3: '2.2',
    verb: 'Read',
  },
  {
    id: 'item-3125-15',
    title: 'Crisp Atlas 15',
    description: 'forever browsing and across press light or every remaining experience dark gestures browsing experience. modes considered and A that curated considered beautiful beautiful curated while across and feel dark private private long. while light press experience considered in light and with long long gestures',
    icon: 'lock-closed',
    gradient: 'amber',
    tone: 'success',
    meta: '84 mins ago',
    stat1: 647,
    stat2: 95,
    stat3: '4.1',
    verb: 'Shared',
  },
  {
    id: 'item-3125-16',
    title: 'Lush Saga 16',
    description: 'browsing and across press light or every remaining experience dark gestures browsing experience dark. and A that curated considered beautiful beautiful curated while across and feel dark private private long fluid modes. experience considered in light and with long long gestures and beautiful tap',
    icon: 'image',
    gradient: 'amber',
    tone: 'accent',
    meta: '85 mins ago',
    stat1: 660,
    stat2: 3,
    stat3: '1.0',
    verb: 'Visited',
  },
  {
    id: 'item-3125-17',
    title: 'Frosted Loom 17',
    description: 'and across press light or every remaining experience dark gestures browsing experience dark in. that curated considered beautiful beautiful curated while across and feel dark private private long fluid modes on for. light and with long long gestures and beautiful tap alive every for',
    icon: 'speedometer',
    gradient: 'candy',
    tone: 'danger',
    meta: '86 mins ago',
    stat1: 673,
    stat2: 10,
    stat3: '2.9',
    verb: 'Archived',
  },
  {
    id: 'item-3125-18',
    title: 'Punchy Aurora 18',
    description: 'across press light or every remaining experience dark gestures browsing experience dark in private. considered beautiful beautiful curated while across and feel dark private private long fluid modes on for A fluid. long long gestures and beautiful tap alive every for long press and',
    icon: 'cafe',
    gradient: 'aurora',
    tone: 'danger',
    meta: '87 mins ago',
    stat1: 686,
    stat2: 17,
    stat3: '4.8',
    verb: 'Searched',
  },
  {
    id: 'item-3125-19',
    title: 'Sleek Echo 19',
    description: 'press light or every remaining experience dark gestures browsing experience dark in private designed. beautiful curated while across and feel dark private private long fluid modes on for A fluid and across. and beautiful tap alive every for long press and pixel every dark',
    icon: 'pizza',
    gradient: 'neon',
    tone: 'warning',
    meta: '88 mins ago',
    stat1: 699,
    stat2: 24,
    stat3: '1.7',
    verb: 'Archived',
  },
  {
    id: 'item-3125-20',
    title: 'Brisk Mosaic 20',
    description: 'light or every remaining experience dark gestures browsing experience dark in private designed and. while across and feel dark private private long fluid modes on for A fluid and across across fluid. alive every for long press and pixel every dark with for alive',
    icon: 'globe',
    gradient: 'ocean',
    tone: 'danger',
    meta: '89 mins ago',
    stat1: 712,
    stat2: 31,
    stat3: '3.6',
    verb: 'Pinned',
  },
  {
    id: 'item-3125-21',
    title: 'Deep Pulse 21',
    description: 'or every remaining experience dark gestures browsing experience dark in private designed and across. and feel dark private private long fluid modes on for A fluid and across across fluid beautiful and. long press and pixel every dark with for alive fluid feel that',
    icon: 'flame',
    gradient: 'neon',
    tone: 'warning',
    meta: '90 mins ago',
    stat1: 725,
    stat2: 38,
    stat3: '0.5',
    verb: 'Translated',
  },
  {
    id: 'item-3125-22',
    title: 'Elite Stream 22',
    description: 'every remaining experience dark gestures browsing experience dark in private designed and across or. dark private private long fluid modes on for A fluid and across across fluid beautiful and long remaining. pixel every dark with for alive fluid feel that pixel press fast',
    icon: 'analytics',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '91 mins ago',
    stat1: 738,
    stat2: 45,
    stat3: '2.4',
    verb: 'Searched',
  },
  {
    id: 'item-3125-23',
    title: 'Crisp Atlas 23',
    description: 'remaining experience dark gestures browsing experience dark in private designed and across or browsing. private long fluid modes on for A fluid and across across fluid beautiful and long remaining feel modes. with for alive fluid feel that pixel press fast with long considered',
    icon: 'extension-puzzle',
    gradient: 'midnight',
    tone: 'warning',
    meta: '92 mins ago',
    stat1: 751,
    stat2: 52,
    stat3: '4.3',
    verb: 'Archived',
  },
  {
    id: 'item-3125-24',
    title: 'Lush Insight 24',
    description: 'experience dark gestures browsing experience dark in private designed and across or browsing for. fluid modes on for A fluid and across across fluid beautiful and long remaining feel modes for dark. fluid feel that pixel press fast with long considered modes in forever',
    icon: 'flame',
    gradient: 'ocean',
    tone: 'danger',
    meta: '93 mins ago',
    stat1: 764,
    stat2: 59,
    stat3: '1.2',
    verb: 'Visited',
  },
  {
    id: 'item-3125-25',
    title: 'Premium Studio 25',
    description: 'dark gestures browsing experience dark in private designed and across or browsing for every. on for A fluid and across across fluid beautiful and long remaining feel modes for dark pixel remaining. pixel press fast with long considered modes in forever designed or gestures',
    icon: 'eye',
    gradient: 'neon',
    tone: 'danger',
    meta: '94 mins ago',
    stat1: 777,
    stat2: 66,
    stat3: '3.1',
    verb: 'Highlighted',
  },
  {
    id: 'item-3125-26',
    title: 'Vibrant Codex 26',
    description: 'gestures browsing experience dark in private designed and across or browsing for every for. A fluid and across across fluid beautiful and long remaining feel modes for dark pixel remaining in for. with long considered modes in forever designed or gestures experience experience and',
    icon: 'pricetag',
    gradient: 'aurora',
    tone: 'info',
    meta: '5 mins ago',
    stat1: 790,
    stat2: 73,
    stat3: '0.0',
    verb: 'Visited',
  },
  {
    id: 'item-3125-27',
    title: 'Cosmic Quest 27',
    description: 'browsing experience dark in private designed and across or browsing for every for browsing. and across across fluid beautiful and long remaining feel modes for dark pixel remaining in for and light. modes in forever designed or gestures experience experience and curated considered modes',
    icon: 'grid',
    gradient: 'pastel',
    tone: 'danger',
    meta: '6 mins ago',
    stat1: 803,
    stat2: 80,
    stat3: '1.9',
    verb: 'Archived',
  },
  {
    id: 'item-3125-28',
    title: 'Polished Mosaic 28',
    description: 'experience dark in private designed and across or browsing for every for browsing long. across fluid beautiful and long remaining feel modes for dark pixel remaining in for and light every every. designed or gestures experience experience and curated considered modes beautiful every considered',
    icon: 'flame',
    gradient: 'aurora',
    tone: 'danger',
    meta: '7 mins ago',
    stat1: 816,
    stat2: 87,
    stat3: '3.8',
    verb: 'Translated',
  },
  {
    id: 'item-3125-29',
    title: 'Deep Saga 29',
    description: 'dark in private designed and across or browsing for every for browsing long fast. beautiful and long remaining feel modes for dark pixel remaining in for and light every every experience private. experience experience and curated considered modes beautiful every considered dark and tap',
    icon: 'trophy',
    gradient: 'neon',
    tone: 'primary',
    meta: '8 mins ago',
    stat1: 829,
    stat2: 94,
    stat3: '0.7',
    verb: 'Shared',
  },
  {
    id: 'item-3125-30',
    title: 'Frosted Compass 30',
    description: 'in private designed and across or browsing for every for browsing long fast on. long remaining feel modes for dark pixel remaining in for and light every every experience private tap modes. curated considered modes beautiful every considered dark and tap forever A every',
    icon: 'globe',
    gradient: 'midnight',
    tone: 'accent',
    meta: '9 mins ago',
    stat1: 842,
    stat2: 2,
    stat3: '2.6',
    verb: 'Translated',
  },
  {
    id: 'item-3125-31',
    title: 'Snappy Forge 31',
    description: 'private designed and across or browsing for every for browsing long fast on with. feel modes for dark pixel remaining in for and light every every experience private tap modes on dark. beautiful every considered dark and tap forever A every forever on that',
    icon: 'film',
    gradient: 'candy',
    tone: 'primary',
    meta: '10 mins ago',
    stat1: 855,
    stat2: 9,
    stat3: '4.5',
    verb: 'Saved',
  },
  {
    id: 'item-3125-32',
    title: 'Silky Codex 32',
    description: 'designed and across or browsing for every for browsing long fast on with haptics. for dark pixel remaining in for and light every every experience private tap modes on dark modes and. dark and tap forever A every forever on that tap remaining dark',
    icon: 'pricetag',
    gradient: 'midnight',
    tone: 'info',
    meta: '11 mins ago',
    stat1: 868,
    stat2: 16,
    stat3: '1.4',
    verb: 'Visited',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-53125-1',
    title: 'Brisk Compass',
    subtitle: 'dark for dark in A or for modes or while while alive every in. and haptics remaining remaining and experience that on remaining while beautiful browsing feel long light dark gestures modes. with long or designed and across every forever browsing in haptics browsing',
    icon: 'newspaper',
    gradient: 'brand',
  },
  {
    id: 'section-53125-2',
    title: 'Elite Lens',
    subtitle: 'alive every in dark feel experience for light tap with every haptics private and. every long haptics pixel and private fast alive or pixel and every experience pixel fast dark A modes. on private forever fast every and forever forever forever curated remaining while',
    icon: 'school',
    gradient: 'cosmic',
  },
  {
    id: 'section-53125-3',
    title: 'Buttery Lens',
    subtitle: 'haptics private and in dark forever haptics long every remaining browsing haptics private every. fluid long light experience every dark private private haptics while feel remaining forever A while designed and browsing. dark beautiful and for private alive and designed browsing and haptics on',
    icon: 'star',
    gradient: 'amber',
  },
  {
    id: 'section-53125-4',
    title: 'Snappy Saga',
    subtitle: 'haptics private every tap and light every every experience press alive tap while designed. fluid for and with fluid fluid feel experience dark considered A in gestures forever or haptics with beautiful. gestures long in remaining for every tap light every that every curated',
    icon: 'medal',
    gradient: 'neon',
  },
  {
    id: 'section-53125-5',
    title: 'Soft Tapestry',
    subtitle: 'tap while designed in gestures with tap browsing modes and pixel dark browsing and. alive tap long on in for considered in or every designed pixel and pixel while beautiful fast alive. every every A in dark fluid considered curated and haptics fast considered',
    icon: 'trophy',
    gradient: 'amber',
  },
  {
    id: 'section-53125-6',
    title: 'Deep Lens',
    subtitle: 'dark browsing and and light while while press or remaining browsing press designed that. dark on press long feel forever dark remaining across remaining in and long on private designed modes feel. every gestures modes or dark dark modes pixel that and with long',
    icon: 'lock-closed',
    gradient: 'cosmic',
  },
  {
    id: 'section-53125-7',
    title: 'Velvet Drift',
    subtitle: 'press designed that private every with considered A fluid feel every for browsing feel. considered experience tap and in private pixel fast for that every pixel remaining every pixel and gestures tap. or light every pixel dark in that every and with press and',
    icon: 'speedometer',
    gradient: 'neon',
  },
  {
    id: 'section-53125-8',
    title: 'Soft Saga',
    subtitle: 'for browsing feel tap A experience feel with considered or curated on for A. and and fluid and designed for long pixel browsing long alive in A light forever on on across. feel or beautiful across beautiful with beautiful every tap remaining and private',
    icon: 'cloud',
    gradient: 'brand',
  },
  {
    id: 'section-53125-9',
    title: 'Vibrant Drift',
    subtitle: 'on for A tap considered and forever modes and A designed experience or fast. alive fluid in browsing and on modes browsing browsing that haptics press considered considered gestures that while feel. pixel on beautiful across beautiful private every press with dark light considered',
    icon: 'compass',
    gradient: 'candy',
  },
  {
    id: 'section-53125-10',
    title: 'Dreamy Aurora',
    subtitle: 'experience or fast modes pixel every gestures fast in fluid designed with every experience. gestures remaining fluid tap that while and remaining modes remaining beautiful that across and or that feel designed. press beautiful in A dark gestures fluid for modes gestures with gestures',
    icon: 'compass',
    gradient: 'brand',
  },
  {
    id: 'section-53125-11',
    title: 'Soft Insight',
    subtitle: 'with every experience fluid forever that haptics for remaining pixel considered private with and. every beautiful every and browsing or haptics browsing private press every modes gestures press every press with modes. tap browsing modes and long alive fast feel considered fluid across feel',
    icon: 'compass',
    gradient: 'candy',
  },
  {
    id: 'section-53125-12',
    title: 'Deep Studio',
    subtitle: 'private with and and for private browsing modes beautiful beautiful fluid in modes press. experience and long on light haptics gestures every designed forever while press experience tap experience and experience curated. alive or that long fluid across fast tap considered experience on A',
    icon: 'heart',
    gradient: 'candy',
  },
  {
    id: 'section-53125-13',
    title: 'Vibrant Saga',
    subtitle: 'in modes press every private on remaining on or across tap dark with curated. curated tap or curated feel across forever long tap designed curated forever with curated on or across with. that remaining on modes press alive beautiful tap modes on alive and',
    icon: 'globe',
    gradient: 'brand',
  },
  {
    id: 'section-53125-14',
    title: 'Cosmic Pulse',
    subtitle: 'dark with curated browsing experience and haptics curated alive A alive gestures in feel. long fluid and every private that private gestures remaining considered and alive every gestures beautiful gestures fast while. every alive gestures fast modes designed fast pixel while haptics or light',
    icon: 'cart',
    gradient: 'midnight',
  },
];

const HERO_TITLE = 'Suggestions';
const HERO_SUBTITLE = 'Live suggestions while typing.';
const FOOTER_TITLE = 'Keep going with Suggestions';
const FOOTER_BODY = 'fluid long private fast tap or remaining alive for in haptics in A on. on across A beautiful fluid and alive tap considered on modes for fast long long curated tap forever. gestures tap private tap alive designed dark long every long while feel';

export const BrowserSearchSuggestionsScreen: React.FC = () => {
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
      variant="neon"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Suggestions"
        subtitle="Live suggestions while typing."
        showBack={true}
        rightIcon="sparkles"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="neon"
        badge="AI"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>40%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '40%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Mosaic</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>36%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '36%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>79%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '79%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>32%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '32%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>75%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '75%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>28%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '28%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>71%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
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
