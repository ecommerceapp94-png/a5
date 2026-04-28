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
    id: 'item-1938-1',
    title: 'Frosted Lens 1',
    description: 'and haptics feel for on while light designed tap curated dark haptics gestures press. on A beautiful with remaining light gestures beautiful or pixel fluid light forever long press remaining modes remaining. pixel feel and long in browsing gestures remaining long experience across in',
    icon: 'shield',
    gradient: 'ocean',
    tone: 'warning',
    meta: '53 mins ago',
    stat1: 714,
    stat2: 4,
    stat3: '2.2',
    verb: 'Read',
  },
  {
    id: 'item-1938-2',
    title: 'Glassy Insight 2',
    description: 'haptics feel for on while light designed tap curated dark haptics gestures press press. beautiful with remaining light gestures beautiful or pixel fluid light forever long press remaining modes remaining while forever. long in browsing gestures remaining long experience across in pixel and every',
    icon: 'leaf',
    gradient: 'cosmic',
    tone: 'success',
    meta: '54 mins ago',
    stat1: 727,
    stat2: 11,
    stat3: '4.1',
    verb: 'Visited',
  },
  {
    id: 'item-1938-3',
    title: 'Premium Stream 3',
    description: 'feel for on while light designed tap curated dark haptics gestures press press for. remaining light gestures beautiful or pixel fluid light forever long press remaining modes remaining while forever for long. gestures remaining long experience across in pixel and every remaining feel on',
    icon: 'pricetag',
    gradient: 'amber',
    tone: 'danger',
    meta: '55 mins ago',
    stat1: 740,
    stat2: 18,
    stat3: '1.0',
    verb: 'Saved',
  },
  {
    id: 'item-1938-4',
    title: 'Crisp Beacon 4',
    description: 'for on while light designed tap curated dark haptics gestures press press for feel. gestures beautiful or pixel fluid light forever long press remaining modes remaining while forever for long beautiful on. experience across in pixel and every remaining feel on alive designed on',
    icon: 'compass',
    gradient: 'aurora',
    tone: 'info',
    meta: '56 mins ago',
    stat1: 753,
    stat2: 25,
    stat3: '2.9',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1938-5',
    title: 'Velvet Spark 5',
    description: 'on while light designed tap curated dark haptics gestures press press for feel considered. or pixel fluid light forever long press remaining modes remaining while forever for long beautiful on every haptics. pixel and every remaining feel on alive designed on with considered feel',
    icon: 'book',
    gradient: 'forest',
    tone: 'success',
    meta: '57 mins ago',
    stat1: 766,
    stat2: 32,
    stat3: '4.8',
    verb: 'Archived',
  },
  {
    id: 'item-1938-6',
    title: 'Soft Loom 6',
    description: 'while light designed tap curated dark haptics gestures press press for feel considered experience. fluid light forever long press remaining modes remaining while forever for long beautiful on every haptics for designed. remaining feel on alive designed on with considered feel feel browsing experience',
    icon: 'cloud',
    gradient: 'sunset',
    tone: 'danger',
    meta: '58 mins ago',
    stat1: 779,
    stat2: 39,
    stat3: '1.7',
    verb: 'Highlighted',
  },
  {
    id: 'item-1938-7',
    title: 'Punchy Beacon 7',
    description: 'light designed tap curated dark haptics gestures press press for feel considered experience dark. forever long press remaining modes remaining while forever for long beautiful on every haptics for designed with gestures. alive designed on with considered feel feel browsing experience light every for',
    icon: 'flame',
    gradient: 'neon',
    tone: 'info',
    meta: '59 mins ago',
    stat1: 792,
    stat2: 46,
    stat3: '3.6',
    verb: 'Pinned',
  },
  {
    id: 'item-1938-8',
    title: 'Velvet Quest 8',
    description: 'designed tap curated dark haptics gestures press press for feel considered experience dark press. press remaining modes remaining while forever for long beautiful on every haptics for designed with gestures with tap. with considered feel feel browsing experience light every for beautiful and curated',
    icon: 'film',
    gradient: 'pastel',
    tone: 'warning',
    meta: '60 mins ago',
    stat1: 805,
    stat2: 53,
    stat3: '0.5',
    verb: 'Read',
  },
  {
    id: 'item-1938-9',
    title: 'Polished Echo 9',
    description: 'tap curated dark haptics gestures press press for feel considered experience dark press tap. modes remaining while forever for long beautiful on every haptics for designed with gestures with tap and that. feel browsing experience light every for beautiful and curated press haptics press',
    icon: 'heart',
    gradient: 'cosmic',
    tone: 'success',
    meta: '61 mins ago',
    stat1: 818,
    stat2: 60,
    stat3: '2.4',
    verb: 'Read',
  },
  {
    id: 'item-1938-10',
    title: 'Brisk Saga 10',
    description: 'curated dark haptics gestures press press for feel considered experience dark press tap tap. while forever for long beautiful on every haptics for designed with gestures with tap and that browsing and. light every for beautiful and curated press haptics press and on long',
    icon: 'speedometer',
    gradient: 'amber',
    tone: 'success',
    meta: '62 mins ago',
    stat1: 831,
    stat2: 67,
    stat3: '4.3',
    verb: 'Saved',
  },
  {
    id: 'item-1938-11',
    title: 'Frosted Beacon 11',
    description: 'dark haptics gestures press press for feel considered experience dark press tap tap gestures. for long beautiful on every haptics for designed with gestures with tap and that browsing and remaining across. beautiful and curated press haptics press and on long modes while considered',
    icon: 'cafe',
    gradient: 'amber',
    tone: 'info',
    meta: '63 mins ago',
    stat1: 844,
    stat2: 74,
    stat3: '1.2',
    verb: 'Opened',
  },
  {
    id: 'item-1938-12',
    title: 'Velvet Compass 12',
    description: 'haptics gestures press press for feel considered experience dark press tap tap gestures light. beautiful on every haptics for designed with gestures with tap and that browsing and remaining across alive every. press haptics press and on long modes while considered and and fast',
    icon: 'gift',
    gradient: 'forest',
    tone: 'primary',
    meta: '64 mins ago',
    stat1: 857,
    stat2: 81,
    stat3: '3.1',
    verb: 'Searched',
  },
  {
    id: 'item-1938-13',
    title: 'Snappy Compass 13',
    description: 'gestures press press for feel considered experience dark press tap tap gestures light that. every haptics for designed with gestures with tap and that browsing and remaining across alive every tap curated. and on long modes while considered and and fast fluid haptics light',
    icon: 'pizza',
    gradient: 'brand',
    tone: 'warning',
    meta: '65 mins ago',
    stat1: 870,
    stat2: 88,
    stat3: '0.0',
    verb: 'Searched',
  },
  {
    id: 'item-1938-14',
    title: 'Snappy Beacon 14',
    description: 'press press for feel considered experience dark press tap tap gestures light that browsing. for designed with gestures with tap and that browsing and remaining across alive every tap curated beautiful fluid. modes while considered and and fast fluid haptics light modes A tap',
    icon: 'pulse',
    gradient: 'ocean',
    tone: 'warning',
    meta: '66 mins ago',
    stat1: 883,
    stat2: 95,
    stat3: '1.9',
    verb: 'Archived',
  },
  {
    id: 'item-1938-15',
    title: 'Velvet Drift 15',
    description: 'press for feel considered experience dark press tap tap gestures light that browsing modes. with gestures with tap and that browsing and remaining across alive every tap curated beautiful fluid while for. and and fast fluid haptics light modes A tap every remaining with',
    icon: 'heart',
    gradient: 'ocean',
    tone: 'danger',
    meta: '67 mins ago',
    stat1: 896,
    stat2: 3,
    stat3: '3.8',
    verb: 'Read',
  },
  {
    id: 'item-1938-16',
    title: 'Dreamy Stream 16',
    description: 'for feel considered experience dark press tap tap gestures light that browsing modes and. with tap and that browsing and remaining across alive every tap curated beautiful fluid while for A beautiful. fluid haptics light modes A tap every remaining with gestures gestures press',
    icon: 'rocket',
    gradient: 'neon',
    tone: 'success',
    meta: '68 mins ago',
    stat1: 909,
    stat2: 10,
    stat3: '0.7',
    verb: 'Saved',
  },
  {
    id: 'item-1938-17',
    title: 'Crisp Halo 17',
    description: 'feel considered experience dark press tap tap gestures light that browsing modes and that. and that browsing and remaining across alive every tap curated beautiful fluid while for A beautiful on alive. modes A tap every remaining with gestures gestures press tap modes fluid',
    icon: 'image',
    gradient: 'amber',
    tone: 'info',
    meta: '69 mins ago',
    stat1: 922,
    stat2: 17,
    stat3: '2.6',
    verb: 'Saved',
  },
  {
    id: 'item-1938-18',
    title: 'Buttery Quest 18',
    description: 'considered experience dark press tap tap gestures light that browsing modes and that with. browsing and remaining across alive every tap curated beautiful fluid while for A beautiful on alive on experience. every remaining with gestures gestures press tap modes fluid with curated fast',
    icon: 'lock-closed',
    gradient: 'forest',
    tone: 'info',
    meta: '70 mins ago',
    stat1: 935,
    stat2: 24,
    stat3: '4.5',
    verb: 'Pinned',
  },
  {
    id: 'item-1938-19',
    title: 'Polished Aurora 19',
    description: 'experience dark press tap tap gestures light that browsing modes and that with in. remaining across alive every tap curated beautiful fluid while for A beautiful on alive on experience curated curated. gestures gestures press tap modes fluid with curated fast remaining and in',
    icon: 'cafe',
    gradient: 'forest',
    tone: 'warning',
    meta: '71 mins ago',
    stat1: 948,
    stat2: 31,
    stat3: '1.4',
    verb: 'Read',
  },
  {
    id: 'item-1938-20',
    title: 'Sleek Drift 20',
    description: 'dark press tap tap gestures light that browsing modes and that with in experience. alive every tap curated beautiful fluid while for A beautiful on alive on experience curated curated that fluid. tap modes fluid with curated fast remaining and in in pixel every',
    icon: 'pizza',
    gradient: 'cosmic',
    tone: 'success',
    meta: '72 mins ago',
    stat1: 961,
    stat2: 38,
    stat3: '3.3',
    verb: 'Followed',
  },
  {
    id: 'item-1938-21',
    title: 'Dreamy Insight 21',
    description: 'press tap tap gestures light that browsing modes and that with in experience long. tap curated beautiful fluid while for A beautiful on alive on experience curated curated that fluid feel that. with curated fast remaining and in in pixel every tap that fast',
    icon: 'star',
    gradient: 'amber',
    tone: 'accent',
    meta: '73 mins ago',
    stat1: 974,
    stat2: 45,
    stat3: '0.2',
    verb: 'Translated',
  },
  {
    id: 'item-1938-22',
    title: 'Premium Beacon 22',
    description: 'tap tap gestures light that browsing modes and that with in experience long with. beautiful fluid while for A beautiful on alive on experience curated curated that fluid feel that fluid and. remaining and in in pixel every tap that fast on every browsing',
    icon: 'cloud',
    gradient: 'fire',
    tone: 'primary',
    meta: '74 mins ago',
    stat1: 987,
    stat2: 52,
    stat3: '2.1',
    verb: 'Highlighted',
  },
  {
    id: 'item-1938-23',
    title: 'Velvet Spark 23',
    description: 'tap gestures light that browsing modes and that with in experience long with beautiful. while for A beautiful on alive on experience curated curated that fluid feel that fluid and across for. in pixel every tap that fast on every browsing long feel and',
    icon: 'lock-closed',
    gradient: 'midnight',
    tone: 'info',
    meta: '75 mins ago',
    stat1: 20,
    stat2: 59,
    stat3: '4.0',
    verb: 'Pinned',
  },
  {
    id: 'item-1938-24',
    title: 'Soft Loom 24',
    description: 'gestures light that browsing modes and that with in experience long with beautiful alive. A beautiful on alive on experience curated curated that fluid feel that fluid and across for gestures modes. tap that fast on every browsing long feel and fast fluid feel',
    icon: 'bookmark',
    gradient: 'pastel',
    tone: 'warning',
    meta: '76 mins ago',
    stat1: 33,
    stat2: 66,
    stat3: '0.9',
    verb: 'Followed',
  },
  {
    id: 'item-1938-25',
    title: 'Punchy Studio 25',
    description: 'light that browsing modes and that with in experience long with beautiful alive with. on alive on experience curated curated that fluid feel that fluid and across for gestures modes haptics remaining. on every browsing long feel and fast fluid feel beautiful feel beautiful',
    icon: 'speedometer',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '77 mins ago',
    stat1: 46,
    stat2: 73,
    stat3: '2.8',
    verb: 'Read',
  },
  {
    id: 'item-1938-26',
    title: 'Vibrant Studio 26',
    description: 'that browsing modes and that with in experience long with beautiful alive with forever. on experience curated curated that fluid feel that fluid and across for gestures modes haptics remaining A haptics. long feel and fast fluid feel beautiful feel beautiful considered every light',
    icon: 'pulse',
    gradient: 'fire',
    tone: 'success',
    meta: '78 mins ago',
    stat1: 59,
    stat2: 80,
    stat3: '4.7',
    verb: 'Visited',
  },
  {
    id: 'item-1938-27',
    title: 'Vibrant Lens 27',
    description: 'browsing modes and that with in experience long with beautiful alive with forever A. curated curated that fluid feel that fluid and across for gestures modes haptics remaining A haptics while tap. fast fluid feel beautiful feel beautiful considered every light private and that',
    icon: 'book',
    gradient: 'amber',
    tone: 'danger',
    meta: '79 mins ago',
    stat1: 72,
    stat2: 87,
    stat3: '1.6',
    verb: 'Searched',
  },
  {
    id: 'item-1938-28',
    title: 'Glassy Spark 28',
    description: 'modes and that with in experience long with beautiful alive with forever A every. that fluid feel that fluid and across for gestures modes haptics remaining A haptics while tap haptics private. beautiful feel beautiful considered every light private and that light experience that',
    icon: 'medal',
    gradient: 'aurora',
    tone: 'warning',
    meta: '80 mins ago',
    stat1: 85,
    stat2: 94,
    stat3: '3.5',
    verb: 'Translated',
  },
  {
    id: 'item-1938-29',
    title: 'Soft Aurora 29',
    description: 'and that with in experience long with beautiful alive with forever A every alive. feel that fluid and across for gestures modes haptics remaining A haptics while tap haptics private considered modes. considered every light private and that light experience that beautiful browsing forever',
    icon: 'extension-puzzle',
    gradient: 'ocean',
    tone: 'primary',
    meta: '81 mins ago',
    stat1: 98,
    stat2: 2,
    stat3: '0.4',
    verb: 'Read',
  },
  {
    id: 'item-1938-30',
    title: 'Sleek Spark 30',
    description: 'that with in experience long with beautiful alive with forever A every alive browsing. fluid and across for gestures modes haptics remaining A haptics while tap haptics private considered modes experience and. private and that light experience that beautiful browsing forever or beautiful or',
    icon: 'heart',
    gradient: 'midnight',
    tone: 'success',
    meta: '82 mins ago',
    stat1: 111,
    stat2: 9,
    stat3: '2.3',
    verb: 'Opened',
  },
  {
    id: 'item-1938-31',
    title: 'Soft Stream 31',
    description: 'with in experience long with beautiful alive with forever A every alive browsing tap. across for gestures modes haptics remaining A haptics while tap haptics private considered modes experience and or haptics. light experience that beautiful browsing forever or beautiful or or while or',
    icon: 'flash',
    gradient: 'amber',
    tone: 'primary',
    meta: '83 mins ago',
    stat1: 124,
    stat2: 16,
    stat3: '4.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1938-32',
    title: 'Crisp Stream 32',
    description: 'in experience long with beautiful alive with forever A every alive browsing tap every. gestures modes haptics remaining A haptics while tap haptics private considered modes experience and or haptics feel haptics. beautiful browsing forever or beautiful or or while or A fluid forever',
    icon: 'analytics',
    gradient: 'brand',
    tone: 'success',
    meta: '84 mins ago',
    stat1: 137,
    stat2: 23,
    stat3: '1.1',
    verb: 'Read',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-32946-1',
    title: 'Soft Codex',
    subtitle: 'browsing every every fluid on while dark private haptics alive and remaining feel tap. designed remaining modes curated experience gestures or with browsing tap with tap considered beautiful feel pixel designed and. every fluid fast curated with remaining beautiful tap gestures private gestures every',
    icon: 'cloud',
    gradient: 'fire',
  },
  {
    id: 'section-32946-2',
    title: 'Premium Pulse',
    subtitle: 'remaining feel tap long across gestures with across A and that every gestures curated. across browsing every long every remaining while long every with dark modes fast A fast fast tap remaining. alive in haptics feel alive A while designed forever press haptics designed',
    icon: 'extension-puzzle',
    gradient: 'sunset',
  },
  {
    id: 'section-32946-3',
    title: 'Subtle Aurora',
    subtitle: 'every gestures curated private alive while in and alive or and forever designed fast. on considered while light remaining designed or and with dark A for remaining every pixel considered light browsing. that feel and tap beautiful haptics long dark in designed while haptics',
    icon: 'shield',
    gradient: 'sunset',
  },
  {
    id: 'section-32946-4',
    title: 'Glassy Spark',
    subtitle: 'forever designed fast and private and while A forever and gestures for forever considered. pixel alive browsing forever long every haptics private alive press alive for private curated A modes gestures feel. remaining designed light press in private considered haptics considered experience and experience',
    icon: 'sparkles',
    gradient: 'candy',
  },
  {
    id: 'section-32946-5',
    title: 'Velvet Beacon',
    subtitle: 'for forever considered fast for remaining or in that fast on across that every. curated curated and forever and while and or forever designed for in private in for on fast gestures. fast experience every every on every for haptics in fast for considered',
    icon: 'newspaper',
    gradient: 'sunset',
  },
  {
    id: 'section-32946-6',
    title: 'Elite Echo',
    subtitle: 'across that every feel experience while A and with every dark designed remaining considered. browsing pixel forever in every or every modes modes press fluid fluid and and considered forever curated in. while feel for that haptics feel alive modes and every remaining browsing',
    icon: 'school',
    gradient: 'fire',
  },
  {
    id: 'section-32946-7',
    title: 'Premium Drift',
    subtitle: 'designed remaining considered haptics in in forever curated curated modes every feel across pixel. experience fast browsing on browsing tap considered modes alive modes private browsing considered in private in long curated. for and light tap in pixel in for experience beautiful tap in',
    icon: 'pizza',
    gradient: 'forest',
  },
  {
    id: 'section-32946-8',
    title: 'Snappy Loom',
    subtitle: 'feel across pixel and and haptics and considered long pixel gestures long browsing with. and fast designed pixel feel press dark remaining experience with on dark across experience every fast forever forever. for across beautiful with modes long gestures haptics curated designed pixel beautiful',
    icon: 'paw',
    gradient: 'pastel',
  },
  {
    id: 'section-32946-9',
    title: 'Cosmic Echo',
    subtitle: 'long browsing with tap with forever feel with private haptics and alive pixel every. long considered light for every fast dark every browsing on remaining gestures and long gestures considered long considered. that feel pixel pixel alive alive across every feel alive considered browsing',
    icon: 'flame',
    gradient: 'candy',
  },
  {
    id: 'section-32946-10',
    title: 'Punchy Beacon',
    subtitle: 'alive pixel every remaining curated forever press remaining curated modes that browsing private A. A A feel browsing feel across every beautiful while tap browsing and A with dark and experience browsing. light and and forever experience considered in haptics long in press browsing',
    icon: 'heart',
    gradient: 'pastel',
  },
  {
    id: 'section-32946-11',
    title: 'Soft Mosaic',
    subtitle: 'browsing private A gestures press on every fluid curated considered forever experience designed remaining. feel on fast for with forever tap fluid that tap with pixel curated experience while gestures considered or. or forever alive curated fast light private and while designed for private',
    icon: 'flash',
    gradient: 'pastel',
  },
  {
    id: 'section-32946-12',
    title: 'Vibrant Loom',
    subtitle: 'experience designed remaining and press and remaining alive beautiful experience designed gestures curated that. remaining curated fast across dark with A that haptics and remaining A designed gestures curated private on long. fast and every and beautiful tap and fluid dark pixel fast A',
    icon: 'leaf',
    gradient: 'ocean',
  },
  {
    id: 'section-32946-13',
    title: 'Elite Forge',
    subtitle: 'gestures curated that or beautiful and alive modes feel browsing long feel considered alive. fast pixel on tap private alive feel designed remaining A or and experience while tap browsing with every. and gestures that alive with that while across alive experience fluid dark',
    icon: 'cafe',
    gradient: 'ocean',
  },
  {
    id: 'section-32946-14',
    title: 'Subtle Echo',
    subtitle: 'feel considered alive on private on pixel for or haptics beautiful press feel curated. private light across pixel with press press private designed remaining every curated experience with fast in curated for. for fast and every curated and private across fast curated haptics and',
    icon: 'leaf',
    gradient: 'midnight',
  },
];

const HERO_TITLE = 'Tab analytics';
const HERO_SUBTITLE = 'Time-on-tab and switching patterns.';
const FOOTER_TITLE = 'Keep going with Tab analytics';
const FOOTER_BODY = 'pixel feel and long in browsing gestures remaining long experience across in pixel and. curated curated pixel browsing designed press alive forever considered light haptics every with dark and alive and tap. and fast in remaining dark private and dark curated long private beautiful';

export const TabsAnalyticsScreen: React.FC = () => {
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
      variant="neon"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Tab analytics"
        subtitle="Time-on-tab and switching patterns."
        showBack={true}
        rightIcon="analytics"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="neon"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>89%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '89%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Compass</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>42%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '42%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>85%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '85%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>38%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '38%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Stream</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Compass</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>34%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '34%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>77%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '77%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>30%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '30%' }]}
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
