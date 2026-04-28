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
    id: 'item-2285-1',
    title: 'Premium Forge 1',
    description: 'fluid beautiful and and curated gestures dark fluid modes modes and alive browsing fast. or across dark remaining tap across browsing experience every curated fluid forever tap that and A fluid private. across that across fast and dark or every every A experience for',
    icon: 'newspaper',
    gradient: 'sunset',
    tone: 'warning',
    meta: '40 mins ago',
    stat1: 325,
    stat2: 57,
    stat3: '1.5',
    verb: 'Archived',
  },
  {
    id: 'item-2285-2',
    title: 'Silky Quest 2',
    description: 'beautiful and and curated gestures dark fluid modes modes and alive browsing fast gestures. dark remaining tap across browsing experience every curated fluid forever tap that and A fluid private browsing for. fast and dark or every every A experience for alive with every',
    icon: 'book',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '41 mins ago',
    stat1: 338,
    stat2: 64,
    stat3: '3.4',
    verb: 'Shared',
  },
  {
    id: 'item-2285-3',
    title: 'Polished Echo 3',
    description: 'and and curated gestures dark fluid modes modes and alive browsing fast gestures light. tap across browsing experience every curated fluid forever tap that and A fluid private browsing for and remaining. or every every A experience for alive with every and tap with',
    icon: 'gift',
    gradient: 'neon',
    tone: 'accent',
    meta: '42 mins ago',
    stat1: 351,
    stat2: 71,
    stat3: '0.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-2285-4',
    title: 'Brisk Lens 4',
    description: 'and curated gestures dark fluid modes modes and alive browsing fast gestures light remaining. browsing experience every curated fluid forever tap that and A fluid private browsing for and remaining feel A. A experience for alive with every and tap with pixel light for',
    icon: 'eye',
    gradient: 'candy',
    tone: 'info',
    meta: '43 mins ago',
    stat1: 364,
    stat2: 78,
    stat3: '2.2',
    verb: 'Highlighted',
  },
  {
    id: 'item-2285-5',
    title: 'Glassy Echo 5',
    description: 'curated gestures dark fluid modes modes and alive browsing fast gestures light remaining every. every curated fluid forever tap that and A fluid private browsing for and remaining feel A on fluid. alive with every and tap with pixel light for gestures tap across',
    icon: 'medal',
    gradient: 'pastel',
    tone: 'info',
    meta: '44 mins ago',
    stat1: 377,
    stat2: 85,
    stat3: '4.1',
    verb: 'Archived',
  },
  {
    id: 'item-2285-6',
    title: 'Brisk Quest 6',
    description: 'gestures dark fluid modes modes and alive browsing fast gestures light remaining every every. fluid forever tap that and A fluid private browsing for and remaining feel A on fluid or modes. and tap with pixel light for gestures tap across beautiful light with',
    icon: 'gift',
    gradient: 'pastel',
    tone: 'danger',
    meta: '45 mins ago',
    stat1: 390,
    stat2: 92,
    stat3: '1.0',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2285-7',
    title: 'Polished Stream 7',
    description: 'dark fluid modes modes and alive browsing fast gestures light remaining every every private. tap that and A fluid private browsing for and remaining feel A on fluid or modes long dark. pixel light for gestures tap across beautiful light with private haptics A',
    icon: 'heart',
    gradient: 'neon',
    tone: 'success',
    meta: '46 mins ago',
    stat1: 403,
    stat2: 99,
    stat3: '2.9',
    verb: 'Translated',
  },
  {
    id: 'item-2285-8',
    title: 'Crisp Halo 8',
    description: 'fluid modes modes and alive browsing fast gestures light remaining every every private in. and A fluid private browsing for and remaining feel A on fluid or modes long dark pixel alive. gestures tap across beautiful light with private haptics A in haptics long',
    icon: 'star',
    gradient: 'sunset',
    tone: 'primary',
    meta: '47 mins ago',
    stat1: 416,
    stat2: 7,
    stat3: '4.8',
    verb: 'Followed',
  },
  {
    id: 'item-2285-9',
    title: 'Buttery Atlas 9',
    description: 'modes modes and alive browsing fast gestures light remaining every every private in feel. fluid private browsing for and remaining feel A on fluid or modes long dark pixel alive every A. beautiful light with private haptics A in haptics long and private A',
    icon: 'school',
    gradient: 'midnight',
    tone: 'accent',
    meta: '48 mins ago',
    stat1: 429,
    stat2: 14,
    stat3: '1.7',
    verb: 'Pinned',
  },
  {
    id: 'item-2285-10',
    title: 'Lush Quest 10',
    description: 'modes and alive browsing fast gestures light remaining every every private in feel and. browsing for and remaining feel A on fluid or modes long dark pixel alive every A while remaining. private haptics A in haptics long and private A experience haptics for',
    icon: 'planet',
    gradient: 'fire',
    tone: 'warning',
    meta: '49 mins ago',
    stat1: 442,
    stat2: 21,
    stat3: '3.6',
    verb: 'Read',
  },
  {
    id: 'item-2285-11',
    title: 'Polished Studio 11',
    description: 'and alive browsing fast gestures light remaining every every private in feel and beautiful. and remaining feel A on fluid or modes long dark pixel alive every A while remaining fast in. in haptics long and private A experience haptics for for press light',
    icon: 'compass',
    gradient: 'cosmic',
    tone: 'success',
    meta: '50 mins ago',
    stat1: 455,
    stat2: 28,
    stat3: '0.5',
    verb: 'Archived',
  },
  {
    id: 'item-2285-12',
    title: 'Vibrant Aurora 12',
    description: 'alive browsing fast gestures light remaining every every private in feel and beautiful or. feel A on fluid or modes long dark pixel alive every A while remaining fast in every A. and private A experience haptics for for press light that private light',
    icon: 'shield',
    gradient: 'amber',
    tone: 'danger',
    meta: '51 mins ago',
    stat1: 468,
    stat2: 35,
    stat3: '2.4',
    verb: 'Visited',
  },
  {
    id: 'item-2285-13',
    title: 'Sleek Tapestry 13',
    description: 'browsing fast gestures light remaining every every private in feel and beautiful or and. on fluid or modes long dark pixel alive every A while remaining fast in every A and with. experience haptics for for press light that private light on long pixel',
    icon: 'eye',
    gradient: 'neon',
    tone: 'danger',
    meta: '52 mins ago',
    stat1: 481,
    stat2: 42,
    stat3: '4.3',
    verb: 'Saved',
  },
  {
    id: 'item-2285-14',
    title: 'Subtle Spark 14',
    description: 'fast gestures light remaining every every private in feel and beautiful or and every. or modes long dark pixel alive every A while remaining fast in every A and with in every. for press light that private light on long pixel light feel fast',
    icon: 'shield',
    gradient: 'aurora',
    tone: 'info',
    meta: '53 mins ago',
    stat1: 494,
    stat2: 49,
    stat3: '1.2',
    verb: 'Highlighted',
  },
  {
    id: 'item-2285-15',
    title: 'Soft Forge 15',
    description: 'gestures light remaining every every private in feel and beautiful or and every fluid. long dark pixel alive every A while remaining fast in every A and with in every that and. that private light on long pixel light feel fast fast light considered',
    icon: 'eye',
    gradient: 'forest',
    tone: 'info',
    meta: '54 mins ago',
    stat1: 507,
    stat2: 56,
    stat3: '3.1',
    verb: 'Visited',
  },
  {
    id: 'item-2285-16',
    title: 'Silky Loom 16',
    description: 'light remaining every every private in feel and beautiful or and every fluid for. pixel alive every A while remaining fast in every A and with in every that and designed in. on long pixel light feel fast fast light considered considered while light',
    icon: 'shield',
    gradient: 'pastel',
    tone: 'danger',
    meta: '55 mins ago',
    stat1: 520,
    stat2: 63,
    stat3: '0.0',
    verb: 'Opened',
  },
  {
    id: 'item-2285-17',
    title: 'Punchy Lens 17',
    description: 'remaining every every private in feel and beautiful or and every fluid for and. every A while remaining fast in every A and with in every that and designed in and on. light feel fast fast light considered considered while light and tap long',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'primary',
    meta: '56 mins ago',
    stat1: 533,
    stat2: 70,
    stat3: '1.9',
    verb: 'Pinned',
  },
  {
    id: 'item-2285-18',
    title: 'Glassy Codex 18',
    description: 'every every private in feel and beautiful or and every fluid for and fast. while remaining fast in every A and with in every that and designed in and on and designed. fast light considered considered while light and tap long designed modes in',
    icon: 'shield',
    gradient: 'brand',
    tone: 'warning',
    meta: '57 mins ago',
    stat1: 546,
    stat2: 77,
    stat3: '3.8',
    verb: 'Opened',
  },
  {
    id: 'item-2285-19',
    title: 'Cosmic Aurora 19',
    description: 'every private in feel and beautiful or and every fluid for and fast dark. fast in every A and with in every that and designed in and on and designed across private. considered while light and tap long designed modes in on on with',
    icon: 'flame',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '58 mins ago',
    stat1: 559,
    stat2: 84,
    stat3: '0.7',
    verb: 'Shared',
  },
  {
    id: 'item-2285-20',
    title: 'Sleek Drift 20',
    description: 'private in feel and beautiful or and every fluid for and fast dark across. every A and with in every that and designed in and on and designed across private across pixel. and tap long designed modes in on on with gestures fluid or',
    icon: 'paw',
    gradient: 'brand',
    tone: 'accent',
    meta: '59 mins ago',
    stat1: 572,
    stat2: 91,
    stat3: '2.6',
    verb: 'Archived',
  },
  {
    id: 'item-2285-21',
    title: 'Dreamy Tapestry 21',
    description: 'in feel and beautiful or and every fluid for and fast dark across remaining. and with in every that and designed in and on and designed across private across pixel tap private. designed modes in on on with gestures fluid or fast in modes',
    icon: 'layers',
    gradient: 'candy',
    tone: 'danger',
    meta: '60 mins ago',
    stat1: 585,
    stat2: 98,
    stat3: '4.5',
    verb: 'Saved',
  },
  {
    id: 'item-2285-22',
    title: 'Subtle Lens 22',
    description: 'feel and beautiful or and every fluid for and fast dark across remaining and. in every that and designed in and on and designed across private across pixel tap private with alive. on on with gestures fluid or fast in modes or pixel modes',
    icon: 'extension-puzzle',
    gradient: 'neon',
    tone: 'info',
    meta: '61 mins ago',
    stat1: 598,
    stat2: 6,
    stat3: '1.4',
    verb: 'Shared',
  },
  {
    id: 'item-2285-23',
    title: 'Glassy Pulse 23',
    description: 'and beautiful or and every fluid for and fast dark across remaining and forever. that and designed in and on and designed across private across pixel tap private with alive that considered. gestures fluid or fast in modes or pixel modes tap remaining forever',
    icon: 'newspaper',
    gradient: 'forest',
    tone: 'accent',
    meta: '62 mins ago',
    stat1: 611,
    stat2: 13,
    stat3: '3.3',
    verb: 'Saved',
  },
  {
    id: 'item-2285-24',
    title: 'Elite Pulse 24',
    description: 'beautiful or and every fluid for and fast dark across remaining and forever with. designed in and on and designed across private across pixel tap private with alive that considered or while. fast in modes or pixel modes tap remaining forever forever tap considered',
    icon: 'image',
    gradient: 'candy',
    tone: 'info',
    meta: '63 mins ago',
    stat1: 624,
    stat2: 20,
    stat3: '0.2',
    verb: 'Archived',
  },
  {
    id: 'item-2285-25',
    title: 'Elite Lens 25',
    description: 'or and every fluid for and fast dark across remaining and forever with for. and on and designed across private across pixel tap private with alive that considered or while curated experience. or pixel modes tap remaining forever forever tap considered or and private',
    icon: 'planet',
    gradient: 'forest',
    tone: 'danger',
    meta: '64 mins ago',
    stat1: 637,
    stat2: 27,
    stat3: '2.1',
    verb: 'Followed',
  },
  {
    id: 'item-2285-26',
    title: 'Glassy Atlas 26',
    description: 'and every fluid for and fast dark across remaining and forever with for on. and designed across private across pixel tap private with alive that considered or while curated experience or in. tap remaining forever forever tap considered or and private on long press',
    icon: 'paw',
    gradient: 'neon',
    tone: 'accent',
    meta: '65 mins ago',
    stat1: 650,
    stat2: 34,
    stat3: '4.0',
    verb: 'Archived',
  },
  {
    id: 'item-2285-27',
    title: 'Lush Lens 27',
    description: 'every fluid for and fast dark across remaining and forever with for on browsing. across private across pixel tap private with alive that considered or while curated experience or in dark feel. forever tap considered or and private on long press designed alive and',
    icon: 'flash',
    gradient: 'fire',
    tone: 'danger',
    meta: '66 mins ago',
    stat1: 663,
    stat2: 41,
    stat3: '0.9',
    verb: 'Translated',
  },
  {
    id: 'item-2285-28',
    title: 'Glassy Atlas 28',
    description: 'fluid for and fast dark across remaining and forever with for on browsing light. across pixel tap private with alive that considered or while curated experience or in dark feel fast gestures. or and private on long press designed alive and long haptics dark',
    icon: 'film',
    gradient: 'neon',
    tone: 'primary',
    meta: '67 mins ago',
    stat1: 676,
    stat2: 48,
    stat3: '2.8',
    verb: 'Archived',
  },
  {
    id: 'item-2285-29',
    title: 'Lush Loom 29',
    description: 'for and fast dark across remaining and forever with for on browsing light in. tap private with alive that considered or while curated experience or in dark feel fast gestures across and. on long press designed alive and long haptics dark while and alive',
    icon: 'speedometer',
    gradient: 'midnight',
    tone: 'danger',
    meta: '68 mins ago',
    stat1: 689,
    stat2: 55,
    stat3: '4.7',
    verb: 'Pinned',
  },
  {
    id: 'item-2285-30',
    title: 'Punchy Forge 30',
    description: 'and fast dark across remaining and forever with for on browsing light in beautiful. with alive that considered or while curated experience or in dark feel fast gestures across and on fast. designed alive and long haptics dark while and alive pixel on with',
    icon: 'bookmark',
    gradient: 'neon',
    tone: 'warning',
    meta: '69 mins ago',
    stat1: 702,
    stat2: 62,
    stat3: '1.6',
    verb: 'Followed',
  },
  {
    id: 'item-2285-31',
    title: 'Silky Halo 31',
    description: 'fast dark across remaining and forever with for on browsing light in beautiful press. that considered or while curated experience or in dark feel fast gestures across and on fast that long. long haptics dark while and alive pixel on with that fluid experience',
    icon: 'newspaper',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '70 mins ago',
    stat1: 715,
    stat2: 69,
    stat3: '3.5',
    verb: 'Read',
  },
  {
    id: 'item-2285-32',
    title: 'Buttery Atlas 32',
    description: 'dark across remaining and forever with for on browsing light in beautiful press pixel. or while curated experience or in dark feel fast gestures across and on fast that long with press. while and alive pixel on with that fluid experience in designed considered',
    icon: 'pricetag',
    gradient: 'fire',
    tone: 'success',
    meta: '71 mins ago',
    stat1: 728,
    stat2: 76,
    stat3: '0.4',
    verb: 'Saved',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-38845-1',
    title: 'Sleek Tapestry',
    subtitle: 'beautiful on on designed browsing browsing gestures with on pixel modes modes gestures considered. experience every private fluid experience alive A curated fluid designed every curated considered long forever designed fluid with. in gestures with haptics and fluid on alive for designed gestures forever',
    icon: 'sparkles',
    gradient: 'fire',
  },
  {
    id: 'section-38845-2',
    title: 'Cosmic Tapestry',
    subtitle: 'modes gestures considered curated long curated and forever on fluid gestures or considered alive. across every or press tap with fast gestures considered press while and forever or gestures forever tap A. considered beautiful forever and long experience haptics that pixel tap every and',
    icon: 'flag',
    gradient: 'candy',
  },
  {
    id: 'section-38845-3',
    title: 'Elite Forge',
    subtitle: 'or considered alive every light remaining considered beautiful browsing private feel while pixel beautiful. on and browsing haptics long dark every gestures designed considered or alive light in alive with or and. haptics alive dark haptics on gestures in haptics long beautiful and considered',
    icon: 'analytics',
    gradient: 'candy',
  },
  {
    id: 'section-38845-4',
    title: 'Polished Halo',
    subtitle: 'while pixel beautiful curated fast A with feel or that fast experience on alive. remaining alive light long curated every haptics experience that across every haptics that tap every light fluid considered. curated pixel considered in beautiful modes remaining every alive on across considered',
    icon: 'book',
    gradient: 'pastel',
  },
  {
    id: 'section-38845-5',
    title: 'Premium Loom',
    subtitle: 'experience on alive experience forever pixel every light across tap fast modes curated light. while that every experience browsing light that fast that in tap experience on every feel across or remaining. across press private and light considered dark remaining alive pixel A gestures',
    icon: 'leaf',
    gradient: 'fire',
  },
  {
    id: 'section-38845-6',
    title: 'Elite Loom',
    subtitle: 'modes curated light forever feel every remaining dark tap private and remaining gestures haptics. gestures fast modes fluid pixel designed tap experience browsing remaining or fast experience every with haptics on every. fluid long in A every forever or beautiful fluid haptics experience modes',
    icon: 'globe',
    gradient: 'forest',
  },
  {
    id: 'section-38845-7',
    title: 'Soft Echo',
    subtitle: 'remaining gestures haptics light while forever every and and gestures dark gestures curated gestures. and gestures alive private A gestures pixel fluid across and remaining for tap on and experience modes haptics. A haptics that modes experience across tap every private across considered or',
    icon: 'gift',
    gradient: 'pastel',
  },
  {
    id: 'section-38845-8',
    title: 'Deep Spark',
    subtitle: 'gestures curated gestures and or on forever across fluid modes and dark feel and. dark browsing every fast fast browsing haptics experience alive dark fast alive on feel press feel experience experience. and curated and fast with press fast with long and on designed',
    icon: 'paw',
    gradient: 'cosmic',
  },
  {
    id: 'section-38845-9',
    title: 'Crisp Loom',
    subtitle: 'dark feel and haptics long modes beautiful with remaining experience experience and considered across. A that designed designed pixel curated curated private fast every considered long designed long A A in light. with alive gestures private every or and or feel haptics that that',
    icon: 'newspaper',
    gradient: 'pastel',
  },
  {
    id: 'section-38845-10',
    title: 'Vibrant Insight',
    subtitle: 'and considered across alive fluid pixel and A and on and and private fluid. across pixel every for every and modes modes across modes in every every forever on browsing forever remaining. haptics and dark alive gestures fluid forever on light and modes fast',
    icon: 'paw',
    gradient: 'ocean',
  },
  {
    id: 'section-38845-11',
    title: 'Lush Forge',
    subtitle: 'and private fluid haptics modes and that that and light for browsing gestures press. while or fast fast press that browsing modes pixel alive in gestures long private private every in that. curated feel every fluid considered across that browsing on tap on considered',
    icon: 'school',
    gradient: 'ocean',
  },
  {
    id: 'section-38845-12',
    title: 'Dreamy Spark',
    subtitle: 'browsing gestures press across that considered press press modes across private tap browsing experience. designed or light in curated in remaining fast fast across fast every gestures press considered and A dark. browsing on curated with forever and browsing or remaining designed experience browsing',
    icon: 'analytics',
    gradient: 'amber',
  },
  {
    id: 'section-38845-13',
    title: 'Vibrant Mosaic',
    subtitle: 'tap browsing experience modes and beautiful browsing for and in curated light tap tap. remaining fast curated on curated for feel modes and gestures press gestures every remaining beautiful tap every while. modes forever fluid designed tap modes remaining press forever modes on remaining',
    icon: 'cafe',
    gradient: 'midnight',
  },
  {
    id: 'section-38845-14',
    title: 'Subtle Studio',
    subtitle: 'light tap tap with curated curated beautiful that forever alive and fast across modes. and for gestures and every that that forever every and and tap forever light press remaining forever experience. while A tap light beautiful tap fluid across A for across for',
    icon: 'medal',
    gradient: 'aurora',
  },
];

const HERO_TITLE = 'Preview';
const HERO_SUBTITLE = 'Mock viewer for the selected file.';
const FOOTER_TITLE = 'Keep going with Preview';
const FOOTER_BODY = 'across that across fast and dark or every every A experience for alive with. with fluid in dark private haptics gestures every and while forever modes for every every or for private. while long with haptics A in and every experience every tap with';

export const DownloadsPreviewScreen: React.FC = () => {
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
      (navigation as any).navigate('DownloadsPreview', { downloadId: 'dl-1' });
    },
    [navigation],
  );
  const goAlt = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('DownloadsActions', { downloadId: 'dl-1' });
    },
    [navigation],
  );
  const goDeep = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('DownloadsSettings', undefined);
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
        title="Preview"
        subtitle="Mock viewer for the selected file."
        showBack={true}
        rightIcon="eye"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="cosmic"
        badge="L2"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>10%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '10%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>53%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '53%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>6%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '6%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>49%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '49%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>92%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '92%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>45%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '45%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>88%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '88%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>41%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '41%' }]}
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
