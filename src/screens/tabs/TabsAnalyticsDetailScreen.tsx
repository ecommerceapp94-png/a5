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
    id: 'item-2533-1',
    title: 'Silky Loom 1',
    description: 'fluid alive press across on while every across long forever long beautiful press for. in pixel and haptics private considered and experience experience fluid alive feel feel press and gestures every across. browsing or with modes and long alive long and fast while gestures',
    icon: 'film',
    gradient: 'ocean',
    tone: 'warning',
    meta: '18 mins ago',
    stat1: 609,
    stat2: 11,
    stat3: '2.7',
    verb: 'Saved',
  },
  {
    id: 'item-2533-2',
    title: 'Punchy Codex 2',
    description: 'alive press across on while every across long forever long beautiful press for across. and haptics private considered and experience experience fluid alive feel feel press and gestures every across and and. modes and long alive long and fast while gestures and fluid and',
    icon: 'newspaper',
    gradient: 'cosmic',
    tone: 'info',
    meta: '19 mins ago',
    stat1: 622,
    stat2: 18,
    stat3: '4.6',
    verb: 'Translated',
  },
  {
    id: 'item-2533-3',
    title: 'Cosmic Saga 3',
    description: 'press across on while every across long forever long beautiful press for across while. private considered and experience experience fluid alive feel feel press and gestures every across and and press every. alive long and fast while gestures and fluid and in A across',
    icon: 'flag',
    gradient: 'forest',
    tone: 'primary',
    meta: '20 mins ago',
    stat1: 635,
    stat2: 25,
    stat3: '1.5',
    verb: 'Translated',
  },
  {
    id: 'item-2533-4',
    title: 'Frosted Drift 4',
    description: 'across on while every across long forever long beautiful press for across while remaining. and experience experience fluid alive feel feel press and gestures every across and and press every and dark. fast while gestures and fluid and in A across press browsing experience',
    icon: 'sparkles',
    gradient: 'midnight',
    tone: 'primary',
    meta: '21 mins ago',
    stat1: 648,
    stat2: 32,
    stat3: '3.4',
    verb: 'Followed',
  },
  {
    id: 'item-2533-5',
    title: 'Dreamy Beacon 5',
    description: 'on while every across long forever long beautiful press for across while remaining browsing. experience fluid alive feel feel press and gestures every across and and press every and dark private haptics. and fluid and in A across press browsing experience tap on browsing',
    icon: 'leaf',
    gradient: 'midnight',
    tone: 'accent',
    meta: '22 mins ago',
    stat1: 661,
    stat2: 39,
    stat3: '0.3',
    verb: 'Translated',
  },
  {
    id: 'item-2533-6',
    title: 'Velvet Studio 6',
    description: 'while every across long forever long beautiful press for across while remaining browsing on. alive feel feel press and gestures every across and and press every and dark private haptics forever press. in A across press browsing experience tap on browsing while browsing beautiful',
    icon: 'flame',
    gradient: 'fire',
    tone: 'primary',
    meta: '23 mins ago',
    stat1: 674,
    stat2: 46,
    stat3: '2.2',
    verb: 'Opened',
  },
  {
    id: 'item-2533-7',
    title: 'Vibrant Studio 7',
    description: 'every across long forever long beautiful press for across while remaining browsing on or. feel press and gestures every across and and press every and dark private haptics forever press designed A. press browsing experience tap on browsing while browsing beautiful that remaining curated',
    icon: 'shield',
    gradient: 'midnight',
    tone: 'primary',
    meta: '24 mins ago',
    stat1: 687,
    stat2: 53,
    stat3: '4.1',
    verb: 'Read',
  },
  {
    id: 'item-2533-8',
    title: 'Vibrant Mosaic 8',
    description: 'across long forever long beautiful press for across while remaining browsing on or across. and gestures every across and and press every and dark private haptics forever press designed A or gestures. tap on browsing while browsing beautiful that remaining curated forever with and',
    icon: 'flame',
    gradient: 'brand',
    tone: 'success',
    meta: '25 mins ago',
    stat1: 700,
    stat2: 60,
    stat3: '1.0',
    verb: 'Saved',
  },
  {
    id: 'item-2533-9',
    title: 'Deep Halo 9',
    description: 'long forever long beautiful press for across while remaining browsing on or across fast. every across and and press every and dark private haptics forever press designed A or gestures and every. while browsing beautiful that remaining curated forever with and modes beautiful forever',
    icon: 'musical-notes',
    gradient: 'amber',
    tone: 'info',
    meta: '26 mins ago',
    stat1: 713,
    stat2: 67,
    stat3: '2.9',
    verb: 'Translated',
  },
  {
    id: 'item-2533-10',
    title: 'Buttery Tapestry 10',
    description: 'forever long beautiful press for across while remaining browsing on or across fast and. and and press every and dark private haptics forever press designed A or gestures and every remaining and. that remaining curated forever with and modes beautiful forever in alive across',
    icon: 'film',
    gradient: 'forest',
    tone: 'primary',
    meta: '27 mins ago',
    stat1: 726,
    stat2: 74,
    stat3: '4.8',
    verb: 'Pinned',
  },
  {
    id: 'item-2533-11',
    title: 'Subtle Loom 11',
    description: 'long beautiful press for across while remaining browsing on or across fast and on. press every and dark private haptics forever press designed A or gestures and every remaining and and considered. forever with and modes beautiful forever in alive across forever remaining and',
    icon: 'musical-notes',
    gradient: 'midnight',
    tone: 'warning',
    meta: '28 mins ago',
    stat1: 739,
    stat2: 81,
    stat3: '1.7',
    verb: 'Archived',
  },
  {
    id: 'item-2533-12',
    title: 'Punchy Drift 12',
    description: 'beautiful press for across while remaining browsing on or across fast and on A. and dark private haptics forever press designed A or gestures and every remaining and and considered while A. modes beautiful forever in alive across forever remaining and dark light long',
    icon: 'compass',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '29 mins ago',
    stat1: 752,
    stat2: 88,
    stat3: '3.6',
    verb: 'Translated',
  },
  {
    id: 'item-2533-13',
    title: 'Dreamy Halo 13',
    description: 'press for across while remaining browsing on or across fast and on A press. private haptics forever press designed A or gestures and every remaining and and considered while A beautiful experience. in alive across forever remaining and dark light long dark across for',
    icon: 'musical-notes',
    gradient: 'neon',
    tone: 'primary',
    meta: '30 mins ago',
    stat1: 765,
    stat2: 95,
    stat3: '0.5',
    verb: 'Searched',
  },
  {
    id: 'item-2533-14',
    title: 'Buttery Beacon 14',
    description: 'for across while remaining browsing on or across fast and on A press browsing. forever press designed A or gestures and every remaining and and considered while A beautiful experience on forever. forever remaining and dark light long dark across for across forever with',
    icon: 'analytics',
    gradient: 'midnight',
    tone: 'warning',
    meta: '31 mins ago',
    stat1: 778,
    stat2: 3,
    stat3: '2.4',
    verb: 'Shared',
  },
  {
    id: 'item-2533-15',
    title: 'Velvet Forge 15',
    description: 'across while remaining browsing on or across fast and on A press browsing that. designed A or gestures and every remaining and and considered while A beautiful experience on forever while browsing. dark light long dark across for across forever with fluid designed designed',
    icon: 'extension-puzzle',
    gradient: 'ocean',
    tone: 'accent',
    meta: '32 mins ago',
    stat1: 791,
    stat2: 10,
    stat3: '4.3',
    verb: 'Translated',
  },
  {
    id: 'item-2533-16',
    title: 'Silky Studio 16',
    description: 'while remaining browsing on or across fast and on A press browsing that experience. or gestures and every remaining and and considered while A beautiful experience on forever while browsing fluid browsing. dark across for across forever with fluid designed designed curated and beautiful',
    icon: 'cafe',
    gradient: 'candy',
    tone: 'primary',
    meta: '33 mins ago',
    stat1: 804,
    stat2: 17,
    stat3: '1.2',
    verb: 'Followed',
  },
  {
    id: 'item-2533-17',
    title: 'Vibrant Stream 17',
    description: 'remaining browsing on or across fast and on A press browsing that experience haptics. and every remaining and and considered while A beautiful experience on forever while browsing fluid browsing haptics haptics. across forever with fluid designed designed curated and beautiful private dark forever',
    icon: 'flash',
    gradient: 'midnight',
    tone: 'accent',
    meta: '34 mins ago',
    stat1: 817,
    stat2: 24,
    stat3: '3.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2533-18',
    title: 'Crisp Forge 18',
    description: 'browsing on or across fast and on A press browsing that experience haptics browsing. remaining and and considered while A beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining. fluid designed designed curated and beautiful private dark forever and press tap',
    icon: 'image',
    gradient: 'fire',
    tone: 'success',
    meta: '35 mins ago',
    stat1: 830,
    stat2: 31,
    stat3: '0.0',
    verb: 'Searched',
  },
  {
    id: 'item-2533-19',
    title: 'Silky Saga 19',
    description: 'on or across fast and on A press browsing that experience haptics browsing and. and considered while A beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining with with. curated and beautiful private dark forever and press tap pixel long browsing',
    icon: 'gift',
    gradient: 'sunset',
    tone: 'warning',
    meta: '36 mins ago',
    stat1: 843,
    stat2: 38,
    stat3: '1.9',
    verb: 'Opened',
  },
  {
    id: 'item-2533-20',
    title: 'Frosted Mosaic 20',
    description: 'or across fast and on A press browsing that experience haptics browsing and fast. while A beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining with with long in. private dark forever and press tap pixel long browsing fast press light',
    icon: 'medal',
    gradient: 'ocean',
    tone: 'primary',
    meta: '37 mins ago',
    stat1: 856,
    stat2: 45,
    stat3: '3.8',
    verb: 'Read',
  },
  {
    id: 'item-2533-21',
    title: 'Deep Atlas 21',
    description: 'across fast and on A press browsing that experience haptics browsing and fast feel. beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining with with long in in experience. and press tap pixel long browsing fast press light considered haptics press',
    icon: 'cart',
    gradient: 'brand',
    tone: 'success',
    meta: '38 mins ago',
    stat1: 869,
    stat2: 52,
    stat3: '0.7',
    verb: 'Translated',
  },
  {
    id: 'item-2533-22',
    title: 'Lush Studio 22',
    description: 'fast and on A press browsing that experience haptics browsing and fast feel on. on forever while browsing fluid browsing haptics haptics beautiful remaining with with long in in experience considered on. pixel long browsing fast press light considered haptics press feel and designed',
    icon: 'medal',
    gradient: 'amber',
    tone: 'primary',
    meta: '39 mins ago',
    stat1: 882,
    stat2: 59,
    stat3: '2.6',
    verb: 'Followed',
  },
  {
    id: 'item-2533-23',
    title: 'Vibrant Insight 23',
    description: 'and on A press browsing that experience haptics browsing and fast feel on long. while browsing fluid browsing haptics haptics beautiful remaining with with long in in experience considered on long A. fast press light considered haptics press feel and designed browsing experience remaining',
    icon: 'pizza',
    gradient: 'midnight',
    tone: 'accent',
    meta: '40 mins ago',
    stat1: 895,
    stat2: 66,
    stat3: '4.5',
    verb: 'Searched',
  },
  {
    id: 'item-2533-24',
    title: 'Premium Aurora 24',
    description: 'on A press browsing that experience haptics browsing and fast feel on long every. fluid browsing haptics haptics beautiful remaining with with long in in experience considered on long A that in. considered haptics press feel and designed browsing experience remaining across browsing haptics',
    icon: 'medal',
    gradient: 'fire',
    tone: 'warning',
    meta: '41 mins ago',
    stat1: 908,
    stat2: 73,
    stat3: '1.4',
    verb: 'Highlighted',
  },
  {
    id: 'item-2533-25',
    title: 'Sleek Studio 25',
    description: 'A press browsing that experience haptics browsing and fast feel on long every in. haptics haptics beautiful remaining with with long in in experience considered on long A that in and and. feel and designed browsing experience remaining across browsing haptics long browsing private',
    icon: 'pizza',
    gradient: 'ocean',
    tone: 'info',
    meta: '42 mins ago',
    stat1: 921,
    stat2: 80,
    stat3: '3.3',
    verb: 'Translated',
  },
  {
    id: 'item-2533-26',
    title: 'Vibrant Aurora 26',
    description: 'press browsing that experience haptics browsing and fast feel on long every in light. beautiful remaining with with long in in experience considered on long A that in and and every beautiful. browsing experience remaining across browsing haptics long browsing private gestures curated considered',
    icon: 'pricetag',
    gradient: 'pastel',
    tone: 'primary',
    meta: '43 mins ago',
    stat1: 934,
    stat2: 87,
    stat3: '0.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2533-27',
    title: 'Sleek Stream 27',
    description: 'browsing that experience haptics browsing and fast feel on long every in light dark. with with long in in experience considered on long A that in and and every beautiful that pixel. across browsing haptics long browsing private gestures curated considered and considered for',
    icon: 'layers',
    gradient: 'midnight',
    tone: 'success',
    meta: '44 mins ago',
    stat1: 947,
    stat2: 94,
    stat3: '2.1',
    verb: 'Followed',
  },
  {
    id: 'item-2533-28',
    title: 'Crisp Saga 28',
    description: 'that experience haptics browsing and fast feel on long every in light dark browsing. long in in experience considered on long A that in and and every beautiful that pixel long experience. long browsing private gestures curated considered and considered for every for light',
    icon: 'cart',
    gradient: 'sunset',
    tone: 'accent',
    meta: '45 mins ago',
    stat1: 960,
    stat2: 2,
    stat3: '4.0',
    verb: 'Opened',
  },
  {
    id: 'item-2533-29',
    title: 'Frosted Halo 29',
    description: 'experience haptics browsing and fast feel on long every in light dark browsing across. in experience considered on long A that in and and every beautiful that pixel long experience fluid light. gestures curated considered and considered for every for light dark dark across',
    icon: 'sparkles',
    gradient: 'fire',
    tone: 'primary',
    meta: '46 mins ago',
    stat1: 973,
    stat2: 9,
    stat3: '0.9',
    verb: 'Searched',
  },
  {
    id: 'item-2533-30',
    title: 'Buttery Pulse 30',
    description: 'haptics browsing and fast feel on long every in light dark browsing across fast. considered on long A that in and and every beautiful that pixel long experience fluid light fluid curated. and considered for every for light dark dark across for private pixel',
    icon: 'flag',
    gradient: 'brand',
    tone: 'warning',
    meta: '47 mins ago',
    stat1: 986,
    stat2: 16,
    stat3: '2.8',
    verb: 'Translated',
  },
  {
    id: 'item-2533-31',
    title: 'Elite Loom 31',
    description: 'browsing and fast feel on long every in light dark browsing across fast haptics. long A that in and and every beautiful that pixel long experience fluid light fluid curated and feel. every for light dark dark across for private pixel or curated while',
    icon: 'trophy',
    gradient: 'ocean',
    tone: 'primary',
    meta: '48 mins ago',
    stat1: 999,
    stat2: 23,
    stat3: '4.7',
    verb: 'Visited',
  },
  {
    id: 'item-2533-32',
    title: 'Punchy Beacon 32',
    description: 'and fast feel on long every in light dark browsing across fast haptics long. that in and and every beautiful that pixel long experience fluid light fluid curated and feel modes considered. dark dark across for private pixel or curated while modes experience considered',
    icon: 'flame',
    gradient: 'midnight',
    tone: 'danger',
    meta: '49 mins ago',
    stat1: 32,
    stat2: 30,
    stat3: '1.6',
    verb: 'Visited',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-43061-1',
    title: 'Cosmic Stream',
    subtitle: 'fast fast dark tap long designed fast long every and forever browsing that A. long and or designed experience alive designed for A forever tap gestures tap every beautiful alive modes gestures. modes curated while curated designed browsing curated in and in and private',
    icon: 'bookmark',
    gradient: 'ocean',
  },
  {
    id: 'section-43061-2',
    title: 'Deep Mosaic',
    subtitle: 'browsing that A and long private that with considered modes and in on dark. and while remaining experience dark fast every pixel for browsing private light on fast experience pixel feel considered. in and feel every designed fast for browsing for experience feel that',
    icon: 'rocket',
    gradient: 'neon',
  },
  {
    id: 'section-43061-3',
    title: 'Vibrant Spark',
    subtitle: 'in on dark designed with beautiful fast or every for on curated tap every. remaining with long that or across across feel A experience A on modes and feel long press feel. beautiful press forever alive in remaining private gestures tap designed in beautiful',
    icon: 'sparkles',
    gradient: 'pastel',
  },
  {
    id: 'section-43061-4',
    title: 'Dreamy Loom',
    subtitle: 'curated tap every experience and or every forever for light experience beautiful tap dark. curated that on forever remaining pixel and in in every tap in modes alive remaining remaining on dark. tap and considered curated and pixel light browsing across or light beautiful',
    icon: 'cart',
    gradient: 'forest',
  },
  {
    id: 'section-43061-5',
    title: 'Elite Beacon',
    subtitle: 'beautiful tap dark haptics that experience pixel and and A in beautiful with fluid. with considered for and feel fast every A haptics and for A remaining pixel considered forever curated private. on across browsing with and alive for forever private fluid while and',
    icon: 'layers',
    gradient: 'amber',
  },
  {
    id: 'section-43061-6',
    title: 'Vibrant Echo',
    subtitle: 'beautiful with fluid fluid alive across with modes every dark alive tap considered pixel. modes while pixel and fast that feel for beautiful remaining pixel curated considered considered pixel in that and. fluid alive every every every for and pixel in tap pixel every',
    icon: 'image',
    gradient: 'brand',
  },
  {
    id: 'section-43061-7',
    title: 'Frosted Mosaic',
    subtitle: 'tap considered pixel modes modes on haptics beautiful on in for with and curated. or considered feel modes while across experience A across and fast forever long modes in across feel modes. in every fluid and and fast designed long browsing and in fast',
    icon: 'trophy',
    gradient: 'neon',
  },
  {
    id: 'section-43061-8',
    title: 'Frosted Halo',
    subtitle: 'with and curated designed or every remaining gestures or curated considered curated haptics considered. fast and light for forever with across in and and long and across remaining fast feel modes private. beautiful modes forever press modes modes haptics gestures and considered or for',
    icon: 'paw',
    gradient: 'aurora',
  },
  {
    id: 'section-43061-9',
    title: 'Dreamy Quest',
    subtitle: 'curated haptics considered with forever press modes pixel modes while on long light gestures. remaining designed and fast A tap pixel gestures considered press or feel pixel long on with and feel. fluid A experience experience and feel and every and dark in alive',
    icon: 'compass',
    gradient: 'sunset',
  },
  {
    id: 'section-43061-10',
    title: 'Soft Studio',
    subtitle: 'long light gestures dark for with dark in tap and gestures press experience while. and and private beautiful long or light press every haptics every considered alive pixel designed long fluid A. A for across curated designed and tap every forever forever modes browsing',
    icon: 'flame',
    gradient: 'cosmic',
  },
  {
    id: 'section-43061-11',
    title: 'Punchy Echo',
    subtitle: 'press experience while forever long remaining dark remaining that haptics private beautiful across while. and and light for while tap fluid press and light tap curated fast alive private browsing beautiful and. browsing browsing forever experience dark fast experience with and long browsing pixel',
    icon: 'pulse',
    gradient: 'neon',
  },
  {
    id: 'section-43061-12',
    title: 'Silky Echo',
    subtitle: 'beautiful across while remaining browsing fluid gestures remaining fluid long pixel and for tap. and long for designed designed gestures remaining feel gestures every every designed or and designed that considered that. forever for press and and that dark fast fast dark while gestures',
    icon: 'rocket',
    gradient: 'pastel',
  },
  {
    id: 'section-43061-13',
    title: 'Polished Lens',
    subtitle: 'and for tap every on long browsing experience press designed and private tap for. modes long and long fluid dark and pixel alive light every experience experience alive alive light every modes. haptics fast for press every long A tap private press every across',
    icon: 'cart',
    gradient: 'midnight',
  },
  {
    id: 'section-43061-14',
    title: 'Crisp Halo',
    subtitle: 'private tap for fluid every press every beautiful beautiful light while with that and. every light on or private every for curated alive haptics alive every haptics in remaining and remaining long. while tap press light and pixel long with A gestures on beautiful',
    icon: 'globe',
    gradient: 'aurora',
  },
];

const HERO_TITLE = 'Metric detail';
const HERO_SUBTITLE = 'Drill into a single analytics metric.';
const FOOTER_TITLE = 'Keep going with Metric detail';
const FOOTER_BODY = 'browsing or with modes and long alive long and fast while gestures and fluid. pixel while and fluid and experience that beautiful and or and and every experience forever browsing considered modes. considered browsing or and and beautiful feel dark in fluid considered across';

export const TabsAnalyticsDetailScreen: React.FC = () => {
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
      variant="ocean"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Metric detail"
        subtitle="Drill into a single analytics metric."
        showBack={true}
        rightIcon="pulse"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>84%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '84%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Compass</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>37%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '37%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>80%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '80%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>33%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '33%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>76%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '76%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>29%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '29%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>72%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '72%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>25%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '25%' }]}
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
