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
    id: 'item-1414-1',
    title: 'Buttery Compass 1',
    description: 'in considered designed feel beautiful on feel A light beautiful long light feel fluid. tap press experience light browsing remaining forever beautiful and fast experience remaining and pixel or alive and and. on and beautiful with long with haptics press and dark fast experience',
    icon: 'cafe',
    gradient: 'brand',
    tone: 'warning',
    meta: '69 mins ago',
    stat1: 762,
    stat2: 98,
    stat3: '1.6',
    verb: 'Opened',
  },
  {
    id: 'item-1414-2',
    title: 'Snappy Insight 2',
    description: 'considered designed feel beautiful on feel A light beautiful long light feel fluid beautiful. experience light browsing remaining forever beautiful and fast experience remaining and pixel or alive and and for beautiful. with long with haptics press and dark fast experience browsing private considered',
    icon: 'paw',
    gradient: 'ocean',
    tone: 'primary',
    meta: '70 mins ago',
    stat1: 775,
    stat2: 6,
    stat3: '3.5',
    verb: 'Opened',
  },
  {
    id: 'item-1414-3',
    title: 'Premium Lens 3',
    description: 'designed feel beautiful on feel A light beautiful long light feel fluid beautiful beautiful. browsing remaining forever beautiful and fast experience remaining and pixel or alive and and for beautiful with private. haptics press and dark fast experience browsing private considered forever tap every',
    icon: 'newspaper',
    gradient: 'brand',
    tone: 'primary',
    meta: '71 mins ago',
    stat1: 788,
    stat2: 13,
    stat3: '0.4',
    verb: 'Read',
  },
  {
    id: 'item-1414-4',
    title: 'Glassy Codex 4',
    description: 'feel beautiful on feel A light beautiful long light feel fluid beautiful beautiful press. forever beautiful and fast experience remaining and pixel or alive and and for beautiful with private feel long. dark fast experience browsing private considered forever tap every curated private experience',
    icon: 'cloud',
    gradient: 'brand',
    tone: 'success',
    meta: '72 mins ago',
    stat1: 801,
    stat2: 20,
    stat3: '2.3',
    verb: 'Opened',
  },
  {
    id: 'item-1414-5',
    title: 'Cosmic Insight 5',
    description: 'beautiful on feel A light beautiful long light feel fluid beautiful beautiful press long. and fast experience remaining and pixel or alive and and for beautiful with private feel long browsing alive. browsing private considered forever tap every curated private experience curated light modes',
    icon: 'bookmark',
    gradient: 'amber',
    tone: 'primary',
    meta: '73 mins ago',
    stat1: 814,
    stat2: 27,
    stat3: '4.2',
    verb: 'Translated',
  },
  {
    id: 'item-1414-6',
    title: 'Premium Tapestry 6',
    description: 'on feel A light beautiful long light feel fluid beautiful beautiful press long A. experience remaining and pixel or alive and and for beautiful with private feel long browsing alive every tap. forever tap every curated private experience curated light modes dark with and',
    icon: 'cloud',
    gradient: 'brand',
    tone: 'primary',
    meta: '74 mins ago',
    stat1: 827,
    stat2: 34,
    stat3: '1.1',
    verb: 'Read',
  },
  {
    id: 'item-1414-7',
    title: 'Subtle Aurora 7',
    description: 'feel A light beautiful long light feel fluid beautiful beautiful press long A feel. and pixel or alive and and for beautiful with private feel long browsing alive every tap in feel. curated private experience curated light modes dark with and while fluid or',
    icon: 'analytics',
    gradient: 'midnight',
    tone: 'success',
    meta: '75 mins ago',
    stat1: 840,
    stat2: 41,
    stat3: '3.0',
    verb: 'Opened',
  },
  {
    id: 'item-1414-8',
    title: 'Sleek Insight 8',
    description: 'A light beautiful long light feel fluid beautiful beautiful press long A feel that. or alive and and for beautiful with private feel long browsing alive every tap in feel feel light. curated light modes dark with and while fluid or feel every gestures',
    icon: 'leaf',
    gradient: 'amber',
    tone: 'primary',
    meta: '76 mins ago',
    stat1: 853,
    stat2: 48,
    stat3: '4.9',
    verb: 'Shared',
  },
  {
    id: 'item-1414-9',
    title: 'Premium Stream 9',
    description: 'light beautiful long light feel fluid beautiful beautiful press long A feel that A. and and for beautiful with private feel long browsing alive every tap in feel feel light that in. dark with and while fluid or feel every gestures and modes and',
    icon: 'paw',
    gradient: 'brand',
    tone: 'accent',
    meta: '77 mins ago',
    stat1: 866,
    stat2: 55,
    stat3: '1.8',
    verb: 'Opened',
  },
  {
    id: 'item-1414-10',
    title: 'Crisp Loom 10',
    description: 'beautiful long light feel fluid beautiful beautiful press long A feel that A press. for beautiful with private feel long browsing alive every tap in feel feel light that in remaining and. while fluid or feel every gestures and modes and fluid browsing beautiful',
    icon: 'school',
    gradient: 'candy',
    tone: 'primary',
    meta: '78 mins ago',
    stat1: 879,
    stat2: 62,
    stat3: '3.7',
    verb: 'Opened',
  },
  {
    id: 'item-1414-11',
    title: 'Punchy Insight 11',
    description: 'long light feel fluid beautiful beautiful press long A feel that A press every. with private feel long browsing alive every tap in feel feel light that in remaining and fluid pixel. feel every gestures and modes and fluid browsing beautiful dark modes long',
    icon: 'speedometer',
    gradient: 'brand',
    tone: 'primary',
    meta: '79 mins ago',
    stat1: 892,
    stat2: 69,
    stat3: '0.6',
    verb: 'Read',
  },
  {
    id: 'item-1414-12',
    title: 'Premium Echo 12',
    description: 'light feel fluid beautiful beautiful press long A feel that A press every while. feel long browsing alive every tap in feel feel light that in remaining and fluid pixel long curated. and modes and fluid browsing beautiful dark modes long and long beautiful',
    icon: 'pricetag',
    gradient: 'brand',
    tone: 'success',
    meta: '80 mins ago',
    stat1: 905,
    stat2: 76,
    stat3: '2.5',
    verb: 'Translated',
  },
  {
    id: 'item-1414-13',
    title: 'Brisk Insight 13',
    description: 'feel fluid beautiful beautiful press long A feel that A press every while while. browsing alive every tap in feel feel light that in remaining and fluid pixel long curated and that. fluid browsing beautiful dark modes long and long beautiful experience or pixel',
    icon: 'pulse',
    gradient: 'amber',
    tone: 'primary',
    meta: '81 mins ago',
    stat1: 918,
    stat2: 83,
    stat3: '4.4',
    verb: 'Opened',
  },
  {
    id: 'item-1414-14',
    title: 'Premium Lens 14',
    description: 'fluid beautiful beautiful press long A feel that A press every while while modes. every tap in feel feel light that in remaining and fluid pixel long curated and that that browsing. dark modes long and long beautiful experience or pixel every designed every',
    icon: 'planet',
    gradient: 'midnight',
    tone: 'primary',
    meta: '82 mins ago',
    stat1: 931,
    stat2: 90,
    stat3: '1.3',
    verb: 'Opened',
  },
  {
    id: 'item-1414-15',
    title: 'Glassy Compass 15',
    description: 'beautiful beautiful press long A feel that A press every while while modes remaining. in feel feel light that in remaining and fluid pixel long curated and that that browsing forever gestures. and long beautiful experience or pixel every designed every browsing with experience',
    icon: 'musical-notes',
    gradient: 'brand',
    tone: 'primary',
    meta: '83 mins ago',
    stat1: 944,
    stat2: 97,
    stat3: '3.2',
    verb: 'Followed',
  },
  {
    id: 'item-1414-16',
    title: 'Snappy Studio 16',
    description: 'beautiful press long A feel that A press every while while modes remaining gestures. feel light that in remaining and fluid pixel long curated and that that browsing forever gestures experience curated. experience or pixel every designed every browsing with experience considered on experience',
    icon: 'cloud',
    gradient: 'brand',
    tone: 'accent',
    meta: '84 mins ago',
    stat1: 957,
    stat2: 5,
    stat3: '0.1',
    verb: 'Opened',
  },
  {
    id: 'item-1414-17',
    title: 'Vibrant Drift 17',
    description: 'press long A feel that A press every while while modes remaining gestures dark. that in remaining and fluid pixel long curated and that that browsing forever gestures experience curated haptics modes. every designed every browsing with experience considered on experience in light for',
    icon: 'analytics',
    gradient: 'fire',
    tone: 'primary',
    meta: '85 mins ago',
    stat1: 970,
    stat2: 12,
    stat3: '2.0',
    verb: 'Read',
  },
  {
    id: 'item-1414-18',
    title: 'Dreamy Tapestry 18',
    description: 'long A feel that A press every while while modes remaining gestures dark while. remaining and fluid pixel long curated and that that browsing forever gestures experience curated haptics modes across light. browsing with experience considered on experience in light for forever haptics in',
    icon: 'medal',
    gradient: 'brand',
    tone: 'success',
    meta: '86 mins ago',
    stat1: 983,
    stat2: 19,
    stat3: '3.9',
    verb: 'Visited',
  },
  {
    id: 'item-1414-19',
    title: 'Subtle Compass 19',
    description: 'A feel that A press every while while modes remaining gestures dark while fluid. fluid pixel long curated and that that browsing forever gestures experience curated haptics modes across light for pixel. considered on experience in light for forever haptics in or that private',
    icon: 'grid',
    gradient: 'amber',
    tone: 'danger',
    meta: '87 mins ago',
    stat1: 996,
    stat2: 26,
    stat3: '0.8',
    verb: 'Pinned',
  },
  {
    id: 'item-1414-20',
    title: 'Snappy Tapestry 20',
    description: 'feel that A press every while while modes remaining gestures dark while fluid feel. long curated and that that browsing forever gestures experience curated haptics modes across light for pixel private fluid. in light for forever haptics in or that private light for long',
    icon: 'cafe',
    gradient: 'aurora',
    tone: 'warning',
    meta: '88 mins ago',
    stat1: 29,
    stat2: 33,
    stat3: '2.7',
    verb: 'Pinned',
  },
  {
    id: 'item-1414-21',
    title: 'Subtle Spark 21',
    description: 'that A press every while while modes remaining gestures dark while fluid feel A. and that that browsing forever gestures experience curated haptics modes across light for pixel private fluid every considered. forever haptics in or that private light for long dark beautiful beautiful',
    icon: 'gift',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '89 mins ago',
    stat1: 42,
    stat2: 40,
    stat3: '4.6',
    verb: 'Highlighted',
  },
  {
    id: 'item-1414-22',
    title: 'Soft Loom 22',
    description: 'A press every while while modes remaining gestures dark while fluid feel A dark. that browsing forever gestures experience curated haptics modes across light for pixel private fluid every considered every dark. or that private light for long dark beautiful beautiful haptics every forever',
    icon: 'analytics',
    gradient: 'cosmic',
    tone: 'info',
    meta: '90 mins ago',
    stat1: 55,
    stat2: 47,
    stat3: '1.5',
    verb: 'Archived',
  },
  {
    id: 'item-1414-23',
    title: 'Punchy Lens 23',
    description: 'press every while while modes remaining gestures dark while fluid feel A dark pixel. forever gestures experience curated haptics modes across light for pixel private fluid every considered every dark considered fluid. light for long dark beautiful beautiful haptics every forever considered forever every',
    icon: 'globe',
    gradient: 'pastel',
    tone: 'danger',
    meta: '91 mins ago',
    stat1: 68,
    stat2: 54,
    stat3: '3.4',
    verb: 'Pinned',
  },
  {
    id: 'item-1414-24',
    title: 'Glassy Tapestry 24',
    description: 'every while while modes remaining gestures dark while fluid feel A dark pixel across. experience curated haptics modes across light for pixel private fluid every considered every dark considered fluid in tap. dark beautiful beautiful haptics every forever considered forever every while gestures experience',
    icon: 'extension-puzzle',
    gradient: 'neon',
    tone: 'warning',
    meta: '92 mins ago',
    stat1: 81,
    stat2: 61,
    stat3: '0.3',
    verb: 'Archived',
  },
  {
    id: 'item-1414-25',
    title: 'Subtle Saga 25',
    description: 'while while modes remaining gestures dark while fluid feel A dark pixel across gestures. haptics modes across light for pixel private fluid every considered every dark considered fluid in tap gestures in. haptics every forever considered forever every while gestures experience beautiful with pixel',
    icon: 'extension-puzzle',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '93 mins ago',
    stat1: 94,
    stat2: 68,
    stat3: '2.2',
    verb: 'Pinned',
  },
  {
    id: 'item-1414-26',
    title: 'Frosted Forge 26',
    description: 'while modes remaining gestures dark while fluid feel A dark pixel across gestures with. across light for pixel private fluid every considered every dark considered fluid in tap gestures in long across. considered forever every while gestures experience beautiful with pixel remaining beautiful curated',
    icon: 'eye',
    gradient: 'neon',
    tone: 'warning',
    meta: '94 mins ago',
    stat1: 107,
    stat2: 75,
    stat3: '4.1',
    verb: 'Shared',
  },
  {
    id: 'item-1414-27',
    title: 'Silky Drift 27',
    description: 'modes remaining gestures dark while fluid feel A dark pixel across gestures with haptics. for pixel private fluid every considered every dark considered fluid in tap gestures in long across across and. while gestures experience beautiful with pixel remaining beautiful curated long that experience',
    icon: 'trophy',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '5 mins ago',
    stat1: 120,
    stat2: 82,
    stat3: '1.0',
    verb: 'Opened',
  },
  {
    id: 'item-1414-28',
    title: 'Dreamy Atlas 28',
    description: 'remaining gestures dark while fluid feel A dark pixel across gestures with haptics and. private fluid every considered every dark considered fluid in tap gestures in long across across and remaining A. beautiful with pixel remaining beautiful curated long that experience dark fast or',
    icon: 'book',
    gradient: 'candy',
    tone: 'primary',
    meta: '6 mins ago',
    stat1: 133,
    stat2: 89,
    stat3: '2.9',
    verb: 'Opened',
  },
  {
    id: 'item-1414-29',
    title: 'Lush Lens 29',
    description: 'gestures dark while fluid feel A dark pixel across gestures with haptics and A. every considered every dark considered fluid in tap gestures in long across across and remaining A alive feel. remaining beautiful curated long that experience dark fast or or or for',
    icon: 'grid',
    gradient: 'brand',
    tone: 'primary',
    meta: '7 mins ago',
    stat1: 146,
    stat2: 96,
    stat3: '4.8',
    verb: 'Archived',
  },
  {
    id: 'item-1414-30',
    title: 'Glassy Quest 30',
    description: 'dark while fluid feel A dark pixel across gestures with haptics and A light. every dark considered fluid in tap gestures in long across across and remaining A alive feel that alive. long that experience dark fast or or or for while or fluid',
    icon: 'image',
    gradient: 'brand',
    tone: 'danger',
    meta: '8 mins ago',
    stat1: 159,
    stat2: 4,
    stat3: '1.7',
    verb: 'Shared',
  },
  {
    id: 'item-1414-31',
    title: 'Polished Tapestry 31',
    description: 'while fluid feel A dark pixel across gestures with haptics and A light long. considered fluid in tap gestures in long across across and remaining A alive feel that alive and and. dark fast or or or for while or fluid for feel long',
    icon: 'planet',
    gradient: 'neon',
    tone: 'accent',
    meta: '9 mins ago',
    stat1: 172,
    stat2: 11,
    stat3: '3.6',
    verb: 'Translated',
  },
  {
    id: 'item-1414-32',
    title: 'Subtle Insight 32',
    description: 'fluid feel A dark pixel across gestures with haptics and A light long fast. in tap gestures in long across across and remaining A alive feel that alive and and and dark. or or for while or fluid for feel long while and long',
    icon: 'gift',
    gradient: 'candy',
    tone: 'primary',
    meta: '10 mins ago',
    stat1: 185,
    stat2: 18,
    stat3: '0.5',
    verb: 'Pinned',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-24038-1',
    title: 'Brisk Drift',
    subtitle: 'and considered browsing for considered considered considered on fast and dark designed in considered. and and experience long pixel for fast designed haptics and and designed long considered in and beautiful or. gestures browsing for A or pixel experience beautiful for press and press',
    icon: 'shield',
    gradient: 'brand',
  },
  {
    id: 'section-24038-2',
    title: 'Frosted Stream',
    subtitle: 'designed in considered experience beautiful every A browsing and browsing and and considered in. tap every alive dark and forever tap designed gestures while designed browsing long forever feel with or considered. forever considered in feel pixel that pixel in haptics for and dark',
    icon: 'image',
    gradient: 'sunset',
  },
  {
    id: 'section-24038-3',
    title: 'Deep Tapestry',
    subtitle: 'and considered in light A tap and private tap dark fast designed across and. dark browsing while for alive fluid with fast remaining every press for fast on across light gestures or. browsing fast fluid and in while across long fluid dark or every',
    icon: 'extension-puzzle',
    gradient: 'midnight',
  },
  {
    id: 'section-24038-4',
    title: 'Glassy Tapestry',
    subtitle: 'designed across and experience forever tap experience browsing fast with while with for browsing. browsing light in with and every in fast press A haptics pixel pixel light browsing across A and. browsing every remaining and and modes remaining light while browsing dark press',
    icon: 'speedometer',
    gradient: 'neon',
  },
  {
    id: 'section-24038-5',
    title: 'Premium Halo',
    subtitle: 'with for browsing and designed and and pixel on designed modes press light designed. haptics private every curated across modes gestures with and designed that feel designed press or modes and across. private in and considered across gestures experience light considered curated for for',
    icon: 'lock-closed',
    gradient: 'amber',
  },
  {
    id: 'section-24038-6',
    title: 'Polished Atlas',
    subtitle: 'press light designed remaining experience or curated curated and that curated fast forever remaining. with that in in gestures remaining or gestures in browsing beautiful while feel haptics beautiful feel tap or. considered browsing gestures gestures every and every tap long A haptics tap',
    icon: 'flame',
    gradient: 'aurora',
  },
  {
    id: 'section-24038-7',
    title: 'Silky Pulse',
    subtitle: 'fast forever remaining that light curated considered dark remaining that forever that in in. A for while and feel every beautiful pixel A for that remaining and with light light browsing and. fluid remaining considered with and every gestures fast browsing tap gestures for',
    icon: 'heart',
    gradient: 'fire',
  },
  {
    id: 'section-24038-8',
    title: 'Lush Codex',
    subtitle: 'that in in every curated fast pixel and and private every beautiful with light. remaining modes haptics private that feel fast dark considered experience feel haptics curated gestures forever fast dark fast. modes remaining beautiful alive light forever fast experience curated experience modes gestures',
    icon: 'gift',
    gradient: 'fire',
  },
  {
    id: 'section-24038-9',
    title: 'Sleek Pulse',
    subtitle: 'beautiful with light curated on dark on dark and long private or remaining light. designed and in in A every press fast pixel light beautiful considered tap or light long fast gestures. remaining every that fluid forever while A A designed fast considered designed',
    icon: 'musical-notes',
    gradient: 'pastel',
  },
  {
    id: 'section-24038-10',
    title: 'Silky Stream',
    subtitle: 'or remaining light long pixel pixel tap gestures in modes remaining and across for. alive light fluid every remaining press with light that private on pixel across light in private tap while. on designed and every in A remaining experience pixel every and considered',
    icon: 'pizza',
    gradient: 'midnight',
  },
  {
    id: 'section-24038-11',
    title: 'Silky Insight',
    subtitle: 'and across for fluid press in with across every in A modes that feel. press curated haptics remaining forever every every in fluid gestures tap private haptics tap while pixel and press. or alive A alive that gestures and modes across that and press',
    icon: 'bookmark',
    gradient: 'pastel',
  },
  {
    id: 'section-24038-12',
    title: 'Soft Loom',
    subtitle: 'modes that feel across long browsing light long on every beautiful tap pixel with. press and and and and experience for with alive every modes A beautiful with on gestures for feel. alive haptics alive and across for across experience and press forever long',
    icon: 'cafe',
    gradient: 'aurora',
  },
  {
    id: 'section-24038-13',
    title: 'Crisp Mosaic',
    subtitle: 'tap pixel with while every beautiful gestures fast experience A experience across forever and. every beautiful modes beautiful alive every alive that light with every experience for gestures designed and A across. considered in tap every dark across private fast A across curated pixel',
    icon: 'eye',
    gradient: 'aurora',
  },
  {
    id: 'section-24038-14',
    title: 'Premium Tapestry',
    subtitle: 'across forever and and forever private for beautiful dark and long gestures with and. designed with tap A every considered on A considered press designed and long on considered alive forever fluid. tap fast long designed considered that light tap on while or tap',
    icon: 'cart',
    gradient: 'brand',
  },
];

const HERO_TITLE = 'Open tabs';
const HERO_SUBTITLE = 'All sessions, grouped and searchable.';
const FOOTER_TITLE = 'Keep going with Open tabs';
const FOOTER_BODY = 'on and beautiful with long with haptics press and dark fast experience browsing private. across every pixel private beautiful fast on gestures press and with feel or on in tap on on. and private gestures for and browsing designed long and alive remaining while';

export const TabsListScreen: React.FC = () => {
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
      variant="aurora"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Open tabs"
        subtitle="All sessions, grouped and searchable."
        showBack={false}
        rightIcon="albums"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="aurora"
        badge="Home"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>70%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '70%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>23%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '23%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>66%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '66%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Spark</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>62%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '62%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>15%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '15%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>58%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '58%' }]}
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
