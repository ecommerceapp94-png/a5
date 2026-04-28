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
    id: 'item-1979-1',
    title: 'Crisp Lens 1',
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
    id: 'item-1979-2',
    title: 'Glassy Compass 2',
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
    id: 'item-1979-3',
    title: 'Snappy Lens 3',
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
    id: 'item-1979-4',
    title: 'Glassy Saga 4',
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
    id: 'item-1979-5',
    title: 'Frosted Codex 5',
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
    id: 'item-1979-6',
    title: 'Cosmic Spark 6',
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
    id: 'item-1979-7',
    title: 'Soft Mosaic 7',
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
    id: 'item-1979-8',
    title: 'Deep Lens 8',
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
    id: 'item-1979-9',
    title: 'Glassy Insight 9',
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
    id: 'item-1979-10',
    title: 'Premium Tapestry 10',
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
    id: 'item-1979-11',
    title: 'Subtle Loom 11',
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
    id: 'item-1979-12',
    title: 'Punchy Lens 12',
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
  {
    id: 'item-1979-13',
    title: 'Glassy Saga 13',
    description: 'forever beautiful private on and alive or press or every that feel alive and. browsing haptics and curated considered while feel fluid experience fluid A long press fluid modes remaining gestures private. on modes every fluid designed light and that for forever private and',
    icon: 'rocket',
    gradient: 'sunset',
    tone: 'success',
    meta: '16 mins ago',
    stat1: 423,
    stat2: 78,
    stat3: '2.9',
    verb: 'Shared',
  },
  {
    id: 'item-1979-14',
    title: 'Frosted Stream 14',
    description: 'beautiful private on and alive or press or every that feel alive and browsing. and curated considered while feel fluid experience fluid A long press fluid modes remaining gestures private gestures gestures. fluid designed light and that for forever private and modes every that',
    icon: 'bookmark',
    gradient: 'sunset',
    tone: 'accent',
    meta: '17 mins ago',
    stat1: 436,
    stat2: 85,
    stat3: '4.8',
    verb: 'Read',
  },
  {
    id: 'item-1979-15',
    title: 'Crisp Forge 15',
    description: 'private on and alive or press or every that feel alive and browsing long. considered while feel fluid experience fluid A long press fluid modes remaining gestures private gestures gestures fluid pixel. and that for forever private and modes every that and pixel considered',
    icon: 'heart',
    gradient: 'candy',
    tone: 'success',
    meta: '18 mins ago',
    stat1: 449,
    stat2: 92,
    stat3: '1.7',
    verb: 'Shared',
  },
  {
    id: 'item-1979-16',
    title: 'Silky Forge 16',
    description: 'on and alive or press or every that feel alive and browsing long private. feel fluid experience fluid A long press fluid modes remaining gestures private gestures gestures fluid pixel alive in. forever private and modes every that and pixel considered or every and',
    icon: 'star',
    gradient: 'amber',
    tone: 'accent',
    meta: '19 mins ago',
    stat1: 462,
    stat2: 99,
    stat3: '3.6',
    verb: 'Visited',
  },
  {
    id: 'item-1979-17',
    title: 'Silky Echo 17',
    description: 'and alive or press or every that feel alive and browsing long private long. experience fluid A long press fluid modes remaining gestures private gestures gestures fluid pixel alive in long curated. modes every that and pixel considered or every and fluid experience haptics',
    icon: 'analytics',
    gradient: 'candy',
    tone: 'danger',
    meta: '20 mins ago',
    stat1: 475,
    stat2: 7,
    stat3: '0.5',
    verb: 'Followed',
  },
  {
    id: 'item-1979-18',
    title: 'Brisk Compass 18',
    description: 'alive or press or every that feel alive and browsing long private long fluid. A long press fluid modes remaining gestures private gestures gestures fluid pixel alive in long curated experience beautiful. and pixel considered or every and fluid experience haptics light forever private',
    icon: 'flame',
    gradient: 'aurora',
    tone: 'accent',
    meta: '21 mins ago',
    stat1: 488,
    stat2: 14,
    stat3: '2.4',
    verb: 'Opened',
  },
  {
    id: 'item-1979-19',
    title: 'Snappy Forge 19',
    description: 'or press or every that feel alive and browsing long private long fluid A. press fluid modes remaining gestures private gestures gestures fluid pixel alive in long curated experience beautiful press experience. or every and fluid experience haptics light forever private for pixel long',
    icon: 'heart',
    gradient: 'fire',
    tone: 'primary',
    meta: '22 mins ago',
    stat1: 501,
    stat2: 21,
    stat3: '4.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1979-20',
    title: 'Silky Spark 20',
    description: 'press or every that feel alive and browsing long private long fluid A tap. modes remaining gestures private gestures gestures fluid pixel alive in long curated experience beautiful press experience and every. fluid experience haptics light forever private for pixel long press that press',
    icon: 'heart',
    gradient: 'brand',
    tone: 'success',
    meta: '23 mins ago',
    stat1: 514,
    stat2: 28,
    stat3: '1.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1979-21',
    title: 'Soft Mosaic 21',
    description: 'or every that feel alive and browsing long private long fluid A tap on. gestures private gestures gestures fluid pixel alive in long curated experience beautiful press experience and every A fluid. light forever private for pixel long press that press fast light fluid',
    icon: 'pricetag',
    gradient: 'sunset',
    tone: 'success',
    meta: '24 mins ago',
    stat1: 527,
    stat2: 35,
    stat3: '3.1',
    verb: 'Translated',
  },
  {
    id: 'item-1979-22',
    title: 'Deep Beacon 22',
    description: 'every that feel alive and browsing long private long fluid A tap on private. gestures gestures fluid pixel alive in long curated experience beautiful press experience and every A fluid modes and. for pixel long press that press fast light fluid modes while A',
    icon: 'heart',
    gradient: 'sunset',
    tone: 'primary',
    meta: '25 mins ago',
    stat1: 540,
    stat2: 42,
    stat3: '0.0',
    verb: 'Translated',
  },
  {
    id: 'item-1979-23',
    title: 'Velvet Forge 23',
    description: 'that feel alive and browsing long private long fluid A tap on private across. fluid pixel alive in long curated experience beautiful press experience and every A fluid modes and that considered. press that press fast light fluid modes while A while fast gestures',
    icon: 'flame',
    gradient: 'midnight',
    tone: 'primary',
    meta: '26 mins ago',
    stat1: 553,
    stat2: 49,
    stat3: '1.9',
    verb: 'Highlighted',
  },
  {
    id: 'item-1979-24',
    title: 'Silky Pulse 24',
    description: 'feel alive and browsing long private long fluid A tap on private across in. alive in long curated experience beautiful press experience and every A fluid modes and that considered for A. fast light fluid modes while A while fast gestures every browsing browsing',
    icon: 'trophy',
    gradient: 'midnight',
    tone: 'info',
    meta: '27 mins ago',
    stat1: 566,
    stat2: 56,
    stat3: '3.8',
    verb: 'Translated',
  },
  {
    id: 'item-1979-25',
    title: 'Elite Stream 25',
    description: 'alive and browsing long private long fluid A tap on private across in dark. long curated experience beautiful press experience and every A fluid modes and that considered for A modes and. modes while A while fast gestures every browsing browsing remaining and alive',
    icon: 'compass',
    gradient: 'pastel',
    tone: 'primary',
    meta: '28 mins ago',
    stat1: 579,
    stat2: 63,
    stat3: '0.7',
    verb: 'Shared',
  },
  {
    id: 'item-1979-26',
    title: 'Crisp Studio 26',
    description: 'and browsing long private long fluid A tap on private across in dark or. experience beautiful press experience and every A fluid modes and that considered for A modes and gestures private. while fast gestures every browsing browsing remaining and alive dark alive across',
    icon: 'flag',
    gradient: 'midnight',
    tone: 'accent',
    meta: '29 mins ago',
    stat1: 592,
    stat2: 70,
    stat3: '2.6',
    verb: 'Opened',
  },
  {
    id: 'item-1979-27',
    title: 'Vibrant Stream 27',
    description: 'browsing long private long fluid A tap on private across in dark or on. press experience and every A fluid modes and that considered for A modes and gestures private tap browsing. every browsing browsing remaining and alive dark alive across remaining every and',
    icon: 'paw',
    gradient: 'candy',
    tone: 'primary',
    meta: '30 mins ago',
    stat1: 605,
    stat2: 77,
    stat3: '4.5',
    verb: 'Saved',
  },
  {
    id: 'item-1979-28',
    title: 'Crisp Studio 28',
    description: 'long private long fluid A tap on private across in dark or on every. and every A fluid modes and that considered for A modes and gestures private tap browsing and pixel. remaining and alive dark alive across remaining every and gestures and gestures',
    icon: 'leaf',
    gradient: 'brand',
    tone: 'info',
    meta: '31 mins ago',
    stat1: 618,
    stat2: 84,
    stat3: '1.4',
    verb: 'Searched',
  },
  {
    id: 'item-1979-29',
    title: 'Vibrant Atlas 29',
    description: 'private long fluid A tap on private across in dark or on every dark. A fluid modes and that considered for A modes and gestures private tap browsing and pixel forever for. dark alive across remaining every and gestures and gestures across A designed',
    icon: 'bookmark',
    gradient: 'forest',
    tone: 'warning',
    meta: '32 mins ago',
    stat1: 631,
    stat2: 91,
    stat3: '3.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-1979-30',
    title: 'Lush Beacon 30',
    description: 'long fluid A tap on private across in dark or on every dark with. modes and that considered for A modes and gestures private tap browsing and pixel forever for beautiful tap. remaining every and gestures and gestures across A designed browsing or and',
    icon: 'eye',
    gradient: 'ocean',
    tone: 'info',
    meta: '33 mins ago',
    stat1: 644,
    stat2: 98,
    stat3: '0.2',
    verb: 'Translated',
  },
  {
    id: 'item-1979-31',
    title: 'Velvet Drift 31',
    description: 'fluid A tap on private across in dark or on every dark with designed. that considered for A modes and gestures private tap browsing and pixel forever for beautiful tap haptics fast. gestures and gestures across A designed browsing or and and alive dark',
    icon: 'star',
    gradient: 'pastel',
    tone: 'primary',
    meta: '34 mins ago',
    stat1: 657,
    stat2: 6,
    stat3: '2.1',
    verb: 'Visited',
  },
  {
    id: 'item-1979-32',
    title: 'Dreamy Codex 32',
    description: 'A tap on private across in dark or on every dark with designed and. for A modes and gestures private tap browsing and pixel forever for beautiful tap haptics fast fluid in. across A designed browsing or and and alive dark remaining considered light',
    icon: 'pricetag',
    gradient: 'midnight',
    tone: 'danger',
    meta: '35 mins ago',
    stat1: 670,
    stat2: 13,
    stat3: '4.0',
    verb: 'Archived',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-33643-1',
    title: 'Vibrant Forge',
    subtitle: 'A considered remaining while fast or long alive browsing curated designed A that that. remaining press haptics pixel and for across long fast browsing dark curated while beautiful fast fluid every across. and pixel modes considered pixel considered alive while curated remaining across fluid',
    icon: 'gift',
    gradient: 'forest',
  },
  {
    id: 'section-33643-2',
    title: 'Polished Studio',
    subtitle: 'A that that forever browsing every with experience alive fast and dark browsing alive. in for designed and in private across browsing that that designed in every long for every gestures modes. modes tap every designed tap for considered across beautiful or for that',
    icon: 'compass',
    gradient: 'sunset',
  },
  {
    id: 'section-33643-3',
    title: 'Snappy Aurora',
    subtitle: 'dark browsing alive modes modes every long modes that browsing modes curated fast while. haptics press browsing every or browsing beautiful private beautiful and browsing curated beautiful gestures pixel and fluid haptics. press and long and press every that dark feel across with and',
    icon: 'paw',
    gradient: 'fire',
  },
  {
    id: 'section-33643-4',
    title: 'Soft Saga',
    subtitle: 'curated fast while in tap and fluid experience browsing and forever A long and. haptics and remaining browsing A and tap modes across browsing curated every tap dark light tap curated beautiful. every private across considered or tap with forever remaining every press light',
    icon: 'gift',
    gradient: 'midnight',
  },
  {
    id: 'section-33643-5',
    title: 'Glassy Forge',
    subtitle: 'A long and and for private haptics private beautiful feel and A remaining gestures. private designed haptics while on feel curated curated considered light pixel for remaining long with every curated and. forever while haptics and browsing in every fluid dark dark tap across',
    icon: 'sparkles',
    gradient: 'neon',
  },
  {
    id: 'section-33643-6',
    title: 'Crisp Studio',
    subtitle: 'A remaining gestures long for and light experience and in dark browsing private while. alive and on press remaining forever press A tap private on modes with experience dark experience A modes. on long feel or private and tap fast with beautiful gestures and',
    icon: 'extension-puzzle',
    gradient: 'brand',
  },
  {
    id: 'section-33643-7',
    title: 'Premium Loom',
    subtitle: 'browsing private while dark and gestures considered and for while designed experience and with. tap and pixel fluid beautiful in pixel in modes press and on browsing or modes tap experience light. considered A light haptics for and haptics and fluid remaining light long',
    icon: 'cloud',
    gradient: 'aurora',
  },
  {
    id: 'section-33643-8',
    title: 'Glassy Saga',
    subtitle: 'experience and with for for press long gestures alive curated private tap fast experience. modes gestures beautiful and while remaining modes alive feel or browsing on while across on or designed and. for and tap and alive every light tap long private press fluid',
    icon: 'film',
    gradient: 'cosmic',
  },
  {
    id: 'section-33643-9',
    title: 'Snappy Halo',
    subtitle: 'tap fast experience tap and fluid and forever every on on designed while while. in designed and A feel while light in or while feel A and experience fluid with browsing browsing. in beautiful fast tap press that considered fast beautiful alive every fast',
    icon: 'sparkles',
    gradient: 'sunset',
  },
  {
    id: 'section-33643-10',
    title: 'Polished Lens',
    subtitle: 'designed while while beautiful remaining and dark tap considered browsing with every or designed. dark and while gestures dark fast private curated while fast haptics with alive and feel press with remaining. remaining with browsing feel alive experience forever pixel feel and for remaining',
    icon: 'speedometer',
    gradient: 'ocean',
  },
  {
    id: 'section-33643-11',
    title: 'Polished Atlas',
    subtitle: 'every or designed every gestures or and fast remaining haptics dark gestures fast gestures. alive remaining fast experience every dark designed experience or pixel fluid experience considered and light press and haptics. pixel across with fast every that feel alive light experience on across',
    icon: 'globe',
    gradient: 'midnight',
  },
  {
    id: 'section-33643-12',
    title: 'Elite Forge',
    subtitle: 'gestures fast gestures designed on tap and across pixel designed remaining gestures browsing every. browsing and gestures feel considered haptics alive forever that forever every long or gestures light designed and for. with with and on designed experience designed on considered A alive modes',
    icon: 'pizza',
    gradient: 'pastel',
  },
  {
    id: 'section-33643-13',
    title: 'Dreamy Echo',
    subtitle: 'gestures browsing every beautiful A for with alive fast curated press that every haptics. with pixel gestures browsing dark dark feel beautiful A browsing that fast every A and haptics that and. light and and while designed feel curated pixel every gestures light press',
    icon: 'extension-puzzle',
    gradient: 'aurora',
  },
  {
    id: 'section-33643-14',
    title: 'Glassy Spark',
    subtitle: 'that every haptics long and and on feel considered and and beautiful beautiful curated. remaining on pixel tap modes and designed gestures and that remaining every considered in for forever and while. while on forever tap gestures remaining every remaining press haptics light and',
    icon: 'flash',
    gradient: 'sunset',
  },
];

const HERO_TITLE = 'Advanced';
const HERO_SUBTITLE = 'Per-page advanced controls and overrides.';
const FOOTER_TITLE = 'Keep going with Advanced';
const FOOTER_BODY = 'private pixel tap designed alive and dark and private press experience on browsing A. that with forever tap in fluid in remaining curated that fluid designed or or across long browsing dark. on remaining curated fast and on for A and tap with fluid';

export const BrowserExtrasScreen: React.FC = () => {
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
      variant="amber"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Advanced"
        subtitle="Per-page advanced controls and overrides."
        showBack={true}
        rightIcon="construct"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="amber"
        badge="L5"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>82%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '82%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>35%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '35%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>78%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '78%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>31%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '31%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>74%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '74%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>70%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '70%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>23%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '23%' }]}
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
