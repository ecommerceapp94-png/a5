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
    id: 'item-2539-1',
    title: 'Vibrant Studio 1',
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
    id: 'item-2539-2',
    title: 'Vibrant Mosaic 2',
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
    id: 'item-2539-3',
    title: 'Deep Halo 3',
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
    id: 'item-2539-4',
    title: 'Buttery Tapestry 4',
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
    id: 'item-2539-5',
    title: 'Subtle Loom 5',
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
    id: 'item-2539-6',
    title: 'Punchy Drift 6',
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
    id: 'item-2539-7',
    title: 'Dreamy Halo 7',
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
    id: 'item-2539-8',
    title: 'Buttery Beacon 8',
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
    id: 'item-2539-9',
    title: 'Velvet Forge 9',
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
    id: 'item-2539-10',
    title: 'Silky Studio 10',
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
    id: 'item-2539-11',
    title: 'Vibrant Stream 11',
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
    id: 'item-2539-12',
    title: 'Crisp Forge 12',
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
    id: 'item-2539-13',
    title: 'Silky Saga 13',
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
    id: 'item-2539-14',
    title: 'Frosted Mosaic 14',
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
    id: 'item-2539-15',
    title: 'Deep Atlas 15',
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
    id: 'item-2539-16',
    title: 'Lush Studio 16',
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
    id: 'item-2539-17',
    title: 'Vibrant Insight 17',
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
    id: 'item-2539-18',
    title: 'Premium Aurora 18',
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
    id: 'item-2539-19',
    title: 'Sleek Studio 19',
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
    id: 'item-2539-20',
    title: 'Vibrant Aurora 20',
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
    id: 'item-2539-21',
    title: 'Sleek Stream 21',
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
    id: 'item-2539-22',
    title: 'Crisp Saga 22',
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
    id: 'item-2539-23',
    title: 'Frosted Halo 23',
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
    id: 'item-2539-24',
    title: 'Buttery Pulse 24',
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
    id: 'item-2539-25',
    title: 'Elite Loom 25',
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
    id: 'item-2539-26',
    title: 'Punchy Beacon 26',
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
  {
    id: 'item-2539-27',
    title: 'Velvet Studio 27',
    description: 'fast feel on long every in light dark browsing across fast haptics long that. and and every beautiful that pixel long experience fluid light fluid curated and feel modes considered curated for. for private pixel or curated while modes experience considered curated light long',
    icon: 'flag',
    gradient: 'aurora',
    tone: 'danger',
    meta: '50 mins ago',
    stat1: 45,
    stat2: 37,
    stat3: '3.5',
    verb: 'Read',
  },
  {
    id: 'item-2539-28',
    title: 'Vibrant Halo 28',
    description: 'feel on long every in light dark browsing across fast haptics long that light. every beautiful that pixel long experience fluid light fluid curated and feel modes considered curated for tap pixel. or curated while modes experience considered curated light long beautiful gestures light',
    icon: 'flame',
    gradient: 'aurora',
    tone: 'success',
    meta: '51 mins ago',
    stat1: 58,
    stat2: 44,
    stat3: '0.4',
    verb: 'Archived',
  },
  {
    id: 'item-2539-29',
    title: 'Buttery Aurora 29',
    description: 'on long every in light dark browsing across fast haptics long that light every. that pixel long experience fluid light fluid curated and feel modes considered curated for tap pixel haptics tap. modes experience considered curated light long beautiful gestures light remaining or browsing',
    icon: 'lock-closed',
    gradient: 'amber',
    tone: 'danger',
    meta: '52 mins ago',
    stat1: 71,
    stat2: 51,
    stat3: '2.3',
    verb: 'Translated',
  },
  {
    id: 'item-2539-30',
    title: 'Sleek Compass 30',
    description: 'long every in light dark browsing across fast haptics long that light every across. long experience fluid light fluid curated and feel modes considered curated for tap pixel haptics tap remaining across. curated light long beautiful gestures light remaining or browsing considered gestures experience',
    icon: 'extension-puzzle',
    gradient: 'neon',
    tone: 'primary',
    meta: '53 mins ago',
    stat1: 84,
    stat2: 58,
    stat3: '4.2',
    verb: 'Translated',
  },
  {
    id: 'item-2539-31',
    title: 'Snappy Spark 31',
    description: 'every in light dark browsing across fast haptics long that light every across and. fluid light fluid curated and feel modes considered curated for tap pixel haptics tap remaining across pixel alive. beautiful gestures light remaining or browsing considered gestures experience on A haptics',
    icon: 'planet',
    gradient: 'midnight',
    tone: 'primary',
    meta: '54 mins ago',
    stat1: 97,
    stat2: 65,
    stat3: '1.1',
    verb: 'Followed',
  },
  {
    id: 'item-2539-32',
    title: 'Soft Echo 32',
    description: 'in light dark browsing across fast haptics long that light every across and experience. fluid curated and feel modes considered curated for tap pixel haptics tap remaining across pixel alive and feel. remaining or browsing considered gestures experience on A haptics every long every',
    icon: 'cart',
    gradient: 'midnight',
    tone: 'accent',
    meta: '55 mins ago',
    stat1: 110,
    stat2: 72,
    stat3: '3.0',
    verb: 'Highlighted',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-43163-1',
    title: 'Frosted Drift',
    subtitle: 'dark for with dark in tap and gestures press experience while forever long remaining. light press every haptics every considered alive pixel designed long fluid A considered private A every and and. forever modes browsing every for on in and dark every designed press',
    icon: 'speedometer',
    gradient: 'amber',
  },
  {
    id: 'section-43163-2',
    title: 'Dreamy Atlas',
    subtitle: 'forever long remaining dark remaining that haptics private beautiful across while remaining browsing fluid. fluid press and light tap curated fast alive private browsing beautiful and that with dark fast and long. long browsing pixel while and beautiful browsing browsing designed light in every',
    icon: 'cart',
    gradient: 'ocean',
  },
  {
    id: 'section-43163-3',
    title: 'Soft Saga',
    subtitle: 'remaining browsing fluid gestures remaining fluid long pixel and for tap every on long. remaining feel gestures every every designed or and designed that considered that experience and A A modes long. dark while gestures every or private modes experience remaining gestures tap forever',
    icon: 'briefcase',
    gradient: 'midnight',
  },
  {
    id: 'section-43163-4',
    title: 'Elite Codex',
    subtitle: 'every on long browsing experience press designed and private tap for fluid every press. and pixel alive light every experience experience alive alive light every modes for curated fluid on every light. press every across curated light forever press beautiful private every haptics feel',
    icon: 'cart',
    gradient: 'forest',
  },
  {
    id: 'section-43163-5',
    title: 'Sleek Compass',
    subtitle: 'fluid every press every beautiful beautiful light while with that and on in alive. for curated alive haptics alive every haptics in remaining and remaining long alive and on and long on. gestures on beautiful gestures browsing private experience curated feel gestures that browsing',
    icon: 'pulse',
    gradient: 'forest',
  },
  {
    id: 'section-43163-6',
    title: 'Velvet Spark',
    subtitle: 'on in alive in for press across considered tap dark every press light every. and and fluid fast haptics every and feel private alive feel experience dark haptics and or curated and. that fluid or fluid every that alive and browsing remaining with tap',
    icon: 'shield',
    gradient: 'fire',
  },
  {
    id: 'section-43163-7',
    title: 'Deep Saga',
    subtitle: 'press light every remaining fluid dark gestures on on every designed curated tap experience. private long pixel A designed pixel and with remaining alive press long considered fluid fluid with long haptics. considered every for feel gestures pixel across every in and while every',
    icon: 'paw',
    gradient: 'neon',
  },
  {
    id: 'section-43163-8',
    title: 'Brisk Insight',
    subtitle: 'curated tap experience remaining across tap and remaining curated designed beautiful pixel while and. that and and that light designed feel with feel pixel haptics forever light in remaining forever pixel remaining. every every press browsing and fast browsing gestures tap or designed while',
    icon: 'bookmark',
    gradient: 'forest',
  },
  {
    id: 'section-43163-9',
    title: 'Glassy Quest',
    subtitle: 'pixel while and fast light modes beautiful on remaining on and haptics remaining and. and private remaining and long for tap every curated pixel every that and with fluid modes designed experience. experience and curated and forever pixel in feel browsing modes that haptics',
    icon: 'lock-closed',
    gradient: 'aurora',
  },
  {
    id: 'section-43163-10',
    title: 'Crisp Drift',
    subtitle: 'haptics remaining and light for fluid while feel long for private and considered or. while designed and experience experience curated on considered long haptics designed private A feel beautiful A and every. browsing modes for private beautiful considered with that alive across feel that',
    icon: 'rocket',
    gradient: 'ocean',
  },
  {
    id: 'section-43163-11',
    title: 'Elite Tapestry',
    subtitle: 'and considered or beautiful forever beautiful for press and and in and experience with. fluid and considered press tap considered experience and and alive fluid pixel curated and that and tap fast. experience curated forever or or A remaining dark and across long for',
    icon: 'image',
    gradient: 'forest',
  },
  {
    id: 'section-43163-12',
    title: 'Subtle Drift',
    subtitle: 'and experience with every experience considered press and in light in light long while. for modes long A considered that while across designed dark fast forever tap across dark private while considered. with for experience pixel and private dark tap private dark long private',
    icon: 'analytics',
    gradient: 'neon',
  },
  {
    id: 'section-43163-13',
    title: 'Buttery Aurora',
    subtitle: 'light long while while alive for private light fluid gestures while across modes fast. every haptics with private pixel fast across remaining browsing for long A browsing browsing private with that modes. every on private and A curated across press feel haptics that long',
    icon: 'compass',
    gradient: 'amber',
  },
  {
    id: 'section-43163-14',
    title: 'Premium Stream',
    subtitle: 'across modes fast every long for while feel and long dark fast pixel for. browsing fluid and and considered light A on experience across every A that fluid haptics and browsing alive. pixel modes or that beautiful designed private feel with fluid A designed',
    icon: 'shield',
    gradient: 'cosmic',
  },
];

const HERO_TITLE = 'Edit folder';
const HERO_SUBTITLE = 'Folder appearance and ordering.';
const FOOTER_TITLE = 'Keep going with Edit folder';
const FOOTER_BODY = 'press browsing experience tap on browsing while browsing beautiful that remaining curated forever with. gestures light feel pixel or light fluid gestures modes and for light fast press remaining across and dark. with experience on for haptics haptics curated private forever gestures fluid forever';

export const BookmarksFolderEditScreen: React.FC = () => {
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
      variant="forest"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Edit folder"
        subtitle="Folder appearance and ordering."
        showBack={true}
        rightIcon="create-outline"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="forest"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>72%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '72%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>25%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '25%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>68%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '68%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Brisk Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>21%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '21%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>64%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '64%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Brisk Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>17%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '17%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>60%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '60%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>13%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '13%' }]}
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
