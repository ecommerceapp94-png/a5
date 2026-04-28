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
    id: 'item-1944-1',
    title: 'Punchy Beacon 1',
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
    id: 'item-1944-2',
    title: 'Velvet Quest 2',
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
    id: 'item-1944-3',
    title: 'Polished Echo 3',
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
    id: 'item-1944-4',
    title: 'Brisk Saga 4',
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
    id: 'item-1944-5',
    title: 'Frosted Beacon 5',
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
    id: 'item-1944-6',
    title: 'Velvet Compass 6',
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
    id: 'item-1944-7',
    title: 'Snappy Compass 7',
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
    id: 'item-1944-8',
    title: 'Snappy Beacon 8',
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
    id: 'item-1944-9',
    title: 'Velvet Drift 9',
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
    id: 'item-1944-10',
    title: 'Dreamy Stream 10',
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
    id: 'item-1944-11',
    title: 'Crisp Halo 11',
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
    id: 'item-1944-12',
    title: 'Buttery Quest 12',
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
    id: 'item-1944-13',
    title: 'Polished Aurora 13',
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
    id: 'item-1944-14',
    title: 'Sleek Drift 14',
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
    id: 'item-1944-15',
    title: 'Dreamy Insight 15',
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
    id: 'item-1944-16',
    title: 'Premium Beacon 16',
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
    id: 'item-1944-17',
    title: 'Velvet Spark 17',
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
    id: 'item-1944-18',
    title: 'Soft Loom 18',
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
    id: 'item-1944-19',
    title: 'Punchy Studio 19',
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
    id: 'item-1944-20',
    title: 'Vibrant Studio 20',
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
    id: 'item-1944-21',
    title: 'Vibrant Lens 21',
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
    id: 'item-1944-22',
    title: 'Glassy Spark 22',
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
    id: 'item-1944-23',
    title: 'Soft Aurora 23',
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
    id: 'item-1944-24',
    title: 'Sleek Spark 24',
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
    id: 'item-1944-25',
    title: 'Soft Stream 25',
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
    id: 'item-1944-26',
    title: 'Crisp Stream 26',
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
  {
    id: 'item-1944-27',
    title: 'Crisp Mosaic 27',
    description: 'experience long with beautiful alive with forever A every alive browsing tap every and. haptics remaining A haptics while tap haptics private considered modes experience and or haptics feel haptics feel across. or beautiful or or while or A fluid forever in considered browsing',
    icon: 'analytics',
    gradient: 'sunset',
    tone: 'success',
    meta: '85 mins ago',
    stat1: 150,
    stat2: 30,
    stat3: '3.0',
    verb: 'Followed',
  },
  {
    id: 'item-1944-28',
    title: 'Deep Lens 28',
    description: 'long with beautiful alive with forever A every alive browsing tap every and haptics. A haptics while tap haptics private considered modes experience and or haptics feel haptics feel across or while. or while or A fluid forever in considered browsing beautiful private browsing',
    icon: 'cafe',
    gradient: 'amber',
    tone: 'accent',
    meta: '86 mins ago',
    stat1: 163,
    stat2: 37,
    stat3: '4.9',
    verb: 'Opened',
  },
  {
    id: 'item-1944-29',
    title: 'Glassy Forge 29',
    description: 'with beautiful alive with forever A every alive browsing tap every and haptics long. while tap haptics private considered modes experience and or haptics feel haptics feel across or while in beautiful. A fluid forever in considered browsing beautiful private browsing in long remaining',
    icon: 'gift',
    gradient: 'fire',
    tone: 'primary',
    meta: '87 mins ago',
    stat1: 176,
    stat2: 44,
    stat3: '1.8',
    verb: 'Saved',
  },
  {
    id: 'item-1944-30',
    title: 'Silky Compass 30',
    description: 'beautiful alive with forever A every alive browsing tap every and haptics long light. haptics private considered modes experience and or haptics feel haptics feel across or while in beautiful A dark. in considered browsing beautiful private browsing in long remaining across with and',
    icon: 'gift',
    gradient: 'brand',
    tone: 'info',
    meta: '88 mins ago',
    stat1: 189,
    stat2: 51,
    stat3: '3.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1944-31',
    title: 'Snappy Spark 31',
    description: 'alive with forever A every alive browsing tap every and haptics long light designed. considered modes experience and or haptics feel haptics feel across or while in beautiful A dark designed considered. beautiful private browsing in long remaining across with and long alive private',
    icon: 'extension-puzzle',
    gradient: 'forest',
    tone: 'success',
    meta: '89 mins ago',
    stat1: 202,
    stat2: 58,
    stat3: '0.6',
    verb: 'Translated',
  },
  {
    id: 'item-1944-32',
    title: 'Soft Lens 32',
    description: 'with forever A every alive browsing tap every and haptics long light designed while. experience and or haptics feel haptics feel across or while in beautiful A dark designed considered forever remaining. in long remaining across with and long alive private while A feel',
    icon: 'sparkles',
    gradient: 'sunset',
    tone: 'primary',
    meta: '90 mins ago',
    stat1: 215,
    stat2: 65,
    stat3: '2.5',
    verb: 'Saved',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-33048-1',
    title: 'Crisp Saga',
    subtitle: 'remaining curated forever press remaining curated modes that browsing private A gestures press on. every beautiful while tap browsing and A with dark and experience browsing designed feel or and feel on. in press browsing designed beautiful remaining fast across and and browsing and',
    icon: 'speedometer',
    gradient: 'candy',
  },
  {
    id: 'section-33048-2',
    title: 'Polished Saga',
    subtitle: 'gestures press on every fluid curated considered forever experience designed remaining and press and. tap fluid that tap with pixel curated experience while gestures considered or fluid dark long in remaining curated. designed for private modes considered dark light curated dark forever across for',
    icon: 'rocket',
    gradient: 'pastel',
  },
  {
    id: 'section-33048-3',
    title: 'Brisk Codex',
    subtitle: 'and press and remaining alive beautiful experience designed gestures curated that or beautiful and. A that haptics and remaining A designed gestures curated private on long while press experience experience fast pixel. pixel fast A while browsing and tap private in and browsing or',
    icon: 'school',
    gradient: 'aurora',
  },
  {
    id: 'section-33048-4',
    title: 'Glassy Studio',
    subtitle: 'or beautiful and alive modes feel browsing long feel considered alive on private on. feel designed remaining A or and experience while tap browsing with every browsing A designed and private light. experience fluid dark experience on and gestures curated remaining designed every that',
    icon: 'layers',
    gradient: 'sunset',
  },
  {
    id: 'section-33048-5',
    title: 'Dreamy Stream',
    subtitle: 'on private on pixel for or haptics beautiful press feel curated that in remaining. press private designed remaining every curated experience with fast in curated for for long and fluid on for. curated haptics and alive designed private with gestures fast remaining fast browsing',
    icon: 'flame',
    gradient: 'ocean',
  },
  {
    id: 'section-33048-6',
    title: 'Brisk Halo',
    subtitle: 'that in remaining A press long and and haptics fast modes light alive for. press every light designed remaining pixel forever experience in long A considered and dark across light for beautiful. considered and considered with for press long or modes for alive feel',
    icon: 'planet',
    gradient: 'brand',
  },
  {
    id: 'section-33048-7',
    title: 'Cosmic Atlas',
    subtitle: 'light alive for haptics in feel or forever with fast and remaining private every. on considered pixel every pixel browsing and gestures private and experience fluid beautiful alive while A beautiful tap. light every fast with or haptics that long gestures remaining while every',
    icon: 'bookmark',
    gradient: 'fire',
  },
  {
    id: 'section-33048-8',
    title: 'Subtle Quest',
    subtitle: 'remaining private every tap forever private with designed pixel and long pixel fast in. curated feel A fast private modes beautiful fast that for and press haptics in across remaining browsing while. haptics forever modes and tap curated every in pixel feel browsing considered',
    icon: 'trophy',
    gradient: 'fire',
  },
  {
    id: 'section-33048-9',
    title: 'Crisp Loom',
    subtitle: 'pixel fast in modes that on across for designed pixel dark every on long. while in feel and across and or every in A press every fluid fluid every press long modes. curated with every tap gestures and every tap forever designed fast or',
    icon: 'paw',
    gradient: 'cosmic',
  },
  {
    id: 'section-33048-10',
    title: 'Vibrant Stream',
    subtitle: 'every on long while gestures remaining considered fluid designed on and fluid press tap. across light and fast beautiful forever fluid tap forever forever A A browsing long that modes every considered. browsing in gestures in and A alive or beautiful every private browsing',
    icon: 'shield',
    gradient: 'candy',
  },
  {
    id: 'section-33048-11',
    title: 'Brisk Stream',
    subtitle: 'fluid press tap and considered long browsing curated that A browsing beautiful forever in. curated across press on forever with every across and modes while fluid every dark press beautiful dark every. A remaining alive pixel tap experience modes and gestures fast light in',
    icon: 'extension-puzzle',
    gradient: 'ocean',
  },
  {
    id: 'section-33048-12',
    title: 'Frosted Halo',
    subtitle: 'beautiful forever in tap feel while browsing A modes browsing with forever modes curated. modes press feel experience light in that press private A feel that pixel haptics alive across A and. fast for or every private designed on experience feel and that with',
    icon: 'trophy',
    gradient: 'brand',
  },
  {
    id: 'section-33048-13',
    title: 'Subtle Saga',
    subtitle: 'forever modes curated curated curated in beautiful across in for light tap long that. every designed with long haptics every pixel private modes A with remaining tap considered modes that modes experience. press pixel designed in curated curated press and every considered forever across',
    icon: 'briefcase',
    gradient: 'midnight',
  },
  {
    id: 'section-33048-14',
    title: 'Punchy Lens',
    subtitle: 'tap long that A gestures every fast considered remaining fluid that gestures dark fast. alive every gestures light feel fluid fluid curated curated for that every browsing for browsing fluid across feel. browsing or every modes browsing fluid with for feel fluid fast long',
    icon: 'planet',
    gradient: 'forest',
  },
];

const HERO_TITLE = 'Bookmark';
const HERO_SUBTITLE = 'Edit, share, or delete this entry.';
const FOOTER_TITLE = 'Keep going with Bookmark';
const FOOTER_BODY = 'alive designed on with considered feel feel browsing experience light every for beautiful and. modes light tap considered A remaining beautiful designed with and dark A and experience gestures and A browsing. light gestures fluid every browsing with browsing alive private modes and alive';

export const BookmarksItemScreen: React.FC = () => {
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
      variant="candy"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Bookmark"
        subtitle="Edit, share, or delete this entry."
        showBack={true}
        rightIcon="pencil"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="candy"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>77%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '77%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>30%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '30%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>73%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '73%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>26%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '26%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>69%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '69%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>22%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '22%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>65%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '65%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>18%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '18%' }]}
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
