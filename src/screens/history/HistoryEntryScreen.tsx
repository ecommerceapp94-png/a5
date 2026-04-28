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
    id: 'item-1892-1',
    title: 'Snappy Beacon 1',
    description: 'that fast and long beautiful press pixel feel dark on long modes alive pixel. that remaining feel with private light designed haptics beautiful that and every remaining or in in for and. press haptics light forever on every beautiful considered experience A and considered',
    icon: 'extension-puzzle',
    gradient: 'brand',
    tone: 'success',
    meta: '7 mins ago',
    stat1: 116,
    stat2: 78,
    stat3: '4.8',
    verb: 'Shared',
  },
  {
    id: 'item-1892-2',
    title: 'Velvet Saga 2',
    description: 'fast and long beautiful press pixel feel dark on long modes alive pixel designed. feel with private light designed haptics beautiful that and every remaining or in in for and every fluid. forever on every beautiful considered experience A and considered with long modes',
    icon: 'analytics',
    gradient: 'amber',
    tone: 'accent',
    meta: '8 mins ago',
    stat1: 129,
    stat2: 85,
    stat3: '1.7',
    verb: 'Opened',
  },
  {
    id: 'item-1892-3',
    title: 'Frosted Lens 3',
    description: 'and long beautiful press pixel feel dark on long modes alive pixel designed in. private light designed haptics beautiful that and every remaining or in in for and every fluid curated beautiful. beautiful considered experience A and considered with long modes tap long tap',
    icon: 'bookmark',
    gradient: 'candy',
    tone: 'primary',
    meta: '9 mins ago',
    stat1: 142,
    stat2: 92,
    stat3: '3.6',
    verb: 'Archived',
  },
  {
    id: 'item-1892-4',
    title: 'Glassy Compass 4',
    description: 'long beautiful press pixel feel dark on long modes alive pixel designed in curated. designed haptics beautiful that and every remaining or in in for and every fluid curated beautiful for in. A and considered with long modes tap long tap and alive browsing',
    icon: 'cart',
    gradient: 'brand',
    tone: 'danger',
    meta: '10 mins ago',
    stat1: 155,
    stat2: 99,
    stat3: '0.5',
    verb: 'Searched',
  },
  {
    id: 'item-1892-5',
    title: 'Snappy Echo 5',
    description: 'beautiful press pixel feel dark on long modes alive pixel designed in curated designed. beautiful that and every remaining or in in for and every fluid curated beautiful for in browsing press. with long modes tap long tap and alive browsing with dark long',
    icon: 'analytics',
    gradient: 'neon',
    tone: 'warning',
    meta: '11 mins ago',
    stat1: 168,
    stat2: 7,
    stat3: '2.4',
    verb: 'Translated',
  },
  {
    id: 'item-1892-6',
    title: 'Brisk Insight 6',
    description: 'press pixel feel dark on long modes alive pixel designed in curated designed press. and every remaining or in in for and every fluid curated beautiful for in browsing press in long. tap long tap and alive browsing with dark long curated designed haptics',
    icon: 'extension-puzzle',
    gradient: 'ocean',
    tone: 'primary',
    meta: '12 mins ago',
    stat1: 181,
    stat2: 14,
    stat3: '4.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-1892-7',
    title: 'Premium Pulse 7',
    description: 'pixel feel dark on long modes alive pixel designed in curated designed press curated. remaining or in in for and every fluid curated beautiful for in browsing press in long for designed. and alive browsing with dark long curated designed haptics haptics haptics browsing',
    icon: 'film',
    gradient: 'midnight',
    tone: 'info',
    meta: '13 mins ago',
    stat1: 194,
    stat2: 21,
    stat3: '1.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1892-8',
    title: 'Elite Saga 8',
    description: 'feel dark on long modes alive pixel designed in curated designed press curated while. in in for and every fluid curated beautiful for in browsing press in long for designed and alive. with dark long curated designed haptics haptics haptics browsing across experience and',
    icon: 'leaf',
    gradient: 'pastel',
    tone: 'success',
    meta: '14 mins ago',
    stat1: 207,
    stat2: 28,
    stat3: '3.1',
    verb: 'Shared',
  },
  {
    id: 'item-1892-9',
    title: 'Frosted Codex 9',
    description: 'dark on long modes alive pixel designed in curated designed press curated while and. for and every fluid curated beautiful for in browsing press in long for designed and alive for experience. curated designed haptics haptics haptics browsing across experience and that haptics curated',
    icon: 'newspaper',
    gradient: 'sunset',
    tone: 'accent',
    meta: '15 mins ago',
    stat1: 220,
    stat2: 35,
    stat3: '0.0',
    verb: 'Visited',
  },
  {
    id: 'item-1892-10',
    title: 'Cosmic Saga 10',
    description: 'on long modes alive pixel designed in curated designed press curated while and remaining. every fluid curated beautiful for in browsing press in long for designed and alive for experience press for. haptics haptics browsing across experience and that haptics curated while fluid alive',
    icon: 'compass',
    gradient: 'candy',
    tone: 'danger',
    meta: '16 mins ago',
    stat1: 233,
    stat2: 42,
    stat3: '1.9',
    verb: 'Visited',
  },
  {
    id: 'item-1892-11',
    title: 'Frosted Pulse 11',
    description: 'long modes alive pixel designed in curated designed press curated while and remaining experience. curated beautiful for in browsing press in long for designed and alive for experience press for modes fast. across experience and that haptics curated while fluid alive designed fluid pixel',
    icon: 'eye',
    gradient: 'aurora',
    tone: 'danger',
    meta: '17 mins ago',
    stat1: 246,
    stat2: 49,
    stat3: '3.8',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1892-12',
    title: 'Elite Pulse 12',
    description: 'modes alive pixel designed in curated designed press curated while and remaining experience with. for in browsing press in long for designed and alive for experience press for modes fast and curated. that haptics curated while fluid alive designed fluid pixel and fast fast',
    icon: 'speedometer',
    gradient: 'aurora',
    tone: 'success',
    meta: '18 mins ago',
    stat1: 259,
    stat2: 56,
    stat3: '0.7',
    verb: 'Visited',
  },
  {
    id: 'item-1892-13',
    title: 'Elite Mosaic 13',
    description: 'alive pixel designed in curated designed press curated while and remaining experience with A. browsing press in long for designed and alive for experience press for modes fast and curated experience A. while fluid alive designed fluid pixel and fast fast every that every',
    icon: 'image',
    gradient: 'sunset',
    tone: 'danger',
    meta: '19 mins ago',
    stat1: 272,
    stat2: 63,
    stat3: '2.6',
    verb: 'Read',
  },
  {
    id: 'item-1892-14',
    title: 'Deep Mosaic 14',
    description: 'pixel designed in curated designed press curated while and remaining experience with A while. in long for designed and alive for experience press for modes fast and curated experience A gestures experience. designed fluid pixel and fast fast every that every for gestures light',
    icon: 'medal',
    gradient: 'aurora',
    tone: 'success',
    meta: '20 mins ago',
    stat1: 285,
    stat2: 70,
    stat3: '4.5',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1892-15',
    title: 'Deep Pulse 15',
    description: 'designed in curated designed press curated while and remaining experience with A while across. for designed and alive for experience press for modes fast and curated experience A gestures experience considered private. and fast fast every that every for gestures light haptics A for',
    icon: 'planet',
    gradient: 'amber',
    tone: 'success',
    meta: '21 mins ago',
    stat1: 298,
    stat2: 77,
    stat3: '1.4',
    verb: 'Pinned',
  },
  {
    id: 'item-1892-16',
    title: 'Elite Mosaic 16',
    description: 'in curated designed press curated while and remaining experience with A while across fast. and alive for experience press for modes fast and curated experience A gestures experience considered private gestures every. every that every for gestures light haptics A for haptics every for',
    icon: 'cafe',
    gradient: 'sunset',
    tone: 'warning',
    meta: '22 mins ago',
    stat1: 311,
    stat2: 84,
    stat3: '3.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1892-17',
    title: 'Deep Spark 17',
    description: 'curated designed press curated while and remaining experience with A while across fast experience. for experience press for modes fast and curated experience A gestures experience considered private gestures every tap while. for gestures light haptics A for haptics every for private curated and',
    icon: 'film',
    gradient: 'cosmic',
    tone: 'success',
    meta: '23 mins ago',
    stat1: 324,
    stat2: 91,
    stat3: '0.2',
    verb: 'Archived',
  },
  {
    id: 'item-1892-18',
    title: 'Soft Atlas 18',
    description: 'designed press curated while and remaining experience with A while across fast experience remaining. press for modes fast and curated experience A gestures experience considered private gestures every tap while curated for. haptics A for haptics every for private curated and for considered on',
    icon: 'compass',
    gradient: 'sunset',
    tone: 'danger',
    meta: '24 mins ago',
    stat1: 337,
    stat2: 98,
    stat3: '2.1',
    verb: 'Searched',
  },
  {
    id: 'item-1892-19',
    title: 'Lush Beacon 19',
    description: 'press curated while and remaining experience with A while across fast experience remaining designed. modes fast and curated experience A gestures experience considered private gestures every tap while curated for fast long. haptics every for private curated and for considered on across considered designed',
    icon: 'medal',
    gradient: 'neon',
    tone: 'warning',
    meta: '25 mins ago',
    stat1: 350,
    stat2: 6,
    stat3: '4.0',
    verb: 'Read',
  },
  {
    id: 'item-1892-20',
    title: 'Velvet Atlas 20',
    description: 'curated while and remaining experience with A while across fast experience remaining designed long. and curated experience A gestures experience considered private gestures every tap while curated for fast long and feel. private curated and for considered on across considered designed every forever long',
    icon: 'pricetag',
    gradient: 'ocean',
    tone: 'success',
    meta: '26 mins ago',
    stat1: 363,
    stat2: 13,
    stat3: '0.9',
    verb: 'Opened',
  },
  {
    id: 'item-1892-21',
    title: 'Lush Forge 21',
    description: 'while and remaining experience with A while across fast experience remaining designed long in. experience A gestures experience considered private gestures every tap while curated for fast long and feel fast beautiful. for considered on across considered designed every forever long dark modes on',
    icon: 'star',
    gradient: 'amber',
    tone: 'primary',
    meta: '27 mins ago',
    stat1: 376,
    stat2: 20,
    stat3: '2.8',
    verb: 'Pinned',
  },
  {
    id: 'item-1892-22',
    title: 'Silky Studio 22',
    description: 'and remaining experience with A while across fast experience remaining designed long in on. gestures experience considered private gestures every tap while curated for fast long and feel fast beautiful beautiful A. across considered designed every forever long dark modes on while browsing tap',
    icon: 'school',
    gradient: 'brand',
    tone: 'warning',
    meta: '28 mins ago',
    stat1: 389,
    stat2: 27,
    stat3: '4.7',
    verb: 'Translated',
  },
  {
    id: 'item-1892-23',
    title: 'Vibrant Loom 23',
    description: 'remaining experience with A while across fast experience remaining designed long in on designed. considered private gestures every tap while curated for fast long and feel fast beautiful beautiful A and with. every forever long dark modes on while browsing tap curated beautiful designed',
    icon: 'gift',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '29 mins ago',
    stat1: 402,
    stat2: 34,
    stat3: '1.6',
    verb: 'Followed',
  },
  {
    id: 'item-1892-24',
    title: 'Punchy Tapestry 24',
    description: 'experience with A while across fast experience remaining designed long in on designed while. gestures every tap while curated for fast long and feel fast beautiful beautiful A and with and and. dark modes on while browsing tap curated beautiful designed and on and',
    icon: 'rocket',
    gradient: 'midnight',
    tone: 'accent',
    meta: '30 mins ago',
    stat1: 415,
    stat2: 41,
    stat3: '3.5',
    verb: 'Searched',
  },
  {
    id: 'item-1892-25',
    title: 'Subtle Tapestry 25',
    description: 'with A while across fast experience remaining designed long in on designed while browsing. tap while curated for fast long and feel fast beautiful beautiful A and with and and on on. while browsing tap curated beautiful designed and on and curated beautiful or',
    icon: 'cafe',
    gradient: 'fire',
    tone: 'warning',
    meta: '31 mins ago',
    stat1: 428,
    stat2: 48,
    stat3: '0.4',
    verb: 'Archived',
  },
  {
    id: 'item-1892-26',
    title: 'Subtle Studio 26',
    description: 'A while across fast experience remaining designed long in on designed while browsing and. curated for fast long and feel fast beautiful beautiful A and with and and on on with that. curated beautiful designed and on and curated beautiful or long long long',
    icon: 'shield',
    gradient: 'ocean',
    tone: 'danger',
    meta: '32 mins ago',
    stat1: 441,
    stat2: 55,
    stat3: '2.3',
    verb: 'Visited',
  },
  {
    id: 'item-1892-27',
    title: 'Vibrant Spark 27',
    description: 'while across fast experience remaining designed long in on designed while browsing and curated. fast long and feel fast beautiful beautiful A and with and and on on with that alive pixel. and on and curated beautiful or long long long feel haptics with',
    icon: 'globe',
    gradient: 'neon',
    tone: 'danger',
    meta: '33 mins ago',
    stat1: 454,
    stat2: 62,
    stat3: '4.2',
    verb: 'Translated',
  },
  {
    id: 'item-1892-28',
    title: 'Soft Stream 28',
    description: 'across fast experience remaining designed long in on designed while browsing and curated long. and feel fast beautiful beautiful A and with and and on on with that alive pixel fast designed. curated beautiful or long long long feel haptics with every fast beautiful',
    icon: 'cart',
    gradient: 'aurora',
    tone: 'primary',
    meta: '34 mins ago',
    stat1: 467,
    stat2: 69,
    stat3: '1.1',
    verb: 'Visited',
  },
  {
    id: 'item-1892-29',
    title: 'Crisp Atlas 29',
    description: 'fast experience remaining designed long in on designed while browsing and curated long every. fast beautiful beautiful A and with and and on on with that alive pixel fast designed dark press. long long long feel haptics with every fast beautiful fast gestures in',
    icon: 'paw',
    gradient: 'midnight',
    tone: 'danger',
    meta: '35 mins ago',
    stat1: 480,
    stat2: 76,
    stat3: '3.0',
    verb: 'Searched',
  },
  {
    id: 'item-1892-30',
    title: 'Lush Mosaic 30',
    description: 'experience remaining designed long in on designed while browsing and curated long every alive. beautiful A and with and and on on with that alive pixel fast designed dark press considered fast. feel haptics with every fast beautiful fast gestures in and dark remaining',
    icon: 'musical-notes',
    gradient: 'aurora',
    tone: 'warning',
    meta: '36 mins ago',
    stat1: 493,
    stat2: 83,
    stat3: '4.9',
    verb: 'Visited',
  },
  {
    id: 'item-1892-31',
    title: 'Deep Stream 31',
    description: 'remaining designed long in on designed while browsing and curated long every alive designed. and with and and on on with that alive pixel fast designed dark press considered fast alive long. every fast beautiful fast gestures in and dark remaining and tap and',
    icon: 'sparkles',
    gradient: 'ocean',
    tone: 'danger',
    meta: '37 mins ago',
    stat1: 506,
    stat2: 90,
    stat3: '1.8',
    verb: 'Pinned',
  },
  {
    id: 'item-1892-32',
    title: 'Crisp Loom 32',
    description: 'designed long in on designed while browsing and curated long every alive designed that. and and on on with that alive pixel fast designed dark press considered fast alive long forever and. fast gestures in and dark remaining and tap and and gestures browsing',
    icon: 'extension-puzzle',
    gradient: 'aurora',
    tone: 'warning',
    meta: '38 mins ago',
    stat1: 519,
    stat2: 97,
    stat3: '3.7',
    verb: 'Translated',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-32164-1',
    title: 'Buttery Lens',
    subtitle: 'and for tap forever with long press and tap with pixel on for tap. while in pixel forever alive tap beautiful long and fluid that with haptics pixel haptics designed tap that. long haptics every A long forever fluid pixel or beautiful every feel',
    icon: 'rocket',
    gradient: 'ocean',
  },
  {
    id: 'section-32164-2',
    title: 'Crisp Mosaic',
    subtitle: 'on for tap forever long every experience dark pixel considered feel every modes light. press feel for private private remaining feel remaining considered alive and and designed remaining or private remaining alive. pixel and or while designed and on feel modes or and alive',
    icon: 'school',
    gradient: 'amber',
  },
  {
    id: 'section-32164-3',
    title: 'Glassy Studio',
    subtitle: 'every modes light browsing gestures dark fast light every every gestures and on and. fast and remaining alive and forever dark for for long in A beautiful and and curated tap private. haptics beautiful and private and press remaining pixel while beautiful experience haptics',
    icon: 'pulse',
    gradient: 'ocean',
  },
  {
    id: 'section-32164-4',
    title: 'Lush Compass',
    subtitle: 'and on and pixel for long every every haptics curated across haptics across for. designed and for browsing while and long with and or in long fluid and across gestures modes with. haptics on haptics curated considered gestures A modes private long considered fluid',
    icon: 'leaf',
    gradient: 'forest',
  },
  {
    id: 'section-32164-5',
    title: 'Buttery Tapestry',
    subtitle: 'haptics across for private that forever for and on curated press browsing or and. and long pixel designed that remaining forever every gestures alive designed fast on tap A that with dark. curated browsing in light with feel long pixel A press fluid light',
    icon: 'newspaper',
    gradient: 'sunset',
  },
  {
    id: 'section-32164-6',
    title: 'Deep Drift',
    subtitle: 'browsing or and feel dark browsing experience that private private browsing and dark alive. fast while long experience light pixel or modes dark experience remaining press long experience curated fluid designed modes. or forever forever across and dark with haptics designed long feel while',
    icon: 'heart',
    gradient: 'sunset',
  },
  {
    id: 'section-32164-7',
    title: 'Frosted Studio',
    subtitle: 'and dark alive gestures that private experience light alive across remaining experience long remaining. every or alive browsing alive gestures and fast fluid and every A every while curated and every for. for or while haptics pixel every remaining on light considered pixel and',
    icon: 'paw',
    gradient: 'pastel',
  },
  {
    id: 'section-32164-8',
    title: 'Vibrant Codex',
    subtitle: 'experience long remaining and across private across and modes while browsing long designed press. haptics for with alive and and alive A and browsing long with with browsing and on browsing long. every on with browsing with every pixel private A or forever modes',
    icon: 'eye',
    gradient: 'midnight',
  },
  {
    id: 'section-32164-9',
    title: 'Vibrant Studio',
    subtitle: 'long designed press designed alive modes that beautiful fast feel remaining designed feel gestures. curated private browsing considered forever in in and in remaining modes forever every considered and every alive A. browsing or considered haptics with forever gestures feel tap across press tap',
    icon: 'cafe',
    gradient: 'cosmic',
  },
  {
    id: 'section-32164-10',
    title: 'Frosted Spark',
    subtitle: 'designed feel gestures every modes A gestures or fluid every forever with tap and. fluid pixel for browsing browsing across with or for light beautiful every gestures on feel dark haptics considered. feel gestures tap dark dark alive dark or every with dark modes',
    icon: 'flash',
    gradient: 'brand',
  },
  {
    id: 'section-32164-11',
    title: 'Dreamy Insight',
    subtitle: 'with tap and experience on and A tap feel alive feel for experience in. press every browsing pixel alive designed remaining fast dark designed pixel every or experience light modes experience long. long dark tap tap gestures that A and across gestures designed considered',
    icon: 'film',
    gradient: 'forest',
  },
  {
    id: 'section-32164-12',
    title: 'Velvet Tapestry',
    subtitle: 'for experience in considered for fluid for and that every every light dark gestures. haptics every with while or remaining curated press experience fluid and experience fast light browsing in remaining every. gestures across tap and A with every browsing A beautiful beautiful modes',
    icon: 'star',
    gradient: 'sunset',
  },
  {
    id: 'section-32164-13',
    title: 'Polished Tapestry',
    subtitle: 'light dark gestures haptics or while A experience feel curated A haptics while experience. alive across that press on browsing tap experience private browsing for gestures remaining and alive every A every. every in browsing browsing press and private dark that remaining forever curated',
    icon: 'analytics',
    gradient: 'aurora',
  },
  {
    id: 'section-32164-14',
    title: 'Velvet Drift',
    subtitle: 'haptics while experience tap every with private and feel alive remaining private private experience. across light on private haptics forever modes feel tap experience feel A every considered that light with press. feel and fast for every private alive haptics for considered or press',
    icon: 'film',
    gradient: 'sunset',
  },
];

const HERO_TITLE = 'Entry';
const HERO_SUBTITLE = 'Visit metadata and related actions.';
const FOOTER_TITLE = 'Keep going with Entry';
const FOOTER_BODY = 'press haptics light forever on every beautiful considered experience A and considered with long. designed tap and alive in press every considered every fast designed tap pixel with across pixel and that. and fast modes alive A feel for fluid forever pixel forever or';

export const HistoryEntryScreen: React.FC = () => {
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
      variant="candy"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Entry"
        subtitle="Visit metadata and related actions."
        showBack={true}
        rightIcon="document-text"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="candy"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>31%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '31%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>74%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '74%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>70%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '70%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>23%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '23%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>66%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '66%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Aurora</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>62%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '62%' }]}
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
