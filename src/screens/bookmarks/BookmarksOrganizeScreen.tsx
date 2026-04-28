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
    id: 'item-2376-1',
    title: 'Soft Saga 1',
    description: 'beautiful in experience tap dark every pixel or curated every A or experience dark. that browsing on in forever every browsing A while private haptics on A experience modes long remaining light. curated pixel in forever alive designed long for while and tap press',
    icon: 'cart',
    gradient: 'neon',
    tone: 'danger',
    meta: '41 mins ago',
    stat1: 528,
    stat2: 1,
    stat3: '4.4',
    verb: 'Shared',
  },
  {
    id: 'item-2376-2',
    title: 'Frosted Lens 2',
    description: 'in experience tap dark every pixel or curated every A or experience dark with. on in forever every browsing A while private haptics on A experience modes long remaining light modes light. forever alive designed long for while and tap press on considered fast',
    icon: 'pizza',
    gradient: 'aurora',
    tone: 'accent',
    meta: '42 mins ago',
    stat1: 541,
    stat2: 8,
    stat3: '1.3',
    verb: 'Shared',
  },
  {
    id: 'item-2376-3',
    title: 'Glassy Atlas 3',
    description: 'experience tap dark every pixel or curated every A or experience dark with and. forever every browsing A while private haptics on A experience modes long remaining light modes light pixel across. long for while and tap press on considered fast while tap A',
    icon: 'flash',
    gradient: 'candy',
    tone: 'accent',
    meta: '43 mins ago',
    stat1: 554,
    stat2: 15,
    stat3: '3.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2376-4',
    title: 'Lush Compass 4',
    description: 'tap dark every pixel or curated every A or experience dark with and experience. browsing A while private haptics on A experience modes long remaining light modes light pixel across experience press. and tap press on considered fast while tap A every modes fluid',
    icon: 'paw',
    gradient: 'candy',
    tone: 'success',
    meta: '44 mins ago',
    stat1: 567,
    stat2: 22,
    stat3: '0.1',
    verb: 'Saved',
  },
  {
    id: 'item-2376-5',
    title: 'Snappy Quest 5',
    description: 'dark every pixel or curated every A or experience dark with and experience browsing. while private haptics on A experience modes long remaining light modes light pixel across experience press experience dark. on considered fast while tap A every modes fluid for experience and',
    icon: 'gift',
    gradient: 'sunset',
    tone: 'info',
    meta: '45 mins ago',
    stat1: 580,
    stat2: 29,
    stat3: '2.0',
    verb: 'Opened',
  },
  {
    id: 'item-2376-6',
    title: 'Polished Atlas 6',
    description: 'every pixel or curated every A or experience dark with and experience browsing dark. haptics on A experience modes long remaining light modes light pixel across experience press experience dark every beautiful. while tap A every modes fluid for experience and remaining press pixel',
    icon: 'analytics',
    gradient: 'forest',
    tone: 'primary',
    meta: '46 mins ago',
    stat1: 593,
    stat2: 36,
    stat3: '3.9',
    verb: 'Shared',
  },
  {
    id: 'item-2376-7',
    title: 'Lush Echo 7',
    description: 'pixel or curated every A or experience dark with and experience browsing dark light. A experience modes long remaining light modes light pixel across experience press experience dark every beautiful and and. every modes fluid for experience and remaining press pixel private and in',
    icon: 'eye',
    gradient: 'brand',
    tone: 'accent',
    meta: '47 mins ago',
    stat1: 606,
    stat2: 43,
    stat3: '0.8',
    verb: 'Searched',
  },
  {
    id: 'item-2376-8',
    title: 'Brisk Lens 8',
    description: 'or curated every A or experience dark with and experience browsing dark light pixel. modes long remaining light modes light pixel across experience press experience dark every beautiful and and haptics experience. for experience and remaining press pixel private and in every and dark',
    icon: 'speedometer',
    gradient: 'candy',
    tone: 'warning',
    meta: '48 mins ago',
    stat1: 619,
    stat2: 50,
    stat3: '2.7',
    verb: 'Archived',
  },
  {
    id: 'item-2376-9',
    title: 'Glassy Tapestry 9',
    description: 'curated every A or experience dark with and experience browsing dark light pixel every. remaining light modes light pixel across experience press experience dark every beautiful and and haptics experience long on. remaining press pixel private and in every and dark modes press haptics',
    icon: 'sparkles',
    gradient: 'ocean',
    tone: 'danger',
    meta: '49 mins ago',
    stat1: 632,
    stat2: 57,
    stat3: '4.6',
    verb: 'Read',
  },
  {
    id: 'item-2376-10',
    title: 'Subtle Forge 10',
    description: 'every A or experience dark with and experience browsing dark light pixel every fast. modes light pixel across experience press experience dark every beautiful and and haptics experience long on and that. private and in every and dark modes press haptics across curated haptics',
    icon: 'pricetag',
    gradient: 'neon',
    tone: 'success',
    meta: '50 mins ago',
    stat1: 645,
    stat2: 64,
    stat3: '1.5',
    verb: 'Archived',
  },
  {
    id: 'item-2376-11',
    title: 'Silky Stream 11',
    description: 'A or experience dark with and experience browsing dark light pixel every fast on. pixel across experience press experience dark every beautiful and and haptics experience long on and that or fast. every and dark modes press haptics across curated haptics for designed across',
    icon: 'flag',
    gradient: 'amber',
    tone: 'danger',
    meta: '51 mins ago',
    stat1: 658,
    stat2: 71,
    stat3: '3.4',
    verb: 'Searched',
  },
  {
    id: 'item-2376-12',
    title: 'Crisp Atlas 12',
    description: 'or experience dark with and experience browsing dark light pixel every fast on gestures. experience press experience dark every beautiful and and haptics experience long on and that or fast gestures gestures. modes press haptics across curated haptics for designed across while A tap',
    icon: 'pulse',
    gradient: 'neon',
    tone: 'warning',
    meta: '52 mins ago',
    stat1: 671,
    stat2: 78,
    stat3: '0.3',
    verb: 'Translated',
  },
  {
    id: 'item-2376-13',
    title: 'Lush Aurora 13',
    description: 'experience dark with and experience browsing dark light pixel every fast on gestures alive. experience dark every beautiful and and haptics experience long on and that or fast gestures gestures considered and. across curated haptics for designed across while A tap while that haptics',
    icon: 'paw',
    gradient: 'ocean',
    tone: 'primary',
    meta: '53 mins ago',
    stat1: 684,
    stat2: 85,
    stat3: '2.2',
    verb: 'Archived',
  },
  {
    id: 'item-2376-14',
    title: 'Sleek Echo 14',
    description: 'dark with and experience browsing dark light pixel every fast on gestures alive press. every beautiful and and haptics experience long on and that or fast gestures gestures considered and beautiful in. for designed across while A tap while that haptics A dark pixel',
    icon: 'flame',
    gradient: 'midnight',
    tone: 'danger',
    meta: '54 mins ago',
    stat1: 697,
    stat2: 92,
    stat3: '4.1',
    verb: 'Read',
  },
  {
    id: 'item-2376-15',
    title: 'Brisk Studio 15',
    description: 'with and experience browsing dark light pixel every fast on gestures alive press gestures. and and haptics experience long on and that or fast gestures gestures considered and beautiful in and alive. while A tap while that haptics A dark pixel or and and',
    icon: 'flame',
    gradient: 'neon',
    tone: 'success',
    meta: '55 mins ago',
    stat1: 710,
    stat2: 99,
    stat3: '1.0',
    verb: 'Shared',
  },
  {
    id: 'item-2376-16',
    title: 'Vibrant Saga 16',
    description: 'and experience browsing dark light pixel every fast on gestures alive press gestures tap. haptics experience long on and that or fast gestures gestures considered and beautiful in and alive and curated. while that haptics A dark pixel or and and and browsing A',
    icon: 'heart',
    gradient: 'amber',
    tone: 'accent',
    meta: '56 mins ago',
    stat1: 723,
    stat2: 7,
    stat3: '2.9',
    verb: 'Visited',
  },
  {
    id: 'item-2376-17',
    title: 'Frosted Echo 17',
    description: 'experience browsing dark light pixel every fast on gestures alive press gestures tap on. long on and that or fast gestures gestures considered and beautiful in and alive and curated browsing while. A dark pixel or and and and browsing A long experience in',
    icon: 'gift',
    gradient: 'candy',
    tone: 'danger',
    meta: '57 mins ago',
    stat1: 736,
    stat2: 14,
    stat3: '4.8',
    verb: 'Followed',
  },
  {
    id: 'item-2376-18',
    title: 'Brisk Loom 18',
    description: 'browsing dark light pixel every fast on gestures alive press gestures tap on gestures. and that or fast gestures gestures considered and beautiful in and alive and curated browsing while alive on. or and and and browsing A long experience in A feel considered',
    icon: 'heart',
    gradient: 'aurora',
    tone: 'accent',
    meta: '58 mins ago',
    stat1: 749,
    stat2: 21,
    stat3: '1.7',
    verb: 'Searched',
  },
  {
    id: 'item-2376-19',
    title: 'Punchy Pulse 19',
    description: 'dark light pixel every fast on gestures alive press gestures tap on gestures with. or fast gestures gestures considered and beautiful in and alive and curated browsing while alive on curated on. and browsing A long experience in A feel considered tap feel light',
    icon: 'compass',
    gradient: 'fire',
    tone: 'warning',
    meta: '59 mins ago',
    stat1: 762,
    stat2: 28,
    stat3: '3.6',
    verb: 'Pinned',
  },
  {
    id: 'item-2376-20',
    title: 'Elite Aurora 20',
    description: 'light pixel every fast on gestures alive press gestures tap on gestures with private. gestures gestures considered and beautiful in and alive and curated browsing while alive on curated on long while. long experience in A feel considered tap feel light feel and across',
    icon: 'trophy',
    gradient: 'ocean',
    tone: 'warning',
    meta: '60 mins ago',
    stat1: 775,
    stat2: 35,
    stat3: '0.5',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2376-21',
    title: 'Sleek Spark 21',
    description: 'pixel every fast on gestures alive press gestures tap on gestures with private alive. considered and beautiful in and alive and curated browsing while alive on curated on long while remaining forever. A feel considered tap feel light feel and across fluid A designed',
    icon: 'star',
    gradient: 'cosmic',
    tone: 'success',
    meta: '61 mins ago',
    stat1: 788,
    stat2: 42,
    stat3: '2.4',
    verb: 'Read',
  },
  {
    id: 'item-2376-22',
    title: 'Soft Halo 22',
    description: 'every fast on gestures alive press gestures tap on gestures with private alive fluid. beautiful in and alive and curated browsing while alive on curated on long while remaining forever remaining pixel. tap feel light feel and across fluid A designed haptics with in',
    icon: 'heart',
    gradient: 'sunset',
    tone: 'success',
    meta: '62 mins ago',
    stat1: 801,
    stat2: 49,
    stat3: '4.3',
    verb: 'Pinned',
  },
  {
    id: 'item-2376-23',
    title: 'Buttery Lens 23',
    description: 'fast on gestures alive press gestures tap on gestures with private alive fluid with. and alive and curated browsing while alive on curated on long while remaining forever remaining pixel fluid alive. feel and across fluid A designed haptics with in for across alive',
    icon: 'analytics',
    gradient: 'amber',
    tone: 'warning',
    meta: '63 mins ago',
    stat1: 814,
    stat2: 56,
    stat3: '1.2',
    verb: 'Saved',
  },
  {
    id: 'item-2376-24',
    title: 'Glassy Quest 24',
    description: 'on gestures alive press gestures tap on gestures with private alive fluid with dark. and curated browsing while alive on curated on long while remaining forever remaining pixel fluid alive press modes. fluid A designed haptics with in for across alive dark haptics gestures',
    icon: 'trophy',
    gradient: 'cosmic',
    tone: 'info',
    meta: '64 mins ago',
    stat1: 827,
    stat2: 63,
    stat3: '3.1',
    verb: 'Searched',
  },
  {
    id: 'item-2376-25',
    title: 'Polished Loom 25',
    description: 'gestures alive press gestures tap on gestures with private alive fluid with dark that. browsing while alive on curated on long while remaining forever remaining pixel fluid alive press modes that forever. haptics with in for across alive dark haptics gestures private and in',
    icon: 'bookmark',
    gradient: 'forest',
    tone: 'warning',
    meta: '65 mins ago',
    stat1: 840,
    stat2: 70,
    stat3: '0.0',
    verb: 'Pinned',
  },
  {
    id: 'item-2376-26',
    title: 'Punchy Lens 26',
    description: 'alive press gestures tap on gestures with private alive fluid with dark that forever. alive on curated on long while remaining forever remaining pixel fluid alive press modes that forever alive pixel. for across alive dark haptics gestures private and in or across alive',
    icon: 'cart',
    gradient: 'ocean',
    tone: 'warning',
    meta: '66 mins ago',
    stat1: 853,
    stat2: 77,
    stat3: '1.9',
    verb: 'Read',
  },
  {
    id: 'item-2376-27',
    title: 'Glassy Drift 27',
    description: 'press gestures tap on gestures with private alive fluid with dark that forever and. curated on long while remaining forever remaining pixel fluid alive press modes that forever alive pixel light modes. dark haptics gestures private and in or across alive private fast every',
    icon: 'cloud',
    gradient: 'cosmic',
    tone: 'success',
    meta: '67 mins ago',
    stat1: 866,
    stat2: 84,
    stat3: '3.8',
    verb: 'Highlighted',
  },
  {
    id: 'item-2376-28',
    title: 'Dreamy Codex 28',
    description: 'gestures tap on gestures with private alive fluid with dark that forever and that. long while remaining forever remaining pixel fluid alive press modes that forever alive pixel light modes for with. private and in or across alive private fast every haptics and and',
    icon: 'globe',
    gradient: 'amber',
    tone: 'info',
    meta: '68 mins ago',
    stat1: 879,
    stat2: 91,
    stat3: '0.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2376-29',
    title: 'Cosmic Beacon 29',
    description: 'tap on gestures with private alive fluid with dark that forever and that curated. remaining forever remaining pixel fluid alive press modes that forever alive pixel light modes for with considered remaining. or across alive private fast every haptics and and curated private forever',
    icon: 'heart',
    gradient: 'pastel',
    tone: 'success',
    meta: '69 mins ago',
    stat1: 892,
    stat2: 98,
    stat3: '2.6',
    verb: 'Shared',
  },
  {
    id: 'item-2376-30',
    title: 'Velvet Spark 30',
    description: 'on gestures with private alive fluid with dark that forever and that curated every. remaining pixel fluid alive press modes that forever alive pixel light modes for with considered remaining and or. private fast every haptics and and curated private forever press experience with',
    icon: 'bookmark',
    gradient: 'sunset',
    tone: 'accent',
    meta: '70 mins ago',
    stat1: 905,
    stat2: 6,
    stat3: '4.5',
    verb: 'Read',
  },
  {
    id: 'item-2376-31',
    title: 'Soft Codex 31',
    description: 'gestures with private alive fluid with dark that forever and that curated every and. fluid alive press modes that forever alive pixel light modes for with considered remaining and or fluid curated. haptics and and curated private forever press experience with alive with and',
    icon: 'eye',
    gradient: 'candy',
    tone: 'success',
    meta: '71 mins ago',
    stat1: 918,
    stat2: 13,
    stat3: '1.4',
    verb: 'Archived',
  },
  {
    id: 'item-2376-32',
    title: 'Cosmic Quest 32',
    description: 'with private alive fluid with dark that forever and that curated every and in. press modes that forever alive pixel light modes for with considered remaining and or fluid curated gestures browsing. curated private forever press experience with alive with and tap every and',
    icon: 'grid',
    gradient: 'amber',
    tone: 'danger',
    meta: '72 mins ago',
    stat1: 931,
    stat2: 20,
    stat3: '3.3',
    verb: 'Followed',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-40392-1',
    title: 'Elite Drift',
    subtitle: 'press on and haptics light designed curated in fast modes pixel forever and haptics. every in curated experience long for A pixel A dark and press press pixel fast press A with. in dark curated private gestures while feel A forever fast considered A',
    icon: 'pulse',
    gradient: 'midnight',
  },
  {
    id: 'section-40392-2',
    title: 'Deep Echo',
    subtitle: 'forever and haptics considered light dark fast press considered press and fast browsing that. haptics every and remaining haptics and gestures every while pixel with dark beautiful designed forever beautiful forever with. beautiful experience for dark private dark A remaining A long experience forever',
    icon: 'film',
    gradient: 'pastel',
  },
  {
    id: 'section-40392-3',
    title: 'Lush Mosaic',
    subtitle: 'fast browsing that pixel modes haptics and remaining and fluid long and A curated. or experience and beautiful or fluid considered and gestures light or long in dark in in that in. fluid with fluid gestures pixel designed on designed modes and and and',
    icon: 'medal',
    gradient: 'amber',
  },
  {
    id: 'section-40392-4',
    title: 'Cosmic Echo',
    subtitle: 'and A curated private beautiful tap and long light in curated in that curated. or every that gestures browsing remaining while curated light curated beautiful that and tap and and dark forever. tap alive feel for pixel feel designed fluid and light that feel',
    icon: 'pulse',
    gradient: 'candy',
  },
  {
    id: 'section-40392-5',
    title: 'Dreamy Echo',
    subtitle: 'in that curated haptics for on remaining long light fast experience across forever beautiful. gestures A pixel alive gestures and beautiful forever private alive across haptics modes remaining tap remaining modes in. alive dark gestures designed light feel designed and on haptics haptics or',
    icon: 'newspaper',
    gradient: 'aurora',
  },
  {
    id: 'section-40392-6',
    title: 'Frosted Quest',
    subtitle: 'across forever beautiful fast and in long beautiful dark while fluid and in long. pixel private for A every browsing with remaining feel across modes or designed every that that haptics browsing. modes remaining for press on remaining curated with long feel press haptics',
    icon: 'layers',
    gradient: 'fire',
  },
  {
    id: 'section-40392-7',
    title: 'Soft Saga',
    subtitle: 'and in long light long tap private alive or remaining while light or for. fluid every that haptics beautiful that A dark fluid long and every with and private curated experience for. browsing haptics across fast haptics private experience on every designed remaining forever',
    icon: 'image',
    gradient: 'cosmic',
  },
  {
    id: 'section-40392-8',
    title: 'Subtle Stream',
    subtitle: 'light or for beautiful considered modes browsing across in dark and private private remaining. alive and that designed forever on gestures and and that every that on fluid browsing remaining with beautiful. remaining fluid designed feel gestures or browsing every that dark designed press',
    icon: 'flame',
    gradient: 'neon',
  },
  {
    id: 'section-40392-9',
    title: 'Vibrant Studio',
    subtitle: 'private private remaining on A feel light feel pixel pixel modes gestures remaining tap. on gestures with press remaining alive in remaining and feel remaining dark while experience fluid fluid pixel considered. A browsing alive remaining browsing tap considered tap on haptics for light',
    icon: 'newspaper',
    gradient: 'neon',
  },
  {
    id: 'section-40392-10',
    title: 'Glassy Aurora',
    subtitle: 'gestures remaining tap and modes and fast browsing or dark while on every every. that with and press private and in light or press alive in across in alive while pixel feel. while fast fluid dark every fast remaining browsing designed and remaining while',
    icon: 'compass',
    gradient: 'candy',
  },
  {
    id: 'section-40392-11',
    title: 'Premium Compass',
    subtitle: 'on every every forever in fluid with and across on that experience with remaining. experience and tap gestures and A designed pixel haptics forever experience fast for browsing modes forever feel every. fast light alive alive tap browsing considered designed every gestures remaining feel',
    icon: 'trophy',
    gradient: 'neon',
  },
  {
    id: 'section-40392-12',
    title: 'Brisk Compass',
    subtitle: 'experience with remaining with A considered A long A tap across for on across. every and pixel or press and and that curated remaining beautiful and or tap in and haptics designed. on every A or in and beautiful for tap haptics every fluid',
    icon: 'gift',
    gradient: 'ocean',
  },
  {
    id: 'section-40392-13',
    title: 'Frosted Tapestry',
    subtitle: 'for on across press private forever in haptics fast haptics press and on fast. feel feel experience or on gestures experience tap pixel long fluid across and tap dark while every browsing. while haptics gestures beautiful gestures on or fluid browsing private curated light',
    icon: 'cafe',
    gradient: 'forest',
  },
  {
    id: 'section-40392-14',
    title: 'Sleek Mosaic',
    subtitle: 'and on fast beautiful pixel that with modes every beautiful on beautiful alive modes. light feel experience experience remaining beautiful considered for long remaining press for every feel that in considered every. that designed while on private dark long fast fluid every gestures in',
    icon: 'planet',
    gradient: 'pastel',
  },
];

const HERO_TITLE = 'Organize';
const HERO_SUBTITLE = 'Multi-select, move, delete or pin.';
const FOOTER_TITLE = 'Keep going with Organize';
const FOOTER_BODY = 'curated pixel in forever alive designed long for while and tap press on considered. modes pixel in that light and and every alive remaining curated every and with fluid pixel gestures and. with tap light fast or on beautiful for haptics with light fluid';

export const BookmarksOrganizeScreen: React.FC = () => {
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
      variant="cosmic"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Organize"
        subtitle="Multi-select, move, delete or pin."
        showBack={true}
        rightIcon="options"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="cosmic"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>23%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '23%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Brisk Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>66%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '66%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>19%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '19%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>62%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '62%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>15%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '15%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>58%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '58%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>11%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '11%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>54%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '54%' }]}
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
