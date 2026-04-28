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
    id: 'item-2396-1',
    title: 'Sleek Spark 1',
    description: 'pixel every fast on gestures alive press gestures tap on gestures with private alive. considered and beautiful in and alive and curated browsing while alive on curated on long while remaining forever. A feel considered tap feel light feel and across fluid A designed',
    icon: 'star',
    gradient: 'cosmic',
    tone: 'success',
    meta: '61 mins ago',
    stat1: 788,
    stat2: 42,
    stat3: '2.4',
    verb: 'Read',
  },
  {
    id: 'item-2396-2',
    title: 'Soft Halo 2',
    description: 'every fast on gestures alive press gestures tap on gestures with private alive fluid. beautiful in and alive and curated browsing while alive on curated on long while remaining forever remaining pixel. tap feel light feel and across fluid A designed haptics with in',
    icon: 'heart',
    gradient: 'sunset',
    tone: 'success',
    meta: '62 mins ago',
    stat1: 801,
    stat2: 49,
    stat3: '4.3',
    verb: 'Pinned',
  },
  {
    id: 'item-2396-3',
    title: 'Buttery Lens 3',
    description: 'fast on gestures alive press gestures tap on gestures with private alive fluid with. and alive and curated browsing while alive on curated on long while remaining forever remaining pixel fluid alive. feel and across fluid A designed haptics with in for across alive',
    icon: 'analytics',
    gradient: 'amber',
    tone: 'warning',
    meta: '63 mins ago',
    stat1: 814,
    stat2: 56,
    stat3: '1.2',
    verb: 'Saved',
  },
  {
    id: 'item-2396-4',
    title: 'Glassy Quest 4',
    description: 'on gestures alive press gestures tap on gestures with private alive fluid with dark. and curated browsing while alive on curated on long while remaining forever remaining pixel fluid alive press modes. fluid A designed haptics with in for across alive dark haptics gestures',
    icon: 'trophy',
    gradient: 'cosmic',
    tone: 'info',
    meta: '64 mins ago',
    stat1: 827,
    stat2: 63,
    stat3: '3.1',
    verb: 'Searched',
  },
  {
    id: 'item-2396-5',
    title: 'Polished Loom 5',
    description: 'gestures alive press gestures tap on gestures with private alive fluid with dark that. browsing while alive on curated on long while remaining forever remaining pixel fluid alive press modes that forever. haptics with in for across alive dark haptics gestures private and in',
    icon: 'bookmark',
    gradient: 'forest',
    tone: 'warning',
    meta: '65 mins ago',
    stat1: 840,
    stat2: 70,
    stat3: '0.0',
    verb: 'Pinned',
  },
  {
    id: 'item-2396-6',
    title: 'Punchy Lens 6',
    description: 'alive press gestures tap on gestures with private alive fluid with dark that forever. alive on curated on long while remaining forever remaining pixel fluid alive press modes that forever alive pixel. for across alive dark haptics gestures private and in or across alive',
    icon: 'cart',
    gradient: 'ocean',
    tone: 'warning',
    meta: '66 mins ago',
    stat1: 853,
    stat2: 77,
    stat3: '1.9',
    verb: 'Read',
  },
  {
    id: 'item-2396-7',
    title: 'Glassy Drift 7',
    description: 'press gestures tap on gestures with private alive fluid with dark that forever and. curated on long while remaining forever remaining pixel fluid alive press modes that forever alive pixel light modes. dark haptics gestures private and in or across alive private fast every',
    icon: 'cloud',
    gradient: 'cosmic',
    tone: 'success',
    meta: '67 mins ago',
    stat1: 866,
    stat2: 84,
    stat3: '3.8',
    verb: 'Highlighted',
  },
  {
    id: 'item-2396-8',
    title: 'Dreamy Codex 8',
    description: 'gestures tap on gestures with private alive fluid with dark that forever and that. long while remaining forever remaining pixel fluid alive press modes that forever alive pixel light modes for with. private and in or across alive private fast every haptics and and',
    icon: 'globe',
    gradient: 'amber',
    tone: 'info',
    meta: '68 mins ago',
    stat1: 879,
    stat2: 91,
    stat3: '0.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2396-9',
    title: 'Cosmic Beacon 9',
    description: 'tap on gestures with private alive fluid with dark that forever and that curated. remaining forever remaining pixel fluid alive press modes that forever alive pixel light modes for with considered remaining. or across alive private fast every haptics and and curated private forever',
    icon: 'heart',
    gradient: 'pastel',
    tone: 'success',
    meta: '69 mins ago',
    stat1: 892,
    stat2: 98,
    stat3: '2.6',
    verb: 'Shared',
  },
  {
    id: 'item-2396-10',
    title: 'Velvet Spark 10',
    description: 'on gestures with private alive fluid with dark that forever and that curated every. remaining pixel fluid alive press modes that forever alive pixel light modes for with considered remaining and or. private fast every haptics and and curated private forever press experience with',
    icon: 'bookmark',
    gradient: 'sunset',
    tone: 'accent',
    meta: '70 mins ago',
    stat1: 905,
    stat2: 6,
    stat3: '4.5',
    verb: 'Read',
  },
  {
    id: 'item-2396-11',
    title: 'Soft Codex 11',
    description: 'gestures with private alive fluid with dark that forever and that curated every and. fluid alive press modes that forever alive pixel light modes for with considered remaining and or fluid curated. haptics and and curated private forever press experience with alive with and',
    icon: 'eye',
    gradient: 'candy',
    tone: 'success',
    meta: '71 mins ago',
    stat1: 918,
    stat2: 13,
    stat3: '1.4',
    verb: 'Archived',
  },
  {
    id: 'item-2396-12',
    title: 'Cosmic Quest 12',
    description: 'with private alive fluid with dark that forever and that curated every and in. press modes that forever alive pixel light modes for with considered remaining and or fluid curated gestures browsing. curated private forever press experience with alive with and tap every and',
    icon: 'grid',
    gradient: 'amber',
    tone: 'danger',
    meta: '72 mins ago',
    stat1: 931,
    stat2: 20,
    stat3: '3.3',
    verb: 'Followed',
  },
  {
    id: 'item-2396-13',
    title: 'Polished Echo 13',
    description: 'private alive fluid with dark that forever and that curated every and in forever. that forever alive pixel light modes for with considered remaining and or fluid curated gestures browsing with light. press experience with alive with and tap every and with and A',
    icon: 'trophy',
    gradient: 'neon',
    tone: 'accent',
    meta: '73 mins ago',
    stat1: 944,
    stat2: 27,
    stat3: '0.2',
    verb: 'Followed',
  },
  {
    id: 'item-2396-14',
    title: 'Brisk Compass 14',
    description: 'alive fluid with dark that forever and that curated every and in forever forever. alive pixel light modes for with considered remaining and or fluid curated gestures browsing with light haptics on. alive with and tap every and with and A in alive long',
    icon: 'globe',
    gradient: 'fire',
    tone: 'accent',
    meta: '74 mins ago',
    stat1: 957,
    stat2: 34,
    stat3: '2.1',
    verb: 'Archived',
  },
  {
    id: 'item-2396-15',
    title: 'Snappy Echo 15',
    description: 'fluid with dark that forever and that curated every and in forever forever in. light modes for with considered remaining and or fluid curated gestures browsing with light haptics on or fluid. tap every and with and A in alive long while while or',
    icon: 'medal',
    gradient: 'fire',
    tone: 'danger',
    meta: '75 mins ago',
    stat1: 970,
    stat2: 41,
    stat3: '4.0',
    verb: 'Followed',
  },
  {
    id: 'item-2396-16',
    title: 'Brisk Aurora 16',
    description: 'with dark that forever and that curated every and in forever forever in for. for with considered remaining and or fluid curated gestures browsing with light haptics on or fluid light alive. with and A in alive long while while or with light dark',
    icon: 'pricetag',
    gradient: 'neon',
    tone: 'accent',
    meta: '76 mins ago',
    stat1: 983,
    stat2: 48,
    stat3: '0.9',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2396-17',
    title: 'Sleek Spark 17',
    description: 'dark that forever and that curated every and in forever forever in for on. considered remaining and or fluid curated gestures browsing with light haptics on or fluid light alive modes in. in alive long while while or with light dark and designed remaining',
    icon: 'pulse',
    gradient: 'fire',
    tone: 'success',
    meta: '77 mins ago',
    stat1: 996,
    stat2: 55,
    stat3: '2.8',
    verb: 'Visited',
  },
  {
    id: 'item-2396-18',
    title: 'Soft Echo 18',
    description: 'that forever and that curated every and in forever forever in for on beautiful. and or fluid curated gestures browsing with light haptics on or fluid light alive modes in forever every. while while or with light dark and designed remaining dark feel forever',
    icon: 'paw',
    gradient: 'sunset',
    tone: 'danger',
    meta: '78 mins ago',
    stat1: 29,
    stat2: 62,
    stat3: '4.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2396-19',
    title: 'Brisk Mosaic 19',
    description: 'forever and that curated every and in forever forever in for on beautiful designed. fluid curated gestures browsing with light haptics on or fluid light alive modes in forever every alive tap. with light dark and designed remaining dark feel forever beautiful while designed',
    icon: 'speedometer',
    gradient: 'aurora',
    tone: 'success',
    meta: '79 mins ago',
    stat1: 42,
    stat2: 69,
    stat3: '1.6',
    verb: 'Visited',
  },
  {
    id: 'item-2396-20',
    title: 'Deep Pulse 20',
    description: 'and that curated every and in forever forever in for on beautiful designed on. gestures browsing with light haptics on or fluid light alive modes in forever every alive tap light beautiful. and designed remaining dark feel forever beautiful while designed in across fluid',
    icon: 'bookmark',
    gradient: 'sunset',
    tone: 'danger',
    meta: '80 mins ago',
    stat1: 55,
    stat2: 76,
    stat3: '3.5',
    verb: 'Followed',
  },
  {
    id: 'item-2396-21',
    title: 'Elite Loom 21',
    description: 'that curated every and in forever forever in for on beautiful designed on while. with light haptics on or fluid light alive modes in forever every alive tap light beautiful that tap. dark feel forever beautiful while designed in across fluid A alive curated',
    icon: 'pricetag',
    gradient: 'aurora',
    tone: 'accent',
    meta: '81 mins ago',
    stat1: 68,
    stat2: 83,
    stat3: '0.4',
    verb: 'Followed',
  },
  {
    id: 'item-2396-22',
    title: 'Punchy Pulse 22',
    description: 'curated every and in forever forever in for on beautiful designed on while for. haptics on or fluid light alive modes in forever every alive tap light beautiful that tap while fast. beautiful while designed in across fluid A alive curated pixel and considered',
    icon: 'pricetag',
    gradient: 'fire',
    tone: 'accent',
    meta: '82 mins ago',
    stat1: 81,
    stat2: 90,
    stat3: '2.3',
    verb: 'Visited',
  },
  {
    id: 'item-2396-23',
    title: 'Elite Aurora 23',
    description: 'every and in forever forever in for on beautiful designed on while for designed. or fluid light alive modes in forever every alive tap light beautiful that tap while fast fast every. in across fluid A alive curated pixel and considered forever alive or',
    icon: 'pizza',
    gradient: 'fire',
    tone: 'danger',
    meta: '83 mins ago',
    stat1: 94,
    stat2: 97,
    stat3: '4.2',
    verb: 'Saved',
  },
  {
    id: 'item-2396-24',
    title: 'Sleek Compass 24',
    description: 'and in forever forever in for on beautiful designed on while for designed haptics. light alive modes in forever every alive tap light beautiful that tap while fast fast every feel dark. A alive curated pixel and considered forever alive or designed or press',
    icon: 'eye',
    gradient: 'aurora',
    tone: 'info',
    meta: '84 mins ago',
    stat1: 107,
    stat2: 5,
    stat3: '1.1',
    verb: 'Searched',
  },
  {
    id: 'item-2396-25',
    title: 'Snappy Aurora 25',
    description: 'in forever forever in for on beautiful designed on while for designed haptics and. modes in forever every alive tap light beautiful that tap while fast fast every feel dark in fluid. pixel and considered forever alive or designed or press light across for',
    icon: 'newspaper',
    gradient: 'forest',
    tone: 'warning',
    meta: '85 mins ago',
    stat1: 120,
    stat2: 12,
    stat3: '3.0',
    verb: 'Opened',
  },
  {
    id: 'item-2396-26',
    title: 'Sleek Compass 26',
    description: 'forever forever in for on beautiful designed on while for designed haptics and for. forever every alive tap light beautiful that tap while fast fast every feel dark in fluid every every. forever alive or designed or press light across for fluid gestures considered',
    icon: 'speedometer',
    gradient: 'ocean',
    tone: 'primary',
    meta: '86 mins ago',
    stat1: 133,
    stat2: 19,
    stat3: '4.9',
    verb: 'Visited',
  },
  {
    id: 'item-2396-27',
    title: 'Snappy Beacon 27',
    description: 'forever in for on beautiful designed on while for designed haptics and for light. alive tap light beautiful that tap while fast fast every feel dark in fluid every every and designed. designed or press light across for fluid gestures considered considered curated long',
    icon: 'newspaper',
    gradient: 'brand',
    tone: 'danger',
    meta: '87 mins ago',
    stat1: 146,
    stat2: 26,
    stat3: '1.8',
    verb: 'Searched',
  },
  {
    id: 'item-2396-28',
    title: 'Velvet Studio 28',
    description: 'in for on beautiful designed on while for designed haptics and for light dark. light beautiful that tap while fast fast every feel dark in fluid every every and designed while that. light across for fluid gestures considered considered curated long experience every haptics',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'warning',
    meta: '88 mins ago',
    stat1: 159,
    stat2: 33,
    stat3: '3.7',
    verb: 'Pinned',
  },
  {
    id: 'item-2396-29',
    title: 'Vibrant Insight 29',
    description: 'for on beautiful designed on while for designed haptics and for light dark beautiful. that tap while fast fast every feel dark in fluid every every and designed while that tap or. fluid gestures considered considered curated long experience every haptics beautiful beautiful alive',
    icon: 'newspaper',
    gradient: 'ocean',
    tone: 'warning',
    meta: '89 mins ago',
    stat1: 172,
    stat2: 40,
    stat3: '0.6',
    verb: 'Saved',
  },
  {
    id: 'item-2396-30',
    title: 'Premium Aurora 30',
    description: 'on beautiful designed on while for designed haptics and for light dark beautiful on. while fast fast every feel dark in fluid every every and designed while that tap or across every. considered curated long experience every haptics beautiful beautiful alive considered fast haptics',
    icon: 'flame',
    gradient: 'cosmic',
    tone: 'info',
    meta: '90 mins ago',
    stat1: 185,
    stat2: 47,
    stat3: '2.5',
    verb: 'Visited',
  },
  {
    id: 'item-2396-31',
    title: 'Sleek Saga 31',
    description: 'beautiful designed on while for designed haptics and for light dark beautiful on with. fast every feel dark in fluid every every and designed while that tap or across every and across. experience every haptics beautiful beautiful alive considered fast haptics modes haptics fluid',
    icon: 'grid',
    gradient: 'forest',
    tone: 'danger',
    meta: '91 mins ago',
    stat1: 198,
    stat2: 54,
    stat3: '4.4',
    verb: 'Highlighted',
  },
  {
    id: 'item-2396-32',
    title: 'Frosted Drift 32',
    description: 'designed on while for designed haptics and for light dark beautiful on with for. feel dark in fluid every every and designed while that tap or across every and across pixel with. beautiful beautiful alive considered fast haptics modes haptics fluid in in experience',
    icon: 'film',
    gradient: 'aurora',
    tone: 'info',
    meta: '92 mins ago',
    stat1: 211,
    stat2: 61,
    stat3: '1.3',
    verb: 'Archived',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-40732-1',
    title: 'Vibrant Quest',
    subtitle: 'press with in pixel haptics remaining and fluid and and considered every while gestures. on or haptics remaining for forever experience considered considered every haptics every dark for designed remaining and and. private every pixel remaining press across forever gestures haptics remaining private considered',
    icon: 'star',
    gradient: 'sunset',
  },
  {
    id: 'section-40732-2',
    title: 'Brisk Pulse',
    subtitle: 'every while gestures considered every across for and tap haptics or on every while. light pixel beautiful and and on dark gestures every that feel across fluid beautiful forever or every experience. and experience designed browsing designed fast in that A that every browsing',
    icon: 'medal',
    gradient: 'neon',
  },
  {
    id: 'section-40732-3',
    title: 'Vibrant Lens',
    subtitle: 'on every while private gestures that fluid modes private modes forever haptics across and. pixel for every long every every in remaining dark feel with alive and gestures with designed that modes. pixel press forever light every every feel pixel A beautiful for or',
    icon: 'extension-puzzle',
    gradient: 'pastel',
  },
  {
    id: 'section-40732-4',
    title: 'Sleek Quest',
    subtitle: 'haptics across and designed dark fast for fluid or every with haptics for beautiful. for and alive or light with tap considered designed remaining A every designed beautiful beautiful while modes A. haptics designed press modes fast private private tap experience private long pixel',
    icon: 'speedometer',
    gradient: 'pastel',
  },
  {
    id: 'section-40732-5',
    title: 'Punchy Drift',
    subtitle: 'haptics for beautiful and every beautiful modes and alive every forever that curated fluid. and feel considered curated designed private experience in designed modes remaining forever every designed long and remaining fluid. with and and dark every every A tap private designed gestures every',
    icon: 'planet',
    gradient: 'aurora',
  },
  {
    id: 'section-40732-6',
    title: 'Glassy Studio',
    subtitle: 'that curated fluid pixel modes in and beautiful and remaining curated fluid A gestures. A and feel and with for or while pixel press experience for across alive remaining fast feel or. tap considered browsing feel fluid press fast every alive considered tap forever',
    icon: 'globe',
    gradient: 'aurora',
  },
  {
    id: 'section-40732-7',
    title: 'Punchy Lens',
    subtitle: 'fluid A gestures across experience remaining press across forever every across on A dark. while for feel curated designed private across gestures on fluid alive in on fast designed gestures curated dark. on modes light experience gestures and press remaining dark experience while while',
    icon: 'image',
    gradient: 'neon',
  },
  {
    id: 'section-40732-8',
    title: 'Brisk Aurora',
    subtitle: 'on A dark forever modes and that browsing A that designed experience beautiful designed. every across beautiful tap and haptics modes beautiful considered modes while A and in and remaining pixel remaining. modes fluid remaining fluid modes A on that on on while and',
    icon: 'globe',
    gradient: 'forest',
  },
  {
    id: 'section-40732-9',
    title: 'Polished Loom',
    subtitle: 'experience beautiful designed that curated fluid A modes on and tap fast and that. and press tap alive or forever modes A modes every press pixel while light for while while on. considered tap beautiful dark and considered gestures across and fluid press press',
    icon: 'briefcase',
    gradient: 'fire',
  },
  {
    id: 'section-40732-10',
    title: 'Brisk Lens',
    subtitle: 'fast and that or pixel curated tap in while fluid haptics modes modes alive. and designed remaining dark forever across and designed modes considered every gestures with every fast and alive every. and pixel browsing designed gestures press and long in browsing light curated',
    icon: 'image',
    gradient: 'cosmic',
  },
  {
    id: 'section-40732-11',
    title: 'Polished Beacon',
    subtitle: 'modes modes alive considered tap with haptics for beautiful and modes and while gestures. with private with modes and pixel haptics experience light and designed gestures with and private press for remaining. light light designed across long A private private on while and beautiful',
    icon: 'grid',
    gradient: 'candy',
  },
  {
    id: 'section-40732-12',
    title: 'Snappy Studio',
    subtitle: 'and while gestures on private and gestures haptics and A beautiful dark curated dark. on curated with while or modes remaining pixel private considered fast and or every dark or dark A. tap forever or experience on or browsing curated across pixel while dark',
    icon: 'extension-puzzle',
    gradient: 'cosmic',
  },
  {
    id: 'section-40732-13',
    title: 'Brisk Beacon',
    subtitle: 'dark curated dark A gestures across or tap beautiful beautiful haptics haptics for across. forever every and fast or gestures and every that in forever browsing for designed considered forever fast private. browsing modes haptics every tap and designed while or light or considered',
    icon: 'cloud',
    gradient: 'brand',
  },
  {
    id: 'section-40732-14',
    title: 'Buttery Echo',
    subtitle: 'haptics for across private haptics pixel and light browsing every fluid and every across. every and fast haptics on considered long pixel light pixel with fluid forever remaining and designed every long. gestures for dark in fast on and haptics and dark every that',
    icon: 'compass',
    gradient: 'brand',
  },
];

const HERO_TITLE = 'Download settings';
const HERO_SUBTITLE = 'Default folder, throttle, and auto-clean.';
const FOOTER_TITLE = 'Keep going with Download settings';
const FOOTER_BODY = 'A feel considered tap feel light feel and across fluid A designed haptics with. considered press A designed haptics every that browsing for dark fast beautiful press pixel across haptics considered and. light designed and gestures alive A considered designed with and while feel';

export const DownloadsSettingsScreen: React.FC = () => {
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
      variant="forest"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Download settings"
        subtitle="Default folder, throttle, and auto-clean."
        showBack={true}
        rightIcon="settings"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="forest"
        badge="L4"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>13%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '13%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>56%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '56%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>9%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '9%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>52%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '52%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>5%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '5%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>48%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '48%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>91%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '91%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>44%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '44%' }]}
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
