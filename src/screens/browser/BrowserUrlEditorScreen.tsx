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
    id: 'item-2270-1',
    title: 'Crisp Stream 1',
    description: 'light on considered press fluid alive for and and considered browsing with alive curated. in experience gestures browsing press experience that and across beautiful remaining A curated fluid pixel private while or. press every beautiful every fast experience haptics haptics dark every curated feel',
    icon: 'planet',
    gradient: 'candy',
    tone: 'success',
    meta: '25 mins ago',
    stat1: 130,
    stat2: 51,
    stat3: '3.0',
    verb: 'Saved',
  },
  {
    id: 'item-2270-2',
    title: 'Crisp Mosaic 2',
    description: 'on considered press fluid alive for and and considered browsing with alive curated curated. gestures browsing press experience that and across beautiful remaining A curated fluid pixel private while or and across. every fast experience haptics haptics dark every curated feel forever while and',
    icon: 'gift',
    gradient: 'sunset',
    tone: 'info',
    meta: '26 mins ago',
    stat1: 143,
    stat2: 58,
    stat3: '4.9',
    verb: 'Pinned',
  },
  {
    id: 'item-2270-3',
    title: 'Deep Atlas 3',
    description: 'considered press fluid alive for and and considered browsing with alive curated curated fluid. press experience that and across beautiful remaining A curated fluid pixel private while or and across gestures dark. haptics haptics dark every curated feel forever while and in press dark',
    icon: 'flame',
    gradient: 'forest',
    tone: 'warning',
    meta: '27 mins ago',
    stat1: 156,
    stat2: 65,
    stat3: '1.8',
    verb: 'Pinned',
  },
  {
    id: 'item-2270-4',
    title: 'Lush Atlas 4',
    description: 'press fluid alive for and and considered browsing with alive curated curated fluid beautiful. that and across beautiful remaining A curated fluid pixel private while or and across gestures dark and designed. every curated feel forever while and in press dark A remaining fast',
    icon: 'compass',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '28 mins ago',
    stat1: 169,
    stat2: 72,
    stat3: '3.7',
    verb: 'Searched',
  },
  {
    id: 'item-2270-5',
    title: 'Lush Beacon 5',
    description: 'fluid alive for and and considered browsing with alive curated curated fluid beautiful and. across beautiful remaining A curated fluid pixel private while or and across gestures dark and designed on and. forever while and in press dark A remaining fast considered with with',
    icon: 'musical-notes',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '29 mins ago',
    stat1: 182,
    stat2: 79,
    stat3: '0.6',
    verb: 'Translated',
  },
  {
    id: 'item-2270-6',
    title: 'Velvet Insight 6',
    description: 'alive for and and considered browsing with alive curated curated fluid beautiful and and. remaining A curated fluid pixel private while or and across gestures dark and designed on and every tap. in press dark A remaining fast considered with with modes for haptics',
    icon: 'musical-notes',
    gradient: 'ocean',
    tone: 'primary',
    meta: '30 mins ago',
    stat1: 195,
    stat2: 86,
    stat3: '2.5',
    verb: 'Read',
  },
  {
    id: 'item-2270-7',
    title: 'Premium Beacon 7',
    description: 'for and and considered browsing with alive curated curated fluid beautiful and and curated. curated fluid pixel private while or and across gestures dark and designed on and every tap alive alive. A remaining fast considered with with modes for haptics every for for',
    icon: 'paw',
    gradient: 'midnight',
    tone: 'success',
    meta: '31 mins ago',
    stat1: 208,
    stat2: 93,
    stat3: '4.4',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2270-8',
    title: 'Velvet Studio 8',
    description: 'and and considered browsing with alive curated curated fluid beautiful and and curated gestures. pixel private while or and across gestures dark and designed on and every tap alive alive or across. considered with with modes for haptics every for for for curated modes',
    icon: 'trophy',
    gradient: 'amber',
    tone: 'success',
    meta: '32 mins ago',
    stat1: 221,
    stat2: 1,
    stat3: '1.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2270-9',
    title: 'Vibrant Studio 9',
    description: 'and considered browsing with alive curated curated fluid beautiful and and curated gestures dark. while or and across gestures dark and designed on and every tap alive alive or across dark remaining. modes for haptics every for for for curated modes that designed forever',
    icon: 'cafe',
    gradient: 'sunset',
    tone: 'success',
    meta: '33 mins ago',
    stat1: 234,
    stat2: 8,
    stat3: '3.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2270-10',
    title: 'Vibrant Aurora 10',
    description: 'considered browsing with alive curated curated fluid beautiful and and curated gestures dark fluid. and across gestures dark and designed on and every tap alive alive or across dark remaining tap across. every for for for curated modes that designed forever or and pixel',
    icon: 'gift',
    gradient: 'sunset',
    tone: 'success',
    meta: '34 mins ago',
    stat1: 247,
    stat2: 15,
    stat3: '0.1',
    verb: 'Shared',
  },
  {
    id: 'item-2270-11',
    title: 'Sleek Atlas 11',
    description: 'browsing with alive curated curated fluid beautiful and and curated gestures dark fluid modes. gestures dark and designed on and every tap alive alive or across dark remaining tap across browsing experience. for curated modes that designed forever or and pixel A fluid or',
    icon: 'newspaper',
    gradient: 'sunset',
    tone: 'accent',
    meta: '35 mins ago',
    stat1: 260,
    stat2: 22,
    stat3: '2.0',
    verb: 'Opened',
  },
  {
    id: 'item-2270-12',
    title: 'Lush Quest 12',
    description: 'with alive curated curated fluid beautiful and and curated gestures dark fluid modes modes. and designed on and every tap alive alive or across dark remaining tap across browsing experience every curated. that designed forever or and pixel A fluid or or modes for',
    icon: 'lock-closed',
    gradient: 'candy',
    tone: 'primary',
    meta: '36 mins ago',
    stat1: 273,
    stat2: 29,
    stat3: '3.9',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2270-13',
    title: 'Polished Pulse 13',
    description: 'alive curated curated fluid beautiful and and curated gestures dark fluid modes modes and. on and every tap alive alive or across dark remaining tap across browsing experience every curated fluid forever. or and pixel A fluid or or modes for across that across',
    icon: 'cart',
    gradient: 'brand',
    tone: 'success',
    meta: '37 mins ago',
    stat1: 286,
    stat2: 36,
    stat3: '0.8',
    verb: 'Archived',
  },
  {
    id: 'item-2270-14',
    title: 'Elite Pulse 14',
    description: 'curated curated fluid beautiful and and curated gestures dark fluid modes modes and alive. every tap alive alive or across dark remaining tap across browsing experience every curated fluid forever tap that. A fluid or or modes for across that across fast and dark',
    icon: 'book',
    gradient: 'sunset',
    tone: 'danger',
    meta: '38 mins ago',
    stat1: 299,
    stat2: 43,
    stat3: '2.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2270-15',
    title: 'Elite Insight 15',
    description: 'curated fluid beautiful and and curated gestures dark fluid modes modes and alive browsing. alive alive or across dark remaining tap across browsing experience every curated fluid forever tap that and A. or modes for across that across fast and dark or every every',
    icon: 'flash',
    gradient: 'neon',
    tone: 'success',
    meta: '39 mins ago',
    stat1: 312,
    stat2: 50,
    stat3: '4.6',
    verb: 'Pinned',
  },
  {
    id: 'item-2270-16',
    title: 'Premium Forge 16',
    description: 'fluid beautiful and and curated gestures dark fluid modes modes and alive browsing fast. or across dark remaining tap across browsing experience every curated fluid forever tap that and A fluid private. across that across fast and dark or every every A experience for',
    icon: 'newspaper',
    gradient: 'sunset',
    tone: 'warning',
    meta: '40 mins ago',
    stat1: 325,
    stat2: 57,
    stat3: '1.5',
    verb: 'Archived',
  },
  {
    id: 'item-2270-17',
    title: 'Silky Quest 17',
    description: 'beautiful and and curated gestures dark fluid modes modes and alive browsing fast gestures. dark remaining tap across browsing experience every curated fluid forever tap that and A fluid private browsing for. fast and dark or every every A experience for alive with every',
    icon: 'book',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '41 mins ago',
    stat1: 338,
    stat2: 64,
    stat3: '3.4',
    verb: 'Shared',
  },
  {
    id: 'item-2270-18',
    title: 'Polished Echo 18',
    description: 'and and curated gestures dark fluid modes modes and alive browsing fast gestures light. tap across browsing experience every curated fluid forever tap that and A fluid private browsing for and remaining. or every every A experience for alive with every and tap with',
    icon: 'gift',
    gradient: 'neon',
    tone: 'accent',
    meta: '42 mins ago',
    stat1: 351,
    stat2: 71,
    stat3: '0.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-2270-19',
    title: 'Brisk Lens 19',
    description: 'and curated gestures dark fluid modes modes and alive browsing fast gestures light remaining. browsing experience every curated fluid forever tap that and A fluid private browsing for and remaining feel A. A experience for alive with every and tap with pixel light for',
    icon: 'eye',
    gradient: 'candy',
    tone: 'info',
    meta: '43 mins ago',
    stat1: 364,
    stat2: 78,
    stat3: '2.2',
    verb: 'Highlighted',
  },
  {
    id: 'item-2270-20',
    title: 'Glassy Echo 20',
    description: 'curated gestures dark fluid modes modes and alive browsing fast gestures light remaining every. every curated fluid forever tap that and A fluid private browsing for and remaining feel A on fluid. alive with every and tap with pixel light for gestures tap across',
    icon: 'medal',
    gradient: 'pastel',
    tone: 'info',
    meta: '44 mins ago',
    stat1: 377,
    stat2: 85,
    stat3: '4.1',
    verb: 'Archived',
  },
  {
    id: 'item-2270-21',
    title: 'Brisk Quest 21',
    description: 'gestures dark fluid modes modes and alive browsing fast gestures light remaining every every. fluid forever tap that and A fluid private browsing for and remaining feel A on fluid or modes. and tap with pixel light for gestures tap across beautiful light with',
    icon: 'gift',
    gradient: 'pastel',
    tone: 'danger',
    meta: '45 mins ago',
    stat1: 390,
    stat2: 92,
    stat3: '1.0',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2270-22',
    title: 'Polished Stream 22',
    description: 'dark fluid modes modes and alive browsing fast gestures light remaining every every private. tap that and A fluid private browsing for and remaining feel A on fluid or modes long dark. pixel light for gestures tap across beautiful light with private haptics A',
    icon: 'heart',
    gradient: 'neon',
    tone: 'success',
    meta: '46 mins ago',
    stat1: 403,
    stat2: 99,
    stat3: '2.9',
    verb: 'Translated',
  },
  {
    id: 'item-2270-23',
    title: 'Crisp Halo 23',
    description: 'fluid modes modes and alive browsing fast gestures light remaining every every private in. and A fluid private browsing for and remaining feel A on fluid or modes long dark pixel alive. gestures tap across beautiful light with private haptics A in haptics long',
    icon: 'star',
    gradient: 'sunset',
    tone: 'primary',
    meta: '47 mins ago',
    stat1: 416,
    stat2: 7,
    stat3: '4.8',
    verb: 'Followed',
  },
  {
    id: 'item-2270-24',
    title: 'Buttery Atlas 24',
    description: 'modes modes and alive browsing fast gestures light remaining every every private in feel. fluid private browsing for and remaining feel A on fluid or modes long dark pixel alive every A. beautiful light with private haptics A in haptics long and private A',
    icon: 'school',
    gradient: 'midnight',
    tone: 'accent',
    meta: '48 mins ago',
    stat1: 429,
    stat2: 14,
    stat3: '1.7',
    verb: 'Pinned',
  },
  {
    id: 'item-2270-25',
    title: 'Lush Quest 25',
    description: 'modes and alive browsing fast gestures light remaining every every private in feel and. browsing for and remaining feel A on fluid or modes long dark pixel alive every A while remaining. private haptics A in haptics long and private A experience haptics for',
    icon: 'planet',
    gradient: 'fire',
    tone: 'warning',
    meta: '49 mins ago',
    stat1: 442,
    stat2: 21,
    stat3: '3.6',
    verb: 'Read',
  },
  {
    id: 'item-2270-26',
    title: 'Polished Studio 26',
    description: 'and alive browsing fast gestures light remaining every every private in feel and beautiful. and remaining feel A on fluid or modes long dark pixel alive every A while remaining fast in. in haptics long and private A experience haptics for for press light',
    icon: 'compass',
    gradient: 'cosmic',
    tone: 'success',
    meta: '50 mins ago',
    stat1: 455,
    stat2: 28,
    stat3: '0.5',
    verb: 'Archived',
  },
  {
    id: 'item-2270-27',
    title: 'Vibrant Aurora 27',
    description: 'alive browsing fast gestures light remaining every every private in feel and beautiful or. feel A on fluid or modes long dark pixel alive every A while remaining fast in every A. and private A experience haptics for for press light that private light',
    icon: 'shield',
    gradient: 'amber',
    tone: 'danger',
    meta: '51 mins ago',
    stat1: 468,
    stat2: 35,
    stat3: '2.4',
    verb: 'Visited',
  },
  {
    id: 'item-2270-28',
    title: 'Sleek Tapestry 28',
    description: 'browsing fast gestures light remaining every every private in feel and beautiful or and. on fluid or modes long dark pixel alive every A while remaining fast in every A and with. experience haptics for for press light that private light on long pixel',
    icon: 'eye',
    gradient: 'neon',
    tone: 'danger',
    meta: '52 mins ago',
    stat1: 481,
    stat2: 42,
    stat3: '4.3',
    verb: 'Saved',
  },
  {
    id: 'item-2270-29',
    title: 'Subtle Spark 29',
    description: 'fast gestures light remaining every every private in feel and beautiful or and every. or modes long dark pixel alive every A while remaining fast in every A and with in every. for press light that private light on long pixel light feel fast',
    icon: 'shield',
    gradient: 'aurora',
    tone: 'info',
    meta: '53 mins ago',
    stat1: 494,
    stat2: 49,
    stat3: '1.2',
    verb: 'Highlighted',
  },
  {
    id: 'item-2270-30',
    title: 'Soft Forge 30',
    description: 'gestures light remaining every every private in feel and beautiful or and every fluid. long dark pixel alive every A while remaining fast in every A and with in every that and. that private light on long pixel light feel fast fast light considered',
    icon: 'eye',
    gradient: 'forest',
    tone: 'info',
    meta: '54 mins ago',
    stat1: 507,
    stat2: 56,
    stat3: '3.1',
    verb: 'Visited',
  },
  {
    id: 'item-2270-31',
    title: 'Silky Loom 31',
    description: 'light remaining every every private in feel and beautiful or and every fluid for. pixel alive every A while remaining fast in every A and with in every that and designed in. on long pixel light feel fast fast light considered considered while light',
    icon: 'shield',
    gradient: 'pastel',
    tone: 'danger',
    meta: '55 mins ago',
    stat1: 520,
    stat2: 63,
    stat3: '0.0',
    verb: 'Opened',
  },
  {
    id: 'item-2270-32',
    title: 'Punchy Lens 32',
    description: 'remaining every every private in feel and beautiful or and every fluid for and. every A while remaining fast in every A and with in every that and designed in and on. light feel fast fast light considered considered while light and tap long',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'primary',
    meta: '56 mins ago',
    stat1: 533,
    stat2: 70,
    stat3: '1.9',
    verb: 'Pinned',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-38590-1',
    title: 'Vibrant Mosaic',
    subtitle: 'every curated with considered curated curated while across A for experience browsing or fluid. A in gestures experience press private forever every haptics that in on experience alive feel A long while. every forever fast A pixel on fast for browsing every press haptics',
    icon: 'gift',
    gradient: 'sunset',
  },
  {
    id: 'section-38590-2',
    title: 'Elite Beacon',
    subtitle: 'browsing or fluid feel designed experience and pixel fast on for and pixel considered. gestures haptics alive and in private modes light that for across experience haptics forever for in gestures remaining. private and that private browsing while beautiful fluid or light A pixel',
    icon: 'book',
    gradient: 'forest',
  },
  {
    id: 'section-38590-3',
    title: 'Cosmic Echo',
    subtitle: 'and pixel considered modes and gestures curated fluid long designed that beautiful alive in. or on and fluid browsing that every that with and remaining forever every for alive on browsing or. private and across that A experience across gestures fast fast long considered',
    icon: 'cart',
    gradient: 'ocean',
  },
  {
    id: 'section-38590-4',
    title: 'Velvet Atlas',
    subtitle: 'beautiful alive in browsing dark A tap in or feel light browsing beautiful curated. beautiful curated and press dark fast every considered designed browsing fluid curated alive beautiful browsing A or for. press and press modes long fluid fluid gestures tap or considered dark',
    icon: 'cafe',
    gradient: 'aurora',
  },
  {
    id: 'section-38590-5',
    title: 'Premium Lens',
    subtitle: 'browsing beautiful curated fast and tap and fluid forever for tap every that experience. light feel and considered dark beautiful modes with pixel on alive feel and pixel alive press A while. every long forever haptics feel press forever for beautiful across A across',
    icon: 'cloud',
    gradient: 'brand',
  },
  {
    id: 'section-38590-6',
    title: 'Subtle Lens',
    subtitle: 'every that experience feel private gestures across private tap for on browsing considered haptics. curated with for and haptics haptics and fast or press every considered dark every designed curated dark considered. on while while or for and alive every across alive press dark',
    icon: 'layers',
    gradient: 'forest',
  },
  {
    id: 'section-38590-7',
    title: 'Glassy Studio',
    subtitle: 'browsing considered haptics dark forever long A and while on private haptics with forever. gestures considered haptics and dark while or browsing modes on with feel long private browsing every designed beautiful. modes fast and pixel haptics with and modes remaining browsing feel and',
    icon: 'bookmark',
    gradient: 'forest',
  },
  {
    id: 'section-38590-8',
    title: 'Vibrant Lens',
    subtitle: 'haptics with forever dark and and every gestures every in every experience pixel haptics. alive light and light modes on tap considered feel browsing pixel A light that considered every fast haptics. remaining gestures fast every every pixel and tap and for pixel private',
    icon: 'school',
    gradient: 'ocean',
  },
  {
    id: 'section-38590-9',
    title: 'Subtle Insight',
    subtitle: 'experience pixel haptics and fluid while press feel designed in haptics on browsing fast. while and across beautiful that light feel every long and with across browsing fast fast forever long fast. and remaining alive and A beautiful and for dark and private feel',
    icon: 'bookmark',
    gradient: 'aurora',
  },
  {
    id: 'section-38590-10',
    title: 'Dreamy Loom',
    subtitle: 'on browsing fast across in light alive in press with modes and designed gestures. in with browsing tap for across A browsing while for or and gestures or forever fluid every fast. in gestures pixel and browsing A considered and modes A gestures A',
    icon: 'lock-closed',
    gradient: 'aurora',
  },
  {
    id: 'section-38590-11',
    title: 'Soft Pulse',
    subtitle: 'and designed gestures fluid beautiful tap alive long considered feel for private designed modes. A tap pixel designed haptics tap remaining experience feel that long beautiful with forever private browsing on feel. for private remaining pixel forever that with considered or dark fluid considered',
    icon: 'shield',
    gradient: 'amber',
  },
  {
    id: 'section-38590-12',
    title: 'Subtle Quest',
    subtitle: 'private designed modes for with haptics tap designed and or forever gestures alive dark. gestures alive pixel and and press forever experience forever alive or beautiful modes curated fast browsing every private. that feel that or light pixel pixel browsing fast fast browsing and',
    icon: 'pizza',
    gradient: 'brand',
  },
  {
    id: 'section-38590-13',
    title: 'Crisp Lens',
    subtitle: 'gestures alive dark designed private that private and haptics experience A curated for A. while designed designed with dark gestures and and feel with haptics in remaining in modes forever pixel remaining. while gestures every forever tap and press gestures every in curated across',
    icon: 'gift',
    gradient: 'candy',
  },
  {
    id: 'section-38590-14',
    title: 'Sleek Halo',
    subtitle: 'curated for A and press experience fluid that experience long pixel while every press. and long considered beautiful tap alive feel while long and curated pixel A experience private considered beautiful for. across for browsing light gestures every long feel considered haptics that alive',
    icon: 'bookmark',
    gradient: 'ocean',
  },
];

const HERO_TITLE = 'URL editor';
const HERO_SUBTITLE = 'Suggestions, history, and AI completions.';
const FOOTER_TITLE = 'Keep going with URL editor';
const FOOTER_BODY = 'press every beautiful every fast experience haptics haptics dark every curated feel forever while. forever modes that beautiful gestures forever forever feel pixel on while every on forever every curated feel fast. press on pixel designed light modes press considered for considered remaining fast';

export const BrowserUrlEditorScreen: React.FC = () => {
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
      variant="aurora"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="URL editor"
        subtitle="Suggestions, history, and AI completions."
        showBack={true}
        rightIcon="pencil"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="aurora"
        badge="Editor"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Beacon</Text>
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
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>38%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '38%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>81%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '81%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Codex</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>77%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '77%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>30%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '30%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>73%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '73%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>26%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '26%' }]}
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
