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
    id: 'item-1740-1',
    title: 'Vibrant Quest 1',
    description: 'with haptics alive and for forever browsing browsing with tap private in dark and. beautiful every for designed fluid with A press every every forever fast pixel browsing beautiful fluid forever private. that designed experience every experience while and A haptics fluid that in',
    icon: 'compass',
    gradient: 'forest',
    tone: 'accent',
    meta: '35 mins ago',
    stat1: 100,
    stat2: 4,
    stat3: '1.0',
    verb: 'Translated',
  },
  {
    id: 'item-1740-2',
    title: 'Polished Insight 2',
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
    id: 'item-1740-3',
    title: 'Premium Tapestry 3',
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
    id: 'item-1740-4',
    title: 'Subtle Mosaic 4',
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
    id: 'item-1740-5',
    title: 'Deep Stream 5',
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
    id: 'item-1740-6',
    title: 'Crisp Studio 6',
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
    id: 'item-1740-7',
    title: 'Vibrant Spark 7',
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
    id: 'item-1740-8',
    title: 'Soft Insight 8',
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
    id: 'item-1740-9',
    title: 'Premium Stream 9',
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
    id: 'item-1740-10',
    title: 'Crisp Compass 10',
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
    id: 'item-1740-11',
    title: 'Snappy Pulse 11',
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
    id: 'item-1740-12',
    title: 'Elite Pulse 12',
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
    id: 'item-1740-13',
    title: 'Elite Halo 13',
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
    id: 'item-1740-14',
    title: 'Buttery Compass 14',
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
    id: 'item-1740-15',
    title: 'Snappy Lens 15',
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
    id: 'item-1740-16',
    title: 'Glassy Aurora 16',
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
    id: 'item-1740-17',
    title: 'Sleek Echo 17',
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
    id: 'item-1740-18',
    title: 'Brisk Spark 18',
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
    id: 'item-1740-19',
    title: 'Soft Stream 19',
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
    id: 'item-1740-20',
    title: 'Crisp Codex 20',
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
    id: 'item-1740-21',
    title: 'Cosmic Studio 21',
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
    id: 'item-1740-22',
    title: 'Vibrant Pulse 22',
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
    id: 'item-1740-23',
    title: 'Elite Loom 23',
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
    id: 'item-1740-24',
    title: 'Punchy Mosaic 24',
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
    id: 'item-1740-25',
    title: 'Deep Mosaic 25',
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
    id: 'item-1740-26',
    title: 'Deep Insight 26',
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
    id: 'item-1740-27',
    title: 'Premium Drift 27',
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
    id: 'item-1740-28',
    title: 'Dreamy Pulse 28',
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
    id: 'item-1740-29',
    title: 'Elite Lens 29',
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
    id: 'item-1740-30',
    title: 'Glassy Beacon 30',
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
    id: 'item-1740-31',
    title: 'Velvet Forge 31',
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
    id: 'item-1740-32',
    title: 'Silky Insight 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-29580-1',
    title: 'Vibrant Aurora',
    subtitle: 'light in that every A remaining private every and light modes haptics considered or. in and beautiful for feel browsing haptics tap on long alive fluid forever press and in fluid experience. pixel in dark and A remaining feel modes designed haptics for with',
    icon: 'flash',
    gradient: 'fire',
  },
  {
    id: 'section-29580-2',
    title: 'Silky Stream',
    subtitle: 'haptics considered or forever fast designed every experience feel pixel considered and feel or. browsing long beautiful beautiful haptics gestures in and haptics and curated modes every considered or light experience pixel. A long or in pixel or A that every alive designed remaining',
    icon: 'book',
    gradient: 'amber',
  },
  {
    id: 'section-29580-3',
    title: 'Deep Mosaic',
    subtitle: 'and feel or considered long curated A feel tap light alive tap fluid on. in in pixel fluid across considered with and in every and beautiful considered every browsing in tap experience. browsing with and alive pixel feel or tap dark gestures alive tap',
    icon: 'cart',
    gradient: 'candy',
  },
  {
    id: 'section-29580-4',
    title: 'Lush Beacon',
    subtitle: 'tap fluid on and and feel considered considered remaining considered dark and pixel on. tap and with and designed remaining tap every and with tap with across while experience while tap beautiful. designed light forever designed experience fluid feel feel for fluid experience and',
    icon: 'flame',
    gradient: 'amber',
  },
  {
    id: 'section-29580-5',
    title: 'Velvet Codex',
    subtitle: 'and pixel on beautiful feel every and in for experience beautiful in considered with. feel experience considered with modes across and that press on and fast every with forever browsing forever considered. A in while or alive and beautiful in for forever remaining dark',
    icon: 'layers',
    gradient: 'ocean',
  },
  {
    id: 'section-29580-6',
    title: 'Sleek Drift',
    subtitle: 'in considered with in experience experience while feel browsing that light pixel that with. feel light or in press every every browsing across long with across press private experience beautiful for for. designed fluid curated fast and on and and press considered remaining and',
    icon: 'lock-closed',
    gradient: 'ocean',
  },
  {
    id: 'section-29580-7',
    title: 'Frosted Beacon',
    subtitle: 'pixel that with feel feel private with in every remaining every for that every. while and feel that every on across or fast on with and fluid dark browsing modes every dark. and every with for browsing private beautiful designed and tap for modes',
    icon: 'newspaper',
    gradient: 'fire',
  },
  {
    id: 'section-29580-8',
    title: 'Vibrant Compass',
    subtitle: 'for that every while and on every considered dark fast considered considered and in. dark press on modes pixel fast in fluid curated with on beautiful press curated on fluid fluid curated. private and curated forever and haptics for for dark considered fluid dark',
    icon: 'image',
    gradient: 'neon',
  },
  {
    id: 'section-29580-9',
    title: 'Vibrant Beacon',
    subtitle: 'considered and in beautiful private considered A gestures alive that in remaining experience that. press that press while long haptics fast that dark pixel beautiful that every experience remaining designed experience long. curated pixel experience fluid long fluid long forever considered alive gestures browsing',
    icon: 'newspaper',
    gradient: 'fire',
  },
  {
    id: 'section-29580-10',
    title: 'Buttery Insight',
    subtitle: 'remaining experience that while feel gestures long designed A remaining feel remaining designed gestures. that curated light haptics curated fluid tap and alive that browsing private pixel modes light modes fast gestures. curated every for while and fluid while fluid haptics or every in',
    icon: 'sparkles',
    gradient: 'fire',
  },
  {
    id: 'section-29580-11',
    title: 'Glassy Studio',
    subtitle: 'remaining designed gestures every curated fast haptics and modes on or designed and beautiful. feel fast haptics A haptics on gestures A haptics fast pixel in considered every designed remaining light that. feel and in beautiful dark and modes fast fluid beautiful feel modes',
    icon: 'rocket',
    gradient: 'neon',
  },
  {
    id: 'section-29580-12',
    title: 'Sleek Stream',
    subtitle: 'designed and beautiful across or and private haptics that gestures light long that tap. while browsing across light on across and press considered and and while every or alive for every private. modes fast beautiful A every designed A while light fast modes for',
    icon: 'film',
    gradient: 'ocean',
  },
  {
    id: 'section-29580-13',
    title: 'Polished Halo',
    subtitle: 'long that tap remaining considered long designed and on and experience and light A. experience press or in and fast while beautiful private modes in for forever with while on feel gestures. that private in press every or experience private and experience fast light',
    icon: 'school',
    gradient: 'cosmic',
  },
  {
    id: 'section-29580-14',
    title: 'Crisp Loom',
    subtitle: 'and light A and press considered browsing on A tap fluid on or while. in pixel and in A fast fluid and A modes designed that that pixel in remaining fast A. considered press light that alive alive curated light and remaining every with',
    icon: 'grid',
    gradient: 'sunset',
  },
];

const HERO_TITLE = 'Tab preview';
const HERO_SUBTITLE = 'Inspect any tab with one tap.';
const FOOTER_TITLE = 'Keep going with Tab preview';
const FOOTER_BODY = 'that designed experience every experience while and A haptics fluid that in browsing forever. on in fast forever forever beautiful experience that beautiful gestures or press or modes tap or remaining fluid. forever remaining beautiful on while press considered A A experience fast every';

export const TabsPreviewScreen: React.FC = () => {
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
      variant="ocean"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Tab preview"
        subtitle="Inspect any tab with one tap."
        showBack={true}
        rightIcon="eye"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="ocean"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>35%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '35%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>78%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '78%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>31%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '31%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>74%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '74%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Saga</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>23%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '23%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>66%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '66%' }]}
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
