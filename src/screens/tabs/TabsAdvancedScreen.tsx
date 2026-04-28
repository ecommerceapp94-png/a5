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
    id: 'item-1792-1',
    title: 'Sleek Aurora 1',
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
    id: 'item-1792-2',
    title: 'Sleek Aurora 2',
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
    id: 'item-1792-3',
    title: 'Sleek Saga 3',
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
    id: 'item-1792-4',
    title: 'Frosted Stream 4',
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
    id: 'item-1792-5',
    title: 'Crisp Insight 5',
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
    id: 'item-1792-6',
    title: 'Premium Saga 6',
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
    id: 'item-1792-7',
    title: 'Frosted Stream 7',
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
    id: 'item-1792-8',
    title: 'Crisp Tapestry 8',
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
    id: 'item-1792-9',
    title: 'Subtle Drift 9',
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
    id: 'item-1792-10',
    title: 'Dreamy Pulse 10',
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
    id: 'item-1792-11',
    title: 'Elite Codex 11',
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
    id: 'item-1792-12',
    title: 'Cosmic Lens 12',
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
    id: 'item-1792-13',
    title: 'Glassy Spark 13',
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
    id: 'item-1792-14',
    title: 'Soft Quest 14',
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
    id: 'item-1792-15',
    title: 'Polished Studio 15',
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
    id: 'item-1792-16',
    title: 'Vibrant Mosaic 16',
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
    id: 'item-1792-17',
    title: 'Deep Halo 17',
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
    id: 'item-1792-18',
    title: 'Buttery Halo 18',
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
    id: 'item-1792-19',
    title: 'Buttery Stream 19',
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
    id: 'item-1792-20',
    title: 'Crisp Quest 20',
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
    id: 'item-1792-21',
    title: 'Polished Tapestry 21',
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
    id: 'item-1792-22',
    title: 'Subtle Quest 22',
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
    id: 'item-1792-23',
    title: 'Polished Loom 23',
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
    id: 'item-1792-24',
    title: 'Punchy Pulse 24',
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
    id: 'item-1792-25',
    title: 'Elite Loom 25',
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
  {
    id: 'item-1792-26',
    title: 'Punchy Quest 26',
    description: 'remaining press dark every and tap designed light fluid private beautiful designed on light. and and light press fast designed or in designed press tap remaining alive and fluid every long considered. haptics tap fluid while light with for browsing with with browsing in',
    icon: 'film',
    gradient: 'cosmic',
    tone: 'info',
    meta: '22 mins ago',
    stat1: 121,
    stat2: 48,
    stat3: '2.3',
    verb: 'Visited',
  },
  {
    id: 'item-1792-27',
    title: 'Polished Compass 27',
    description: 'press dark every and tap designed light fluid private beautiful designed on light modes. light press fast designed or in designed press tap remaining alive and fluid every long considered dark beautiful. while light with for browsing with with browsing in press remaining every',
    icon: 'pricetag',
    gradient: 'forest',
    tone: 'danger',
    meta: '23 mins ago',
    stat1: 134,
    stat2: 55,
    stat3: '4.2',
    verb: 'Read',
  },
  {
    id: 'item-1792-28',
    title: 'Snappy Beacon 28',
    description: 'dark every and tap designed light fluid private beautiful designed on light modes or. fast designed or in designed press tap remaining alive and fluid every long considered dark beautiful and feel. for browsing with with browsing in press remaining every every every designed',
    icon: 'image',
    gradient: 'aurora',
    tone: 'success',
    meta: '24 mins ago',
    stat1: 147,
    stat2: 62,
    stat3: '1.1',
    verb: 'Shared',
  },
  {
    id: 'item-1792-29',
    title: 'Velvet Beacon 29',
    description: 'every and tap designed light fluid private beautiful designed on light modes or that. or in designed press tap remaining alive and fluid every long considered dark beautiful and feel beautiful curated. with browsing in press remaining every every every designed press curated every',
    icon: 'cloud',
    gradient: 'amber',
    tone: 'accent',
    meta: '25 mins ago',
    stat1: 160,
    stat2: 69,
    stat3: '3.0',
    verb: 'Highlighted',
  },
  {
    id: 'item-1792-30',
    title: 'Velvet Loom 30',
    description: 'and tap designed light fluid private beautiful designed on light modes or that modes. designed press tap remaining alive and fluid every long considered dark beautiful and feel beautiful curated designed tap. press remaining every every every designed press curated every modes modes alive',
    icon: 'grid',
    gradient: 'candy',
    tone: 'info',
    meta: '26 mins ago',
    stat1: 173,
    stat2: 76,
    stat3: '4.9',
    verb: 'Opened',
  },
  {
    id: 'item-1792-31',
    title: 'Punchy Aurora 31',
    description: 'tap designed light fluid private beautiful designed on light modes or that modes modes. tap remaining alive and fluid every long considered dark beautiful and feel beautiful curated designed tap feel press. every every designed press curated every modes modes alive and remaining designed',
    icon: 'leaf',
    gradient: 'pastel',
    tone: 'primary',
    meta: '27 mins ago',
    stat1: 186,
    stat2: 83,
    stat3: '1.8',
    verb: 'Visited',
  },
  {
    id: 'item-1792-32',
    title: 'Sleek Forge 32',
    description: 'designed light fluid private beautiful designed on light modes or that modes modes beautiful. alive and fluid every long considered dark beautiful and feel beautiful curated designed tap feel press that browsing. press curated every modes modes alive and remaining designed private press every',
    icon: 'pulse',
    gradient: 'brand',
    tone: 'danger',
    meta: '28 mins ago',
    stat1: 199,
    stat2: 90,
    stat3: '3.7',
    verb: 'Searched',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-30464-1',
    title: 'Lush Lens',
    subtitle: 'fast fluid light dark or fluid curated forever forever fast beautiful gestures experience considered. that considered every beautiful long every every private experience for while gestures A gestures tap beautiful designed fast. with pixel feel and or pixel and and with browsing haptics long',
    icon: 'paw',
    gradient: 'neon',
  },
  {
    id: 'section-30464-2',
    title: 'Brisk Atlas',
    subtitle: 'gestures experience considered that considered in curated experience while pixel beautiful for designed across. press designed designed press that haptics tap curated alive A A fluid designed considered dark long considered and. and on alive designed pixel and dark feel or pixel long that',
    icon: 'cloud',
    gradient: 'fire',
  },
  {
    id: 'section-30464-3',
    title: 'Punchy Pulse',
    subtitle: 'for designed across pixel with that designed feel feel or forever press every on. press dark light alive or or or press press browsing long considered long experience beautiful A haptics modes. A designed haptics designed alive designed every for considered that with while',
    icon: 'grid',
    gradient: 'candy',
  },
  {
    id: 'section-30464-4',
    title: 'Snappy Aurora',
    subtitle: 'press every on beautiful across pixel fluid experience gestures while that gestures modes modes. tap alive experience experience dark or remaining and considered or forever dark on feel pixel experience private fast. designed that beautiful long every remaining every browsing long forever in light',
    icon: 'trophy',
    gradient: 'candy',
  },
  {
    id: 'section-30464-5',
    title: 'Polished Atlas',
    subtitle: 'gestures modes modes long considered gestures feel remaining haptics fast for fluid that browsing. browsing haptics considered considered in fluid and experience across curated long pixel while or haptics considered across or. curated considered experience in in experience and and light dark alive fast',
    icon: 'sparkles',
    gradient: 'cosmic',
  },
  {
    id: 'section-30464-6',
    title: 'Velvet Insight',
    subtitle: 'fluid that browsing gestures A A with and that haptics on across remaining designed. every pixel considered haptics light while light designed A and forever alive browsing remaining browsing modes across feel. fast private forever and every gestures considered and tap every every every',
    icon: 'extension-puzzle',
    gradient: 'fire',
  },
  {
    id: 'section-30464-7',
    title: 'Glassy Mosaic',
    subtitle: 'across remaining designed designed for A private private every and gestures fluid every and. browsing and fluid every on remaining A gestures and while press fast experience while every every in on. on and press remaining with haptics experience forever feel with feel fluid',
    icon: 'grid',
    gradient: 'pastel',
  },
  {
    id: 'section-30464-8',
    title: 'Velvet Halo',
    subtitle: 'fluid every and and and every feel experience beautiful light pixel designed fluid alive. or remaining and for and feel gestures private and press designed private feel long fluid for or long. private alive every and and curated or while and private fluid and',
    icon: 'rocket',
    gradient: 'neon',
  },
  {
    id: 'section-30464-9',
    title: 'Soft Tapestry',
    subtitle: 'designed fluid alive every haptics remaining A while and with with or haptics beautiful. remaining light curated every press and alive fluid long considered considered alive light that gestures A designed across. long fluid that beautiful browsing press pixel dark fast experience or pixel',
    icon: 'pricetag',
    gradient: 'amber',
  },
  {
    id: 'section-30464-10',
    title: 'Elite Beacon',
    subtitle: 'or haptics beautiful pixel and modes tap for tap every and across or in. while pixel tap remaining browsing considered while dark with forever alive across every for light on press and. or long or while with while experience light press experience light beautiful',
    icon: 'cloud',
    gradient: 'amber',
  },
  {
    id: 'section-30464-11',
    title: 'Crisp Beacon',
    subtitle: 'across or in private that experience tap haptics while press for and considered on. feel feel gestures beautiful haptics haptics beautiful light across on for fluid dark pixel and that light modes. remaining remaining with on haptics alive forever browsing press in alive curated',
    icon: 'cart',
    gradient: 'aurora',
  },
  {
    id: 'section-30464-12',
    title: 'Buttery Tapestry',
    subtitle: 'and considered on light press beautiful beautiful modes or across modes with considered that. forever remaining gestures remaining in long across for feel light and browsing every long long and A in. and fluid while with for designed designed fluid on press and gestures',
    icon: 'planet',
    gradient: 'amber',
  },
  {
    id: 'section-30464-13',
    title: 'Premium Beacon',
    subtitle: 'with considered that long for feel modes and dark fluid and feel light with. every every while tap considered gestures dark press in press every for for designed press remaining designed light. forever private light light dark while light feel or haptics on while',
    icon: 'cloud',
    gradient: 'midnight',
  },
  {
    id: 'section-30464-14',
    title: 'Dreamy Saga',
    subtitle: 'feel light with with gestures or and or and and considered A every A. considered A for fluid designed while curated and forever with and pixel fluid beautiful browsing and forever fluid. feel with every that while for forever browsing while private gestures feel',
    icon: 'film',
    gradient: 'candy',
  },
];

const HERO_TITLE = 'Advanced';
const HERO_SUBTITLE = 'Power-user options for the active tab.';
const FOOTER_TITLE = 'Keep going with Advanced';
const FOOTER_BODY = 'pixel haptics on that and pixel A that long dark across feel browsing gestures. private while in alive browsing long alive every designed modes fast long while and long or and or. considered private A gestures for curated light on for alive alive with';

export const TabsAdvancedScreen: React.FC = () => {
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
      variant="midnight"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Advanced"
        subtitle="Power-user options for the active tab."
        showBack={true}
        rightIcon="options"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="midnight"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>81%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '81%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>34%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '34%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Compass</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Mosaic</Text>
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
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>73%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '73%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>26%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '26%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>69%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '69%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>22%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '22%' }]}
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
