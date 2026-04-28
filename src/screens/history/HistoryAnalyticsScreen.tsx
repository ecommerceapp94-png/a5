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
    id: 'item-2298-1',
    title: 'Subtle Spark 1',
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
    id: 'item-2298-2',
    title: 'Soft Forge 2',
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
    id: 'item-2298-3',
    title: 'Silky Loom 3',
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
    id: 'item-2298-4',
    title: 'Punchy Lens 4',
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
  {
    id: 'item-2298-5',
    title: 'Glassy Codex 5',
    description: 'every every private in feel and beautiful or and every fluid for and fast. while remaining fast in every A and with in every that and designed in and on and designed. fast light considered considered while light and tap long designed modes in',
    icon: 'shield',
    gradient: 'brand',
    tone: 'warning',
    meta: '57 mins ago',
    stat1: 546,
    stat2: 77,
    stat3: '3.8',
    verb: 'Opened',
  },
  {
    id: 'item-2298-6',
    title: 'Cosmic Aurora 6',
    description: 'every private in feel and beautiful or and every fluid for and fast dark. fast in every A and with in every that and designed in and on and designed across private. considered while light and tap long designed modes in on on with',
    icon: 'flame',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '58 mins ago',
    stat1: 559,
    stat2: 84,
    stat3: '0.7',
    verb: 'Shared',
  },
  {
    id: 'item-2298-7',
    title: 'Sleek Drift 7',
    description: 'private in feel and beautiful or and every fluid for and fast dark across. every A and with in every that and designed in and on and designed across private across pixel. and tap long designed modes in on on with gestures fluid or',
    icon: 'paw',
    gradient: 'brand',
    tone: 'accent',
    meta: '59 mins ago',
    stat1: 572,
    stat2: 91,
    stat3: '2.6',
    verb: 'Archived',
  },
  {
    id: 'item-2298-8',
    title: 'Dreamy Tapestry 8',
    description: 'in feel and beautiful or and every fluid for and fast dark across remaining. and with in every that and designed in and on and designed across private across pixel tap private. designed modes in on on with gestures fluid or fast in modes',
    icon: 'layers',
    gradient: 'candy',
    tone: 'danger',
    meta: '60 mins ago',
    stat1: 585,
    stat2: 98,
    stat3: '4.5',
    verb: 'Saved',
  },
  {
    id: 'item-2298-9',
    title: 'Subtle Lens 9',
    description: 'feel and beautiful or and every fluid for and fast dark across remaining and. in every that and designed in and on and designed across private across pixel tap private with alive. on on with gestures fluid or fast in modes or pixel modes',
    icon: 'extension-puzzle',
    gradient: 'neon',
    tone: 'info',
    meta: '61 mins ago',
    stat1: 598,
    stat2: 6,
    stat3: '1.4',
    verb: 'Shared',
  },
  {
    id: 'item-2298-10',
    title: 'Glassy Pulse 10',
    description: 'and beautiful or and every fluid for and fast dark across remaining and forever. that and designed in and on and designed across private across pixel tap private with alive that considered. gestures fluid or fast in modes or pixel modes tap remaining forever',
    icon: 'newspaper',
    gradient: 'forest',
    tone: 'accent',
    meta: '62 mins ago',
    stat1: 611,
    stat2: 13,
    stat3: '3.3',
    verb: 'Saved',
  },
  {
    id: 'item-2298-11',
    title: 'Elite Pulse 11',
    description: 'beautiful or and every fluid for and fast dark across remaining and forever with. designed in and on and designed across private across pixel tap private with alive that considered or while. fast in modes or pixel modes tap remaining forever forever tap considered',
    icon: 'image',
    gradient: 'candy',
    tone: 'info',
    meta: '63 mins ago',
    stat1: 624,
    stat2: 20,
    stat3: '0.2',
    verb: 'Archived',
  },
  {
    id: 'item-2298-12',
    title: 'Elite Lens 12',
    description: 'or and every fluid for and fast dark across remaining and forever with for. and on and designed across private across pixel tap private with alive that considered or while curated experience. or pixel modes tap remaining forever forever tap considered or and private',
    icon: 'planet',
    gradient: 'forest',
    tone: 'danger',
    meta: '64 mins ago',
    stat1: 637,
    stat2: 27,
    stat3: '2.1',
    verb: 'Followed',
  },
  {
    id: 'item-2298-13',
    title: 'Glassy Atlas 13',
    description: 'and every fluid for and fast dark across remaining and forever with for on. and designed across private across pixel tap private with alive that considered or while curated experience or in. tap remaining forever forever tap considered or and private on long press',
    icon: 'paw',
    gradient: 'neon',
    tone: 'accent',
    meta: '65 mins ago',
    stat1: 650,
    stat2: 34,
    stat3: '4.0',
    verb: 'Archived',
  },
  {
    id: 'item-2298-14',
    title: 'Lush Lens 14',
    description: 'every fluid for and fast dark across remaining and forever with for on browsing. across private across pixel tap private with alive that considered or while curated experience or in dark feel. forever tap considered or and private on long press designed alive and',
    icon: 'flash',
    gradient: 'fire',
    tone: 'danger',
    meta: '66 mins ago',
    stat1: 663,
    stat2: 41,
    stat3: '0.9',
    verb: 'Translated',
  },
  {
    id: 'item-2298-15',
    title: 'Glassy Atlas 15',
    description: 'fluid for and fast dark across remaining and forever with for on browsing light. across pixel tap private with alive that considered or while curated experience or in dark feel fast gestures. or and private on long press designed alive and long haptics dark',
    icon: 'film',
    gradient: 'neon',
    tone: 'primary',
    meta: '67 mins ago',
    stat1: 676,
    stat2: 48,
    stat3: '2.8',
    verb: 'Archived',
  },
  {
    id: 'item-2298-16',
    title: 'Lush Loom 16',
    description: 'for and fast dark across remaining and forever with for on browsing light in. tap private with alive that considered or while curated experience or in dark feel fast gestures across and. on long press designed alive and long haptics dark while and alive',
    icon: 'speedometer',
    gradient: 'midnight',
    tone: 'danger',
    meta: '68 mins ago',
    stat1: 689,
    stat2: 55,
    stat3: '4.7',
    verb: 'Pinned',
  },
  {
    id: 'item-2298-17',
    title: 'Punchy Forge 17',
    description: 'and fast dark across remaining and forever with for on browsing light in beautiful. with alive that considered or while curated experience or in dark feel fast gestures across and on fast. designed alive and long haptics dark while and alive pixel on with',
    icon: 'bookmark',
    gradient: 'neon',
    tone: 'warning',
    meta: '69 mins ago',
    stat1: 702,
    stat2: 62,
    stat3: '1.6',
    verb: 'Followed',
  },
  {
    id: 'item-2298-18',
    title: 'Silky Halo 18',
    description: 'fast dark across remaining and forever with for on browsing light in beautiful press. that considered or while curated experience or in dark feel fast gestures across and on fast that long. long haptics dark while and alive pixel on with that fluid experience',
    icon: 'newspaper',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '70 mins ago',
    stat1: 715,
    stat2: 69,
    stat3: '3.5',
    verb: 'Read',
  },
  {
    id: 'item-2298-19',
    title: 'Buttery Atlas 19',
    description: 'dark across remaining and forever with for on browsing light in beautiful press pixel. or while curated experience or in dark feel fast gestures across and on fast that long with press. while and alive pixel on with that fluid experience in designed considered',
    icon: 'pricetag',
    gradient: 'fire',
    tone: 'success',
    meta: '71 mins ago',
    stat1: 728,
    stat2: 76,
    stat3: '0.4',
    verb: 'Saved',
  },
  {
    id: 'item-2298-20',
    title: 'Lush Tapestry 20',
    description: 'across remaining and forever with for on browsing light in beautiful press pixel across. curated experience or in dark feel fast gestures across and on fast that long with press every every. pixel on with that fluid experience in designed considered with while designed',
    icon: 'grid',
    gradient: 'amber',
    tone: 'info',
    meta: '72 mins ago',
    stat1: 741,
    stat2: 83,
    stat3: '2.3',
    verb: 'Searched',
  },
  {
    id: 'item-2298-21',
    title: 'Subtle Loom 21',
    description: 'remaining and forever with for on browsing light in beautiful press pixel across browsing. or in dark feel fast gestures across and on fast that long with press every every considered light. that fluid experience in designed considered with while designed press with on',
    icon: 'briefcase',
    gradient: 'forest',
    tone: 'warning',
    meta: '73 mins ago',
    stat1: 754,
    stat2: 90,
    stat3: '4.2',
    verb: 'Translated',
  },
  {
    id: 'item-2298-22',
    title: 'Punchy Compass 22',
    description: 'and forever with for on browsing light in beautiful press pixel across browsing or. dark feel fast gestures across and on fast that long with press every every considered light A feel. in designed considered with while designed press with on pixel beautiful across',
    icon: 'extension-puzzle',
    gradient: 'ocean',
    tone: 'primary',
    meta: '74 mins ago',
    stat1: 767,
    stat2: 97,
    stat3: '1.1',
    verb: 'Read',
  },
  {
    id: 'item-2298-23',
    title: 'Snappy Lens 23',
    description: 'forever with for on browsing light in beautiful press pixel across browsing or tap. fast gestures across and on fast that long with press every every considered light A feel dark haptics. with while designed press with on pixel beautiful across that for pixel',
    icon: 'image',
    gradient: 'midnight',
    tone: 'success',
    meta: '75 mins ago',
    stat1: 780,
    stat2: 5,
    stat3: '3.0',
    verb: 'Visited',
  },
  {
    id: 'item-2298-24',
    title: 'Glassy Saga 24',
    description: 'with for on browsing light in beautiful press pixel across browsing or tap press. across and on fast that long with press every every considered light A feel dark haptics pixel private. press with on pixel beautiful across that for pixel tap private private',
    icon: 'globe',
    gradient: 'amber',
    tone: 'danger',
    meta: '76 mins ago',
    stat1: 793,
    stat2: 12,
    stat3: '4.9',
    verb: 'Opened',
  },
  {
    id: 'item-2298-25',
    title: 'Frosted Halo 25',
    description: 'for on browsing light in beautiful press pixel across browsing or tap press every. on fast that long with press every every considered light A feel dark haptics pixel private modes forever. pixel beautiful across that for pixel tap private private every on gestures',
    icon: 'paw',
    gradient: 'aurora',
    tone: 'primary',
    meta: '77 mins ago',
    stat1: 806,
    stat2: 19,
    stat3: '1.8',
    verb: 'Read',
  },
  {
    id: 'item-2298-26',
    title: 'Buttery Loom 26',
    description: 'on browsing light in beautiful press pixel across browsing or tap press every haptics. that long with press every every considered light A feel dark haptics pixel private modes forever pixel alive. that for pixel tap private private every on gestures beautiful and or',
    icon: 'pulse',
    gradient: 'brand',
    tone: 'success',
    meta: '78 mins ago',
    stat1: 819,
    stat2: 26,
    stat3: '3.7',
    verb: 'Shared',
  },
  {
    id: 'item-2298-27',
    title: 'Punchy Loom 27',
    description: 'browsing light in beautiful press pixel across browsing or tap press every haptics fast. with press every every considered light A feel dark haptics pixel private modes forever pixel alive across beautiful. tap private private every on gestures beautiful and or that private fluid',
    icon: 'cafe',
    gradient: 'amber',
    tone: 'accent',
    meta: '79 mins ago',
    stat1: 832,
    stat2: 33,
    stat3: '0.6',
    verb: 'Translated',
  },
  {
    id: 'item-2298-28',
    title: 'Punchy Tapestry 28',
    description: 'light in beautiful press pixel across browsing or tap press every haptics fast press. every every considered light A feel dark haptics pixel private modes forever pixel alive across beautiful while while. every on gestures beautiful and or that private fluid gestures while fast',
    icon: 'school',
    gradient: 'candy',
    tone: 'primary',
    meta: '80 mins ago',
    stat1: 845,
    stat2: 40,
    stat3: '2.5',
    verb: 'Translated',
  },
  {
    id: 'item-2298-29',
    title: 'Subtle Spark 29',
    description: 'in beautiful press pixel across browsing or tap press every haptics fast press with. considered light A feel dark haptics pixel private modes forever pixel alive across beautiful while while modes dark. beautiful and or that private fluid gestures while fast fluid considered and',
    icon: 'book',
    gradient: 'midnight',
    tone: 'primary',
    meta: '81 mins ago',
    stat1: 858,
    stat2: 47,
    stat3: '4.4',
    verb: 'Shared',
  },
  {
    id: 'item-2298-30',
    title: 'Soft Atlas 30',
    description: 'beautiful press pixel across browsing or tap press every haptics fast press with considered. A feel dark haptics pixel private modes forever pixel alive across beautiful while while modes dark considered gestures. that private fluid gestures while fast fluid considered and gestures forever beautiful',
    icon: 'leaf',
    gradient: 'midnight',
    tone: 'accent',
    meta: '82 mins ago',
    stat1: 871,
    stat2: 54,
    stat3: '1.3',
    verb: 'Saved',
  },
  {
    id: 'item-2298-31',
    title: 'Lush Studio 31',
    description: 'press pixel across browsing or tap press every haptics fast press with considered private. dark haptics pixel private modes forever pixel alive across beautiful while while modes dark considered gestures long for. gestures while fast fluid considered and gestures forever beautiful on and and',
    icon: 'speedometer',
    gradient: 'candy',
    tone: 'info',
    meta: '83 mins ago',
    stat1: 884,
    stat2: 61,
    stat3: '3.2',
    verb: 'Read',
  },
  {
    id: 'item-2298-32',
    title: 'Vibrant Studio 32',
    description: 'pixel across browsing or tap press every haptics fast press with considered private browsing. pixel private modes forever pixel alive across beautiful while while modes dark considered gestures long for every that. fluid considered and gestures forever beautiful on and and designed alive on',
    icon: 'paw',
    gradient: 'forest',
    tone: 'success',
    meta: '84 mins ago',
    stat1: 897,
    stat2: 68,
    stat3: '0.1',
    verb: 'Saved',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-39066-1',
    title: 'Lush Saga',
    subtitle: 'designed in fluid fast dark tap designed forever forever fluid modes long fluid experience. long and and with haptics every beautiful long alive that experience browsing fluid considered and remaining haptics haptics. across and or curated considered on long with long tap tap browsing',
    icon: 'gift',
    gradient: 'midnight',
  },
  {
    id: 'section-39066-2',
    title: 'Dreamy Loom',
    subtitle: 'long fluid experience or alive long curated for fast private pixel tap considered fluid. across every fluid beautiful that tap modes and and for across and in tap press on beautiful gestures. every gestures browsing remaining considered for tap considered forever A and alive',
    icon: 'pricetag',
    gradient: 'candy',
  },
  {
    id: 'section-39066-3',
    title: 'Frosted Echo',
    subtitle: 'tap considered fluid haptics that haptics considered fluid haptics gestures pixel light long private. fluid across every fluid across while curated A light pixel while that browsing in with for long in. that beautiful feel tap forever light fluid on while for long press',
    icon: 'trophy',
    gradient: 'pastel',
  },
  {
    id: 'section-39066-4',
    title: 'Frosted Codex',
    subtitle: 'light long private curated beautiful and beautiful press gestures press private curated every forever. remaining for fast or every and curated press and haptics browsing every or every designed and considered and. beautiful every across private curated and or haptics light in on every',
    icon: 'pizza',
    gradient: 'cosmic',
  },
  {
    id: 'section-39066-5',
    title: 'Silky Beacon',
    subtitle: 'curated every forever browsing while long modes gestures every curated every designed modes experience. curated for light across that on across gestures feel fast considered tap while on that gestures tap while. that every in while long gestures and light curated that haptics on',
    icon: 'film',
    gradient: 'amber',
  },
  {
    id: 'section-39066-6',
    title: 'Frosted Studio',
    subtitle: 'designed modes experience haptics gestures across fast fast across and that beautiful pixel or. private curated haptics designed haptics curated while with private in with long long every considered press while pixel. forever private private press fast light designed with gestures and light curated',
    icon: 'globe',
    gradient: 'sunset',
  },
  {
    id: 'section-39066-7',
    title: 'Cosmic Loom',
    subtitle: 'beautiful pixel or every pixel and fast for alive beautiful modes gestures alive haptics. gestures and A alive across designed for feel private in beautiful or and every every pixel with press. and experience curated modes across long fluid that experience press with fast',
    icon: 'medal',
    gradient: 'sunset',
  },
  {
    id: 'section-39066-8',
    title: 'Brisk Spark',
    subtitle: 'gestures alive haptics designed fluid alive designed that on A A long forever across. A haptics modes press dark fast remaining pixel haptics press experience every light remaining haptics light and across. in that light for across haptics fluid modes tap with every while',
    icon: 'briefcase',
    gradient: 'brand',
  },
  {
    id: 'section-39066-9',
    title: 'Silky Compass',
    subtitle: 'long forever across modes dark on and and gestures forever gestures gestures across on. pixel and browsing in private remaining and long fast with long gestures and experience on light light while. haptics designed gestures A in dark long with remaining with modes alive',
    icon: 'school',
    gradient: 'brand',
  },
  {
    id: 'section-39066-10',
    title: 'Buttery Tapestry',
    subtitle: 'gestures across on private that in and private forever private long alive fluid dark. pixel designed while and across A fluid while remaining fast dark A long feel private fast modes pixel. and browsing and every for feel every and designed tap or A',
    icon: 'newspaper',
    gradient: 'fire',
  },
  {
    id: 'section-39066-11',
    title: 'Deep Tapestry',
    subtitle: 'alive fluid dark every experience designed while long with designed on with and haptics. light that gestures experience considered every gestures light and A on remaining while that experience alive remaining or. across fast beautiful on in or alive and pixel and forever tap',
    icon: 'image',
    gradient: 'pastel',
  },
  {
    id: 'section-39066-12',
    title: 'Snappy Tapestry',
    subtitle: 'with and haptics considered every experience browsing tap or every modes every tap light. for while curated with gestures A and while tap for and for or for remaining light considered private. long in browsing gestures in remaining light dark while beautiful gestures gestures',
    icon: 'grid',
    gradient: 'aurora',
  },
  {
    id: 'section-39066-13',
    title: 'Cosmic Saga',
    subtitle: 'every tap light light experience gestures pixel curated or across that curated and curated. or beautiful designed alive on press fluid press that fluid or every browsing beautiful that haptics tap for. every on or long fast long feel A beautiful dark modes A',
    icon: 'layers',
    gradient: 'aurora',
  },
  {
    id: 'section-39066-14',
    title: 'Glassy Atlas',
    subtitle: 'curated and curated remaining or browsing light light A long with long every private. A across and long with long A modes considered modes for fast considered for designed or and experience. or alive and private and or gestures light tap pixel A press',
    icon: 'pulse',
    gradient: 'midnight',
  },
];

const HERO_TITLE = 'Analytics';
const HERO_SUBTITLE = 'Browsing time and topics over time.';
const FOOTER_TITLE = 'Keep going with Analytics';
const FOOTER_BODY = 'for press light that private light on long pixel light feel fast fast light. haptics on and across and private gestures considered modes long forever in curated experience forever light modes feel. and considered or dark experience and experience every across while modes gestures';

export const HistoryAnalyticsScreen: React.FC = () => {
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
      variant="neon"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Analytics"
        subtitle="Browsing time and topics over time."
        showBack={true}
        rightIcon="analytics"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="neon"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>89%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '89%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>42%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '42%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Pulse</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Aurora</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>81%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '81%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Brisk Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>34%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '34%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Beacon</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>77%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '77%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>30%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '30%' }]}
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
