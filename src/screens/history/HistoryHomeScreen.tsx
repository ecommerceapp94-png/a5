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
    id: 'item-1755-1',
    title: 'Glassy Aurora 1',
    description: 'light for press alive that considered haptics long alive press with press every tap. with light or tap feel on light tap tap dark private A gestures tap every considered long fast. A across haptics alive and haptics press tap alive fluid feel dark',
    icon: 'gift',
    gradient: 'fire',
    tone: 'warning',
    meta: '50 mins ago',
    stat1: 295,
    stat2: 10,
    stat3: '4.5',
    verb: 'Highlighted',
  },
  {
    id: 'item-1755-2',
    title: 'Sleek Echo 2',
    description: 'for press alive that considered haptics long alive press with press every tap remaining. or tap feel on light tap tap dark private A gestures tap every considered long fast or curated. alive and haptics press tap alive fluid feel dark on curated designed',
    icon: 'leaf',
    gradient: 'ocean',
    tone: 'info',
    meta: '51 mins ago',
    stat1: 308,
    stat2: 17,
    stat3: '1.4',
    verb: 'Translated',
  },
  {
    id: 'item-1755-3',
    title: 'Brisk Spark 3',
    description: 'press alive that considered haptics long alive press with press every tap remaining A. feel on light tap tap dark private A gestures tap every considered long fast or curated with A. press tap alive fluid feel dark on curated designed remaining fluid across',
    icon: 'cart',
    gradient: 'pastel',
    tone: 'primary',
    meta: '52 mins ago',
    stat1: 321,
    stat2: 24,
    stat3: '3.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1755-4',
    title: 'Soft Stream 4',
    description: 'alive that considered haptics long alive press with press every tap remaining A while. light tap tap dark private A gestures tap every considered long fast or curated with A haptics browsing. fluid feel dark on curated designed remaining fluid across dark pixel modes',
    icon: 'medal',
    gradient: 'midnight',
    tone: 'success',
    meta: '53 mins ago',
    stat1: 334,
    stat2: 31,
    stat3: '0.2',
    verb: 'Read',
  },
  {
    id: 'item-1755-5',
    title: 'Crisp Codex 5',
    description: 'that considered haptics long alive press with press every tap remaining A while fluid. tap dark private A gestures tap every considered long fast or curated with A haptics browsing haptics dark. on curated designed remaining fluid across dark pixel modes considered tap and',
    icon: 'star',
    gradient: 'sunset',
    tone: 'success',
    meta: '54 mins ago',
    stat1: 347,
    stat2: 38,
    stat3: '2.1',
    verb: 'Read',
  },
  {
    id: 'item-1755-6',
    title: 'Cosmic Studio 6',
    description: 'considered haptics long alive press with press every tap remaining A while fluid A. private A gestures tap every considered long fast or curated with A haptics browsing haptics dark in considered. remaining fluid across dark pixel modes considered tap and pixel fast on',
    icon: 'cart',
    gradient: 'amber',
    tone: 'success',
    meta: '55 mins ago',
    stat1: 360,
    stat2: 45,
    stat3: '4.0',
    verb: 'Read',
  },
  {
    id: 'item-1755-7',
    title: 'Vibrant Pulse 7',
    description: 'haptics long alive press with press every tap remaining A while fluid A dark. gestures tap every considered long fast or curated with A haptics browsing haptics dark in considered light press. dark pixel modes considered tap and pixel fast on or dark every',
    icon: 'image',
    gradient: 'amber',
    tone: 'success',
    meta: '56 mins ago',
    stat1: 373,
    stat2: 52,
    stat3: '0.9',
    verb: 'Saved',
  },
  {
    id: 'item-1755-8',
    title: 'Elite Loom 8',
    description: 'long alive press with press every tap remaining A while fluid A dark with. every considered long fast or curated with A haptics browsing haptics dark in considered light press beautiful on. considered tap and pixel fast on or dark every haptics and and',
    icon: 'grid',
    gradient: 'amber',
    tone: 'info',
    meta: '57 mins ago',
    stat1: 386,
    stat2: 59,
    stat3: '2.8',
    verb: 'Saved',
  },
  {
    id: 'item-1755-9',
    title: 'Punchy Mosaic 9',
    description: 'alive press with press every tap remaining A while fluid A dark with or. long fast or curated with A haptics browsing haptics dark in considered light press beautiful on every feel. pixel fast on or dark every haptics and and fast curated and',
    icon: 'planet',
    gradient: 'forest',
    tone: 'info',
    meta: '58 mins ago',
    stat1: 399,
    stat2: 66,
    stat3: '4.7',
    verb: 'Archived',
  },
  {
    id: 'item-1755-10',
    title: 'Deep Mosaic 10',
    description: 'press with press every tap remaining A while fluid A dark with or press. or curated with A haptics browsing haptics dark in considered light press beautiful on every feel while fluid. or dark every haptics and and fast curated and that tap feel',
    icon: 'compass',
    gradient: 'forest',
    tone: 'danger',
    meta: '59 mins ago',
    stat1: 412,
    stat2: 73,
    stat3: '1.6',
    verb: 'Opened',
  },
  {
    id: 'item-1755-11',
    title: 'Deep Insight 11',
    description: 'with press every tap remaining A while fluid A dark with or press light. with A haptics browsing haptics dark in considered light press beautiful on every feel while fluid pixel that. haptics and and fast curated and that tap feel that tap across',
    icon: 'cafe',
    gradient: 'neon',
    tone: 'primary',
    meta: '60 mins ago',
    stat1: 425,
    stat2: 80,
    stat3: '3.5',
    verb: 'Pinned',
  },
  {
    id: 'item-1755-12',
    title: 'Premium Drift 12',
    description: 'press every tap remaining A while fluid A dark with or press light curated. haptics browsing haptics dark in considered light press beautiful on every feel while fluid pixel that in and. fast curated and that tap feel that tap across experience curated that',
    icon: 'newspaper',
    gradient: 'brand',
    tone: 'warning',
    meta: '61 mins ago',
    stat1: 438,
    stat2: 87,
    stat3: '0.4',
    verb: 'Shared',
  },
  {
    id: 'item-1755-13',
    title: 'Dreamy Pulse 13',
    description: 'every tap remaining A while fluid A dark with or press light curated remaining. haptics dark in considered light press beautiful on every feel while fluid pixel that in and alive and. that tap feel that tap across experience curated that designed fluid and',
    icon: 'rocket',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '62 mins ago',
    stat1: 451,
    stat2: 94,
    stat3: '2.3',
    verb: 'Opened',
  },
  {
    id: 'item-1755-14',
    title: 'Elite Lens 14',
    description: 'tap remaining A while fluid A dark with or press light curated remaining long. in considered light press beautiful on every feel while fluid pixel that in and alive and in and. that tap across experience curated that designed fluid and every remaining browsing',
    icon: 'flag',
    gradient: 'candy',
    tone: 'primary',
    meta: '63 mins ago',
    stat1: 464,
    stat2: 2,
    stat3: '4.2',
    verb: 'Archived',
  },
  {
    id: 'item-1755-15',
    title: 'Glassy Beacon 15',
    description: 'remaining A while fluid A dark with or press light curated remaining long pixel. light press beautiful on every feel while fluid pixel that in and alive and in and every every. experience curated that designed fluid and every remaining browsing browsing forever fluid',
    icon: 'flame',
    gradient: 'brand',
    tone: 'danger',
    meta: '64 mins ago',
    stat1: 477,
    stat2: 9,
    stat3: '1.1',
    verb: 'Read',
  },
  {
    id: 'item-1755-16',
    title: 'Velvet Forge 16',
    description: 'A while fluid A dark with or press light curated remaining long pixel remaining. beautiful on every feel while fluid pixel that in and alive and in and every every press dark. designed fluid and every remaining browsing browsing forever fluid private alive designed',
    icon: 'cafe',
    gradient: 'neon',
    tone: 'success',
    meta: '65 mins ago',
    stat1: 490,
    stat2: 16,
    stat3: '3.0',
    verb: 'Shared',
  },
  {
    id: 'item-1755-17',
    title: 'Silky Insight 17',
    description: 'while fluid A dark with or press light curated remaining long pixel remaining modes. every feel while fluid pixel that in and alive and in and every every press dark modes designed. every remaining browsing browsing forever fluid private alive designed every or on',
    icon: 'cloud',
    gradient: 'amber',
    tone: 'accent',
    meta: '66 mins ago',
    stat1: 503,
    stat2: 23,
    stat3: '4.9',
    verb: 'Read',
  },
  {
    id: 'item-1755-18',
    title: 'Premium Forge 18',
    description: 'fluid A dark with or press light curated remaining long pixel remaining modes with. while fluid pixel that in and alive and in and every every press dark modes designed in or. browsing forever fluid private alive designed every or on remaining A experience',
    icon: 'flame',
    gradient: 'candy',
    tone: 'success',
    meta: '67 mins ago',
    stat1: 516,
    stat2: 30,
    stat3: '1.8',
    verb: 'Read',
  },
  {
    id: 'item-1755-19',
    title: 'Silky Loom 19',
    description: 'A dark with or press light curated remaining long pixel remaining modes with or. pixel that in and alive and in and every every press dark modes designed in or in and. private alive designed every or on remaining A experience remaining or with',
    icon: 'briefcase',
    gradient: 'amber',
    tone: 'success',
    meta: '68 mins ago',
    stat1: 529,
    stat2: 37,
    stat3: '3.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1755-20',
    title: 'Punchy Quest 20',
    description: 'dark with or press light curated remaining long pixel remaining modes with or and. in and alive and in and every every press dark modes designed in or in and A browsing. every or on remaining A experience remaining or with or for alive',
    icon: 'pricetag',
    gradient: 'amber',
    tone: 'success',
    meta: '69 mins ago',
    stat1: 542,
    stat2: 44,
    stat3: '0.6',
    verb: 'Archived',
  },
  {
    id: 'item-1755-21',
    title: 'Polished Mosaic 21',
    description: 'with or press light curated remaining long pixel remaining modes with or and for. alive and in and every every press dark modes designed in or in and A browsing feel pixel. remaining A experience remaining or with or for alive that gestures tap',
    icon: 'planet',
    gradient: 'sunset',
    tone: 'danger',
    meta: '70 mins ago',
    stat1: 555,
    stat2: 51,
    stat3: '2.5',
    verb: 'Translated',
  },
  {
    id: 'item-1755-22',
    title: 'Deep Loom 22',
    description: 'or press light curated remaining long pixel remaining modes with or and for tap. in and every every press dark modes designed in or in and A browsing feel pixel and press. remaining or with or for alive that gestures tap with considered private',
    icon: 'image',
    gradient: 'neon',
    tone: 'primary',
    meta: '71 mins ago',
    stat1: 568,
    stat2: 58,
    stat3: '4.4',
    verb: 'Shared',
  },
  {
    id: 'item-1755-23',
    title: 'Punchy Pulse 23',
    description: 'press light curated remaining long pixel remaining modes with or and for tap on. every every press dark modes designed in or in and A browsing feel pixel and press A across. or for alive that gestures tap with considered private curated feel dark',
    icon: 'newspaper',
    gradient: 'midnight',
    tone: 'accent',
    meta: '72 mins ago',
    stat1: 581,
    stat2: 65,
    stat3: '1.3',
    verb: 'Archived',
  },
  {
    id: 'item-1755-24',
    title: 'Elite Pulse 24',
    description: 'light curated remaining long pixel remaining modes with or and for tap on that. press dark modes designed in or in and A browsing feel pixel and press A across and remaining. that gestures tap with considered private curated feel dark tap and considered',
    icon: 'speedometer',
    gradient: 'candy',
    tone: 'danger',
    meta: '73 mins ago',
    stat1: 594,
    stat2: 72,
    stat3: '3.2',
    verb: 'Highlighted',
  },
  {
    id: 'item-1755-25',
    title: 'Elite Studio 25',
    description: 'curated remaining long pixel remaining modes with or and for tap on that private. modes designed in or in and A browsing feel pixel and press A across and remaining every fluid. with considered private curated feel dark tap and considered while every pixel',
    icon: 'eye',
    gradient: 'neon',
    tone: 'info',
    meta: '74 mins ago',
    stat1: 607,
    stat2: 79,
    stat3: '0.1',
    verb: 'Read',
  },
  {
    id: 'item-1755-26',
    title: 'Vibrant Pulse 26',
    description: 'remaining long pixel remaining modes with or and for tap on that private forever. in or in and A browsing feel pixel and press A across and remaining every fluid remaining press. curated feel dark tap and considered while every pixel private forever that',
    icon: 'speedometer',
    gradient: 'pastel',
    tone: 'success',
    meta: '75 mins ago',
    stat1: 620,
    stat2: 86,
    stat3: '2.0',
    verb: 'Shared',
  },
  {
    id: 'item-1755-27',
    title: 'Elite Echo 27',
    description: 'long pixel remaining modes with or and for tap on that private forever every. in and A browsing feel pixel and press A across and remaining every fluid remaining press designed while. tap and considered while every pixel private forever that feel designed beautiful',
    icon: 'school',
    gradient: 'amber',
    tone: 'accent',
    meta: '76 mins ago',
    stat1: 633,
    stat2: 93,
    stat3: '3.9',
    verb: 'Archived',
  },
  {
    id: 'item-1755-28',
    title: 'Brisk Stream 28',
    description: 'pixel remaining modes with or and for tap on that private forever every that. A browsing feel pixel and press A across and remaining every fluid remaining press designed while experience private. while every pixel private forever that feel designed beautiful alive in and',
    icon: 'briefcase',
    gradient: 'candy',
    tone: 'danger',
    meta: '77 mins ago',
    stat1: 646,
    stat2: 1,
    stat3: '0.8',
    verb: 'Saved',
  },
  {
    id: 'item-1755-29',
    title: 'Crisp Aurora 29',
    description: 'remaining modes with or and for tap on that private forever every that browsing. feel pixel and press A across and remaining every fluid remaining press designed while experience private on with. private forever that feel designed beautiful alive in and browsing designed that',
    icon: 'book',
    gradient: 'neon',
    tone: 'info',
    meta: '78 mins ago',
    stat1: 659,
    stat2: 8,
    stat3: '2.7',
    verb: 'Saved',
  },
  {
    id: 'item-1755-30',
    title: 'Sleek Forge 30',
    description: 'modes with or and for tap on that private forever every that browsing experience. and press A across and remaining every fluid remaining press designed while experience private on with private while. feel designed beautiful alive in and browsing designed that A every or',
    icon: 'extension-puzzle',
    gradient: 'forest',
    tone: 'info',
    meta: '79 mins ago',
    stat1: 672,
    stat2: 15,
    stat3: '4.6',
    verb: 'Searched',
  },
  {
    id: 'item-1755-31',
    title: 'Silky Atlas 31',
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
    id: 'item-1755-32',
    title: 'Lush Beacon 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-29835-1',
    title: 'Glassy Drift',
    subtitle: 'gestures press experience considered private alive every across on dark curated that A long. alive every while modes with press alive fast curated remaining on press feel for with tap across remaining. or curated light every forever with feel curated browsing dark and for',
    icon: 'shield',
    gradient: 'amber',
  },
  {
    id: 'section-29835-2',
    title: 'Polished Aurora',
    subtitle: 'that A long feel browsing remaining in private fast A in curated experience with. browsing A gestures and every alive or while and dark modes considered that alive with every haptics in. while alive for and beautiful long on forever curated tap light in',
    icon: 'pricetag',
    gradient: 'neon',
  },
  {
    id: 'section-29835-3',
    title: 'Lush Aurora',
    subtitle: 'curated experience with every on dark that private in haptics gestures feel or dark. across haptics and browsing and with for modes fluid alive feel pixel and remaining A forever experience and. with fast every every for and browsing or feel with and and',
    icon: 'briefcase',
    gradient: 'brand',
  },
  {
    id: 'section-29835-4',
    title: 'Silky Loom',
    subtitle: 'feel or dark designed light modes and alive designed in pixel light pixel every. long considered beautiful or light dark fluid dark long experience on fast curated light and gestures designed across. every fast forever feel and every for press forever for across in',
    icon: 'pulse',
    gradient: 'pastel',
  },
  {
    id: 'section-29835-5',
    title: 'Crisp Forge',
    subtitle: 'light pixel every private every alive remaining modes curated light fluid browsing every tap. forever gestures tap press on fast in that and and and on every designed fluid designed every considered. pixel and every press fast in fast and on press every designed',
    icon: 'trophy',
    gradient: 'aurora',
  },
  {
    id: 'section-29835-6',
    title: 'Silky Quest',
    subtitle: 'browsing every tap and gestures while or long gestures while fluid while private fast. every and alive tap for and pixel gestures pixel A in and every feel long and forever every. press fast alive alive for with considered feel while feel for haptics',
    icon: 'musical-notes',
    gradient: 'amber',
  },
  {
    id: 'section-29835-7',
    title: 'Dreamy Quest',
    subtitle: 'while private fast fluid across every alive every designed press light light curated forever. private private feel fluid browsing light tap while considered haptics A haptics designed or private modes pixel experience. fast every curated press feel private feel light alive alive modes across',
    icon: 'star',
    gradient: 'cosmic',
  },
  {
    id: 'section-29835-8',
    title: 'Subtle Echo',
    subtitle: 'light curated forever for fluid press with experience dark haptics private and private forever. considered tap every in on every private on remaining and and tap beautiful private private modes pixel long. considered and light light pixel for curated and every experience with and',
    icon: 'compass',
    gradient: 'amber',
  },
  {
    id: 'section-29835-9',
    title: 'Soft Compass',
    subtitle: 'and private forever long long designed while browsing designed tap haptics feel for press. remaining feel remaining with modes forever alive private and and long long haptics private on fast experience light. feel for remaining curated every on beautiful experience tap gestures modes designed',
    icon: 'pizza',
    gradient: 'pastel',
  },
  {
    id: 'section-29835-10',
    title: 'Sleek Insight',
    subtitle: 'feel for press every every every in A haptics curated on in beautiful that. that that dark remaining fast or beautiful that and light and feel light remaining curated fluid every experience. while on A in remaining gestures experience for modes A and private',
    icon: 'cloud',
    gradient: 'forest',
  },
  {
    id: 'section-29835-11',
    title: 'Premium Mosaic',
    subtitle: 'in beautiful that private long on that forever light long long and with curated. in that that across private A fast alive feel haptics remaining experience press alive tap feel curated fluid. with dark remaining press across every haptics on beautiful press browsing A',
    icon: 'star',
    gradient: 'sunset',
  },
  {
    id: 'section-29835-12',
    title: 'Cosmic Aurora',
    subtitle: 'and with curated long curated feel and tap fluid considered feel gestures light every. curated every and designed in or with light in designed curated while browsing designed in alive considered curated. A for on designed experience and remaining across in for in alive',
    icon: 'pizza',
    gradient: 'midnight',
  },
  {
    id: 'section-29835-13',
    title: 'Subtle Quest',
    subtitle: 'gestures light every remaining considered remaining long feel remaining across on across fluid remaining. modes long while gestures for A every and A with browsing forever modes private across fluid remaining pixel. and every every while experience every while fast feel dark for remaining',
    icon: 'extension-puzzle',
    gradient: 'ocean',
  },
  {
    id: 'section-29835-14',
    title: 'Silky Saga',
    subtitle: 'across fluid remaining or curated designed while haptics private tap remaining or for haptics. beautiful beautiful every on fast long haptics modes gestures and pixel fluid considered curated every every long on. with tap press pixel press pixel and on gestures browsing modes remaining',
    icon: 'lock-closed',
    gradient: 'midnight',
  },
];

const HERO_TITLE = 'History';
const HERO_SUBTITLE = 'Today, Yesterday, Last week.';
const FOOTER_TITLE = 'Keep going with History';
const FOOTER_BODY = 'A across haptics alive and haptics press tap alive fluid feel dark on curated. fast designed browsing experience feel haptics tap or press beautiful light pixel press fluid fast gestures fluid and. and designed for on in haptics private curated press on every that';

export const HistoryHomeScreen: React.FC = () => {
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
      variant="forest"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="History"
        subtitle="Today, Yesterday, Last week."
        showBack={false}
        rightIcon="time"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="forest"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>50%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '50%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>93%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '93%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>46%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '46%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Aurora</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>89%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '89%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>42%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '42%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Loom</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>38%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '38%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>81%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '81%' }]}
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
