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
    id: 'item-1648-1',
    title: 'Glassy Insight 1',
    description: 'press tap while remaining on in experience beautiful and and and forever tap every. A light alive designed for gestures and pixel forever or designed fast forever and fast private considered A. private experience dark light fluid light pixel beautiful or and designed or',
    icon: 'flame',
    gradient: 'ocean',
    tone: 'danger',
    meta: '33 mins ago',
    stat1: 864,
    stat2: 53,
    stat3: '1.2',
    verb: 'Searched',
  },
  {
    id: 'item-1648-2',
    title: 'Premium Quest 2',
    description: 'tap while remaining on in experience beautiful and and and forever tap every beautiful. alive designed for gestures and pixel forever or designed fast forever and fast private considered A every and. light fluid light pixel beautiful or and designed or haptics and beautiful',
    icon: 'bookmark',
    gradient: 'aurora',
    tone: 'warning',
    meta: '34 mins ago',
    stat1: 877,
    stat2: 60,
    stat3: '3.1',
    verb: 'Opened',
  },
  {
    id: 'item-1648-3',
    title: 'Polished Studio 3',
    description: 'while remaining on in experience beautiful and and and forever tap every beautiful curated. for gestures and pixel forever or designed fast forever and fast private considered A every and long private. pixel beautiful or and designed or haptics and beautiful press across every',
    icon: 'cloud',
    gradient: 'ocean',
    tone: 'primary',
    meta: '35 mins ago',
    stat1: 890,
    stat2: 67,
    stat3: '0.0',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1648-4',
    title: 'Vibrant Compass 4',
    description: 'remaining on in experience beautiful and and and forever tap every beautiful curated gestures. and pixel forever or designed fast forever and fast private considered A every and long private every beautiful. and designed or haptics and beautiful press across every and pixel every',
    icon: 'heart',
    gradient: 'brand',
    tone: 'success',
    meta: '36 mins ago',
    stat1: 903,
    stat2: 74,
    stat3: '1.9',
    verb: 'Archived',
  },
  {
    id: 'item-1648-5',
    title: 'Snappy Stream 5',
    description: 'on in experience beautiful and and and forever tap every beautiful curated gestures pixel. forever or designed fast forever and fast private considered A every and long private every beautiful haptics press. haptics and beautiful press across every and pixel every designed private private',
    icon: 'grid',
    gradient: 'sunset',
    tone: 'danger',
    meta: '37 mins ago',
    stat1: 916,
    stat2: 81,
    stat3: '3.8',
    verb: 'Archived',
  },
  {
    id: 'item-1648-6',
    title: 'Crisp Lens 6',
    description: 'in experience beautiful and and and forever tap every beautiful curated gestures pixel and. designed fast forever and fast private considered A every and long private every beautiful haptics press haptics private. press across every and pixel every designed private private fluid light considered',
    icon: 'musical-notes',
    gradient: 'neon',
    tone: 'danger',
    meta: '38 mins ago',
    stat1: 929,
    stat2: 88,
    stat3: '0.7',
    verb: 'Followed',
  },
  {
    id: 'item-1648-7',
    title: 'Glassy Atlas 7',
    description: 'experience beautiful and and and forever tap every beautiful curated gestures pixel and alive. forever and fast private considered A every and long private every beautiful haptics press haptics private fast curated. and pixel every designed private private fluid light considered long alive on',
    icon: 'planet',
    gradient: 'neon',
    tone: 'accent',
    meta: '39 mins ago',
    stat1: 942,
    stat2: 95,
    stat3: '2.6',
    verb: 'Saved',
  },
  {
    id: 'item-1648-8',
    title: 'Lush Pulse 8',
    description: 'beautiful and and and forever tap every beautiful curated gestures pixel and alive and. fast private considered A every and long private every beautiful haptics press haptics private fast curated for designed. designed private private fluid light considered long alive on forever or that',
    icon: 'film',
    gradient: 'fire',
    tone: 'info',
    meta: '40 mins ago',
    stat1: 955,
    stat2: 3,
    stat3: '4.5',
    verb: 'Visited',
  },
  {
    id: 'item-1648-9',
    title: 'Elite Forge 9',
    description: 'and and and forever tap every beautiful curated gestures pixel and alive and haptics. considered A every and long private every beautiful haptics press haptics private fast curated for designed beautiful press. fluid light considered long alive on forever or that tap tap curated',
    icon: 'heart',
    gradient: 'forest',
    tone: 'danger',
    meta: '41 mins ago',
    stat1: 968,
    stat2: 10,
    stat3: '1.4',
    verb: 'Opened',
  },
  {
    id: 'item-1648-10',
    title: 'Silky Aurora 10',
    description: 'and and forever tap every beautiful curated gestures pixel and alive and haptics that. every and long private every beautiful haptics press haptics private fast curated for designed beautiful press with designed. long alive on forever or that tap tap curated while or dark',
    icon: 'gift',
    gradient: 'aurora',
    tone: 'primary',
    meta: '42 mins ago',
    stat1: 981,
    stat2: 17,
    stat3: '3.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1648-11',
    title: 'Sleek Beacon 11',
    description: 'and forever tap every beautiful curated gestures pixel and alive and haptics that A. long private every beautiful haptics press haptics private fast curated for designed beautiful press with designed every tap. forever or that tap tap curated while or dark dark tap fast',
    icon: 'star',
    gradient: 'brand',
    tone: 'success',
    meta: '43 mins ago',
    stat1: 994,
    stat2: 24,
    stat3: '0.2',
    verb: 'Pinned',
  },
  {
    id: 'item-1648-12',
    title: 'Velvet Aurora 12',
    description: 'forever tap every beautiful curated gestures pixel and alive and haptics that A long. every beautiful haptics press haptics private fast curated for designed beautiful press with designed every tap forever on. tap tap curated while or dark dark tap fast while considered curated',
    icon: 'medal',
    gradient: 'sunset',
    tone: 'warning',
    meta: '44 mins ago',
    stat1: 27,
    stat2: 31,
    stat3: '2.1',
    verb: 'Shared',
  },
  {
    id: 'item-1648-13',
    title: 'Sleek Drift 13',
    description: 'tap every beautiful curated gestures pixel and alive and haptics that A long fast. haptics press haptics private fast curated for designed beautiful press with designed every tap forever on designed considered. while or dark dark tap fast while considered curated across alive A',
    icon: 'analytics',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '45 mins ago',
    stat1: 40,
    stat2: 38,
    stat3: '4.0',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1648-14',
    title: 'Dreamy Atlas 14',
    description: 'every beautiful curated gestures pixel and alive and haptics that A long fast press. haptics private fast curated for designed beautiful press with designed every tap forever on designed considered alive dark. dark tap fast while considered curated across alive A private on A',
    icon: 'bookmark',
    gradient: 'candy',
    tone: 'success',
    meta: '46 mins ago',
    stat1: 53,
    stat2: 45,
    stat3: '0.9',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1648-15',
    title: 'Lush Tapestry 15',
    description: 'beautiful curated gestures pixel and alive and haptics that A long fast press feel. fast curated for designed beautiful press with designed every tap forever on designed considered alive dark remaining feel. while considered curated across alive A private on A across in while',
    icon: 'newspaper',
    gradient: 'sunset',
    tone: 'success',
    meta: '47 mins ago',
    stat1: 66,
    stat2: 52,
    stat3: '2.8',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1648-16',
    title: 'Subtle Quest 16',
    description: 'curated gestures pixel and alive and haptics that A long fast press feel dark. for designed beautiful press with designed every tap forever on designed considered alive dark remaining feel dark gestures. across alive A private on A across in while light experience press',
    icon: 'flag',
    gradient: 'sunset',
    tone: 'success',
    meta: '48 mins ago',
    stat1: 79,
    stat2: 59,
    stat3: '4.7',
    verb: 'Highlighted',
  },
  {
    id: 'item-1648-17',
    title: 'Polished Forge 17',
    description: 'gestures pixel and alive and haptics that A long fast press feel dark light. beautiful press with designed every tap forever on designed considered alive dark remaining feel dark gestures and on. private on A across in while light experience press while browsing browsing',
    icon: 'medal',
    gradient: 'sunset',
    tone: 'info',
    meta: '49 mins ago',
    stat1: 92,
    stat2: 66,
    stat3: '1.6',
    verb: 'Followed',
  },
  {
    id: 'item-1648-18',
    title: 'Silky Pulse 18',
    description: 'pixel and alive and haptics that A long fast press feel dark light press. with designed every tap forever on designed considered alive dark remaining feel dark gestures and on beautiful haptics. across in while light experience press while browsing browsing every remaining dark',
    icon: 'flame',
    gradient: 'pastel',
    tone: 'accent',
    meta: '50 mins ago',
    stat1: 105,
    stat2: 73,
    stat3: '3.5',
    verb: 'Opened',
  },
  {
    id: 'item-1648-19',
    title: 'Elite Quest 19',
    description: 'and alive and haptics that A long fast press feel dark light press private. every tap forever on designed considered alive dark remaining feel dark gestures and on beautiful haptics remaining press. light experience press while browsing browsing every remaining dark for fast with',
    icon: 'cafe',
    gradient: 'fire',
    tone: 'primary',
    meta: '51 mins ago',
    stat1: 118,
    stat2: 80,
    stat3: '0.4',
    verb: 'Translated',
  },
  {
    id: 'item-1648-20',
    title: 'Polished Codex 20',
    description: 'alive and haptics that A long fast press feel dark light press private every. forever on designed considered alive dark remaining feel dark gestures and on beautiful haptics remaining press feel tap. while browsing browsing every remaining dark for fast with in every fast',
    icon: 'newspaper',
    gradient: 'brand',
    tone: 'primary',
    meta: '52 mins ago',
    stat1: 131,
    stat2: 87,
    stat3: '2.3',
    verb: 'Followed',
  },
  {
    id: 'item-1648-21',
    title: 'Cosmic Spark 21',
    description: 'and haptics that A long fast press feel dark light press private every fast. designed considered alive dark remaining feel dark gestures and on beautiful haptics remaining press feel tap browsing pixel. every remaining dark for fast with in every fast alive every alive',
    icon: 'school',
    gradient: 'midnight',
    tone: 'accent',
    meta: '53 mins ago',
    stat1: 144,
    stat2: 94,
    stat3: '4.2',
    verb: 'Read',
  },
  {
    id: 'item-1648-22',
    title: 'Soft Insight 22',
    description: 'haptics that A long fast press feel dark light press private every fast long. alive dark remaining feel dark gestures and on beautiful haptics remaining press feel tap browsing pixel with pixel. for fast with in every fast alive every alive remaining modes dark',
    icon: 'newspaper',
    gradient: 'fire',
    tone: 'success',
    meta: '54 mins ago',
    stat1: 157,
    stat2: 2,
    stat3: '1.1',
    verb: 'Opened',
  },
  {
    id: 'item-1648-23',
    title: 'Premium Codex 23',
    description: 'that A long fast press feel dark light press private every fast long gestures. remaining feel dark gestures and on beautiful haptics remaining press feel tap browsing pixel with pixel beautiful private. in every fast alive every alive remaining modes dark private and browsing',
    icon: 'image',
    gradient: 'amber',
    tone: 'primary',
    meta: '55 mins ago',
    stat1: 170,
    stat2: 9,
    stat3: '3.0',
    verb: 'Archived',
  },
  {
    id: 'item-1648-24',
    title: 'Cosmic Loom 24',
    description: 'A long fast press feel dark light press private every fast long gestures and. dark gestures and on beautiful haptics remaining press feel tap browsing pixel with pixel beautiful private while forever. alive every alive remaining modes dark private and browsing on fluid fast',
    icon: 'leaf',
    gradient: 'brand',
    tone: 'danger',
    meta: '56 mins ago',
    stat1: 183,
    stat2: 16,
    stat3: '4.9',
    verb: 'Read',
  },
  {
    id: 'item-1648-25',
    title: 'Punchy Loom 25',
    description: 'long fast press feel dark light press private every fast long gestures and for. and on beautiful haptics remaining press feel tap browsing pixel with pixel beautiful private while forever for with. remaining modes dark private and browsing on fluid fast considered press gestures',
    icon: 'flame',
    gradient: 'neon',
    tone: 'success',
    meta: '57 mins ago',
    stat1: 196,
    stat2: 23,
    stat3: '1.8',
    verb: 'Read',
  },
  {
    id: 'item-1648-26',
    title: 'Punchy Tapestry 26',
    description: 'fast press feel dark light press private every fast long gestures and for beautiful. beautiful haptics remaining press feel tap browsing pixel with pixel beautiful private while forever for with feel pixel. private and browsing on fluid fast considered press gestures browsing for fluid',
    icon: 'musical-notes',
    gradient: 'amber',
    tone: 'success',
    meta: '58 mins ago',
    stat1: 209,
    stat2: 30,
    stat3: '3.7',
    verb: 'Highlighted',
  },
  {
    id: 'item-1648-27',
    title: 'Subtle Quest 27',
    description: 'press feel dark light press private every fast long gestures and for beautiful designed. remaining press feel tap browsing pixel with pixel beautiful private while forever for with feel pixel with gestures. on fluid fast considered press gestures browsing for fluid fast dark that',
    icon: 'eye',
    gradient: 'amber',
    tone: 'info',
    meta: '59 mins ago',
    stat1: 222,
    stat2: 37,
    stat3: '0.6',
    verb: 'Visited',
  },
  {
    id: 'item-1648-28',
    title: 'Polished Spark 28',
    description: 'feel dark light press private every fast long gestures and for beautiful designed beautiful. feel tap browsing pixel with pixel beautiful private while forever for with feel pixel with gestures browsing beautiful. considered press gestures browsing for fluid fast dark that light light haptics',
    icon: 'cart',
    gradient: 'pastel',
    tone: 'danger',
    meta: '60 mins ago',
    stat1: 235,
    stat2: 44,
    stat3: '2.5',
    verb: 'Followed',
  },
  {
    id: 'item-1648-29',
    title: 'Soft Aurora 29',
    description: 'dark light press private every fast long gestures and for beautiful designed beautiful curated. browsing pixel with pixel beautiful private while forever for with feel pixel with gestures browsing beautiful with or. browsing for fluid fast dark that light light haptics press haptics across',
    icon: 'star',
    gradient: 'aurora',
    tone: 'accent',
    meta: '61 mins ago',
    stat1: 248,
    stat2: 51,
    stat3: '4.4',
    verb: 'Translated',
  },
  {
    id: 'item-1648-30',
    title: 'Sleek Saga 30',
    description: 'light press private every fast long gestures and for beautiful designed beautiful curated and. with pixel beautiful private while forever for with feel pixel with gestures browsing beautiful with or gestures light. fast dark that light light haptics press haptics across alive while that',
    icon: 'film',
    gradient: 'fire',
    tone: 'primary',
    meta: '62 mins ago',
    stat1: 261,
    stat2: 58,
    stat3: '1.3',
    verb: 'Pinned',
  },
  {
    id: 'item-1648-31',
    title: 'Frosted Loom 31',
    description: 'press private every fast long gestures and for beautiful designed beautiful curated and gestures. beautiful private while forever for with feel pixel with gestures browsing beautiful with or gestures light for long. light light haptics press haptics across alive while that light browsing dark',
    icon: 'lock-closed',
    gradient: 'midnight',
    tone: 'warning',
    meta: '63 mins ago',
    stat1: 274,
    stat2: 65,
    stat3: '3.2',
    verb: 'Archived',
  },
  {
    id: 'item-1648-32',
    title: 'Punchy Spark 32',
    description: 'private every fast long gestures and for beautiful designed beautiful curated and gestures modes. while forever for with feel pixel with gestures browsing beautiful with or gestures light for long A considered. press haptics across alive while that light browsing dark light experience for',
    icon: 'film',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '64 mins ago',
    stat1: 287,
    stat2: 72,
    stat3: '0.1',
    verb: 'Saved',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-28016-1',
    title: 'Brisk Lens',
    subtitle: 'considered remaining long across on gestures modes in considered gestures remaining considered browsing forever. tap curated considered long private press curated for browsing and light every and fluid every designed tap alive. fluid or light A modes considered in considered every every long beautiful',
    icon: 'grid',
    gradient: 'pastel',
  },
  {
    id: 'section-28016-2',
    title: 'Premium Stream',
    subtitle: 'considered browsing forever and and experience long A or and alive browsing and beautiful. while fast feel every light every long light or fluid and in long browsing fluid and or A. and tap press and alive forever haptics and experience long pixel tap',
    icon: 'leaf',
    gradient: 'cosmic',
  },
  {
    id: 'section-28016-3',
    title: 'Crisp Halo',
    subtitle: 'browsing and beautiful press tap modes A or or tap fluid for dark that. haptics on dark forever while forever tap fluid private experience while private A gestures fast across modes private. or across experience tap tap pixel every every private fast pixel dark',
    icon: 'musical-notes',
    gradient: 'sunset',
  },
  {
    id: 'section-28016-4',
    title: 'Cosmic Lens',
    subtitle: 'for dark that light and fast private A beautiful press fluid A haptics pixel. browsing alive while haptics long curated considered experience private fluid remaining and that on experience private considered experience. A forever forever designed and pixel feel considered A fast designed fluid',
    icon: 'paw',
    gradient: 'forest',
  },
  {
    id: 'section-28016-5',
    title: 'Snappy Studio',
    subtitle: 'A haptics pixel across dark private or and curated considered while on remaining and. forever every with and light designed tap tap tap that or in long remaining and modes and or. and remaining tap gestures for with press across on long every private',
    icon: 'shield',
    gradient: 'amber',
  },
  {
    id: 'section-28016-6',
    title: 'Buttery Quest',
    subtitle: 'on remaining and every alive fast beautiful every or that experience light dark curated. every and modes curated long A remaining every browsing beautiful designed curated press light feel modes feel and. for gestures forever while remaining private every fast in across gestures browsing',
    icon: 'film',
    gradient: 'ocean',
  },
  {
    id: 'section-28016-7',
    title: 'Snappy Lens',
    subtitle: 'light dark curated modes beautiful browsing feel press or browsing considered every curated with. or curated beautiful long or and gestures light and fluid long browsing or fluid with press fluid and. and while alive forever or forever on while modes modes in and',
    icon: 'gift',
    gradient: 'fire',
  },
  {
    id: 'section-28016-8',
    title: 'Frosted Tapestry',
    subtitle: 'every curated with private for dark remaining browsing A fluid with fast private gestures. fluid while long pixel considered beautiful that light fluid across private for that tap modes across with dark. considered and modes tap that experience press or beautiful every on and',
    icon: 'rocket',
    gradient: 'midnight',
  },
  {
    id: 'section-28016-9',
    title: 'Brisk Forge',
    subtitle: 'fast private gestures considered pixel and beautiful light considered and considered feel every and. fast for alive light haptics or dark that on and long dark designed and or in while and. haptics alive modes experience that alive forever long haptics alive press haptics',
    icon: 'medal',
    gradient: 'candy',
  },
  {
    id: 'section-28016-10',
    title: 'Brisk Insight',
    subtitle: 'feel every and gestures tap private tap alive designed dark long every long while. experience light alive every designed fluid A haptics while across experience long every forever and on for beautiful. in pixel press light tap press every or on alive A in',
    icon: 'cart',
    gradient: 'sunset',
  },
  {
    id: 'section-28016-11',
    title: 'Vibrant Tapestry',
    subtitle: 'every long while feel with designed on in and tap every curated private and. haptics fast alive long browsing light fast beautiful while fluid alive modes or browsing designed and A alive. with dark while for gestures or beautiful every private feel with that',
    icon: 'sparkles',
    gradient: 'neon',
  },
  {
    id: 'section-28016-12',
    title: 'Snappy Stream',
    subtitle: 'curated private and considered or while browsing dark across in designed curated or light. on while while for or tap pixel while long every haptics with designed feel browsing in A and. alive experience browsing beautiful gestures fast for for that feel haptics haptics',
    icon: 'image',
    gradient: 'forest',
  },
  {
    id: 'section-28016-13',
    title: 'Subtle Codex',
    subtitle: 'curated or light fast modes or fast for across that dark remaining every every. and or in while designed designed remaining across and private dark that in alive A long haptics feel. light across that remaining A fast fluid pixel modes and long dark',
    icon: 'pulse',
    gradient: 'aurora',
  },
  {
    id: 'section-28016-14',
    title: 'Brisk Aurora',
    subtitle: 'remaining every every curated experience across pixel modes fluid or pixel private private haptics. A press fluid modes across beautiful dark remaining modes pixel browsing gestures alive alive in curated and remaining. tap light press dark haptics across on beautiful forever fast fast browsing',
    icon: 'paw',
    gradient: 'fire',
  },
];

const HERO_TITLE = 'Day';
const HERO_SUBTITLE = 'Sessions for the selected day.';
const FOOTER_TITLE = 'Keep going with Day';
const FOOTER_BODY = 'private experience dark light fluid light pixel beautiful or and designed or haptics and. fluid designed pixel browsing on light pixel and that across press curated gestures across designed forever on in. alive press gestures for browsing that beautiful experience and on and with';

export const HistoryDayScreen: React.FC = () => {
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
      (navigation as any).navigate('HistoryDay', { dayKey: 'today' });
    },
    [navigation],
  );
  const goAlt = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('HistoryEntry', { entryId: 'h-1' });
    },
    [navigation],
  );
  const goDeep = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('HistoryEntryOptions', { entryId: 'h-1' });
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
        title="Day"
        subtitle="Sessions for the selected day."
        showBack={true}
        rightIcon="calendar"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="aurora"
        badge="L2"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>9%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '9%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Brisk Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>52%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '52%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>5%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '5%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>48%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '48%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>91%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '91%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>44%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '44%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>87%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '87%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>40%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '40%' }]}
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
