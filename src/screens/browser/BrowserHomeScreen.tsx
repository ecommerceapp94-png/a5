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
    id: 'item-1741-1',
    title: 'Polished Insight 1',
    description: 'haptics alive and for forever browsing browsing with tap private in dark and considered. for designed fluid with A press every every forever fast pixel browsing beautiful fluid forever private and haptics. every experience while and A haptics fluid that in browsing forever remaining',
    icon: 'briefcase',
    gradient: 'fire',
    tone: 'primary',
    meta: '36 mins ago',
    stat1: 113,
    stat2: 11,
    stat3: '2.9',
    verb: 'Translated',
  },
  {
    id: 'item-1741-2',
    title: 'Premium Tapestry 2',
    description: 'alive and for forever browsing browsing with tap private in dark and considered light. fluid with A press every every forever fast pixel browsing beautiful fluid forever private and haptics and fast. and A haptics fluid that in browsing forever remaining light on considered',
    icon: 'heart',
    gradient: 'midnight',
    tone: 'primary',
    meta: '37 mins ago',
    stat1: 126,
    stat2: 18,
    stat3: '4.8',
    verb: 'Read',
  },
  {
    id: 'item-1741-3',
    title: 'Subtle Mosaic 3',
    description: 'and for forever browsing browsing with tap private in dark and considered light for. A press every every forever fast pixel browsing beautiful fluid forever private and haptics and fast curated dark. fluid that in browsing forever remaining light on considered tap pixel fast',
    icon: 'planet',
    gradient: 'midnight',
    tone: 'success',
    meta: '38 mins ago',
    stat1: 139,
    stat2: 25,
    stat3: '1.7',
    verb: 'Saved',
  },
  {
    id: 'item-1741-4',
    title: 'Deep Stream 4',
    description: 'for forever browsing browsing with tap private in dark and considered light for press. every every forever fast pixel browsing beautiful fluid forever private and haptics and fast curated dark that across. browsing forever remaining light on considered tap pixel fast dark light light',
    icon: 'briefcase',
    gradient: 'amber',
    tone: 'info',
    meta: '39 mins ago',
    stat1: 152,
    stat2: 32,
    stat3: '3.6',
    verb: 'Highlighted',
  },
  {
    id: 'item-1741-5',
    title: 'Crisp Studio 5',
    description: 'forever browsing browsing with tap private in dark and considered light for press alive. forever fast pixel browsing beautiful fluid forever private and haptics and fast curated dark that across alive long. light on considered tap pixel fast dark light light beautiful fast gestures',
    icon: 'star',
    gradient: 'forest',
    tone: 'info',
    meta: '40 mins ago',
    stat1: 165,
    stat2: 39,
    stat3: '0.5',
    verb: 'Visited',
  },
  {
    id: 'item-1741-6',
    title: 'Vibrant Spark 6',
    description: 'browsing browsing with tap private in dark and considered light for press alive that. pixel browsing beautiful fluid forever private and haptics and fast curated dark that across alive long while dark. tap pixel fast dark light light beautiful fast gestures modes across across',
    icon: 'planet',
    gradient: 'pastel',
    tone: 'danger',
    meta: '41 mins ago',
    stat1: 178,
    stat2: 46,
    stat3: '2.4',
    verb: 'Archived',
  },
  {
    id: 'item-1741-7',
    title: 'Soft Insight 7',
    description: 'browsing with tap private in dark and considered light for press alive that considered. beautiful fluid forever private and haptics and fast curated dark that across alive long while dark with light. dark light light beautiful fast gestures modes across across that feel A',
    icon: 'sparkles',
    gradient: 'aurora',
    tone: 'danger',
    meta: '42 mins ago',
    stat1: 191,
    stat2: 53,
    stat3: '4.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1741-8',
    title: 'Premium Stream 8',
    description: 'with tap private in dark and considered light for press alive that considered haptics. forever private and haptics and fast curated dark that across alive long while dark with light or tap. beautiful fast gestures modes across across that feel A every experience A',
    icon: 'speedometer',
    gradient: 'neon',
    tone: 'success',
    meta: '43 mins ago',
    stat1: 204,
    stat2: 60,
    stat3: '1.2',
    verb: 'Searched',
  },
  {
    id: 'item-1741-9',
    title: 'Crisp Compass 9',
    description: 'tap private in dark and considered light for press alive that considered haptics long. and haptics and fast curated dark that across alive long while dark with light or tap feel on. modes across across that feel A every experience A modes forever modes',
    icon: 'briefcase',
    gradient: 'sunset',
    tone: 'warning',
    meta: '44 mins ago',
    stat1: 217,
    stat2: 67,
    stat3: '3.1',
    verb: 'Read',
  },
  {
    id: 'item-1741-10',
    title: 'Snappy Pulse 10',
    description: 'private in dark and considered light for press alive that considered haptics long alive. and fast curated dark that across alive long while dark with light or tap feel on light tap. that feel A every experience A modes forever modes A long feel',
    icon: 'star',
    gradient: 'ocean',
    tone: 'success',
    meta: '45 mins ago',
    stat1: 230,
    stat2: 74,
    stat3: '0.0',
    verb: 'Saved',
  },
  {
    id: 'item-1741-11',
    title: 'Elite Pulse 11',
    description: 'in dark and considered light for press alive that considered haptics long alive press. curated dark that across alive long while dark with light or tap feel on light tap tap dark. every experience A modes forever modes A long feel alive haptics alive',
    icon: 'film',
    gradient: 'amber',
    tone: 'info',
    meta: '46 mins ago',
    stat1: 243,
    stat2: 81,
    stat3: '1.9',
    verb: 'Read',
  },
  {
    id: 'item-1741-12',
    title: 'Elite Halo 12',
    description: 'dark and considered light for press alive that considered haptics long alive press with. that across alive long while dark with light or tap feel on light tap tap dark private A. modes forever modes A long feel alive haptics alive A across haptics',
    icon: 'extension-puzzle',
    gradient: 'forest',
    tone: 'success',
    meta: '47 mins ago',
    stat1: 256,
    stat2: 88,
    stat3: '3.8',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1741-13',
    title: 'Buttery Compass 13',
    description: 'and considered light for press alive that considered haptics long alive press with press. alive long while dark with light or tap feel on light tap tap dark private A gestures tap. A long feel alive haptics alive A across haptics alive and haptics',
    icon: 'newspaper',
    gradient: 'amber',
    tone: 'success',
    meta: '48 mins ago',
    stat1: 269,
    stat2: 95,
    stat3: '0.7',
    verb: 'Followed',
  },
  {
    id: 'item-1741-14',
    title: 'Snappy Lens 14',
    description: 'considered light for press alive that considered haptics long alive press with press every. while dark with light or tap feel on light tap tap dark private A gestures tap every considered. alive haptics alive A across haptics alive and haptics press tap alive',
    icon: 'school',
    gradient: 'sunset',
    tone: 'accent',
    meta: '49 mins ago',
    stat1: 282,
    stat2: 3,
    stat3: '2.6',
    verb: 'Searched',
  },
  {
    id: 'item-1741-15',
    title: 'Glassy Aurora 15',
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
    id: 'item-1741-16',
    title: 'Sleek Echo 16',
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
    id: 'item-1741-17',
    title: 'Brisk Spark 17',
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
    id: 'item-1741-18',
    title: 'Soft Stream 18',
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
    id: 'item-1741-19',
    title: 'Crisp Codex 19',
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
    id: 'item-1741-20',
    title: 'Cosmic Studio 20',
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
    id: 'item-1741-21',
    title: 'Vibrant Pulse 21',
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
    id: 'item-1741-22',
    title: 'Elite Loom 22',
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
    id: 'item-1741-23',
    title: 'Punchy Mosaic 23',
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
    id: 'item-1741-24',
    title: 'Deep Mosaic 24',
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
    id: 'item-1741-25',
    title: 'Deep Insight 25',
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
    id: 'item-1741-26',
    title: 'Premium Drift 26',
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
    id: 'item-1741-27',
    title: 'Dreamy Pulse 27',
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
    id: 'item-1741-28',
    title: 'Elite Lens 28',
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
    id: 'item-1741-29',
    title: 'Glassy Beacon 29',
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
    id: 'item-1741-30',
    title: 'Velvet Forge 30',
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
    id: 'item-1741-31',
    title: 'Silky Insight 31',
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
    id: 'item-1741-32',
    title: 'Premium Forge 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-29597-1',
    title: 'Crisp Stream',
    subtitle: 'every experience feel pixel considered and feel or considered long curated A feel tap. every considered or light experience pixel experience for alive and in in pixel fluid across considered with and. and A while experience every browsing private tap dark considered modes pixel',
    icon: 'lock-closed',
    gradient: 'fire',
  },
  {
    id: 'section-29597-2',
    title: 'Premium Tapestry',
    subtitle: 'A feel tap light alive tap fluid on and and feel considered considered remaining. considered every browsing in tap experience across fast that every tap and with and designed remaining tap every. every feel and feel fast pixel fast while A dark A fluid',
    icon: 'paw',
    gradient: 'midnight',
  },
  {
    id: 'section-29597-3',
    title: 'Glassy Pulse',
    subtitle: 'considered considered remaining considered dark and pixel on beautiful feel every and in for. across while experience while tap beautiful long tap A forever feel experience considered with modes across and that. with long tap private press across gestures designed designed haptics pixel haptics',
    icon: 'school',
    gradient: 'cosmic',
  },
  {
    id: 'section-29597-4',
    title: 'Premium Forge',
    subtitle: 'and in for experience beautiful in considered with in experience experience while feel browsing. every with forever browsing forever considered fluid fast alive for feel light or in press every every browsing. every with fast and dark for press gestures private gestures every and',
    icon: 'bookmark',
    gradient: 'brand',
  },
  {
    id: 'section-29597-5',
    title: 'Sleek Saga',
    subtitle: 'while feel browsing that light pixel that with feel feel private with in every. press private experience beautiful for for private fluid or alive while and feel that every on across or. with A A that fluid tap private with fast alive haptics designed',
    icon: 'star',
    gradient: 'ocean',
  },
  {
    id: 'section-29597-6',
    title: 'Elite Aurora',
    subtitle: 'with in every remaining every for that every while and on every considered dark. fluid dark browsing modes every dark experience designed with press dark press on modes pixel fast in fluid. light and in that and for and haptics long fast tap while',
    icon: 'bookmark',
    gradient: 'brand',
  },
  {
    id: 'section-29597-7',
    title: 'Subtle Mosaic',
    subtitle: 'every considered dark fast considered considered and in beautiful private considered A gestures alive. press curated on fluid fluid curated feel feel remaining every press that press while long haptics fast that. or fluid fluid while A and and with on and forever considered',
    icon: 'planet',
    gradient: 'neon',
  },
  {
    id: 'section-29597-8',
    title: 'Cosmic Atlas',
    subtitle: 'A gestures alive that in remaining experience that while feel gestures long designed A. every experience remaining designed experience long remaining experience while modes that curated light haptics curated fluid tap and. every private while and modes with tap across with remaining every modes',
    icon: 'pricetag',
    gradient: 'pastel',
  },
  {
    id: 'section-29597-9',
    title: 'Brisk Studio',
    subtitle: 'long designed A remaining feel remaining designed gestures every curated fast haptics and modes. pixel modes light modes fast gestures fast fluid with browsing feel fast haptics A haptics on gestures A. press and private remaining beautiful on or considered light designed feel modes',
    icon: 'sparkles',
    gradient: 'brand',
  },
  {
    id: 'section-29597-10',
    title: 'Polished Aurora',
    subtitle: 'haptics and modes on or designed and beautiful across or and private haptics that. considered every designed remaining light that beautiful and alive that while browsing across light on across and press. experience on long while across dark private every A and across on',
    icon: 'cart',
    gradient: 'sunset',
  },
  {
    id: 'section-29597-11',
    title: 'Sleek Tapestry',
    subtitle: 'private haptics that gestures light long that tap remaining considered long designed and on. every or alive for every private long fast browsing or experience press or in and fast while beautiful. beautiful forever on across while and long light modes fluid modes feel',
    icon: 'trophy',
    gradient: 'candy',
  },
  {
    id: 'section-29597-12',
    title: 'Cosmic Aurora',
    subtitle: 'designed and on and experience and light A and press considered browsing on A. forever with while on feel gestures haptics designed tap press in pixel and in A fast fluid and. or long browsing on haptics beautiful curated browsing long every every fluid',
    icon: 'briefcase',
    gradient: 'ocean',
  },
  {
    id: 'section-29597-13',
    title: 'Silky Mosaic',
    subtitle: 'browsing on A tap fluid on or while with long fluid alive beautiful light. that pixel in remaining fast A light modes feel fast every light curated pixel remaining modes in tap. alive and browsing press and browsing on and and while gestures private',
    icon: 'heart',
    gradient: 'amber',
  },
  {
    id: 'section-29597-14',
    title: 'Crisp Forge',
    subtitle: 'alive beautiful light alive that that modes with forever fast every designed alive modes. while tap across press private experience alive feel beautiful private A every forever curated experience every and browsing. remaining forever modes dark press A with dark A feel while considered',
    icon: 'musical-notes',
    gradient: 'midnight',
  },
];

const HERO_TITLE = 'Pro Browser Elite';
const HERO_SUBTITLE = 'Speed dials, news, and quick AI actions.';
const FOOTER_TITLE = 'Keep going with Pro Browser Elite';
const FOOTER_BODY = 'every experience while and A haptics fluid that in browsing forever remaining light on. experience that beautiful gestures or press or modes tap or remaining fluid and tap forever press designed experience. experience fast every haptics experience or fluid designed pixel fluid considered experience';

export const BrowserHomeScreen: React.FC = () => {
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
      variant="midnight"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Pro Browser Elite"
        subtitle="Speed dials, news, and quick AI actions."
        showBack={false}
        rightIcon="apps"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="midnight"
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
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>83%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '83%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>36%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '36%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>79%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '79%' }]}
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
