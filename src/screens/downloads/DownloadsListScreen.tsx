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
    id: 'item-1959-1',
    title: 'Premium Beacon 1',
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
    id: 'item-1959-2',
    title: 'Velvet Spark 2',
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
    id: 'item-1959-3',
    title: 'Soft Loom 3',
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
    id: 'item-1959-4',
    title: 'Punchy Studio 4',
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
    id: 'item-1959-5',
    title: 'Vibrant Studio 5',
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
    id: 'item-1959-6',
    title: 'Vibrant Lens 6',
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
    id: 'item-1959-7',
    title: 'Glassy Spark 7',
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
    id: 'item-1959-8',
    title: 'Soft Aurora 8',
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
    id: 'item-1959-9',
    title: 'Sleek Spark 9',
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
    id: 'item-1959-10',
    title: 'Soft Stream 10',
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
    id: 'item-1959-11',
    title: 'Crisp Stream 11',
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
    id: 'item-1959-12',
    title: 'Crisp Mosaic 12',
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
    id: 'item-1959-13',
    title: 'Deep Lens 13',
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
    id: 'item-1959-14',
    title: 'Glassy Forge 14',
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
    id: 'item-1959-15',
    title: 'Silky Compass 15',
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
    id: 'item-1959-16',
    title: 'Snappy Spark 16',
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
    id: 'item-1959-17',
    title: 'Soft Lens 17',
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
  {
    id: 'item-1959-18',
    title: 'Glassy Tapestry 18',
    description: 'forever A every alive browsing tap every and haptics long light designed while every. or haptics feel haptics feel across or while in beautiful A dark designed considered forever remaining light and. across with and long alive private while A feel private pixel tap',
    icon: 'book',
    gradient: 'midnight',
    tone: 'info',
    meta: '91 mins ago',
    stat1: 228,
    stat2: 72,
    stat3: '4.4',
    verb: 'Visited',
  },
  {
    id: 'item-1959-19',
    title: 'Subtle Quest 19',
    description: 'A every alive browsing tap every and haptics long light designed while every and. feel haptics feel across or while in beautiful A dark designed considered forever remaining light and that considered. long alive private while A feel private pixel tap designed alive and',
    icon: 'shield',
    gradient: 'forest',
    tone: 'danger',
    meta: '92 mins ago',
    stat1: 241,
    stat2: 79,
    stat3: '1.3',
    verb: 'Pinned',
  },
  {
    id: 'item-1959-20',
    title: 'Polished Stream 20',
    description: 'every alive browsing tap every and haptics long light designed while every and forever. feel across or while in beautiful A dark designed considered forever remaining light and that considered with alive. while A feel private pixel tap designed alive and dark and private',
    icon: 'musical-notes',
    gradient: 'aurora',
    tone: 'warning',
    meta: '93 mins ago',
    stat1: 254,
    stat2: 86,
    stat3: '3.2',
    verb: 'Highlighted',
  },
  {
    id: 'item-1959-21',
    title: 'Crisp Lens 21',
    description: 'alive browsing tap every and haptics long light designed while every and forever beautiful. or while in beautiful A dark designed considered forever remaining light and that considered with alive that pixel. private pixel tap designed alive and dark and private press experience on',
    icon: 'film',
    gradient: 'cosmic',
    tone: 'info',
    meta: '94 mins ago',
    stat1: 267,
    stat2: 93,
    stat3: '0.1',
    verb: 'Translated',
  },
  {
    id: 'item-1959-22',
    title: 'Glassy Compass 22',
    description: 'browsing tap every and haptics long light designed while every and forever beautiful private. in beautiful A dark designed considered forever remaining light and that considered with alive that pixel alive in. designed alive and dark and private press experience on browsing A experience',
    icon: 'film',
    gradient: 'pastel',
    tone: 'primary',
    meta: '5 mins ago',
    stat1: 280,
    stat2: 1,
    stat3: '2.0',
    verb: 'Read',
  },
  {
    id: 'item-1959-23',
    title: 'Snappy Lens 23',
    description: 'tap every and haptics long light designed while every and forever beautiful private on. A dark designed considered forever remaining light and that considered with alive that pixel alive in A remaining. dark and private press experience on browsing A experience tap haptics modes',
    icon: 'heart',
    gradient: 'midnight',
    tone: 'success',
    meta: '6 mins ago',
    stat1: 293,
    stat2: 8,
    stat3: '3.9',
    verb: 'Visited',
  },
  {
    id: 'item-1959-24',
    title: 'Glassy Saga 24',
    description: 'every and haptics long light designed while every and forever beautiful private on and. designed considered forever remaining light and that considered with alive that pixel alive in A remaining with pixel. press experience on browsing A experience tap haptics modes tap considered alive',
    icon: 'flag',
    gradient: 'amber',
    tone: 'danger',
    meta: '7 mins ago',
    stat1: 306,
    stat2: 15,
    stat3: '0.8',
    verb: 'Pinned',
  },
  {
    id: 'item-1959-25',
    title: 'Frosted Codex 25',
    description: 'and haptics long light designed while every and forever beautiful private on and alive. forever remaining light and that considered with alive that pixel alive in A remaining with pixel browsing haptics. browsing A experience tap haptics modes tap considered alive light or across',
    icon: 'flash',
    gradient: 'aurora',
    tone: 'warning',
    meta: '8 mins ago',
    stat1: 319,
    stat2: 22,
    stat3: '2.7',
    verb: 'Saved',
  },
  {
    id: 'item-1959-26',
    title: 'Cosmic Spark 26',
    description: 'haptics long light designed while every and forever beautiful private on and alive or. light and that considered with alive that pixel alive in A remaining with pixel browsing haptics and curated. tap haptics modes tap considered alive light or across fast in every',
    icon: 'trophy',
    gradient: 'cosmic',
    tone: 'info',
    meta: '9 mins ago',
    stat1: 332,
    stat2: 29,
    stat3: '4.6',
    verb: 'Pinned',
  },
  {
    id: 'item-1959-27',
    title: 'Soft Mosaic 27',
    description: 'long light designed while every and forever beautiful private on and alive or press. that considered with alive that pixel alive in A remaining with pixel browsing haptics and curated considered while. tap considered alive light or across fast in every while modes private',
    icon: 'shield',
    gradient: 'forest',
    tone: 'warning',
    meta: '10 mins ago',
    stat1: 345,
    stat2: 36,
    stat3: '1.5',
    verb: 'Followed',
  },
  {
    id: 'item-1959-28',
    title: 'Deep Lens 28',
    description: 'light designed while every and forever beautiful private on and alive or press or. with alive that pixel alive in A remaining with pixel browsing haptics and curated considered while feel fluid. light or across fast in every while modes private considered designed that',
    icon: 'compass',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '11 mins ago',
    stat1: 358,
    stat2: 43,
    stat3: '3.4',
    verb: 'Opened',
  },
  {
    id: 'item-1959-29',
    title: 'Glassy Insight 29',
    description: 'designed while every and forever beautiful private on and alive or press or every. that pixel alive in A remaining with pixel browsing haptics and curated considered while feel fluid experience fluid. fast in every while modes private considered designed that tap and considered',
    icon: 'globe',
    gradient: 'fire',
    tone: 'primary',
    meta: '12 mins ago',
    stat1: 371,
    stat2: 50,
    stat3: '0.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-1959-30',
    title: 'Premium Tapestry 30',
    description: 'while every and forever beautiful private on and alive or press or every that. alive in A remaining with pixel browsing haptics and curated considered while feel fluid experience fluid A long. while modes private considered designed that tap and considered on modes every',
    icon: 'eye',
    gradient: 'brand',
    tone: 'info',
    meta: '13 mins ago',
    stat1: 384,
    stat2: 57,
    stat3: '2.2',
    verb: 'Searched',
  },
  {
    id: 'item-1959-31',
    title: 'Subtle Loom 31',
    description: 'every and forever beautiful private on and alive or press or every that feel. A remaining with pixel browsing haptics and curated considered while feel fluid experience fluid A long press fluid. considered designed that tap and considered on modes every fluid designed light',
    icon: 'pizza',
    gradient: 'pastel',
    tone: 'warning',
    meta: '14 mins ago',
    stat1: 397,
    stat2: 64,
    stat3: '4.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1959-32',
    title: 'Punchy Lens 32',
    description: 'and forever beautiful private on and alive or press or every that feel alive. with pixel browsing haptics and curated considered while feel fluid experience fluid A long press fluid modes remaining. tap and considered on modes every fluid designed light and that for',
    icon: 'paw',
    gradient: 'ocean',
    tone: 'success',
    meta: '15 mins ago',
    stat1: 410,
    stat2: 71,
    stat3: '1.0',
    verb: 'Bookmarked',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-33303-1',
    title: 'Buttery Insight',
    subtitle: 'modes pixel that across private remaining while browsing experience A for beautiful dark and. beautiful in every forever every forever fluid for or pixel beautiful every tap experience fluid modes in for. for forever tap every in and experience pixel and every feel fluid',
    icon: 'gift',
    gradient: 'ocean',
  },
  {
    id: 'section-33303-2',
    title: 'Polished Tapestry',
    subtitle: 'beautiful dark and private every curated tap feel tap A A haptics gestures gestures. curated fluid light and experience and light remaining on fluid forever remaining pixel modes fluid that browsing light. remaining and in and on A in private feel tap dark curated',
    icon: 'compass',
    gradient: 'brand',
  },
  {
    id: 'section-33303-3',
    title: 'Silky Beacon',
    subtitle: 'haptics gestures gestures every long haptics and gestures feel that dark and with every. with fast in curated pixel every modes every that press fluid fast with long or press and haptics. modes on light every A considered alive remaining in every curated feel',
    icon: 'flag',
    gradient: 'brand',
  },
  {
    id: 'section-33303-4',
    title: 'Cosmic Pulse',
    subtitle: 'and with every gestures designed fluid or on tap fast and and haptics A. for that while alive forever A haptics in feel fluid feel light while beautiful and and A and. fast modes tap gestures every A forever considered and pixel gestures beautiful',
    icon: 'cloud',
    gradient: 'fire',
  },
  {
    id: 'section-33303-5',
    title: 'Brisk Atlas',
    subtitle: 'and haptics A light fluid considered remaining every press gestures designed A in dark. light designed fluid with remaining remaining curated on that light tap that modes while alive considered every light. or pixel across feel fast designed while light feel browsing beautiful fluid',
    icon: 'planet',
    gradient: 'fire',
  },
  {
    id: 'section-33303-6',
    title: 'Buttery Pulse',
    subtitle: 'A in dark dark remaining and private on experience beautiful alive modes and remaining. alive A fast beautiful while A experience pixel on every every light feel designed light considered haptics A. that private fast long press A or while forever forever every browsing',
    icon: 'flag',
    gradient: 'cosmic',
  },
  {
    id: 'section-33303-7',
    title: 'Polished Halo',
    subtitle: 'modes and remaining forever and experience feel beautiful long beautiful beautiful experience considered experience. in modes modes beautiful modes on long pixel every across that fast every alive beautiful while long in. for while curated and A for and haptics browsing experience remaining and',
    icon: 'bookmark',
    gradient: 'brand',
  },
  {
    id: 'section-33303-8',
    title: 'Frosted Insight',
    subtitle: 'experience considered experience remaining gestures remaining forever or every A and alive designed designed. dark experience fluid that beautiful fast and while long for designed long gestures that light on with A. curated across beautiful with in while considered dark tap while remaining curated',
    icon: 'extension-puzzle',
    gradient: 'brand',
  },
  {
    id: 'section-33303-9',
    title: 'Lush Aurora',
    subtitle: 'alive designed designed and A browsing and experience on in remaining forever A and. A fluid for or every pixel tap and press press and remaining in experience that for and across. designed haptics that dark gestures every press browsing A haptics every with',
    icon: 'star',
    gradient: 'brand',
  },
  {
    id: 'section-33303-10',
    title: 'Vibrant Tapestry',
    subtitle: 'forever A and feel designed on tap while tap considered on gestures pixel alive. and feel forever alive fluid light A and fast gestures remaining considered that long for pixel light for. remaining pixel with in alive forever feel and fast forever on or',
    icon: 'film',
    gradient: 'aurora',
  },
  {
    id: 'section-33303-11',
    title: 'Frosted Lens',
    subtitle: 'gestures pixel alive remaining fluid fluid feel tap experience on dark across considered feel. in or private pixel and across curated tap fast designed gestures experience modes pixel browsing alive light forever. light that on while fast across every and on modes press and',
    icon: 'image',
    gradient: 'ocean',
  },
  {
    id: 'section-33303-12',
    title: 'Silky Drift',
    subtitle: 'across considered feel A designed gestures for and haptics considered in or for while. or and fluid forever light fast every fast and gestures and tap private across while modes every and. tap while press across or pixel considered haptics across pixel fluid forever',
    icon: 'lock-closed',
    gradient: 'ocean',
  },
  {
    id: 'section-33303-13',
    title: 'Velvet Beacon',
    subtitle: 'or for while fluid curated and remaining modes private and long press every or. fluid across tap in fluid alive that feel beautiful while for forever on in browsing every tap designed. considered haptics with press private curated every across browsing that remaining haptics',
    icon: 'bookmark',
    gradient: 'ocean',
  },
  {
    id: 'section-33303-14',
    title: 'Glassy Atlas',
    subtitle: 'press every or considered alive dark light light pixel designed designed gestures light while. considered A beautiful haptics fast modes remaining fast fast with feel while gestures tap for dark experience that. alive and haptics modes forever every while with while long fast in',
    icon: 'bookmark',
    gradient: 'sunset',
  },
];

const HERO_TITLE = 'Downloads';
const HERO_SUBTITLE = 'All files saved on this device.';
const FOOTER_TITLE = 'Keep going with Downloads';
const FOOTER_BODY = 'remaining and in in pixel every tap that fast on every browsing long feel. or browsing tap modes long alive considered considered browsing designed pixel long A pixel while pixel feel dark. fast feel dark private considered experience fluid fluid and for tap gestures';

export const DownloadsListScreen: React.FC = () => {
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
      variant="amber"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Downloads"
        subtitle="All files saved on this device."
        showBack={false}
        rightIcon="download"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="amber"
        badge="Home"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>92%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '92%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>45%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '45%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>88%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '88%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>41%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '41%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>84%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '84%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>37%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '37%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>80%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '80%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>33%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '33%' }]}
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
