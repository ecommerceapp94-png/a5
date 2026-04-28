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
    id: 'item-2972-1',
    title: 'Lush Drift 1',
    description: 'gestures and and A remaining considered haptics alive press across designed tap beautiful across. and private press experience on browsing A experience tap haptics modes tap considered alive light or across fast. across haptics gestures beautiful gestures fast across every pixel forever curated dark',
    icon: 'speedometer',
    gradient: 'neon',
    tone: 'warning',
    meta: '7 mins ago',
    stat1: 436,
    stat2: 15,
    stat3: '1.8',
    verb: 'Highlighted',
  },
  {
    id: 'item-2972-2',
    title: 'Dreamy Lens 2',
    description: 'and and A remaining considered haptics alive press across designed tap beautiful across and. press experience on browsing A experience tap haptics modes tap considered alive light or across fast in every. beautiful gestures fast across every pixel forever curated dark considered and long',
    icon: 'rocket',
    gradient: 'ocean',
    tone: 'info',
    meta: '8 mins ago',
    stat1: 449,
    stat2: 22,
    stat3: '3.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2972-3',
    title: 'Glassy Pulse 3',
    description: 'and A remaining considered haptics alive press across designed tap beautiful across and while. on browsing A experience tap haptics modes tap considered alive light or across fast in every while modes. across every pixel forever curated dark considered and long fast press that',
    icon: 'heart',
    gradient: 'pastel',
    tone: 'success',
    meta: '9 mins ago',
    stat1: 462,
    stat2: 29,
    stat3: '0.6',
    verb: 'Read',
  },
  {
    id: 'item-2972-4',
    title: 'Elite Saga 4',
    description: 'A remaining considered haptics alive press across designed tap beautiful across and while or. A experience tap haptics modes tap considered alive light or across fast in every while modes private considered. forever curated dark considered and long fast press that curated and A',
    icon: 'cloud',
    gradient: 'sunset',
    tone: 'success',
    meta: '10 mins ago',
    stat1: 475,
    stat2: 36,
    stat3: '2.5',
    verb: 'Translated',
  },
  {
    id: 'item-2972-5',
    title: 'Frosted Halo 5',
    description: 'remaining considered haptics alive press across designed tap beautiful across and while or designed. tap haptics modes tap considered alive light or across fast in every while modes private considered designed that. considered and long fast press that curated and A beautiful every long',
    icon: 'school',
    gradient: 'amber',
    tone: 'primary',
    meta: '11 mins ago',
    stat1: 488,
    stat2: 43,
    stat3: '4.4',
    verb: 'Visited',
  },
  {
    id: 'item-2972-6',
    title: 'Buttery Quest 6',
    description: 'considered haptics alive press across designed tap beautiful across and while or designed A. modes tap considered alive light or across fast in every while modes private considered designed that tap and. fast press that curated and A beautiful every long and tap and',
    icon: 'school',
    gradient: 'midnight',
    tone: 'danger',
    meta: '12 mins ago',
    stat1: 501,
    stat2: 50,
    stat3: '1.3',
    verb: 'Saved',
  },
  {
    id: 'item-2972-7',
    title: 'Polished Loom 7',
    description: 'haptics alive press across designed tap beautiful across and while or designed A across. considered alive light or across fast in every while modes private considered designed that tap and considered on. curated and A beautiful every long and tap and with beautiful gestures',
    icon: 'pulse',
    gradient: 'aurora',
    tone: 'info',
    meta: '13 mins ago',
    stat1: 514,
    stat2: 57,
    stat3: '3.2',
    verb: 'Opened',
  },
  {
    id: 'item-2972-8',
    title: 'Punchy Codex 8',
    description: 'alive press across designed tap beautiful across and while or designed A across forever. light or across fast in every while modes private considered designed that tap and considered on modes every. beautiful every long and tap and with beautiful gestures considered every private',
    icon: 'school',
    gradient: 'forest',
    tone: 'primary',
    meta: '14 mins ago',
    stat1: 527,
    stat2: 64,
    stat3: '0.1',
    verb: 'Translated',
  },
  {
    id: 'item-2972-9',
    title: 'Cosmic Loom 9',
    description: 'press across designed tap beautiful across and while or designed A across forever curated. across fast in every while modes private considered designed that tap and considered on modes every fluid designed. and tap and with beautiful gestures considered every private while on or',
    icon: 'globe',
    gradient: 'brand',
    tone: 'primary',
    meta: '15 mins ago',
    stat1: 540,
    stat2: 71,
    stat3: '2.0',
    verb: 'Archived',
  },
  {
    id: 'item-2972-10',
    title: 'Punchy Drift 10',
    description: 'across designed tap beautiful across and while or designed A across forever curated considered. in every while modes private considered designed that tap and considered on modes every fluid designed light and. with beautiful gestures considered every private while on or pixel gestures with',
    icon: 'heart',
    gradient: 'midnight',
    tone: 'danger',
    meta: '16 mins ago',
    stat1: 553,
    stat2: 78,
    stat3: '3.9',
    verb: 'Pinned',
  },
  {
    id: 'item-2972-11',
    title: 'Dreamy Drift 11',
    description: 'designed tap beautiful across and while or designed A across forever curated considered modes. while modes private considered designed that tap and considered on modes every fluid designed light and that for. considered every private while on or pixel gestures with that private and',
    icon: 'extension-puzzle',
    gradient: 'neon',
    tone: 'warning',
    meta: '17 mins ago',
    stat1: 566,
    stat2: 85,
    stat3: '0.8',
    verb: 'Shared',
  },
  {
    id: 'item-2972-12',
    title: 'Dreamy Halo 12',
    description: 'tap beautiful across and while or designed A across forever curated considered modes light. private considered designed that tap and considered on modes every fluid designed light and that for forever private. while on or pixel gestures with that private and and browsing remaining',
    icon: 'sparkles',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '18 mins ago',
    stat1: 579,
    stat2: 92,
    stat3: '2.7',
    verb: 'Visited',
  },
  {
    id: 'item-2972-13',
    title: 'Buttery Forge 13',
    description: 'beautiful across and while or designed A across forever curated considered modes light curated. designed that tap and considered on modes every fluid designed light and that for forever private and modes. pixel gestures with that private and and browsing remaining fast feel gestures',
    icon: 'flag',
    gradient: 'candy',
    tone: 'danger',
    meta: '19 mins ago',
    stat1: 592,
    stat2: 99,
    stat3: '4.6',
    verb: 'Opened',
  },
  {
    id: 'item-2972-14',
    title: 'Silky Drift 14',
    description: 'across and while or designed A across forever curated considered modes light curated haptics. tap and considered on modes every fluid designed light and that for forever private and modes every that. that private and and browsing remaining fast feel gestures long light that',
    icon: 'cafe',
    gradient: 'aurora',
    tone: 'primary',
    meta: '20 mins ago',
    stat1: 605,
    stat2: 7,
    stat3: '1.5',
    verb: 'Translated',
  },
  {
    id: 'item-2972-15',
    title: 'Dreamy Pulse 15',
    description: 'and while or designed A across forever curated considered modes light curated haptics or. considered on modes every fluid designed light and that for forever private and modes every that and pixel. and browsing remaining fast feel gestures long light that dark long and',
    icon: 'pizza',
    gradient: 'brand',
    tone: 'primary',
    meta: '21 mins ago',
    stat1: 618,
    stat2: 14,
    stat3: '3.4',
    verb: 'Followed',
  },
  {
    id: 'item-2972-16',
    title: 'Elite Compass 16',
    description: 'while or designed A across forever curated considered modes light curated haptics or remaining. modes every fluid designed light and that for forever private and modes every that and pixel considered or. fast feel gestures long light that dark long and every for that',
    icon: 'cart',
    gradient: 'midnight',
    tone: 'accent',
    meta: '22 mins ago',
    stat1: 631,
    stat2: 21,
    stat3: '0.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2972-17',
    title: 'Snappy Lens 17',
    description: 'or designed A across forever curated considered modes light curated haptics or remaining for. fluid designed light and that for forever private and modes every that and pixel considered or every and. long light that dark long and every for that every and fast',
    icon: 'layers',
    gradient: 'fire',
    tone: 'success',
    meta: '23 mins ago',
    stat1: 644,
    stat2: 28,
    stat3: '2.2',
    verb: 'Searched',
  },
  {
    id: 'item-2972-18',
    title: 'Glassy Codex 18',
    description: 'designed A across forever curated considered modes light curated haptics or remaining for pixel. light and that for forever private and modes every that and pixel considered or every and fluid experience. dark long and every for that every and fast modes gestures light',
    icon: 'bookmark',
    gradient: 'sunset',
    tone: 'warning',
    meta: '24 mins ago',
    stat1: 657,
    stat2: 35,
    stat3: '4.1',
    verb: 'Highlighted',
  },
  {
    id: 'item-2972-19',
    title: 'Cosmic Aurora 19',
    description: 'A across forever curated considered modes light curated haptics or remaining for pixel alive. that for forever private and modes every that and pixel considered or every and fluid experience haptics light. every for that every and fast modes gestures light in feel A',
    icon: 'book',
    gradient: 'ocean',
    tone: 'info',
    meta: '25 mins ago',
    stat1: 670,
    stat2: 42,
    stat3: '1.0',
    verb: 'Read',
  },
  {
    id: 'item-2972-20',
    title: 'Sleek Echo 20',
    description: 'across forever curated considered modes light curated haptics or remaining for pixel alive haptics. forever private and modes every that and pixel considered or every and fluid experience haptics light forever private. every and fast modes gestures light in feel A every across gestures',
    icon: 'rocket',
    gradient: 'pastel',
    tone: 'success',
    meta: '26 mins ago',
    stat1: 683,
    stat2: 49,
    stat3: '2.9',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2972-21',
    title: 'Brisk Stream 21',
    description: 'forever curated considered modes light curated haptics or remaining for pixel alive haptics fluid. and modes every that and pixel considered or every and fluid experience haptics light forever private for pixel. modes gestures light in feel A every across gestures light pixel press',
    icon: 'bookmark',
    gradient: 'amber',
    tone: 'success',
    meta: '27 mins ago',
    stat1: 696,
    stat2: 56,
    stat3: '4.8',
    verb: 'Highlighted',
  },
  {
    id: 'item-2972-22',
    title: 'Crisp Studio 22',
    description: 'curated considered modes light curated haptics or remaining for pixel alive haptics fluid and. every that and pixel considered or every and fluid experience haptics light forever private for pixel long press. in feel A every across gestures light pixel press fast A haptics',
    icon: 'globe',
    gradient: 'sunset',
    tone: 'info',
    meta: '28 mins ago',
    stat1: 709,
    stat2: 63,
    stat3: '1.7',
    verb: 'Shared',
  },
  {
    id: 'item-2972-23',
    title: 'Vibrant Loom 23',
    description: 'considered modes light curated haptics or remaining for pixel alive haptics fluid and fast. and pixel considered or every and fluid experience haptics light forever private for pixel long press that press. every across gestures light pixel press fast A haptics private every or',
    icon: 'eye',
    gradient: 'pastel',
    tone: 'accent',
    meta: '29 mins ago',
    stat1: 722,
    stat2: 70,
    stat3: '3.6',
    verb: 'Archived',
  },
  {
    id: 'item-2972-24',
    title: 'Punchy Forge 24',
    description: 'modes light curated haptics or remaining for pixel alive haptics fluid and fast every. considered or every and fluid experience haptics light forever private for pixel long press that press fast light. light pixel press fast A haptics private every or feel fluid light',
    icon: 'newspaper',
    gradient: 'candy',
    tone: 'danger',
    meta: '30 mins ago',
    stat1: 735,
    stat2: 77,
    stat3: '0.5',
    verb: 'Saved',
  },
  {
    id: 'item-2972-25',
    title: 'Silky Studio 25',
    description: 'light curated haptics or remaining for pixel alive haptics fluid and fast every and. every and fluid experience haptics light forever private for pixel long press that press fast light fluid modes. fast A haptics private every or feel fluid light A beautiful and',
    icon: 'heart',
    gradient: 'neon',
    tone: 'info',
    meta: '31 mins ago',
    stat1: 748,
    stat2: 84,
    stat3: '2.4',
    verb: 'Shared',
  },
  {
    id: 'item-2972-26',
    title: 'Vibrant Echo 26',
    description: 'curated haptics or remaining for pixel alive haptics fluid and fast every and every. fluid experience haptics light forever private for pixel long press that press fast light fluid modes while A. private every or feel fluid light A beautiful and considered with alive',
    icon: 'planet',
    gradient: 'forest',
    tone: 'accent',
    meta: '32 mins ago',
    stat1: 761,
    stat2: 91,
    stat3: '4.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2972-27',
    title: 'Brisk Forge 27',
    description: 'haptics or remaining for pixel alive haptics fluid and fast every and every modes. haptics light forever private for pixel long press that press fast light fluid modes while A while fast. feel fluid light A beautiful and considered with alive feel every modes',
    icon: 'school',
    gradient: 'candy',
    tone: 'success',
    meta: '33 mins ago',
    stat1: 774,
    stat2: 98,
    stat3: '1.2',
    verb: 'Highlighted',
  },
  {
    id: 'item-2972-28',
    title: 'Silky Insight 28',
    description: 'or remaining for pixel alive haptics fluid and fast every and every modes gestures. forever private for pixel long press that press fast light fluid modes while A while fast gestures every. A beautiful and considered with alive feel every modes haptics or that',
    icon: 'leaf',
    gradient: 'sunset',
    tone: 'info',
    meta: '34 mins ago',
    stat1: 787,
    stat2: 6,
    stat3: '3.1',
    verb: 'Shared',
  },
  {
    id: 'item-2972-29',
    title: 'Premium Pulse 29',
    description: 'remaining for pixel alive haptics fluid and fast every and every modes gestures every. for pixel long press that press fast light fluid modes while A while fast gestures every browsing browsing. considered with alive feel every modes haptics or that feel light haptics',
    icon: 'flame',
    gradient: 'pastel',
    tone: 'accent',
    meta: '35 mins ago',
    stat1: 800,
    stat2: 13,
    stat3: '0.0',
    verb: 'Pinned',
  },
  {
    id: 'item-2972-30',
    title: 'Elite Atlas 30',
    description: 'for pixel alive haptics fluid and fast every and every modes gestures every with. long press that press fast light fluid modes while A while fast gestures every browsing browsing remaining and. feel every modes haptics or that feel light haptics modes on remaining',
    icon: 'eye',
    gradient: 'candy',
    tone: 'warning',
    meta: '36 mins ago',
    stat1: 813,
    stat2: 20,
    stat3: '1.9',
    verb: 'Followed',
  },
  {
    id: 'item-2972-31',
    title: 'Lush Codex 31',
    description: 'pixel alive haptics fluid and fast every and every modes gestures every with in. that press fast light fluid modes while A while fast gestures every browsing browsing remaining and alive dark. haptics or that feel light haptics modes on remaining in private while',
    icon: 'rocket',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '37 mins ago',
    stat1: 826,
    stat2: 27,
    stat3: '3.8',
    verb: 'Saved',
  },
  {
    id: 'item-2972-32',
    title: 'Cosmic Pulse 32',
    description: 'alive haptics fluid and fast every and every modes gestures every with in A. fast light fluid modes while A while fast gestures every browsing browsing remaining and alive dark alive across. feel light haptics modes on remaining in private while remaining gestures tap',
    icon: 'bookmark',
    gradient: 'fire',
    tone: 'info',
    meta: '38 mins ago',
    stat1: 839,
    stat2: 34,
    stat3: '0.7',
    verb: 'Pinned',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-50524-1',
    title: 'Dreamy Insight',
    subtitle: 'pixel modes remaining in tap while light and and considered and and while fast. dark curated press press fluid on designed long across beautiful and pixel dark A and with curated dark. and curated every private across pixel long tap curated fast dark every',
    icon: 'sparkles',
    gradient: 'fire',
  },
  {
    id: 'section-50524-2',
    title: 'Glassy Mosaic',
    subtitle: 'and while fast gestures for A forever considered designed with and in pixel and. haptics and browsing in every fluid dark dark tap across private beautiful with feel pixel and that browsing. pixel pixel tap browsing designed designed press long tap while that every',
    icon: 'eye',
    gradient: 'ocean',
  },
  {
    id: 'section-50524-3',
    title: 'Subtle Compass',
    subtitle: 'in pixel and every every forever modes alive beautiful A or and on considered. every while curated forever across pixel that every curated on long feel or private and tap fast with. long and fast designed that every with considered fast curated remaining press',
    icon: 'analytics',
    gradient: 'amber',
  },
  {
    id: 'section-50524-4',
    title: 'Soft Halo',
    subtitle: 'and on considered fluid A pixel designed pixel on on that tap press gestures. and light forever designed long while every forever or gestures designed light and and or in browsing fluid. pixel for fluid curated A A every considered tap curated while while',
    icon: 'musical-notes',
    gradient: 'brand',
  },
  {
    id: 'section-50524-5',
    title: 'Lush Aurora',
    subtitle: 'tap press gestures modes fluid remaining across and curated that on dark and light. light haptics for and haptics and fluid remaining light long browsing gestures that fast while dark considered light. dark fluid press modes and light tap dark pixel that A forever',
    icon: 'eye',
    gradient: 'ocean',
  },
  {
    id: 'section-50524-6',
    title: 'Elite Stream',
    subtitle: 'dark and light light with private in and long considered and curated haptics tap. designed fast on beautiful haptics curated private long designed for and tap and alive every light tap long. light designed and across and beautiful considered alive modes curated with with',
    icon: 'gift',
    gradient: 'fire',
  },
  {
    id: 'section-50524-7',
    title: 'Crisp Mosaic',
    subtitle: 'curated haptics tap and long or beautiful modes and press long curated haptics for. experience experience and or on every in pixel that with designed or while modes fluid considered browsing dark. for for considered feel for press for feel browsing press beautiful browsing',
    icon: 'planet',
    gradient: 'ocean',
  },
  {
    id: 'section-50524-8',
    title: 'Brisk Drift',
    subtitle: 'curated haptics for long private feel modes gestures while on and alive modes and. fast tap press that considered fast beautiful alive every fast dark every on and beautiful alive A gestures. remaining and with modes tap with across with and gestures considered and',
    icon: 'compass',
    gradient: 'amber',
  },
  {
    id: 'section-50524-9',
    title: 'Velvet Codex',
    subtitle: 'alive modes and tap fast while that on feel in modes dark that tap. and light every experience for or haptics that or remaining with browsing feel alive experience forever pixel feel. alive in in fluid feel every and long fluid every pixel considered',
    icon: 'trophy',
    gradient: 'ocean',
  },
  {
    id: 'section-50524-10',
    title: 'Velvet Compass',
    subtitle: 'dark that tap modes that designed in remaining every haptics every private beautiful every. and gestures tap in and every and press tap modes experience across long with with on and that. on fast with modes long A on light tap forever and feel',
    icon: 'paw',
    gradient: 'aurora',
  },
  {
    id: 'section-50524-11',
    title: 'Deep Compass',
    subtitle: 'private beautiful every every tap light light every with across private beautiful or modes. with fast every that feel alive light experience on across alive that pixel pixel and pixel press designed. fast tap that remaining fluid forever every considered feel experience modes forever',
    icon: 'paw',
    gradient: 'pastel',
  },
  {
    id: 'section-50524-12',
    title: 'Snappy Spark',
    subtitle: 'beautiful or modes feel browsing in designed every gestures long considered fast feel light. browsing forever haptics pixel browsing tap and across gestures with with and on designed experience designed on considered. light and on gestures considered with gestures fluid light dark and designed',
    icon: 'shield',
    gradient: 'midnight',
  },
  {
    id: 'section-50524-13',
    title: 'Punchy Compass',
    subtitle: 'fast feel light haptics curated feel gestures light remaining modes fast for fast long. pixel that designed for A while and dark designed for tap and fluid fluid in alive browsing fluid. gestures every and private dark across in while browsing with feel remaining',
    icon: 'shield',
    gradient: 'midnight',
  },
  {
    id: 'section-50524-14',
    title: 'Dreamy Tapestry',
    subtitle: 'for fast long private that tap designed private light A in while designed in. and while designed feel curated pixel every gestures light press gestures curated browsing pixel gestures while modes or. on with A alive A with feel fast remaining or while gestures',
    icon: 'pizza',
    gradient: 'pastel',
  },
];

const HERO_TITLE = 'Category';
const HERO_SUBTITLE = 'All downloads for one category.';
const FOOTER_TITLE = 'Keep going with Category';
const FOOTER_BODY = 'across haptics gestures beautiful gestures fast across every pixel forever curated dark considered and. press every and gestures beautiful every for fluid tap tap experience light forever curated haptics and remaining experience. pixel considered considered and curated haptics light and every haptics forever across';

export const DownloadsCategoryDetailScreen: React.FC = () => {
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
      variant="ocean"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Category"
        subtitle="All downloads for one category."
        showBack={true}
        rightIcon="apps"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="ocean"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Halo</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>74%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '74%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Stream</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>23%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '23%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>66%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '66%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>19%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '19%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>62%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '62%' }]}
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
