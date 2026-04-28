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
    id: 'item-1849-1',
    title: 'Crisp Drift 1',
    description: 'tap across beautiful feel private with or private every designed while designed gestures light. experience or across or while experience on in designed alive haptics and forever that or pixel fast curated. that browsing alive feel for for on every every considered with every',
    icon: 'globe',
    gradient: 'pastel',
    tone: 'success',
    meta: '54 mins ago',
    stat1: 537,
    stat2: 74,
    stat3: '3.1',
    verb: 'Shared',
  },
  {
    id: 'item-1849-2',
    title: 'Dreamy Tapestry 2',
    description: 'across beautiful feel private with or private every designed while designed gestures light or. across or while experience on in designed alive haptics and forever that or pixel fast curated every for. feel for for on every every considered with every press with with',
    icon: 'speedometer',
    gradient: 'amber',
    tone: 'accent',
    meta: '55 mins ago',
    stat1: 550,
    stat2: 81,
    stat3: '0.0',
    verb: 'Highlighted',
  },
  {
    id: 'item-1849-3',
    title: 'Subtle Studio 3',
    description: 'beautiful feel private with or private every designed while designed gestures light or forever. while experience on in designed alive haptics and forever that or pixel fast curated every for and while. on every every considered with every press with with forever while modes',
    icon: 'briefcase',
    gradient: 'candy',
    tone: 'info',
    meta: '56 mins ago',
    stat1: 563,
    stat2: 88,
    stat3: '1.9',
    verb: 'Saved',
  },
  {
    id: 'item-1849-4',
    title: 'Vibrant Aurora 4',
    description: 'feel private with or private every designed while designed gestures light or forever on. on in designed alive haptics and forever that or pixel fast curated every for and while A that. considered with every press with with forever while modes or considered pixel',
    icon: 'cafe',
    gradient: 'pastel',
    tone: 'info',
    meta: '57 mins ago',
    stat1: 576,
    stat2: 95,
    stat3: '3.8',
    verb: 'Visited',
  },
  {
    id: 'item-1849-5',
    title: 'Sleek Atlas 5',
    description: 'private with or private every designed while designed gestures light or forever on modes. designed alive haptics and forever that or pixel fast curated every for and while A that experience experience. press with with forever while modes or considered pixel with while while',
    icon: 'analytics',
    gradient: 'forest',
    tone: 'danger',
    meta: '58 mins ago',
    stat1: 589,
    stat2: 3,
    stat3: '0.7',
    verb: 'Pinned',
  },
  {
    id: 'item-1849-6',
    title: 'Lush Studio 6',
    description: 'with or private every designed while designed gestures light or forever on modes tap. haptics and forever that or pixel fast curated every for and while A that experience experience every in. forever while modes or considered pixel with while while curated modes beautiful',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'warning',
    meta: '59 mins ago',
    stat1: 602,
    stat2: 10,
    stat3: '2.6',
    verb: 'Visited',
  },
  {
    id: 'item-1849-7',
    title: 'Vibrant Drift 7',
    description: 'or private every designed while designed gestures light or forever on modes tap across. forever that or pixel fast curated every for and while A that experience experience every in beautiful long. or considered pixel with while while curated modes beautiful remaining experience and',
    icon: 'rocket',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '60 mins ago',
    stat1: 615,
    stat2: 17,
    stat3: '4.5',
    verb: 'Pinned',
  },
  {
    id: 'item-1849-8',
    title: 'Dreamy Compass 8',
    description: 'private every designed while designed gestures light or forever on modes tap across or. or pixel fast curated every for and while A that experience experience every in beautiful long experience fluid. with while while curated modes beautiful remaining experience and considered considered feel',
    icon: 'heart',
    gradient: 'aurora',
    tone: 'warning',
    meta: '61 mins ago',
    stat1: 628,
    stat2: 24,
    stat3: '1.4',
    verb: 'Read',
  },
  {
    id: 'item-1849-9',
    title: 'Snappy Lens 9',
    description: 'every designed while designed gestures light or forever on modes tap across or while. fast curated every for and while A that experience experience every in beautiful long experience fluid haptics private. curated modes beautiful remaining experience and considered considered feel and and haptics',
    icon: 'image',
    gradient: 'cosmic',
    tone: 'success',
    meta: '62 mins ago',
    stat1: 641,
    stat2: 31,
    stat3: '3.3',
    verb: 'Shared',
  },
  {
    id: 'item-1849-10',
    title: 'Glassy Compass 10',
    description: 'designed while designed gestures light or forever on modes tap across or while fluid. every for and while A that experience experience every in beautiful long experience fluid haptics private light or. remaining experience and considered considered feel and and haptics experience that considered',
    icon: 'layers',
    gradient: 'amber',
    tone: 'accent',
    meta: '63 mins ago',
    stat1: 654,
    stat2: 38,
    stat3: '0.2',
    verb: 'Followed',
  },
  {
    id: 'item-1849-11',
    title: 'Snappy Tapestry 11',
    description: 'while designed gestures light or forever on modes tap across or while fluid pixel. and while A that experience experience every in beautiful long experience fluid haptics private light or press long. considered considered feel and and haptics experience that considered press every every',
    icon: 'globe',
    gradient: 'candy',
    tone: 'accent',
    meta: '64 mins ago',
    stat1: 667,
    stat2: 45,
    stat3: '2.1',
    verb: 'Searched',
  },
  {
    id: 'item-1849-12',
    title: 'Subtle Loom 12',
    description: 'designed gestures light or forever on modes tap across or while fluid pixel and. A that experience experience every in beautiful long experience fluid haptics private light or press long remaining remaining. and and haptics experience that considered press every every tap and A',
    icon: 'image',
    gradient: 'fire',
    tone: 'warning',
    meta: '65 mins ago',
    stat1: 680,
    stat2: 52,
    stat3: '4.0',
    verb: 'Highlighted',
  },
  {
    id: 'item-1849-13',
    title: 'Punchy Forge 13',
    description: 'gestures light or forever on modes tap across or while fluid pixel and while. experience experience every in beautiful long experience fluid haptics private light or press long remaining remaining fast pixel. experience that considered press every every tap and A dark and or',
    icon: 'bookmark',
    gradient: 'ocean',
    tone: 'info',
    meta: '66 mins ago',
    stat1: 693,
    stat2: 59,
    stat3: '0.9',
    verb: 'Saved',
  },
  {
    id: 'item-1849-14',
    title: 'Silky Aurora 14',
    description: 'light or forever on modes tap across or while fluid pixel and while designed. every in beautiful long experience fluid haptics private light or press long remaining remaining fast pixel with long. press every every tap and A dark and or every press beautiful',
    icon: 'leaf',
    gradient: 'pastel',
    tone: 'info',
    meta: '67 mins ago',
    stat1: 706,
    stat2: 66,
    stat3: '2.8',
    verb: 'Translated',
  },
  {
    id: 'item-1849-15',
    title: 'Sleek Studio 15',
    description: 'or forever on modes tap across or while fluid pixel and while designed curated. beautiful long experience fluid haptics private light or press long remaining remaining fast pixel with long and designed. tap and A dark and or every press beautiful designed haptics press',
    icon: 'eye',
    gradient: 'forest',
    tone: 'primary',
    meta: '68 mins ago',
    stat1: 719,
    stat2: 73,
    stat3: '4.7',
    verb: 'Shared',
  },
  {
    id: 'item-1849-16',
    title: 'Vibrant Halo 16',
    description: 'forever on modes tap across or while fluid pixel and while designed curated press. experience fluid haptics private light or press long remaining remaining fast pixel with long and designed every for. dark and or every press beautiful designed haptics press tap and light',
    icon: 'heart',
    gradient: 'midnight',
    tone: 'accent',
    meta: '69 mins ago',
    stat1: 732,
    stat2: 80,
    stat3: '1.6',
    verb: 'Pinned',
  },
  {
    id: 'item-1849-17',
    title: 'Buttery Insight 17',
    description: 'on modes tap across or while fluid pixel and while designed curated press forever. haptics private light or press long remaining remaining fast pixel with long and designed every for dark fast. every press beautiful designed haptics press tap and light browsing experience tap',
    icon: 'globe',
    gradient: 'candy',
    tone: 'warning',
    meta: '70 mins ago',
    stat1: 745,
    stat2: 87,
    stat3: '3.5',
    verb: 'Shared',
  },
  {
    id: 'item-1849-18',
    title: 'Premium Saga 18',
    description: 'modes tap across or while fluid pixel and while designed curated press forever dark. light or press long remaining remaining fast pixel with long and designed every for dark fast and alive. designed haptics press tap and light browsing experience tap feel private feel',
    icon: 'flag',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '71 mins ago',
    stat1: 758,
    stat2: 94,
    stat3: '0.4',
    verb: 'Shared',
  },
  {
    id: 'item-1849-19',
    title: 'Frosted Atlas 19',
    description: 'tap across or while fluid pixel and while designed curated press forever dark that. press long remaining remaining fast pixel with long and designed every for dark fast and alive with across. tap and light browsing experience tap feel private feel long in that',
    icon: 'extension-puzzle',
    gradient: 'candy',
    tone: 'accent',
    meta: '72 mins ago',
    stat1: 771,
    stat2: 2,
    stat3: '2.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1849-20',
    title: 'Lush Drift 20',
    description: 'across or while fluid pixel and while designed curated press forever dark that press. remaining remaining fast pixel with long and designed every for dark fast and alive with across tap and. browsing experience tap feel private feel long in that long fluid A',
    icon: 'book',
    gradient: 'candy',
    tone: 'success',
    meta: '73 mins ago',
    stat1: 784,
    stat2: 9,
    stat3: '4.2',
    verb: 'Pinned',
  },
  {
    id: 'item-1849-21',
    title: 'Dreamy Pulse 21',
    description: 'or while fluid pixel and while designed curated press forever dark that press modes. fast pixel with long and designed every for dark fast and alive with across tap and and fluid. feel private feel long in that long fluid A curated remaining pixel',
    icon: 'pricetag',
    gradient: 'sunset',
    tone: 'warning',
    meta: '74 mins ago',
    stat1: 797,
    stat2: 16,
    stat3: '1.1',
    verb: 'Visited',
  },
  {
    id: 'item-1849-22',
    title: 'Elite Forge 22',
    description: 'while fluid pixel and while designed curated press forever dark that press modes while. with long and designed every for dark fast and alive with across tap and and fluid press long. long in that long fluid A curated remaining pixel fluid with long',
    icon: 'sparkles',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '75 mins ago',
    stat1: 810,
    stat2: 23,
    stat3: '3.0',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1849-23',
    title: 'Silky Atlas 23',
    description: 'fluid pixel and while designed curated press forever dark that press modes while and. and designed every for dark fast and alive with across tap and and fluid press long browsing dark. long fluid A curated remaining pixel fluid with long gestures fast modes',
    icon: 'lock-closed',
    gradient: 'aurora',
    tone: 'success',
    meta: '76 mins ago',
    stat1: 823,
    stat2: 30,
    stat3: '4.9',
    verb: 'Read',
  },
  {
    id: 'item-1849-24',
    title: 'Lush Insight 24',
    description: 'pixel and while designed curated press forever dark that press modes while and fluid. every for dark fast and alive with across tap and and fluid press long browsing dark every press. curated remaining pixel fluid with long gestures fast modes and every and',
    icon: 'planet',
    gradient: 'sunset',
    tone: 'success',
    meta: '77 mins ago',
    stat1: 836,
    stat2: 37,
    stat3: '1.8',
    verb: 'Followed',
  },
  {
    id: 'item-1849-25',
    title: 'Premium Mosaic 25',
    description: 'and while designed curated press forever dark that press modes while and fluid every. dark fast and alive with across tap and and fluid press long browsing dark every press alive with. fluid with long gestures fast modes and every and press while for',
    icon: 'trophy',
    gradient: 'amber',
    tone: 'accent',
    meta: '78 mins ago',
    stat1: 849,
    stat2: 44,
    stat3: '3.7',
    verb: 'Archived',
  },
  {
    id: 'item-1849-26',
    title: 'Deep Pulse 26',
    description: 'while designed curated press forever dark that press modes while and fluid every browsing. and alive with across tap and and fluid press long browsing dark every press alive with beautiful and. gestures fast modes and every and press while for fluid pixel and',
    icon: 'school',
    gradient: 'fire',
    tone: 'danger',
    meta: '79 mins ago',
    stat1: 862,
    stat2: 51,
    stat3: '0.6',
    verb: 'Followed',
  },
  {
    id: 'item-1849-27',
    title: 'Elite Compass 27',
    description: 'designed curated press forever dark that press modes while and fluid every browsing that. with across tap and and fluid press long browsing dark every press alive with beautiful and modes every. and every and press while for fluid pixel and or with feel',
    icon: 'pulse',
    gradient: 'neon',
    tone: 'accent',
    meta: '80 mins ago',
    stat1: 875,
    stat2: 58,
    stat3: '2.5',
    verb: 'Read',
  },
  {
    id: 'item-1849-28',
    title: 'Snappy Loom 28',
    description: 'curated press forever dark that press modes while and fluid every browsing that private. tap and and fluid press long browsing dark every press alive with beautiful and modes every experience light. press while for fluid pixel and or with feel haptics while modes',
    icon: 'pulse',
    gradient: 'fire',
    tone: 'success',
    meta: '81 mins ago',
    stat1: 888,
    stat2: 65,
    stat3: '4.4',
    verb: 'Highlighted',
  },
  {
    id: 'item-1849-29',
    title: 'Punchy Atlas 29',
    description: 'press forever dark that press modes while and fluid every browsing that private in. and fluid press long browsing dark every press alive with beautiful and modes every experience light across haptics. fluid pixel and or with feel haptics while modes press press beautiful',
    icon: 'school',
    gradient: 'amber',
    tone: 'info',
    meta: '82 mins ago',
    stat1: 901,
    stat2: 72,
    stat3: '1.3',
    verb: 'Pinned',
  },
  {
    id: 'item-1849-30',
    title: 'Lush Loom 30',
    description: 'forever dark that press modes while and fluid every browsing that private in light. press long browsing dark every press alive with beautiful and modes every experience light across haptics alive feel. or with feel haptics while modes press press beautiful that and across',
    icon: 'newspaper',
    gradient: 'pastel',
    tone: 'warning',
    meta: '83 mins ago',
    stat1: 914,
    stat2: 79,
    stat3: '3.2',
    verb: 'Pinned',
  },
  {
    id: 'item-1849-31',
    title: 'Punchy Spark 31',
    description: 'dark that press modes while and fluid every browsing that private in light that. browsing dark every press alive with beautiful and modes every experience light across haptics alive feel modes dark. haptics while modes press press beautiful that and across for press and',
    icon: 'flash',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '84 mins ago',
    stat1: 927,
    stat2: 86,
    stat3: '0.1',
    verb: 'Shared',
  },
  {
    id: 'item-1849-32',
    title: 'Soft Studio 32',
    description: 'that press modes while and fluid every browsing that private in light that fast. every press alive with beautiful and modes every experience light across haptics alive feel modes dark and with. press press beautiful that and across for press and long alive and',
    icon: 'newspaper',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '85 mins ago',
    stat1: 940,
    stat2: 93,
    stat3: '2.0',
    verb: 'Visited',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-31433-1',
    title: 'Subtle Pulse',
    subtitle: 'haptics fast A and and considered pixel A dark feel A alive curated that. in haptics or forever with experience gestures every beautiful remaining haptics light and designed fast forever or beautiful. on designed long every fast in in dark remaining with that considered',
    icon: 'musical-notes',
    gradient: 'fire',
  },
  {
    id: 'section-31433-2',
    title: 'Vibrant Atlas',
    subtitle: 'alive curated that or long forever feel every in and long modes for A. across across browsing press curated with experience feel modes browsing or light experience forever press tap fast feel. or for beautiful press fast light browsing gestures private beautiful feel across',
    icon: 'flame',
    gradient: 'brand',
  },
  {
    id: 'section-31433-3',
    title: 'Punchy Beacon',
    subtitle: 'modes for A across fluid on designed curated and forever and beautiful on feel. for long and alive considered in tap every every or tap and that in designed fluid fast alive. curated in A for or light or modes A haptics haptics every',
    icon: 'trophy',
    gradient: 'cosmic',
  },
  {
    id: 'section-31433-4',
    title: 'Frosted Compass',
    subtitle: 'beautiful on feel modes or and that haptics in beautiful A pixel press with. tap browsing modes press tap light that curated A while haptics long long that gestures with while light. remaining that that considered fluid fluid designed curated on fluid for considered',
    icon: 'analytics',
    gradient: 'fire',
  },
  {
    id: 'section-31433-5',
    title: 'Polished Aurora',
    subtitle: 'pixel press with light while long haptics alive tap on in modes fast browsing. modes modes curated modes experience on and with light that and browsing in in for or feel in. private experience and while remaining experience long that for browsing considered or',
    icon: 'briefcase',
    gradient: 'brand',
  },
  {
    id: 'section-31433-6',
    title: 'Crisp Codex',
    subtitle: 'modes fast browsing while gestures A pixel in designed browsing press and pixel beautiful. long in and beautiful fast or press browsing and pixel on across dark forever private experience curated fluid. browsing curated considered tap across across and fluid with considered tap browsing',
    icon: 'star',
    gradient: 'ocean',
  },
  {
    id: 'section-31433-7',
    title: 'Premium Quest',
    subtitle: 'and pixel beautiful modes fast A that forever considered and beautiful curated fast considered. gestures and fast private browsing experience light designed gestures forever fast every designed designed and pixel while modes. across beautiful fast long and fast every long pixel and and A',
    icon: 'star',
    gradient: 'midnight',
  },
  {
    id: 'section-31433-8',
    title: 'Dreamy Loom',
    subtitle: 'curated fast considered on and that and for beautiful long browsing every experience haptics. modes and gestures light and and private across in light pixel A for forever pixel across forever haptics. for fast or in and alive alive across private haptics and and',
    icon: 'leaf',
    gradient: 'sunset',
  },
  {
    id: 'section-31433-9',
    title: 'Deep Echo',
    subtitle: 'every experience haptics forever haptics dark haptics forever while pixel while designed press designed. pixel across and haptics fluid modes across long remaining on considered while fluid considered press A gestures experience. haptics every with private alive fast fast and feel designed on dark',
    icon: 'globe',
    gradient: 'midnight',
  },
  {
    id: 'section-31433-10',
    title: 'Lush Stream',
    subtitle: 'designed press designed that alive designed designed tap fast long every forever with browsing. and experience curated forever fast haptics every A and remaining while browsing curated haptics dark every on every. remaining fast experience long beautiful feel or remaining experience or for or',
    icon: 'paw',
    gradient: 'candy',
  },
  {
    id: 'section-31433-11',
    title: 'Deep Compass',
    subtitle: 'forever with browsing experience private with for and experience every remaining dark with browsing. and tap feel light experience with or tap fluid on browsing considered across beautiful fluid dark alive gestures. haptics dark long gestures tap feel in designed beautiful experience pixel alive',
    icon: 'star',
    gradient: 'midnight',
  },
  {
    id: 'section-31433-12',
    title: 'Soft Tapestry',
    subtitle: 'dark with browsing every considered or light beautiful and that long feel alive browsing. beautiful dark long forever press every light considered light light fast every or light designed fast gestures private. tap every experience in private fluid feel private designed that designed that',
    icon: 'shield',
    gradient: 'forest',
  },
  {
    id: 'section-31433-13',
    title: 'Lush Aurora',
    subtitle: 'feel alive browsing designed while dark and modes designed while private fast in fluid. in remaining and and modes modes considered forever A light dark designed curated dark light tap dark long. or experience modes curated tap across with considered experience every forever and',
    icon: 'newspaper',
    gradient: 'fire',
  },
  {
    id: 'section-31433-14',
    title: 'Brisk Tapestry',
    subtitle: 'fast in fluid remaining dark alive designed across press in browsing across press on. pixel alive pixel in every across light designed tap press for and alive in every on or A. dark while forever on on every modes tap for tap light modes',
    icon: 'pulse',
    gradient: 'cosmic',
  },
];

const HERO_TITLE = 'Clear history';
const HERO_SUBTITLE = 'Range, exclusions, and confirmation.';
const FOOTER_TITLE = 'Keep going with Clear history';
const FOOTER_BODY = 'that browsing alive feel for for on every every considered with every press with. experience private that designed dark alive tap with beautiful press and that tap considered modes press while while. alive and browsing feel pixel while light browsing alive on for pixel';

export const HistoryClearScreen: React.FC = () => {
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
      (navigation as any).navigate('HistoryDay', { dayKey: 'today' });
    },
    [navigation],
  );
  const goAlt = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('HistoryEntry', { entryId: 'h-1' });
    },
    [navigation],
  );
  const goDeep = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('HistoryEntryOptions', { entryId: 'h-1' });
    },
    [navigation],
  );

  return (
    <ScreenContainer
      variant="fire"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Clear history"
        subtitle="Range, exclusions, and confirmation."
        showBack={true}
        rightIcon="trash"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="fire"
        badge="Clear"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>12%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '12%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>55%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '55%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>8%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '8%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>51%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '51%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>94%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '94%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>47%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '47%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>90%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '90%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>43%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '43%' }]}
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
