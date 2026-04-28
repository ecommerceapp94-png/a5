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
    id: 'item-2818-1',
    title: 'Glassy Aurora 1',
    description: 'browsing for light fast browsing fast and beautiful forever and tap press experience light. feel haptics while modes press press beautiful that and across for press and long alive and designed dark. every every every forever that on pixel beautiful every private beautiful on',
    icon: 'cafe',
    gradient: 'midnight',
    tone: 'accent',
    meta: '33 mins ago',
    stat1: 394,
    stat2: 26,
    stat3: '4.2',
    verb: 'Pinned',
  },
  {
    id: 'item-2818-2',
    title: 'Sleek Spark 2',
    description: 'for light fast browsing fast and beautiful forever and tap press experience light browsing. while modes press press beautiful that and across for press and long alive and designed dark press and. forever that on pixel beautiful every private beautiful on gestures on private',
    icon: 'cloud',
    gradient: 'fire',
    tone: 'warning',
    meta: '34 mins ago',
    stat1: 407,
    stat2: 33,
    stat3: '1.1',
    verb: 'Opened',
  },
  {
    id: 'item-2818-3',
    title: 'Soft Codex 3',
    description: 'light fast browsing fast and beautiful forever and tap press experience light browsing remaining. press press beautiful that and across for press and long alive and designed dark press and private forever. pixel beautiful every private beautiful on gestures on private remaining while fluid',
    icon: 'pricetag',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '35 mins ago',
    stat1: 420,
    stat2: 40,
    stat3: '3.0',
    verb: 'Followed',
  },
  {
    id: 'item-2818-4',
    title: 'Cosmic Loom 4',
    description: 'fast browsing fast and beautiful forever and tap press experience light browsing remaining forever. beautiful that and across for press and long alive and designed dark press and private forever or every. private beautiful on gestures on private remaining while fluid press while alive',
    icon: 'pricetag',
    gradient: 'brand',
    tone: 'accent',
    meta: '36 mins ago',
    stat1: 433,
    stat2: 47,
    stat3: '4.9',
    verb: 'Archived',
  },
  {
    id: 'item-2818-5',
    title: 'Punchy Drift 5',
    description: 'browsing fast and beautiful forever and tap press experience light browsing remaining forever beautiful. and across for press and long alive and designed dark press and private forever or every fluid curated. gestures on private remaining while fluid press while alive beautiful fast A',
    icon: 'pizza',
    gradient: 'fire',
    tone: 'danger',
    meta: '37 mins ago',
    stat1: 446,
    stat2: 54,
    stat3: '1.8',
    verb: 'Saved',
  },
  {
    id: 'item-2818-6',
    title: 'Dreamy Drift 6',
    description: 'fast and beautiful forever and tap press experience light browsing remaining forever beautiful and. for press and long alive and designed dark press and private forever or every fluid curated remaining every. remaining while fluid press while alive beautiful fast A light feel A',
    icon: 'cafe',
    gradient: 'neon',
    tone: 'info',
    meta: '38 mins ago',
    stat1: 459,
    stat2: 61,
    stat3: '3.7',
    verb: 'Read',
  },
  {
    id: 'item-2818-7',
    title: 'Dreamy Mosaic 7',
    description: 'and beautiful forever and tap press experience light browsing remaining forever beautiful and fast. and long alive and designed dark press and private forever or every fluid curated remaining every or in. press while alive beautiful fast A light feel A in haptics every',
    icon: 'paw',
    gradient: 'forest',
    tone: 'success',
    meta: '39 mins ago',
    stat1: 472,
    stat2: 68,
    stat3: '0.6',
    verb: 'Searched',
  },
  {
    id: 'item-2818-8',
    title: 'Deep Forge 8',
    description: 'beautiful forever and tap press experience light browsing remaining forever beautiful and fast experience. alive and designed dark press and private forever or every fluid curated remaining every or in experience browsing. beautiful fast A light feel A in haptics every across every pixel',
    icon: 'flag',
    gradient: 'amber',
    tone: 'warning',
    meta: '40 mins ago',
    stat1: 485,
    stat2: 75,
    stat3: '2.5',
    verb: 'Read',
  },
  {
    id: 'item-2818-9',
    title: 'Silky Tapestry 9',
    description: 'forever and tap press experience light browsing remaining forever beautiful and fast experience remaining. designed dark press and private forever or every fluid curated remaining every or in experience browsing designed while. light feel A in haptics every across every pixel private beautiful fast',
    icon: 'image',
    gradient: 'ocean',
    tone: 'success',
    meta: '41 mins ago',
    stat1: 498,
    stat2: 82,
    stat3: '4.4',
    verb: 'Translated',
  },
  {
    id: 'item-2818-10',
    title: 'Subtle Loom 10',
    description: 'and tap press experience light browsing remaining forever beautiful and fast experience remaining and. press and private forever or every fluid curated remaining every or in experience browsing designed while tap modes. in haptics every across every pixel private beautiful fast on gestures press',
    icon: 'image',
    gradient: 'amber',
    tone: 'primary',
    meta: '42 mins ago',
    stat1: 511,
    stat2: 89,
    stat3: '1.3',
    verb: 'Archived',
  },
  {
    id: 'item-2818-11',
    title: 'Punchy Halo 11',
    description: 'tap press experience light browsing remaining forever beautiful and fast experience remaining and pixel. private forever or every fluid curated remaining every or in experience browsing designed while tap modes fluid press. across every pixel private beautiful fast on gestures press and with feel',
    icon: 'cafe',
    gradient: 'midnight',
    tone: 'danger',
    meta: '43 mins ago',
    stat1: 524,
    stat2: 96,
    stat3: '3.2',
    verb: 'Followed',
  },
  {
    id: 'item-2818-12',
    title: 'Buttery Spark 12',
    description: 'press experience light browsing remaining forever beautiful and fast experience remaining and pixel or. or every fluid curated remaining every or in experience browsing designed while tap modes fluid press on while. private beautiful fast on gestures press and with feel or on in',
    icon: 'shield',
    gradient: 'neon',
    tone: 'accent',
    meta: '44 mins ago',
    stat1: 537,
    stat2: 4,
    stat3: '0.1',
    verb: 'Opened',
  },
  {
    id: 'item-2818-13',
    title: 'Soft Saga 13',
    description: 'experience light browsing remaining forever beautiful and fast experience remaining and pixel or alive. fluid curated remaining every or in experience browsing designed while tap modes fluid press on while press haptics. on gestures press and with feel or on in tap on on',
    icon: 'eye',
    gradient: 'fire',
    tone: 'primary',
    meta: '45 mins ago',
    stat1: 550,
    stat2: 11,
    stat3: '2.0',
    verb: 'Pinned',
  },
  {
    id: 'item-2818-14',
    title: 'Frosted Atlas 14',
    description: 'light browsing remaining forever beautiful and fast experience remaining and pixel or alive and. remaining every or in experience browsing designed while tap modes fluid press on while press haptics light forever. and with feel or on in tap on on A modes experience',
    icon: 'planet',
    gradient: 'brand',
    tone: 'warning',
    meta: '46 mins ago',
    stat1: 563,
    stat2: 18,
    stat3: '3.9',
    verb: 'Followed',
  },
  {
    id: 'item-2818-15',
    title: 'Lush Aurora 15',
    description: 'browsing remaining forever beautiful and fast experience remaining and pixel or alive and and. or in experience browsing designed while tap modes fluid press on while press haptics light forever on every. or on in tap on on A modes experience across fluid designed',
    icon: 'newspaper',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '47 mins ago',
    stat1: 576,
    stat2: 25,
    stat3: '0.8',
    verb: 'Searched',
  },
  {
    id: 'item-2818-16',
    title: 'Sleek Drift 16',
    description: 'remaining forever beautiful and fast experience remaining and pixel or alive and and for. experience browsing designed while tap modes fluid press on while press haptics light forever on every beautiful considered. tap on on A modes experience across fluid designed in remaining pixel',
    icon: 'speedometer',
    gradient: 'fire',
    tone: 'warning',
    meta: '48 mins ago',
    stat1: 589,
    stat2: 32,
    stat3: '2.7',
    verb: 'Archived',
  },
  {
    id: 'item-2818-17',
    title: 'Dreamy Beacon 17',
    description: 'forever beautiful and fast experience remaining and pixel or alive and and for beautiful. designed while tap modes fluid press on while press haptics light forever on every beautiful considered experience A. A modes experience across fluid designed in remaining pixel experience for long',
    icon: 'extension-puzzle',
    gradient: 'ocean',
    tone: 'danger',
    meta: '49 mins ago',
    stat1: 602,
    stat2: 39,
    stat3: '4.6',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2818-18',
    title: 'Velvet Spark 18',
    description: 'beautiful and fast experience remaining and pixel or alive and and for beautiful with. tap modes fluid press on while press haptics light forever on every beautiful considered experience A and considered. across fluid designed in remaining pixel experience for long across or fluid',
    icon: 'pizza',
    gradient: 'neon',
    tone: 'success',
    meta: '50 mins ago',
    stat1: 615,
    stat2: 46,
    stat3: '1.5',
    verb: 'Shared',
  },
  {
    id: 'item-2818-19',
    title: 'Soft Halo 19',
    description: 'and fast experience remaining and pixel or alive and and for beautiful with private. fluid press on while press haptics light forever on every beautiful considered experience A and considered with long. in remaining pixel experience for long across or fluid dark fast feel',
    icon: 'globe',
    gradient: 'sunset',
    tone: 'accent',
    meta: '51 mins ago',
    stat1: 628,
    stat2: 53,
    stat3: '3.4',
    verb: 'Shared',
  },
  {
    id: 'item-2818-20',
    title: 'Buttery Pulse 20',
    description: 'fast experience remaining and pixel or alive and and for beautiful with private feel. on while press haptics light forever on every beautiful considered experience A and considered with long modes tap. experience for long across or fluid dark fast feel designed curated and',
    icon: 'extension-puzzle',
    gradient: 'candy',
    tone: 'accent',
    meta: '52 mins ago',
    stat1: 641,
    stat2: 60,
    stat3: '0.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2818-21',
    title: 'Elite Pulse 21',
    description: 'experience remaining and pixel or alive and and for beautiful with private feel long. press haptics light forever on every beautiful considered experience A and considered with long modes tap long tap. across or fluid dark fast feel designed curated and designed tap designed',
    icon: 'paw',
    gradient: 'candy',
    tone: 'success',
    meta: '53 mins ago',
    stat1: 654,
    stat2: 67,
    stat3: '2.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2818-22',
    title: 'Elite Pulse 22',
    description: 'remaining and pixel or alive and and for beautiful with private feel long browsing. light forever on every beautiful considered experience A and considered with long modes tap long tap and alive. dark fast feel designed curated and designed tap designed and in gestures',
    icon: 'layers',
    gradient: 'sunset',
    tone: 'success',
    meta: '54 mins ago',
    stat1: 667,
    stat2: 74,
    stat3: '4.1',
    verb: 'Pinned',
  },
  {
    id: 'item-2818-23',
    title: 'Elite Echo 23',
    description: 'and pixel or alive and and for beautiful with private feel long browsing alive. on every beautiful considered experience A and considered with long modes tap long tap and alive browsing with. designed curated and designed tap designed and in gestures every remaining every',
    icon: 'medal',
    gradient: 'sunset',
    tone: 'warning',
    meta: '55 mins ago',
    stat1: 680,
    stat2: 81,
    stat3: '1.0',
    verb: 'Saved',
  },
  {
    id: 'item-2818-24',
    title: 'Brisk Pulse 24',
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
    id: 'item-2818-25',
    title: 'Elite Pulse 25',
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
    id: 'item-2818-26',
    title: 'Elite Tapestry 26',
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
    id: 'item-2818-27',
    title: 'Subtle Beacon 27',
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
    id: 'item-2818-28',
    title: 'Velvet Lens 28',
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
    id: 'item-2818-29',
    title: 'Glassy Compass 29',
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
    id: 'item-2818-30',
    title: 'Snappy Halo 30',
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
    id: 'item-2818-31',
    title: 'Buttery Beacon 31',
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
    id: 'item-2818-32',
    title: 'Velvet Studio 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-47906-1',
    title: 'Silky Studio',
    subtitle: 'designed every in private on and curated fast and light designed dark experience designed. A light every long long private feel on press considered experience every designed remaining or alive browsing remaining. forever fast on in alive fast private and curated designed with that',
    icon: 'book',
    gradient: 'midnight',
  },
  {
    id: 'section-47906-2',
    title: 'Polished Pulse',
    subtitle: 'dark experience designed curated designed A or dark considered long beautiful every in haptics. press haptics experience while feel curated on every gestures tap alive alive dark private while experience light with. every long gestures fluid and haptics A alive remaining feel modes pixel',
    icon: 'flame',
    gradient: 'amber',
  },
  {
    id: 'section-47906-3',
    title: 'Subtle Pulse',
    subtitle: 'every in haptics pixel for press long alive dark A press feel and fluid. A across modes across and and considered experience haptics pixel while for long on on and tap tap. modes gestures browsing every and press in fluid in press and beautiful',
    icon: 'heart',
    gradient: 'midnight',
  },
  {
    id: 'section-47906-4',
    title: 'Punchy Halo',
    subtitle: 'feel and fluid every feel fluid every that beautiful fast in remaining private considered. press private considered browsing fluid for tap that pixel fast while modes dark experience browsing considered pixel and. every haptics curated or and that feel fluid tap fluid or and',
    icon: 'sparkles',
    gradient: 'brand',
  },
  {
    id: 'section-47906-5',
    title: 'Lush Insight',
    subtitle: 'remaining private considered A fast alive alive curated curated in dark and in every. A press press considered for every every tap considered experience or forever experience long in fast designed considered. beautiful browsing dark browsing gestures across or and alive A designed considered',
    icon: 'star',
    gradient: 'fire',
  },
  {
    id: 'section-47906-6',
    title: 'Brisk Quest',
    subtitle: 'and in every fast on remaining dark curated gestures and curated press gestures modes. press considered browsing alive for browsing in while browsing dark browsing fluid forever across that long for pixel. while and considered designed forever dark considered while beautiful for private every',
    icon: 'briefcase',
    gradient: 'aurora',
  },
  {
    id: 'section-47906-7',
    title: 'Polished Pulse',
    subtitle: 'press gestures modes feel experience light press while or with on and long in. A designed pixel fluid gestures every feel while curated alive pixel while private modes considered tap experience remaining. for across haptics experience and experience beautiful browsing press or and and',
    icon: 'image',
    gradient: 'sunset',
  },
  {
    id: 'section-47906-8',
    title: 'Deep Compass',
    subtitle: 'and long in or fluid on experience haptics haptics press every haptics considered for. or considered and A feel on and while or gestures and for A dark for that in A. alive and considered on long gestures while on remaining modes and or',
    icon: 'medal',
    gradient: 'amber',
  },
  {
    id: 'section-47906-9',
    title: 'Crisp Studio',
    subtitle: 'haptics considered for fast and modes designed A alive gestures every beautiful and that. light while private curated remaining and on or alive private private modes experience beautiful on with feel browsing. long across considered feel and every feel for fast and beautiful in',
    icon: 'globe',
    gradient: 'amber',
  },
  {
    id: 'section-47906-10',
    title: 'Crisp Loom',
    subtitle: 'beautiful and that on and tap experience and and haptics A in A for. haptics considered every experience and dark pixel on light every pixel forever light that and forever and modes. private designed and dark considered private long and and forever experience browsing',
    icon: 'compass',
    gradient: 'cosmic',
  },
  {
    id: 'section-47906-11',
    title: 'Glassy Stream',
    subtitle: 'in A for curated feel and and that private and with and light dark. private experience across and feel or tap gestures across and dark that haptics considered dark considered modes press. across press A gestures and or every pixel haptics and pixel beautiful',
    icon: 'newspaper',
    gradient: 'pastel',
  },
  {
    id: 'section-47906-12',
    title: 'Elite Drift',
    subtitle: 'and light dark feel modes and experience experience modes across considered A fluid experience. dark in private tap across and alive designed or alive light and every A with alive forever every. light feel and for and gestures for dark forever across beautiful dark',
    icon: 'analytics',
    gradient: 'cosmic',
  },
  {
    id: 'section-47906-13',
    title: 'Subtle Stream',
    subtitle: 'A fluid experience alive gestures curated experience while alive for while that every and. fluid and haptics in long and tap and fast press in pixel fluid designed every modes light across. alive while press fast for across modes across dark haptics dark haptics',
    icon: 'globe',
    gradient: 'midnight',
  },
  {
    id: 'section-47906-14',
    title: 'Silky Studio',
    subtitle: 'that every and on designed press modes beautiful remaining that and modes designed and. feel forever private designed and or pixel considered or A or A while experience in feel press private. long considered that press curated every while A light forever tap forever',
    icon: 'star',
    gradient: 'forest',
  },
];

const HERO_TITLE = 'Speed dial';
const HERO_SUBTITLE = 'Tap any tile to open detailed insights.';
const FOOTER_TITLE = 'Keep going with Speed dial';
const FOOTER_BODY = 'every every every forever that on pixel beautiful every private beautiful on gestures on. every forever or pixel beautiful fluid or light with on forever pixel alive designed A fluid forever browsing. on with alive fluid remaining across A beautiful private and forever fast';

export const BrowserSpeedDialDetailScreen: React.FC = () => {
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
      variant="cosmic"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Speed dial"
        subtitle="Tap any tile to open detailed insights."
        showBack={true}
        rightIcon="options"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="cosmic"
        badge="Detail"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>9%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '9%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>52%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '52%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>5%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '5%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>48%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '48%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>91%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '91%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>44%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '44%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>87%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '87%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>40%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '40%' }]}
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
