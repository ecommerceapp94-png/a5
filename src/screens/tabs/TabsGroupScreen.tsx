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
    id: 'item-1527-1',
    title: 'Snappy Quest 1',
    description: 'for with alive feel curated remaining browsing designed A beautiful considered across and pixel. for alive fluid fluid long light browsing long with A modes press and curated considered haptics with haptics. forever tap that and A fluid private browsing for and remaining feel',
    icon: 'planet',
    gradient: 'sunset',
    tone: 'danger',
    meta: '92 mins ago',
    stat1: 271,
    stat2: 97,
    stat3: '1.3',
    verb: 'Translated',
  },
  {
    id: 'item-1527-2',
    title: 'Polished Beacon 2',
    description: 'with alive feel curated remaining browsing designed A beautiful considered across and pixel and. fluid fluid long light browsing long with A modes press and curated considered haptics with haptics every beautiful. and A fluid private browsing for and remaining feel A on fluid',
    icon: 'pricetag',
    gradient: 'neon',
    tone: 'primary',
    meta: '93 mins ago',
    stat1: 284,
    stat2: 5,
    stat3: '3.2',
    verb: 'Visited',
  },
  {
    id: 'item-1527-3',
    title: 'Velvet Quest 3',
    description: 'alive feel curated remaining browsing designed A beautiful considered across and pixel and gestures. long light browsing long with A modes press and curated considered haptics with haptics every beautiful gestures modes. private browsing for and remaining feel A on fluid or modes long',
    icon: 'flag',
    gradient: 'midnight',
    tone: 'danger',
    meta: '94 mins ago',
    stat1: 297,
    stat2: 12,
    stat3: '0.1',
    verb: 'Opened',
  },
  {
    id: 'item-1527-4',
    title: 'Polished Pulse 4',
    description: 'feel curated remaining browsing designed A beautiful considered across and pixel and gestures designed. browsing long with A modes press and curated considered haptics with haptics every beautiful gestures modes every and. and remaining feel A on fluid or modes long dark pixel alive',
    icon: 'cafe',
    gradient: 'aurora',
    tone: 'primary',
    meta: '5 mins ago',
    stat1: 310,
    stat2: 19,
    stat3: '2.0',
    verb: 'Opened',
  },
  {
    id: 'item-1527-5',
    title: 'Elite Stream 5',
    description: 'curated remaining browsing designed A beautiful considered across and pixel and gestures designed that. with A modes press and curated considered haptics with haptics every beautiful gestures modes every and across gestures. A on fluid or modes long dark pixel alive every A while',
    icon: 'newspaper',
    gradient: 'brand',
    tone: 'primary',
    meta: '6 mins ago',
    stat1: 323,
    stat2: 26,
    stat3: '3.9',
    verb: 'Searched',
  },
  {
    id: 'item-1527-6',
    title: 'Crisp Mosaic 6',
    description: 'remaining browsing designed A beautiful considered across and pixel and gestures designed that private. modes press and curated considered haptics with haptics every beautiful gestures modes every and across gestures press feel. or modes long dark pixel alive every A while remaining fast in',
    icon: 'cloud',
    gradient: 'brand',
    tone: 'warning',
    meta: '7 mins ago',
    stat1: 336,
    stat2: 33,
    stat3: '0.8',
    verb: 'Translated',
  },
  {
    id: 'item-1527-7',
    title: 'Deep Tapestry 7',
    description: 'browsing designed A beautiful considered across and pixel and gestures designed that private while. and curated considered haptics with haptics every beautiful gestures modes every and across gestures press feel A while. dark pixel alive every A while remaining fast in every A and',
    icon: 'flame',
    gradient: 'ocean',
    tone: 'primary',
    meta: '8 mins ago',
    stat1: 349,
    stat2: 40,
    stat3: '2.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1527-8',
    title: 'Subtle Beacon 8',
    description: 'designed A beautiful considered across and pixel and gestures designed that private while haptics. considered haptics with haptics every beautiful gestures modes every and across gestures press feel A while while tap. every A while remaining fast in every A and with in every',
    icon: 'grid',
    gradient: 'midnight',
    tone: 'success',
    meta: '9 mins ago',
    stat1: 362,
    stat2: 47,
    stat3: '4.6',
    verb: 'Shared',
  },
  {
    id: 'item-1527-9',
    title: 'Velvet Codex 9',
    description: 'A beautiful considered across and pixel and gestures designed that private while haptics long. with haptics every beautiful gestures modes every and across gestures press feel A while while tap fast for. remaining fast in every A and with in every that and designed',
    icon: 'school',
    gradient: 'sunset',
    tone: 'accent',
    meta: '10 mins ago',
    stat1: 375,
    stat2: 54,
    stat3: '1.5',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1527-10',
    title: 'Cosmic Studio 10',
    description: 'beautiful considered across and pixel and gestures designed that private while haptics long while. every beautiful gestures modes every and across gestures press feel A while while tap fast for every remaining. every A and with in every that and designed in and on',
    icon: 'globe',
    gradient: 'candy',
    tone: 'success',
    meta: '11 mins ago',
    stat1: 388,
    stat2: 61,
    stat3: '3.4',
    verb: 'Pinned',
  },
  {
    id: 'item-1527-11',
    title: 'Vibrant Quest 11',
    description: 'considered across and pixel and gestures designed that private while haptics long while press. gestures modes every and across gestures press feel A while while tap fast for every remaining long across. with in every that and designed in and on and designed across',
    icon: 'speedometer',
    gradient: 'sunset',
    tone: 'warning',
    meta: '12 mins ago',
    stat1: 401,
    stat2: 68,
    stat3: '0.3',
    verb: 'Visited',
  },
  {
    id: 'item-1527-12',
    title: 'Polished Forge 12',
    description: 'across and pixel and gestures designed that private while haptics long while press remaining. every and across gestures press feel A while while tap fast for every remaining long across for that. that and designed in and on and designed across private across pixel',
    icon: 'speedometer',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '13 mins ago',
    stat1: 414,
    stat2: 75,
    stat3: '2.2',
    verb: 'Followed',
  },
  {
    id: 'item-1527-13',
    title: 'Silky Forge 13',
    description: 'and pixel and gestures designed that private while haptics long while press remaining light. across gestures press feel A while while tap fast for every remaining long across for that press gestures. in and on and designed across private across pixel tap private with',
    icon: 'layers',
    gradient: 'aurora',
    tone: 'accent',
    meta: '14 mins ago',
    stat1: 427,
    stat2: 82,
    stat3: '4.1',
    verb: 'Highlighted',
  },
  {
    id: 'item-1527-14',
    title: 'Silky Lens 14',
    description: 'pixel and gestures designed that private while haptics long while press remaining light remaining. press feel A while while tap fast for every remaining long across for that press gestures experience for. and designed across private across pixel tap private with alive that considered',
    icon: 'book',
    gradient: 'fire',
    tone: 'info',
    meta: '15 mins ago',
    stat1: 440,
    stat2: 89,
    stat3: '1.0',
    verb: 'Pinned',
  },
  {
    id: 'item-1527-15',
    title: 'Glassy Loom 15',
    description: 'and gestures designed that private while haptics long while press remaining light remaining tap. A while while tap fast for every remaining long across for that press gestures experience for private gestures. private across pixel tap private with alive that considered or while curated',
    icon: 'image',
    gradient: 'pastel',
    tone: 'warning',
    meta: '16 mins ago',
    stat1: 453,
    stat2: 96,
    stat3: '2.9',
    verb: 'Highlighted',
  },
  {
    id: 'item-1527-16',
    title: 'Punchy Spark 16',
    description: 'gestures designed that private while haptics long while press remaining light remaining tap feel. while tap fast for every remaining long across for that press gestures experience for private gestures forever light. tap private with alive that considered or while curated experience or in',
    icon: 'heart',
    gradient: 'cosmic',
    tone: 'info',
    meta: '17 mins ago',
    stat1: 466,
    stat2: 4,
    stat3: '4.8',
    verb: 'Translated',
  },
  {
    id: 'item-1527-17',
    title: 'Soft Codex 17',
    description: 'designed that private while haptics long while press remaining light remaining tap feel while. fast for every remaining long across for that press gestures experience for private gestures forever light remaining fluid. alive that considered or while curated experience or in dark feel fast',
    icon: 'book',
    gradient: 'pastel',
    tone: 'primary',
    meta: '18 mins ago',
    stat1: 479,
    stat2: 11,
    stat3: '1.7',
    verb: 'Pinned',
  },
  {
    id: 'item-1527-18',
    title: 'Cosmic Beacon 18',
    description: 'that private while haptics long while press remaining light remaining tap feel while light. every remaining long across for that press gestures experience for private gestures forever light remaining fluid remaining private. or while curated experience or in dark feel fast gestures across and',
    icon: 'rocket',
    gradient: 'midnight',
    tone: 'warning',
    meta: '19 mins ago',
    stat1: 492,
    stat2: 18,
    stat3: '3.6',
    verb: 'Read',
  },
  {
    id: 'item-1527-19',
    title: 'Velvet Halo 19',
    description: 'private while haptics long while press remaining light remaining tap feel while light press. long across for that press gestures experience for private gestures forever light remaining fluid remaining private modes in. experience or in dark feel fast gestures across and on fast that',
    icon: 'cloud',
    gradient: 'cosmic',
    tone: 'success',
    meta: '20 mins ago',
    stat1: 505,
    stat2: 25,
    stat3: '0.5',
    verb: 'Archived',
  },
  {
    id: 'item-1527-20',
    title: 'Buttery Saga 20',
    description: 'while haptics long while press remaining light remaining tap feel while light press modes. for that press gestures experience for private gestures forever light remaining fluid remaining private modes in remaining in. dark feel fast gestures across and on fast that long with press',
    icon: 'bookmark',
    gradient: 'amber',
    tone: 'danger',
    meta: '21 mins ago',
    stat1: 518,
    stat2: 32,
    stat3: '2.4',
    verb: 'Read',
  },
  {
    id: 'item-1527-21',
    title: 'Frosted Drift 21',
    description: 'haptics long while press remaining light remaining tap feel while light press modes with. press gestures experience for private gestures forever light remaining fluid remaining private modes in remaining in remaining long. gestures across and on fast that long with press every every considered',
    icon: 'bookmark',
    gradient: 'neon',
    tone: 'success',
    meta: '22 mins ago',
    stat1: 531,
    stat2: 39,
    stat3: '4.3',
    verb: 'Archived',
  },
  {
    id: 'item-1527-22',
    title: 'Dreamy Loom 22',
    description: 'long while press remaining light remaining tap feel while light press modes with forever. experience for private gestures forever light remaining fluid remaining private modes in remaining in remaining long for fast. on fast that long with press every every considered light A feel',
    icon: 'pizza',
    gradient: 'amber',
    tone: 'danger',
    meta: '23 mins ago',
    stat1: 544,
    stat2: 46,
    stat3: '1.2',
    verb: 'Saved',
  },
  {
    id: 'item-1527-23',
    title: 'Punchy Quest 23',
    description: 'while press remaining light remaining tap feel while light press modes with forever alive. private gestures forever light remaining fluid remaining private modes in remaining in remaining long for fast in with. long with press every every considered light A feel dark haptics pixel',
    icon: 'pricetag',
    gradient: 'neon',
    tone: 'info',
    meta: '24 mins ago',
    stat1: 557,
    stat2: 53,
    stat3: '3.1',
    verb: 'Opened',
  },
  {
    id: 'item-1527-24',
    title: 'Polished Compass 24',
    description: 'press remaining light remaining tap feel while light press modes with forever alive fast. forever light remaining fluid remaining private modes in remaining in remaining long for fast in with considered fast. every every considered light A feel dark haptics pixel private modes forever',
    icon: 'star',
    gradient: 'forest',
    tone: 'primary',
    meta: '25 mins ago',
    stat1: 570,
    stat2: 60,
    stat3: '0.0',
    verb: 'Pinned',
  },
  {
    id: 'item-1527-25',
    title: 'Snappy Atlas 25',
    description: 'remaining light remaining tap feel while light press modes with forever alive fast remaining. remaining fluid remaining private modes in remaining in remaining long for fast in with considered fast beautiful forever. light A feel dark haptics pixel private modes forever pixel alive across',
    icon: 'shield',
    gradient: 'brand',
    tone: 'warning',
    meta: '26 mins ago',
    stat1: 583,
    stat2: 67,
    stat3: '1.9',
    verb: 'Read',
  },
  {
    id: 'item-1527-26',
    title: 'Lush Lens 26',
    description: 'light remaining tap feel while light press modes with forever alive fast remaining light. remaining private modes in remaining in remaining long for fast in with considered fast beautiful forever beautiful or. dark haptics pixel private modes forever pixel alive across beautiful while while',
    icon: 'flame',
    gradient: 'cosmic',
    tone: 'success',
    meta: '27 mins ago',
    stat1: 596,
    stat2: 74,
    stat3: '3.8',
    verb: 'Read',
  },
  {
    id: 'item-1527-27',
    title: 'Glassy Lens 27',
    description: 'remaining tap feel while light press modes with forever alive fast remaining light forever. modes in remaining in remaining long for fast in with considered fast beautiful forever beautiful or and dark. private modes forever pixel alive across beautiful while while modes dark considered',
    icon: 'flame',
    gradient: 'amber',
    tone: 'success',
    meta: '28 mins ago',
    stat1: 609,
    stat2: 81,
    stat3: '0.7',
    verb: 'Highlighted',
  },
  {
    id: 'item-1527-28',
    title: 'Glassy Lens 28',
    description: 'tap feel while light press modes with forever alive fast remaining light forever gestures. remaining in remaining long for fast in with considered fast beautiful forever beautiful or and dark long browsing. pixel alive across beautiful while while modes dark considered gestures long for',
    icon: 'cafe',
    gradient: 'amber',
    tone: 'info',
    meta: '29 mins ago',
    stat1: 622,
    stat2: 88,
    stat3: '2.6',
    verb: 'Read',
  },
  {
    id: 'item-1527-29',
    title: 'Glassy Mosaic 29',
    description: 'feel while light press modes with forever alive fast remaining light forever gestures that. remaining long for fast in with considered fast beautiful forever beautiful or and dark long browsing forever every. beautiful while while modes dark considered gestures long for every that on',
    icon: 'lock-closed',
    gradient: 'pastel',
    tone: 'success',
    meta: '30 mins ago',
    stat1: 635,
    stat2: 95,
    stat3: '4.5',
    verb: 'Followed',
  },
  {
    id: 'item-1527-30',
    title: 'Deep Mosaic 30',
    description: 'while light press modes with forever alive fast remaining light forever gestures that feel. for fast in with considered fast beautiful forever beautiful or and dark long browsing forever every while A. modes dark considered gestures long for every that on tap press while',
    icon: 'cafe',
    gradient: 'amber',
    tone: 'accent',
    meta: '31 mins ago',
    stat1: 648,
    stat2: 3,
    stat3: '1.4',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1527-31',
    title: 'Deep Codex 31',
    description: 'light press modes with forever alive fast remaining light forever gestures that feel alive. in with considered fast beautiful forever beautiful or and dark long browsing forever every while A and that. gestures long for every that on tap press while alive on experience',
    icon: 'cafe',
    gradient: 'fire',
    tone: 'success',
    meta: '32 mins ago',
    stat1: 661,
    stat2: 10,
    stat3: '3.3',
    verb: 'Followed',
  },
  {
    id: 'item-1527-32',
    title: 'Cosmic Mosaic 32',
    description: 'press modes with forever alive fast remaining light forever gestures that feel alive press. considered fast beautiful forever beautiful or and dark long browsing forever every while A and that feel and. every that on tap press while alive on experience fast fast light',
    icon: 'lock-closed',
    gradient: 'sunset',
    tone: 'accent',
    meta: '33 mins ago',
    stat1: 674,
    stat2: 17,
    stat3: '0.2',
    verb: 'Archived',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-25959-1',
    title: 'Buttery Tapestry',
    subtitle: 'pixel that every while while feel beautiful curated A fluid that while curated with. gestures every fast press that dark private press for press fluid pixel press A designed fast designed with. for forever tap forever across pixel every for every and modes modes',
    icon: 'school',
    gradient: 'brand',
  },
  {
    id: 'section-25959-2',
    title: 'Dreamy Beacon',
    subtitle: 'while curated with curated private curated tap considered fast and press browsing private feel. experience every considered fast dark browsing modes dark remaining with experience light browsing light and fluid every designed. modes pixel alive in gestures long private private every in that with',
    icon: 'cloud',
    gradient: 'candy',
  },
  {
    id: 'section-25959-3',
    title: 'Brisk Tapestry',
    subtitle: 'browsing private feel remaining long considered with and alive across gestures pixel fluid A. and in for beautiful curated modes with long curated A fluid pixel curated fast pixel browsing and and. fluid fluid modes and remaining fast curated on curated for feel modes',
    icon: 'medal',
    gradient: 'neon',
  },
  {
    id: 'section-25959-4',
    title: 'Vibrant Compass',
    subtitle: 'pixel fluid A on on modes pixel feel experience and haptics designed pixel designed. with tap considered while press that or alive and light gestures press with every or private every remaining. forever every and and tap forever light press remaining forever experience modes',
    icon: 'musical-notes',
    gradient: 'midnight',
  },
  {
    id: 'section-25959-5',
    title: 'Vibrant Forge',
    subtitle: 'designed pixel designed that gestures modes every gestures on pixel forever on and light. or pixel private feel press browsing beautiful or alive across or browsing remaining for beautiful while every and. across on modes press alive remaining while experience on tap that across',
    icon: 'speedometer',
    gradient: 'sunset',
  },
  {
    id: 'section-25959-6',
    title: 'Cosmic Lens',
    subtitle: 'on and light forever A forever browsing fast across fluid press or pixel A. fast dark beautiful modes forever remaining across and and light every private and across or and private for. fast gestures gestures in browsing every press for experience feel and while',
    icon: 'paw',
    gradient: 'candy',
  },
  {
    id: 'section-25959-7',
    title: 'Deep Studio',
    subtitle: 'or pixel A across across fluid feel while curated for beautiful tap with fast. remaining and forever or forever tap dark press A A and A designed or pixel considered every feel. every that on browsing with with curated press and forever long designed',
    icon: 'eye',
    gradient: 'candy',
  },
  {
    id: 'section-25959-8',
    title: 'Lush Tapestry',
    subtitle: 'tap with fast in remaining fluid private pixel light tap and every considered fluid. on haptics every pixel every across A press tap fluid every and with browsing every and curated pixel. and that press considered and designed with on beautiful with private and',
    icon: 'speedometer',
    gradient: 'forest',
  },
  {
    id: 'section-25959-9',
    title: 'Polished Stream',
    subtitle: 'every considered fluid curated gestures with modes every on fast browsing light fluid or. forever remaining designed experience tap private modes every considered on long long tap every alive long remaining beautiful. haptics haptics and feel beautiful that across every fluid beautiful that tap',
    icon: 'cart',
    gradient: 'forest',
  },
  {
    id: 'section-25959-10',
    title: 'Snappy Studio',
    subtitle: 'light fluid or across A alive for considered with every long every or tap. tap and across for dark dark and every and private that fast forever or fast or A pixel. while curated A light pixel while that browsing in with for long',
    icon: 'flag',
    gradient: 'fire',
  },
  {
    id: 'section-25959-11',
    title: 'Elite Beacon',
    subtitle: 'every or tap curated or gestures tap every alive or private pixel remaining with. beautiful while every experience curated while and feel every modes feel pixel private designed long across alive alive. considered and on tap tap while curated for light across that on',
    icon: 'book',
    gradient: 'forest',
  },
  {
    id: 'section-25959-12',
    title: 'Velvet Beacon',
    subtitle: 'pixel remaining with designed feel in in press in curated and beautiful fluid curated. every haptics in pixel fast beautiful tap fast pixel gestures tap for or pixel for press remaining haptics. curated while with private in with long long every considered press while',
    icon: 'book',
    gradient: 'candy',
  },
  {
    id: 'section-25959-13',
    title: 'Snappy Spark',
    subtitle: 'beautiful fluid curated fast press browsing A fast designed long and browsing private modes. beautiful every and tap and for designed and dark remaining pixel modes or or on private pixel private. with press while beautiful for every A haptics modes press dark fast',
    icon: 'cafe',
    gradient: 'sunset',
  },
  {
    id: 'section-25959-14',
    title: 'Cosmic Beacon',
    subtitle: 'browsing private modes beautiful every browsing every fluid private haptics remaining modes fast pixel. tap browsing experience and beautiful modes beautiful that beautiful and haptics pixel fast and every forever light feel. remaining and long fast with long gestures and experience on light light',
    icon: 'image',
    gradient: 'midnight',
  },
];

const HERO_TITLE = 'Group';
const HERO_SUBTITLE = 'Group of related sessions.';
const FOOTER_TITLE = 'Keep going with Group';
const FOOTER_BODY = 'forever tap that and A fluid private browsing for and remaining feel A on. A fluid in considered in that tap forever gestures forever with for designed tap across dark and feel. considered for and curated press light in private gestures press on while';

export const TabsGroupScreen: React.FC = () => {
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
      variant="cosmic"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Group"
        subtitle="Group of related sessions."
        showBack={true}
        rightIcon="grid"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="cosmic"
        badge="Group"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>56%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '56%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Echo</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Compass</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>52%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '52%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>5%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '5%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>48%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '48%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>91%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '91%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>44%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '44%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>87%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '87%' }]}
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
