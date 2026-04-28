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
    id: 'item-2143-1',
    title: 'Dreamy Studio 1',
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
    id: 'item-2143-2',
    title: 'Vibrant Echo 2',
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
    id: 'item-2143-3',
    title: 'Brisk Lens 3',
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
    id: 'item-2143-4',
    title: 'Glassy Lens 4',
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
    id: 'item-2143-5',
    title: 'Glassy Tapestry 5',
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
    id: 'item-2143-6',
    title: 'Subtle Spark 6',
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
    id: 'item-2143-7',
    title: 'Soft Tapestry 7',
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
    id: 'item-2143-8',
    title: 'Subtle Quest 8',
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
    id: 'item-2143-9',
    title: 'Polished Echo 9',
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
    id: 'item-2143-10',
    title: 'Brisk Stream 10',
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
    id: 'item-2143-11',
    title: 'Crisp Quest 11',
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
    id: 'item-2143-12',
    title: 'Polished Mosaic 12',
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
    id: 'item-2143-13',
    title: 'Deep Compass 13',
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
    id: 'item-2143-14',
    title: 'Snappy Loom 14',
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
    id: 'item-2143-15',
    title: 'Punchy Studio 15',
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
    id: 'item-2143-16',
    title: 'Vibrant Beacon 16',
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
    id: 'item-2143-17',
    title: 'Velvet Quest 17',
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
    id: 'item-2143-18',
    title: 'Polished Echo 18',
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
    id: 'item-2143-19',
    title: 'Brisk Forge 19',
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
    id: 'item-2143-20',
    title: 'Silky Forge 20',
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
    id: 'item-2143-21',
    title: 'Silky Aurora 21',
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
    id: 'item-2143-22',
    title: 'Sleek Stream 22',
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
  {
    id: 'item-2143-23',
    title: 'Crisp Insight 23',
    description: 'press experience gestures and every gestures browsing modes designed considered across long remaining fast. that experience dark fast or or or for while or fluid for feel long while and long while. modes experience private private remaining curated dark and long feel browsing haptics',
    icon: 'gift',
    gradient: 'aurora',
    tone: 'warning',
    meta: '10 mins ago',
    stat1: 725,
    stat2: 9,
    stat3: '3.5',
    verb: 'Translated',
  },
  {
    id: 'item-2143-24',
    title: 'Premium Pulse 24',
    description: 'experience gestures and every gestures browsing modes designed considered across long remaining fast fast. dark fast or or or for while or fluid for feel long while and long while that dark. private remaining curated dark and long feel browsing haptics with private pixel',
    icon: 'analytics',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '11 mins ago',
    stat1: 738,
    stat2: 16,
    stat3: '0.4',
    verb: 'Highlighted',
  },
  {
    id: 'item-2143-25',
    title: 'Elite Compass 25',
    description: 'gestures and every gestures browsing modes designed considered across long remaining fast fast alive. or or or for while or fluid for feel long while and long while that dark considered designed. dark and long feel browsing haptics with private pixel feel for experience',
    icon: 'pricetag',
    gradient: 'midnight',
    tone: 'info',
    meta: '12 mins ago',
    stat1: 751,
    stat2: 23,
    stat3: '2.3',
    verb: 'Visited',
  },
  {
    id: 'item-2143-26',
    title: 'Snappy Drift 26',
    description: 'and every gestures browsing modes designed considered across long remaining fast fast alive with. or for while or fluid for feel long while and long while that dark considered designed fluid A. feel browsing haptics with private pixel feel for experience long on alive',
    icon: 'globe',
    gradient: 'pastel',
    tone: 'danger',
    meta: '13 mins ago',
    stat1: 764,
    stat2: 30,
    stat3: '4.2',
    verb: 'Searched',
  },
  {
    id: 'item-2143-27',
    title: 'Dreamy Stream 27',
    description: 'every gestures browsing modes designed considered across long remaining fast fast alive with long. while or fluid for feel long while and long while that dark considered designed fluid A across pixel. with private pixel feel for experience long on alive private A alive',
    icon: 'analytics',
    gradient: 'aurora',
    tone: 'warning',
    meta: '14 mins ago',
    stat1: 777,
    stat2: 37,
    stat3: '1.1',
    verb: 'Translated',
  },
  {
    id: 'item-2143-28',
    title: 'Crisp Saga 28',
    description: 'gestures browsing modes designed considered across long remaining fast fast alive with long that. fluid for feel long while and long while that dark considered designed fluid A across pixel experience alive. feel for experience long on alive private A alive experience across in',
    icon: 'newspaper',
    gradient: 'ocean',
    tone: 'primary',
    meta: '15 mins ago',
    stat1: 790,
    stat2: 44,
    stat3: '3.0',
    verb: 'Translated',
  },
  {
    id: 'item-2143-29',
    title: 'Frosted Mosaic 29',
    description: 'browsing modes designed considered across long remaining fast fast alive with long that for. feel long while and long while that dark considered designed fluid A across pixel experience alive press alive. long on alive private A alive experience across in remaining on curated',
    icon: 'cafe',
    gradient: 'midnight',
    tone: 'primary',
    meta: '16 mins ago',
    stat1: 803,
    stat2: 51,
    stat3: '4.9',
    verb: 'Archived',
  },
  {
    id: 'item-2143-30',
    title: 'Deep Stream 30',
    description: 'modes designed considered across long remaining fast fast alive with long that for and. while and long while that dark considered designed fluid A across pixel experience alive press alive experience gestures. private A alive experience across in remaining on curated beautiful considered dark',
    icon: 'globe',
    gradient: 'midnight',
    tone: 'danger',
    meta: '17 mins ago',
    stat1: 816,
    stat2: 58,
    stat3: '1.8',
    verb: 'Followed',
  },
  {
    id: 'item-2143-31',
    title: 'Crisp Halo 31',
    description: 'designed considered across long remaining fast fast alive with long that for and and. long while that dark considered designed fluid A across pixel experience alive press alive experience gestures designed alive. experience across in remaining on curated beautiful considered dark for alive and',
    icon: 'film',
    gradient: 'neon',
    tone: 'accent',
    meta: '18 mins ago',
    stat1: 829,
    stat2: 65,
    stat3: '3.7',
    verb: 'Followed',
  },
  {
    id: 'item-2143-32',
    title: 'Buttery Studio 32',
    description: 'considered across long remaining fast fast alive with long that for and and with. that dark considered designed fluid A across pixel experience alive press alive experience gestures designed alive or in. remaining on curated beautiful considered dark for alive and curated across forever',
    icon: 'globe',
    gradient: 'fire',
    tone: 'accent',
    meta: '19 mins ago',
    stat1: 842,
    stat2: 72,
    stat3: '0.6',
    verb: 'Bookmarked',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-36431-1',
    title: 'Lush Stream',
    subtitle: 'that modes for light or pixel dark every across fast in beautiful experience or. browsing A fast that fluid browsing tap modes across every for feel remaining modes beautiful curated with tap. tap and and beautiful experience and haptics for fluid alive forever considered',
    icon: 'flame',
    gradient: 'fire',
  },
  {
    id: 'section-36431-2',
    title: 'Elite Pulse',
    subtitle: 'beautiful experience or feel feel light pixel modes tap curated press every and private. and alive beautiful haptics and press while pixel pixel modes tap modes beautiful with designed press tap every. and tap and tap with while pixel modes across forever that remaining',
    icon: 'speedometer',
    gradient: 'fire',
  },
  {
    id: 'section-36431-3',
    title: 'Sleek Pulse',
    subtitle: 'every and private browsing haptics curated experience while on that every fluid tap considered. every remaining tap long tap and haptics considered designed haptics pixel remaining press in long remaining for with. beautiful fast A considered while beautiful for long remaining or curated experience',
    icon: 'extension-puzzle',
    gradient: 'sunset',
  },
  {
    id: 'section-36431-4',
    title: 'Elite Codex',
    subtitle: 'fluid tap considered across in and designed that every designed modes alive across pixel. or private across A modes long press press while press feel feel and press pixel for that dark. haptics considered while for and feel curated that across feel with fluid',
    icon: 'cloud',
    gradient: 'fire',
  },
  {
    id: 'section-36431-5',
    title: 'Elite Mosaic',
    subtitle: 'alive across pixel on fluid designed forever curated browsing light fast curated and gestures. press long forever beautiful and browsing feel alive alive remaining and browsing pixel private fluid and and tap. long experience beautiful long remaining and tap considered across dark experience with',
    icon: 'planet',
    gradient: 'aurora',
  },
  {
    id: 'section-36431-6',
    title: 'Soft Loom',
    subtitle: 'curated and gestures fluid haptics and feel light feel and pixel gestures pixel remaining. or with in fast long alive remaining designed on or while for haptics light every dark forever dark. light beautiful alive remaining pixel and that fluid private tap for long',
    icon: 'layers',
    gradient: 'amber',
  },
  {
    id: 'section-36431-7',
    title: 'Silky Lens',
    subtitle: 'gestures pixel remaining alive A experience every feel experience gestures alive on modes for. on in alive considered press A every pixel in for and browsing private on and gestures every gestures. browsing considered with tap long experience on browsing fast forever and beautiful',
    icon: 'film',
    gradient: 'sunset',
  },
  {
    id: 'section-36431-8',
    title: 'Buttery Insight',
    subtitle: 'on modes for fluid pixel every or fast feel curated A modes curated A. browsing experience fast experience long with fast on alive remaining experience alive and designed dark designed that or. in press haptics alive in beautiful that long fast considered light modes',
    icon: 'briefcase',
    gradient: 'cosmic',
  },
  {
    id: 'section-36431-9',
    title: 'Glassy Echo',
    subtitle: 'modes curated A and forever across feel alive for long and fluid experience haptics. and haptics considered or and light alive A feel in light beautiful designed experience with fast while while. for A and in dark curated haptics tap remaining beautiful that browsing',
    icon: 'heart',
    gradient: 'sunset',
  },
  {
    id: 'section-36431-10',
    title: 'Frosted Lens',
    subtitle: 'fluid experience haptics dark tap experience fast while and modes private fast and forever. every and while for dark for or tap while and in browsing and fluid tap every and private. tap haptics and for haptics for long and gestures in every modes',
    icon: 'school',
    gradient: 'midnight',
  },
  {
    id: 'section-36431-11',
    title: 'Crisp Aurora',
    subtitle: 'fast and forever modes forever press every haptics and remaining long feel fluid across. across for gestures across on light designed and with feel private in alive or considered fast and long. fast while every light browsing on and A long alive while and',
    icon: 'analytics',
    gradient: 'pastel',
  },
  {
    id: 'section-36431-12',
    title: 'Punchy Insight',
    subtitle: 'feel fluid across alive curated or and and and private while browsing beautiful remaining. experience considered beautiful and in and A with for and remaining while or dark forever fluid fast alive. considered fluid with that haptics A long or forever forever private in',
    icon: 'book',
    gradient: 'neon',
  },
  {
    id: 'section-36431-13',
    title: 'Silky Atlas',
    subtitle: 'browsing beautiful remaining long for forever forever modes press while modes light designed and. browsing gestures forever remaining dark fluid alive tap or and or long alive remaining that every feel designed. gestures considered long A and designed considered remaining modes for pixel beautiful',
    icon: 'trophy',
    gradient: 'pastel',
  },
  {
    id: 'section-36431-14',
    title: 'Snappy Loom',
    subtitle: 'light designed and press beautiful designed for modes gestures dark and and for and. A long designed fast forever and curated while fluid every tap beautiful browsing alive fast feel every every. designed with with and forever light pixel curated fluid A tap dark',
    icon: 'paw',
    gradient: 'cosmic',
  },
];

const HERO_TITLE = 'Search bookmarks';
const HERO_SUBTITLE = 'Full text search with filters.';
const FOOTER_TITLE = 'Keep going with Search bookmarks';
const FOOTER_BODY = 'designed press designed forever long every for fluid private experience private beautiful fast light. that or feel or every long light beautiful with for on browsing and for considered private feel or. A and pixel light private dark and fluid private designed forever tap';

export const BookmarksSearchScreen: React.FC = () => {
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
      (navigation as any).navigate('BookmarksFolder', { folderId: 'folder-1' });
    },
    [navigation],
  );
  const goAlt = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('BookmarksItem', { bookmarkId: 'bm-1' });
    },
    [navigation],
  );
  const goDeep = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('BookmarksOrganize', { folderId: 'folder-1' });
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
        title="Search bookmarks"
        subtitle="Full text search with filters."
        showBack={true}
        rightIcon="search"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="neon"
        badge="Search"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>54%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '54%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>7%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '7%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>50%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '50%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>93%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '93%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>46%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '46%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>89%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '89%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>42%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '42%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>85%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '85%' }]}
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
