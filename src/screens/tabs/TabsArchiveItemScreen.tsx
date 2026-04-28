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
    id: 'item-2107-1',
    title: 'Vibrant Mosaic 1',
    description: 'tap across with while that experience designed long on with in curated long or. curated modes and every and and that every and considered for light haptics or curated tap light in. every experience private tap modes on dark modes and remaining pixel A',
    icon: 'bookmark',
    gradient: 'fire',
    tone: 'warning',
    meta: '42 mins ago',
    stat1: 951,
    stat2: 98,
    stat3: '3.3',
    verb: 'Visited',
  },
  {
    id: 'item-2107-2',
    title: 'Deep Drift 2',
    description: 'across with while that experience designed long on with in curated long or feel. and every and and that every and considered for light haptics or curated tap light in across modes. tap modes on dark modes and remaining pixel A fluid alive that',
    icon: 'pricetag',
    gradient: 'ocean',
    tone: 'danger',
    meta: '43 mins ago',
    stat1: 964,
    stat2: 6,
    stat3: '0.2',
    verb: 'Translated',
  },
  {
    id: 'item-2107-3',
    title: 'Dreamy Spark 3',
    description: 'with while that experience designed long on with in curated long or feel dark. and and that every and considered for light haptics or curated tap light in across modes and on. dark modes and remaining pixel A fluid alive that on every every',
    icon: 'star',
    gradient: 'aurora',
    tone: 'primary',
    meta: '44 mins ago',
    stat1: 977,
    stat2: 13,
    stat3: '2.1',
    verb: 'Searched',
  },
  {
    id: 'item-2107-4',
    title: 'Soft Codex 4',
    description: 'while that experience designed long on with in curated long or feel dark light. that every and considered for light haptics or curated tap light in across modes and on with in. remaining pixel A fluid alive that on every every that considered fast',
    icon: 'pulse',
    gradient: 'midnight',
    tone: 'warning',
    meta: '45 mins ago',
    stat1: 990,
    stat2: 20,
    stat3: '4.0',
    verb: 'Read',
  },
  {
    id: 'item-2107-5',
    title: 'Cosmic Aurora 5',
    description: 'that experience designed long on with in curated long or feel dark light alive. and considered for light haptics or curated tap light in across modes and on with in pixel modes. fluid alive that on every every that considered fast in while with',
    icon: 'eye',
    gradient: 'ocean',
    tone: 'success',
    meta: '46 mins ago',
    stat1: 23,
    stat2: 27,
    stat3: '0.9',
    verb: 'Visited',
  },
  {
    id: 'item-2107-6',
    title: 'Sleek Studio 6',
    description: 'experience designed long on with in curated long or feel dark light alive with. for light haptics or curated tap light in across modes and on with in pixel modes long feel. on every every that considered fast in while with that beautiful with',
    icon: 'flame',
    gradient: 'amber',
    tone: 'danger',
    meta: '47 mins ago',
    stat1: 36,
    stat2: 34,
    stat3: '2.8',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2107-7',
    title: 'Vibrant Codex 7',
    description: 'designed long on with in curated long or feel dark light alive with A. haptics or curated tap light in across modes and on with in pixel modes long feel on and. that considered fast in while with that beautiful with and haptics fast',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'success',
    meta: '48 mins ago',
    stat1: 49,
    stat2: 41,
    stat3: '4.7',
    verb: 'Translated',
  },
  {
    id: 'item-2107-8',
    title: 'Cosmic Compass 8',
    description: 'long on with in curated long or feel dark light alive with A A. curated tap light in across modes and on with in pixel modes long feel on and beautiful with. in while with that beautiful with and haptics fast designed designed remaining',
    icon: 'cart',
    gradient: 'sunset',
    tone: 'primary',
    meta: '49 mins ago',
    stat1: 62,
    stat2: 48,
    stat3: '1.6',
    verb: 'Shared',
  },
  {
    id: 'item-2107-9',
    title: 'Snappy Compass 9',
    description: 'on with in curated long or feel dark light alive with A A alive. light in across modes and on with in pixel modes long feel on and beautiful with long with. that beautiful with and haptics fast designed designed remaining or feel while',
    icon: 'flame',
    gradient: 'midnight',
    tone: 'accent',
    meta: '50 mins ago',
    stat1: 75,
    stat2: 55,
    stat3: '3.5',
    verb: 'Opened',
  },
  {
    id: 'item-2107-10',
    title: 'Snappy Atlas 10',
    description: 'with in curated long or feel dark light alive with A A alive long. across modes and on with in pixel modes long feel on and beautiful with long with haptics press. and haptics fast designed designed remaining or feel while press across curated',
    icon: 'musical-notes',
    gradient: 'candy',
    tone: 'primary',
    meta: '51 mins ago',
    stat1: 88,
    stat2: 62,
    stat3: '0.4',
    verb: 'Archived',
  },
  {
    id: 'item-2107-11',
    title: 'Lush Studio 11',
    description: 'in curated long or feel dark light alive with A A alive long A. and on with in pixel modes long feel on and beautiful with long with haptics press and dark. designed designed remaining or feel while press across curated fast forever and',
    icon: 'star',
    gradient: 'brand',
    tone: 'danger',
    meta: '52 mins ago',
    stat1: 101,
    stat2: 69,
    stat3: '2.3',
    verb: 'Read',
  },
  {
    id: 'item-2107-12',
    title: 'Vibrant Forge 12',
    description: 'curated long or feel dark light alive with A A alive long A and. with in pixel modes long feel on and beautiful with long with haptics press and dark fast experience. or feel while press across curated fast forever and every tap alive',
    icon: 'analytics',
    gradient: 'neon',
    tone: 'success',
    meta: '53 mins ago',
    stat1: 114,
    stat2: 76,
    stat3: '4.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2107-13',
    title: 'Silky Beacon 13',
    description: 'long or feel dark light alive with A A alive long A and browsing. pixel modes long feel on and beautiful with long with haptics press and dark fast experience browsing private. press across curated fast forever and every tap alive feel designed every',
    icon: 'sparkles',
    gradient: 'amber',
    tone: 'success',
    meta: '54 mins ago',
    stat1: 127,
    stat2: 83,
    stat3: '1.1',
    verb: 'Read',
  },
  {
    id: 'item-2107-14',
    title: 'Velvet Atlas 14',
    description: 'or feel dark light alive with A A alive long A and browsing A. long feel on and beautiful with long with haptics press and dark fast experience browsing private considered forever. fast forever and every tap alive feel designed every and tap alive',
    icon: 'book',
    gradient: 'sunset',
    tone: 'success',
    meta: '55 mins ago',
    stat1: 140,
    stat2: 90,
    stat3: '3.0',
    verb: 'Opened',
  },
  {
    id: 'item-2107-15',
    title: 'Lush Loom 15',
    description: 'feel dark light alive with A A alive long A and browsing A remaining. on and beautiful with long with haptics press and dark fast experience browsing private considered forever tap every. every tap alive feel designed every and tap alive and feel light',
    icon: 'flag',
    gradient: 'amber',
    tone: 'primary',
    meta: '56 mins ago',
    stat1: 153,
    stat2: 97,
    stat3: '4.9',
    verb: 'Opened',
  },
  {
    id: 'item-2107-16',
    title: 'Punchy Forge 16',
    description: 'dark light alive with A A alive long A and browsing A remaining alive. beautiful with long with haptics press and dark fast experience browsing private considered forever tap every curated private. feel designed every and tap alive and feel light A across fast',
    icon: 'cloud',
    gradient: 'brand',
    tone: 'primary',
    meta: '57 mins ago',
    stat1: 166,
    stat2: 5,
    stat3: '1.8',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2107-17',
    title: 'Silky Mosaic 17',
    description: 'light alive with A A alive long A and browsing A remaining alive considered. long with haptics press and dark fast experience browsing private considered forever tap every curated private experience curated. and tap alive and feel light A across fast long while curated',
    icon: 'pricetag',
    gradient: 'brand',
    tone: 'success',
    meta: '58 mins ago',
    stat1: 179,
    stat2: 12,
    stat3: '3.7',
    verb: 'Translated',
  },
  {
    id: 'item-2107-18',
    title: 'Deep Beacon 18',
    description: 'alive with A A alive long A and browsing A remaining alive considered on. haptics press and dark fast experience browsing private considered forever tap every curated private experience curated light modes. and feel light A across fast long while curated or on haptics',
    icon: 'pricetag',
    gradient: 'sunset',
    tone: 'primary',
    meta: '59 mins ago',
    stat1: 192,
    stat2: 19,
    stat3: '0.6',
    verb: 'Opened',
  },
  {
    id: 'item-2107-19',
    title: 'Velvet Insight 19',
    description: 'with A A alive long A and browsing A remaining alive considered on every. and dark fast experience browsing private considered forever tap every curated private experience curated light modes dark with. A across fast long while curated or on haptics A experience every',
    icon: 'school',
    gradient: 'midnight',
    tone: 'primary',
    meta: '60 mins ago',
    stat1: 205,
    stat2: 26,
    stat3: '2.5',
    verb: 'Pinned',
  },
  {
    id: 'item-2107-20',
    title: 'Premium Quest 20',
    description: 'A A alive long A and browsing A remaining alive considered on every fluid. fast experience browsing private considered forever tap every curated private experience curated light modes dark with and while. long while curated or on haptics A experience every modes while experience',
    icon: 'speedometer',
    gradient: 'brand',
    tone: 'warning',
    meta: '61 mins ago',
    stat1: 218,
    stat2: 33,
    stat3: '4.4',
    verb: 'Translated',
  },
  {
    id: 'item-2107-21',
    title: 'Polished Saga 21',
    description: 'A alive long A and browsing A remaining alive considered on every fluid dark. browsing private considered forever tap every curated private experience curated light modes dark with and while fluid or. or on haptics A experience every modes while experience experience feel forever',
    icon: 'grid',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '62 mins ago',
    stat1: 231,
    stat2: 40,
    stat3: '1.3',
    verb: 'Opened',
  },
  {
    id: 'item-2107-22',
    title: 'Frosted Insight 22',
    description: 'alive long A and browsing A remaining alive considered on every fluid dark long. considered forever tap every curated private experience curated light modes dark with and while fluid or feel every. A experience every modes while experience experience feel forever experience browsing press',
    icon: 'flame',
    gradient: 'midnight',
    tone: 'primary',
    meta: '63 mins ago',
    stat1: 244,
    stat2: 47,
    stat3: '3.2',
    verb: 'Archived',
  },
  {
    id: 'item-2107-23',
    title: 'Premium Lens 23',
    description: 'long A and browsing A remaining alive considered on every fluid dark long remaining. tap every curated private experience curated light modes dark with and while fluid or feel every gestures and. modes while experience experience feel forever experience browsing press designed forever forever',
    icon: 'trophy',
    gradient: 'brand',
    tone: 'danger',
    meta: '64 mins ago',
    stat1: 257,
    stat2: 54,
    stat3: '0.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2107-24',
    title: 'Glassy Stream 24',
    description: 'A and browsing A remaining alive considered on every fluid dark long remaining light. curated private experience curated light modes dark with and while fluid or feel every gestures and modes and. experience feel forever experience browsing press designed forever forever A alive tap',
    icon: 'heart',
    gradient: 'neon',
    tone: 'success',
    meta: '65 mins ago',
    stat1: 270,
    stat2: 61,
    stat3: '2.0',
    verb: 'Searched',
  },
  {
    id: 'item-2107-25',
    title: 'Crisp Insight 25',
    description: 'and browsing A remaining alive considered on every fluid dark long remaining light while. experience curated light modes dark with and while fluid or feel every gestures and modes and fluid browsing. experience browsing press designed forever forever A alive tap designed forever dark',
    icon: 'pizza',
    gradient: 'sunset',
    tone: 'warning',
    meta: '66 mins ago',
    stat1: 283,
    stat2: 68,
    stat3: '3.9',
    verb: 'Searched',
  },
  {
    id: 'item-2107-26',
    title: 'Premium Pulse 26',
    description: 'browsing A remaining alive considered on every fluid dark long remaining light while considered. light modes dark with and while fluid or feel every gestures and modes and fluid browsing beautiful dark. designed forever forever A alive tap designed forever dark designed in fast',
    icon: 'eye',
    gradient: 'ocean',
    tone: 'warning',
    meta: '67 mins ago',
    stat1: 296,
    stat2: 75,
    stat3: '0.8',
    verb: 'Visited',
  },
  {
    id: 'item-2107-27',
    title: 'Elite Quest 27',
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
    id: 'item-2107-28',
    title: 'Polished Stream 28',
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
    id: 'item-2107-29',
    title: 'Crisp Stream 29',
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
    id: 'item-2107-30',
    title: 'Crisp Loom 30',
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
    id: 'item-2107-31',
    title: 'Punchy Quest 31',
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
    id: 'item-2107-32',
    title: 'Polished Quest 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-35819-1',
    title: 'Vibrant Compass',
    subtitle: 'modes press while alive and considered forever that fast modes private press for that. fluid haptics while with feel experience on private and or considered on feel modes private that every designed. and gestures experience experience while or gestures light fast with fluid on',
    icon: 'newspaper',
    gradient: 'neon',
  },
  {
    id: 'section-35819-2',
    title: 'Cosmic Mosaic',
    subtitle: 'press for that and browsing long for every beautiful considered feel every considered beautiful. and and A designed curated every and on light modes on A gestures while considered beautiful for forever. and every press on considered that for with haptics dark curated in',
    icon: 'leaf',
    gradient: 'pastel',
  },
  {
    id: 'section-35819-3',
    title: 'Crisp Insight',
    subtitle: 'every considered beautiful dark and feel on remaining pixel forever haptics or beautiful haptics. and private and considered or fast haptics every every and feel on with on fluid fluid on or. every forever gestures every remaining curated press curated remaining haptics or with',
    icon: 'star',
    gradient: 'ocean',
  },
  {
    id: 'section-35819-4',
    title: 'Premium Stream',
    subtitle: 'or beautiful haptics that in fast remaining A alive A feel gestures and private. curated on alive and pixel while or and browsing while and on fluid feel curated across in considered. designed experience every designed modes browsing feel modes designed long while that',
    icon: 'speedometer',
    gradient: 'fire',
  },
  {
    id: 'section-35819-5',
    title: 'Snappy Quest',
    subtitle: 'gestures and private pixel light A curated every experience modes remaining pixel with considered. in alive gestures while dark private while haptics across and on for fluid while pixel private for beautiful. press A and dark in experience A across long beautiful with tap',
    icon: 'flag',
    gradient: 'brand',
  },
  {
    id: 'section-35819-6',
    title: 'Velvet Atlas',
    subtitle: 'pixel with considered tap fluid across and designed dark feel designed gestures with press. gestures on dark considered modes beautiful every every dark every long every designed and private remaining press on. forever and light designed on gestures curated press and in pixel haptics',
    icon: 'film',
    gradient: 'pastel',
  },
  {
    id: 'section-35819-7',
    title: 'Vibrant Beacon',
    subtitle: 'gestures with press for fast fast every haptics press curated beautiful tap remaining press. fast private feel and pixel pixel with with and and forever every experience long haptics fast forever across. pixel alive light that alive browsing browsing that every A on beautiful',
    icon: 'school',
    gradient: 'brand',
  },
  {
    id: 'section-35819-8',
    title: 'Deep Insight',
    subtitle: 'tap remaining press browsing every gestures forever forever haptics in in and tap that. across forever while long private and considered remaining forever remaining dark modes forever haptics modes and press for. and fast light forever long with every press remaining experience fluid and',
    icon: 'extension-puzzle',
    gradient: 'sunset',
  },
  {
    id: 'section-35819-9',
    title: 'Glassy Loom',
    subtitle: 'and tap that considered fluid that pixel experience for designed every tap modes across. forever while long for haptics experience browsing and and haptics and for modes feel every browsing for fluid. for tap alive fluid tap in in fast A in modes gestures',
    icon: 'briefcase',
    gradient: 'aurora',
  },
  {
    id: 'section-35819-10',
    title: 'Deep Quest',
    subtitle: 'tap modes across on long and light considered remaining browsing gestures for designed A. and that with remaining and browsing alive every browsing dark experience pixel pixel while pixel fast pixel experience. every fast haptics A light for A feel dark private fluid designed',
    icon: 'school',
    gradient: 'aurora',
  },
  {
    id: 'section-35819-11',
    title: 'Polished Mosaic',
    subtitle: 'for designed A pixel with modes forever pixel light and A and with press. in that while across every haptics or light private on and designed and for A for press considered. for alive private gestures that or haptics across while fast designed and',
    icon: 'briefcase',
    gradient: 'midnight',
  },
  {
    id: 'section-35819-12',
    title: 'Crisp Spark',
    subtitle: 'and with press browsing long on or gestures and beautiful while curated forever while. tap press fast forever forever that feel forever alive every A light or light designed in every feel. light modes with considered and considered curated remaining in light with every',
    icon: 'compass',
    gradient: 'neon',
  },
  {
    id: 'section-35819-13',
    title: 'Vibrant Quest',
    subtitle: 'curated forever while and modes private every tap and every that that every in. experience curated on and every feel designed across haptics forever fluid with haptics forever modes on alive in. fast long with browsing curated beautiful long for curated fluid beautiful every',
    icon: 'extension-puzzle',
    gradient: 'brand',
  },
  {
    id: 'section-35819-14',
    title: 'Buttery Compass',
    subtitle: 'that every in every that with and fast every for beautiful press gestures curated. or every across and modes with private on every for light modes forever haptics fast browsing or fluid. across forever tap or with designed forever private light A light fluid',
    icon: 'eye',
    gradient: 'aurora',
  },
];

const HERO_TITLE = 'Archived tab';
const HERO_SUBTITLE = 'Restore or share archived sessions.';
const FOOTER_TITLE = 'Keep going with Archived tab';
const FOOTER_BODY = 'every experience private tap modes on dark modes and remaining pixel A fluid alive. for A A considered A curated tap for browsing beautiful considered long forever modes fluid that haptics feel. and tap private in or in haptics and curated every designed while';

export const TabsArchiveItemScreen: React.FC = () => {
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
      (navigation as any).navigate('TabsPreview', { tabId: 'tab-1' });
    },
    [navigation],
  );
  const goAlt = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('TabsSettings', { tabId: 'tab-1' });
    },
    [navigation],
  );
  const goDeep = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('TabsAdvanced', { tabId: 'tab-1' });
    },
    [navigation],
  );

  return (
    <ScreenContainer
      variant="amber"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Archived tab"
        subtitle="Restore or share archived sessions."
        showBack={true}
        rightIcon="reload-circle"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="amber"
        badge="L3"
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
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>24%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '24%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>67%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '67%' }]}
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
