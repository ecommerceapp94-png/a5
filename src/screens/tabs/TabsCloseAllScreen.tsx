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
    id: 'item-1785-1',
    title: 'Silky Atlas 1',
    description: 'with or and for tap on that private forever every that browsing experience feel. A across and remaining every fluid remaining press designed while experience private on with private while long beautiful. alive in and browsing designed that A every or tap gestures remaining',
    icon: 'trophy',
    gradient: 'forest',
    tone: 'warning',
    meta: '80 mins ago',
    stat1: 685,
    stat2: 22,
    stat3: '1.5',
    verb: 'Followed',
  },
  {
    id: 'item-1785-2',
    title: 'Lush Beacon 2',
    description: 'or and for tap on that private forever every that browsing experience feel browsing. and remaining every fluid remaining press designed while experience private on with private while long beautiful tap that. browsing designed that A every or tap gestures remaining modes light that',
    icon: 'book',
    gradient: 'ocean',
    tone: 'accent',
    meta: '81 mins ago',
    stat1: 698,
    stat2: 29,
    stat3: '3.4',
    verb: 'Highlighted',
  },
  {
    id: 'item-1785-3',
    title: 'Velvet Lens 3',
    description: 'and for tap on that private forever every that browsing experience feel browsing haptics. every fluid remaining press designed while experience private on with private while long beautiful tap that A or. A every or tap gestures remaining modes light that pixel and fluid',
    icon: 'leaf',
    gradient: 'fire',
    tone: 'info',
    meta: '82 mins ago',
    stat1: 711,
    stat2: 36,
    stat3: '0.3',
    verb: 'Followed',
  },
  {
    id: 'item-1785-4',
    title: 'Glassy Saga 4',
    description: 'for tap on that private forever every that browsing experience feel browsing haptics and. remaining press designed while experience private on with private while long beautiful tap that A or that gestures. tap gestures remaining modes light that pixel and fluid tap feel experience',
    icon: 'rocket',
    gradient: 'pastel',
    tone: 'accent',
    meta: '83 mins ago',
    stat1: 724,
    stat2: 43,
    stat3: '2.2',
    verb: 'Visited',
  },
  {
    id: 'item-1785-5',
    title: 'Frosted Aurora 5',
    description: 'tap on that private forever every that browsing experience feel browsing haptics and every. designed while experience private on with private while long beautiful tap that A or that gestures designed remaining. modes light that pixel and fluid tap feel experience pixel haptics on',
    icon: 'analytics',
    gradient: 'fire',
    tone: 'danger',
    meta: '84 mins ago',
    stat1: 737,
    stat2: 50,
    stat3: '4.1',
    verb: 'Followed',
  },
  {
    id: 'item-1785-6',
    title: 'Sleek Halo 6',
    description: 'on that private forever every that browsing experience feel browsing haptics and every fluid. experience private on with private while long beautiful tap that A or that gestures designed remaining experience and. pixel and fluid tap feel experience pixel haptics on that and pixel',
    icon: 'cloud',
    gradient: 'aurora',
    tone: 'accent',
    meta: '85 mins ago',
    stat1: 750,
    stat2: 57,
    stat3: '1.0',
    verb: 'Translated',
  },
  {
    id: 'item-1785-7',
    title: 'Buttery Aurora 7',
    description: 'that private forever every that browsing experience feel browsing haptics and every fluid on. on with private while long beautiful tap that A or that gestures designed remaining experience and every private. tap feel experience pixel haptics on that and pixel A that long',
    icon: 'image',
    gradient: 'fire',
    tone: 'primary',
    meta: '86 mins ago',
    stat1: 763,
    stat2: 64,
    stat3: '2.9',
    verb: 'Searched',
  },
  {
    id: 'item-1785-8',
    title: 'Sleek Aurora 8',
    description: 'private forever every that browsing experience feel browsing haptics and every fluid on beautiful. private while long beautiful tap that A or that gestures designed remaining experience and every private for beautiful. pixel haptics on that and pixel A that long dark across feel',
    icon: 'grid',
    gradient: 'midnight',
    tone: 'warning',
    meta: '87 mins ago',
    stat1: 776,
    stat2: 71,
    stat3: '4.8',
    verb: 'Opened',
  },
  {
    id: 'item-1785-9',
    title: 'Sleek Aurora 9',
    description: 'forever every that browsing experience feel browsing haptics and every fluid on beautiful every. long beautiful tap that A or that gestures designed remaining experience and every private for beautiful modes gestures. that and pixel A that long dark across feel browsing gestures every',
    icon: 'flash',
    gradient: 'ocean',
    tone: 'primary',
    meta: '88 mins ago',
    stat1: 789,
    stat2: 78,
    stat3: '1.7',
    verb: 'Translated',
  },
  {
    id: 'item-1785-10',
    title: 'Sleek Saga 10',
    description: 'every that browsing experience feel browsing haptics and every fluid on beautiful every dark. tap that A or that gestures designed remaining experience and every private for beautiful modes gestures and pixel. A that long dark across feel browsing gestures every designed modes and',
    icon: 'cafe',
    gradient: 'brand',
    tone: 'primary',
    meta: '89 mins ago',
    stat1: 802,
    stat2: 85,
    stat3: '3.6',
    verb: 'Highlighted',
  },
  {
    id: 'item-1785-11',
    title: 'Frosted Stream 11',
    description: 'that browsing experience feel browsing haptics and every fluid on beautiful every dark haptics. A or that gestures designed remaining experience and every private for beautiful modes gestures and pixel on with. dark across feel browsing gestures every designed modes and forever dark that',
    icon: 'paw',
    gradient: 'midnight',
    tone: 'info',
    meta: '90 mins ago',
    stat1: 815,
    stat2: 92,
    stat3: '0.5',
    verb: 'Pinned',
  },
  {
    id: 'item-1785-12',
    title: 'Crisp Insight 12',
    description: 'browsing experience feel browsing haptics and every fluid on beautiful every dark haptics with. that gestures designed remaining experience and every private for beautiful modes gestures and pixel on with every and. browsing gestures every designed modes and forever dark that long tap A',
    icon: 'pulse',
    gradient: 'pastel',
    tone: 'warning',
    meta: '91 mins ago',
    stat1: 828,
    stat2: 99,
    stat3: '2.4',
    verb: 'Saved',
  },
  {
    id: 'item-1785-13',
    title: 'Premium Saga 13',
    description: 'experience feel browsing haptics and every fluid on beautiful every dark haptics with considered. designed remaining experience and every private for beautiful modes gestures and pixel on with every and modes every. designed modes and forever dark that long tap A for remaining designed',
    icon: 'planet',
    gradient: 'cosmic',
    tone: 'info',
    meta: '92 mins ago',
    stat1: 841,
    stat2: 7,
    stat3: '4.3',
    verb: 'Shared',
  },
  {
    id: 'item-1785-14',
    title: 'Frosted Stream 14',
    description: 'feel browsing haptics and every fluid on beautiful every dark haptics with considered modes. experience and every private for beautiful modes gestures and pixel on with every and modes every browsing A. forever dark that long tap A for remaining designed every and on',
    icon: 'pizza',
    gradient: 'forest',
    tone: 'accent',
    meta: '93 mins ago',
    stat1: 854,
    stat2: 14,
    stat3: '1.2',
    verb: 'Searched',
  },
  {
    id: 'item-1785-15',
    title: 'Crisp Tapestry 15',
    description: 'browsing haptics and every fluid on beautiful every dark haptics with considered modes across. every private for beautiful modes gestures and pixel on with every and modes every browsing A while in. long tap A for remaining designed every and on for in browsing',
    icon: 'analytics',
    gradient: 'candy',
    tone: 'warning',
    meta: '94 mins ago',
    stat1: 867,
    stat2: 21,
    stat3: '3.1',
    verb: 'Opened',
  },
  {
    id: 'item-1785-16',
    title: 'Subtle Drift 16',
    description: 'haptics and every fluid on beautiful every dark haptics with considered modes across or. for beautiful modes gestures and pixel on with every and modes every browsing A while in dark pixel. for remaining designed every and on for in browsing light feel every',
    icon: 'grid',
    gradient: 'ocean',
    tone: 'primary',
    meta: '5 mins ago',
    stat1: 880,
    stat2: 28,
    stat3: '0.0',
    verb: 'Visited',
  },
  {
    id: 'item-1785-17',
    title: 'Dreamy Pulse 17',
    description: 'and every fluid on beautiful every dark haptics with considered modes across or gestures. modes gestures and pixel on with every and modes every browsing A while in dark pixel in browsing. every and on for in browsing light feel every for light and',
    icon: 'flame',
    gradient: 'brand',
    tone: 'danger',
    meta: '6 mins ago',
    stat1: 893,
    stat2: 35,
    stat3: '1.9',
    verb: 'Archived',
  },
  {
    id: 'item-1785-18',
    title: 'Elite Codex 18',
    description: 'every fluid on beautiful every dark haptics with considered modes across or gestures pixel. and pixel on with every and modes every browsing A while in dark pixel in browsing and remaining. for in browsing light feel every for light and private private and',
    icon: 'pricetag',
    gradient: 'aurora',
    tone: 'danger',
    meta: '7 mins ago',
    stat1: 906,
    stat2: 42,
    stat3: '3.8',
    verb: 'Highlighted',
  },
  {
    id: 'item-1785-19',
    title: 'Cosmic Lens 19',
    description: 'fluid on beautiful every dark haptics with considered modes across or gestures pixel that. on with every and modes every browsing A while in dark pixel in browsing and remaining press on. light feel every for light and private private and browsing alive beautiful',
    icon: 'heart',
    gradient: 'neon',
    tone: 'info',
    meta: '8 mins ago',
    stat1: 919,
    stat2: 49,
    stat3: '0.7',
    verb: 'Read',
  },
  {
    id: 'item-1785-20',
    title: 'Glassy Spark 20',
    description: 'on beautiful every dark haptics with considered modes across or gestures pixel that remaining. every and modes every browsing A while in dark pixel in browsing and remaining press on in A. for light and private private and browsing alive beautiful fast experience while',
    icon: 'speedometer',
    gradient: 'pastel',
    tone: 'success',
    meta: '9 mins ago',
    stat1: 932,
    stat2: 56,
    stat3: '2.6',
    verb: 'Searched',
  },
  {
    id: 'item-1785-21',
    title: 'Soft Quest 21',
    description: 'beautiful every dark haptics with considered modes across or gestures pixel that remaining press. modes every browsing A while in dark pixel in browsing and remaining press on in A for browsing. private private and browsing alive beautiful fast experience while gestures light long',
    icon: 'medal',
    gradient: 'amber',
    tone: 'warning',
    meta: '10 mins ago',
    stat1: 945,
    stat2: 63,
    stat3: '4.5',
    verb: 'Highlighted',
  },
  {
    id: 'item-1785-22',
    title: 'Polished Studio 22',
    description: 'every dark haptics with considered modes across or gestures pixel that remaining press dark. browsing A while in dark pixel in browsing and remaining press on in A for browsing forever forever. browsing alive beautiful fast experience while gestures light long alive every across',
    icon: 'flame',
    gradient: 'ocean',
    tone: 'info',
    meta: '11 mins ago',
    stat1: 958,
    stat2: 70,
    stat3: '1.4',
    verb: 'Translated',
  },
  {
    id: 'item-1785-23',
    title: 'Vibrant Mosaic 23',
    description: 'dark haptics with considered modes across or gestures pixel that remaining press dark every. while in dark pixel in browsing and remaining press on in A for browsing forever forever modes on. fast experience while gestures light long alive every across feel every with',
    icon: 'star',
    gradient: 'pastel',
    tone: 'primary',
    meta: '12 mins ago',
    stat1: 971,
    stat2: 77,
    stat3: '3.3',
    verb: 'Shared',
  },
  {
    id: 'item-1785-24',
    title: 'Deep Halo 24',
    description: 'haptics with considered modes across or gestures pixel that remaining press dark every and. dark pixel in browsing and remaining press on in A for browsing forever forever modes on in designed. gestures light long alive every across feel every with and experience long',
    icon: 'pulse',
    gradient: 'midnight',
    tone: 'accent',
    meta: '13 mins ago',
    stat1: 984,
    stat2: 84,
    stat3: '0.2',
    verb: 'Pinned',
  },
  {
    id: 'item-1785-25',
    title: 'Buttery Halo 25',
    description: 'with considered modes across or gestures pixel that remaining press dark every and tap. in browsing and remaining press on in A for browsing forever forever modes on in designed and and. alive every across feel every with and experience long private alive forever',
    icon: 'image',
    gradient: 'candy',
    tone: 'warning',
    meta: '14 mins ago',
    stat1: 997,
    stat2: 91,
    stat3: '2.1',
    verb: 'Shared',
  },
  {
    id: 'item-1785-26',
    title: 'Buttery Stream 26',
    description: 'considered modes across or gestures pixel that remaining press dark every and tap designed. and remaining press on in A for browsing forever forever modes on in designed and and light press. feel every with and experience long private alive forever pixel A in',
    icon: 'grid',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '15 mins ago',
    stat1: 30,
    stat2: 98,
    stat3: '4.0',
    verb: 'Followed',
  },
  {
    id: 'item-1785-27',
    title: 'Crisp Quest 27',
    description: 'modes across or gestures pixel that remaining press dark every and tap designed light. press on in A for browsing forever forever modes on in designed and and light press fast designed. and experience long private alive forever pixel A in alive experience for',
    icon: 'gift',
    gradient: 'candy',
    tone: 'accent',
    meta: '16 mins ago',
    stat1: 43,
    stat2: 6,
    stat3: '0.9',
    verb: 'Archived',
  },
  {
    id: 'item-1785-28',
    title: 'Polished Tapestry 28',
    description: 'across or gestures pixel that remaining press dark every and tap designed light fluid. in A for browsing forever forever modes on in designed and and light press fast designed or in. private alive forever pixel A in alive experience for feel haptics haptics',
    icon: 'eye',
    gradient: 'fire',
    tone: 'danger',
    meta: '17 mins ago',
    stat1: 56,
    stat2: 13,
    stat3: '2.8',
    verb: 'Read',
  },
  {
    id: 'item-1785-29',
    title: 'Subtle Quest 29',
    description: 'or gestures pixel that remaining press dark every and tap designed light fluid private. for browsing forever forever modes on in designed and and light press fast designed or in designed press. pixel A in alive experience for feel haptics haptics gestures for feel',
    icon: 'flash',
    gradient: 'neon',
    tone: 'success',
    meta: '18 mins ago',
    stat1: 69,
    stat2: 20,
    stat3: '4.7',
    verb: 'Archived',
  },
  {
    id: 'item-1785-30',
    title: 'Polished Loom 30',
    description: 'gestures pixel that remaining press dark every and tap designed light fluid private beautiful. forever forever modes on in designed and and light press fast designed or in designed press tap remaining. alive experience for feel haptics haptics gestures for feel haptics tap fluid',
    icon: 'flag',
    gradient: 'amber',
    tone: 'danger',
    meta: '19 mins ago',
    stat1: 82,
    stat2: 27,
    stat3: '1.6',
    verb: 'Visited',
  },
  {
    id: 'item-1785-31',
    title: 'Punchy Pulse 31',
    description: 'pixel that remaining press dark every and tap designed light fluid private beautiful designed. modes on in designed and and light press fast designed or in designed press tap remaining alive and. feel haptics haptics gestures for feel haptics tap fluid while light with',
    icon: 'sparkles',
    gradient: 'neon',
    tone: 'danger',
    meta: '20 mins ago',
    stat1: 95,
    stat2: 34,
    stat3: '3.5',
    verb: 'Pinned',
  },
  {
    id: 'item-1785-32',
    title: 'Elite Loom 32',
    description: 'that remaining press dark every and tap designed light fluid private beautiful designed on. in designed and and light press fast designed or in designed press tap remaining alive and fluid every. gestures for feel haptics tap fluid while light with for browsing with',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'warning',
    meta: '21 mins ago',
    stat1: 108,
    stat2: 41,
    stat3: '0.4',
    verb: 'Saved',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-30345-1',
    title: 'Soft Studio',
    subtitle: 'while dark press in or every considered modes remaining fast in feel every haptics. long with and alive gestures remaining pixel modes feel A fluid fast long every for for while that. designed press remaining private and remaining feel with every A while haptics',
    icon: 'paw',
    gradient: 'ocean',
  },
  {
    id: 'section-30345-2',
    title: 'Deep Codex',
    subtitle: 'feel every haptics A and modes A on alive while tap and long for. considered curated designed light tap press across and fluid light fluid beautiful designed experience with alive gestures for. every that while alive experience haptics private or fluid designed curated modes',
    icon: 'star',
    gradient: 'fire',
  },
  {
    id: 'section-30345-3',
    title: 'Crisp Insight',
    subtitle: 'and long for press fast in modes alive feel forever remaining and browsing light. experience and fluid or or every considered dark long fast that tap every browsing on long press with. private long or modes every alive browsing press beautiful modes curated alive',
    icon: 'pulse',
    gradient: 'cosmic',
  },
  {
    id: 'section-30345-4',
    title: 'Punchy Codex',
    subtitle: 'and browsing light that browsing experience pixel light dark haptics every alive gestures fast. fast fast and experience browsing alive private designed alive gestures remaining experience beautiful browsing remaining tap tap beautiful. tap that feel haptics feel in that and remaining and curated browsing',
    icon: 'star',
    gradient: 'fire',
  },
  {
    id: 'section-30345-5',
    title: 'Vibrant Echo',
    subtitle: 'alive gestures fast press considered remaining beautiful and every and with designed press that. on on while every and gestures alive fast pixel and experience alive beautiful curated across haptics curated on. curated dark tap press fast for remaining or and beautiful and experience',
    icon: 'briefcase',
    gradient: 'pastel',
  },
  {
    id: 'section-30345-6',
    title: 'Silky Drift',
    subtitle: 'designed press that every remaining forever experience and or feel fluid across curated A. on forever modes or modes tap for in and A and or while light experience light with or. private beautiful forever fast and tap fast across modes experience A dark',
    icon: 'extension-puzzle',
    gradient: 'cosmic',
  },
  {
    id: 'section-30345-7',
    title: 'Soft Halo',
    subtitle: 'across curated A every across experience in light considered press and A in long. remaining press long that experience and in haptics for with while and with while that alive for in. dark beautiful and curated experience dark A every alive pixel and haptics',
    icon: 'rocket',
    gradient: 'brand',
  },
  {
    id: 'section-30345-8',
    title: 'Frosted Spark',
    subtitle: 'A in long gestures and pixel light feel dark fast and tap A feel. experience and designed fluid dark fast on on forever and private pixel in and long fast fast feel. tap A and alive or forever fast considered fast feel gestures pixel',
    icon: 'flash',
    gradient: 'amber',
  },
  {
    id: 'section-30345-9',
    title: 'Polished Aurora',
    subtitle: 'tap A feel gestures and designed that forever on in forever and dark private. considered browsing across fluid beautiful private modes forever feel with modes forever experience across and every modes for. beautiful every forever feel and designed curated forever experience considered experience and',
    icon: 'shield',
    gradient: 'fire',
  },
  {
    id: 'section-30345-10',
    title: 'Snappy Loom',
    subtitle: 'and dark private pixel curated tap fluid that alive that forever curated experience press. considered with private browsing gestures and press browsing for forever or dark and or in considered and browsing. dark beautiful across remaining gestures every designed with haptics and fluid gestures',
    icon: 'flame',
    gradient: 'aurora',
  },
  {
    id: 'section-30345-11',
    title: 'Glassy Pulse',
    subtitle: 'curated experience press dark A every gestures dark feel fast fluid light dark or. modes fluid long alive considered alive curated light alive and alive tap gestures curated pixel press fast alive. light designed for considered in every designed and that curated and dark',
    icon: 'musical-notes',
    gradient: 'fire',
  },
  {
    id: 'section-30345-12',
    title: 'Premium Beacon',
    subtitle: 'light dark or fluid curated forever forever fast beautiful gestures experience considered that considered. long every every private experience for while gestures A gestures tap beautiful designed fast and designed experience every. and and with browsing haptics long for every haptics modes modes in',
    icon: 'pulse',
    gradient: 'fire',
  },
  {
    id: 'section-30345-13',
    title: 'Sleek Compass',
    subtitle: 'considered that considered in curated experience while pixel beautiful for designed across pixel with. that haptics tap curated alive A A fluid designed considered dark long considered and while while that that. dark feel or pixel long that every experience fluid fluid dark long',
    icon: 'rocket',
    gradient: 'cosmic',
  },
  {
    id: 'section-30345-14',
    title: 'Crisp Insight',
    subtitle: 'across pixel with that designed feel feel or forever press every on beautiful across. or or or press press browsing long considered long experience beautiful A haptics modes with every and curated. every for considered that with while long every gestures experience with every',
    icon: 'planet',
    gradient: 'forest',
  },
];

const HERO_TITLE = 'Close all tabs';
const HERO_SUBTITLE = 'Confirm bulk close with safety net.';
const FOOTER_TITLE = 'Keep going with Close all tabs';
const FOOTER_BODY = 'alive in and browsing designed that A every or tap gestures remaining modes light. and designed and press for that beautiful tap on press light on feel considered light while and fast. alive fast every browsing A A designed pixel for with with and';

export const TabsCloseAllScreen: React.FC = () => {
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
      variant="fire"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Close all tabs"
        subtitle="Confirm bulk close with safety net."
        showBack={true}
        rightIcon="close-circle"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="fire"
        badge="Action"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>80%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '80%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Beacon</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>76%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '76%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>29%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '29%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>72%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '72%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>25%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '25%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>68%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '68%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>21%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '21%' }]}
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
