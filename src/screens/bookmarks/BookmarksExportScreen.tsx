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
    id: 'item-2187-1',
    title: 'Frosted Halo 1',
    description: 'with on haptics in dark every considered gestures private while experience and long fluid. gestures pixel fluid while while or and alive every curated dark feel and across light fluid forever and. in feel remaining fluid considered alive and light tap haptics and that',
    icon: 'image',
    gradient: 'neon',
    tone: 'danger',
    meta: '32 mins ago',
    stat1: 31,
    stat2: 64,
    stat3: '0.3',
    verb: 'Searched',
  },
  {
    id: 'item-2187-2',
    title: 'Buttery Compass 2',
    description: 'on haptics in dark every considered gestures private while experience and long fluid private. fluid while while or and alive every curated dark feel and across light fluid forever and while and. fluid considered alive and light tap haptics and that with designed gestures',
    icon: 'trophy',
    gradient: 'aurora',
    tone: 'warning',
    meta: '33 mins ago',
    stat1: 44,
    stat2: 71,
    stat3: '2.2',
    verb: 'Pinned',
  },
  {
    id: 'item-2187-3',
    title: 'Snappy Atlas 3',
    description: 'haptics in dark every considered gestures private while experience and long fluid private every. while or and alive every curated dark feel and across light fluid forever and while and feel beautiful. and light tap haptics and that with designed gestures modes designed in',
    icon: 'trophy',
    gradient: 'ocean',
    tone: 'warning',
    meta: '34 mins ago',
    stat1: 57,
    stat2: 78,
    stat3: '4.1',
    verb: 'Highlighted',
  },
  {
    id: 'item-2187-4',
    title: 'Lush Spark 4',
    description: 'in dark every considered gestures private while experience and long fluid private every modes. and alive every curated dark feel and across light fluid forever and while and feel beautiful fast private. haptics and that with designed gestures modes designed in beautiful fast for',
    icon: 'globe',
    gradient: 'cosmic',
    tone: 'info',
    meta: '35 mins ago',
    stat1: 70,
    stat2: 85,
    stat3: '1.0',
    verb: 'Pinned',
  },
  {
    id: 'item-2187-5',
    title: 'Soft Saga 5',
    description: 'dark every considered gestures private while experience and long fluid private every modes feel. every curated dark feel and across light fluid forever and while and feel beautiful fast private curated in. with designed gestures modes designed in beautiful fast for long or curated',
    icon: 'flag',
    gradient: 'pastel',
    tone: 'warning',
    meta: '36 mins ago',
    stat1: 83,
    stat2: 92,
    stat3: '2.9',
    verb: 'Searched',
  },
  {
    id: 'item-2187-6',
    title: 'Frosted Tapestry 6',
    description: 'every considered gestures private while experience and long fluid private every modes feel designed. dark feel and across light fluid forever and while and feel beautiful fast private curated in and considered. modes designed in beautiful fast for long or curated beautiful with remaining',
    icon: 'globe',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '37 mins ago',
    stat1: 96,
    stat2: 99,
    stat3: '4.8',
    verb: 'Archived',
  },
  {
    id: 'item-2187-7',
    title: 'Subtle Codex 7',
    description: 'considered gestures private while experience and long fluid private every modes feel designed feel. and across light fluid forever and while and feel beautiful fast private curated in and considered every and. beautiful fast for long or curated beautiful with remaining while press dark',
    icon: 'eye',
    gradient: 'ocean',
    tone: 'danger',
    meta: '38 mins ago',
    stat1: 109,
    stat2: 7,
    stat3: '1.7',
    verb: 'Translated',
  },
  {
    id: 'item-2187-8',
    title: 'Cosmic Drift 8',
    description: 'gestures private while experience and long fluid private every modes feel designed feel haptics. light fluid forever and while and feel beautiful fast private curated in and considered every and in every. long or curated beautiful with remaining while press dark fluid every across',
    icon: 'newspaper',
    gradient: 'neon',
    tone: 'primary',
    meta: '39 mins ago',
    stat1: 122,
    stat2: 14,
    stat3: '3.6',
    verb: 'Shared',
  },
  {
    id: 'item-2187-9',
    title: 'Dreamy Saga 9',
    description: 'private while experience and long fluid private every modes feel designed feel haptics light. forever and while and feel beautiful fast private curated in and considered every and in every press dark. beautiful with remaining while press dark fluid every across beautiful pixel curated',
    icon: 'heart',
    gradient: 'midnight',
    tone: 'accent',
    meta: '40 mins ago',
    stat1: 135,
    stat2: 21,
    stat3: '0.5',
    verb: 'Highlighted',
  },
  {
    id: 'item-2187-10',
    title: 'Frosted Forge 10',
    description: 'while experience and long fluid private every modes feel designed feel haptics light forever. while and feel beautiful fast private curated in and considered every and in every press dark private across. while press dark fluid every across beautiful pixel curated with long feel',
    icon: 'flag',
    gradient: 'candy',
    tone: 'info',
    meta: '41 mins ago',
    stat1: 148,
    stat2: 28,
    stat3: '2.4',
    verb: 'Saved',
  },
  {
    id: 'item-2187-11',
    title: 'Silky Codex 11',
    description: 'experience and long fluid private every modes feel designed feel haptics light forever remaining. feel beautiful fast private curated in and considered every and in every press dark private across beautiful for. fluid every across beautiful pixel curated with long feel across alive in',
    icon: 'rocket',
    gradient: 'pastel',
    tone: 'info',
    meta: '42 mins ago',
    stat1: 161,
    stat2: 35,
    stat3: '4.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-2187-12',
    title: 'Cosmic Atlas 12',
    description: 'and long fluid private every modes feel designed feel haptics light forever remaining A. fast private curated in and considered every and in every press dark private across beautiful for browsing experience. beautiful pixel curated with long feel across alive in every and A',
    icon: 'school',
    gradient: 'forest',
    tone: 'info',
    meta: '43 mins ago',
    stat1: 174,
    stat2: 42,
    stat3: '1.2',
    verb: 'Opened',
  },
  {
    id: 'item-2187-13',
    title: 'Lush Halo 13',
    description: 'long fluid private every modes feel designed feel haptics light forever remaining A while. curated in and considered every and in every press dark private across beautiful for browsing experience experience remaining. with long feel across alive in every and A for haptics haptics',
    icon: 'pulse',
    gradient: 'pastel',
    tone: 'primary',
    meta: '44 mins ago',
    stat1: 187,
    stat2: 49,
    stat3: '3.1',
    verb: 'Visited',
  },
  {
    id: 'item-2187-14',
    title: 'Buttery Lens 14',
    description: 'fluid private every modes feel designed feel haptics light forever remaining A while and. and considered every and in every press dark private across beautiful for browsing experience experience remaining haptics beautiful. across alive in every and A for haptics haptics in press on',
    icon: 'musical-notes',
    gradient: 'brand',
    tone: 'danger',
    meta: '45 mins ago',
    stat1: 200,
    stat2: 56,
    stat3: '0.0',
    verb: 'Opened',
  },
  {
    id: 'item-2187-15',
    title: 'Glassy Codex 15',
    description: 'private every modes feel designed feel haptics light forever remaining A while and forever. every and in every press dark private across beautiful for browsing experience experience remaining haptics beautiful that that. every and A for haptics haptics in press on experience fast across',
    icon: 'musical-notes',
    gradient: 'aurora',
    tone: 'primary',
    meta: '46 mins ago',
    stat1: 213,
    stat2: 63,
    stat3: '1.9',
    verb: 'Highlighted',
  },
  {
    id: 'item-2187-16',
    title: 'Cosmic Tapestry 16',
    description: 'every modes feel designed feel haptics light forever remaining A while and forever modes. in every press dark private across beautiful for browsing experience experience remaining haptics beautiful that that feel long. for haptics haptics in press on experience fast across tap beautiful across',
    icon: 'flame',
    gradient: 'brand',
    tone: 'info',
    meta: '47 mins ago',
    stat1: 226,
    stat2: 70,
    stat3: '3.8',
    verb: 'Read',
  },
  {
    id: 'item-2187-17',
    title: 'Subtle Mosaic 17',
    description: 'modes feel designed feel haptics light forever remaining A while and forever modes while. press dark private across beautiful for browsing experience experience remaining haptics beautiful that that feel long for gestures. in press on experience fast across tap beautiful across every on every',
    icon: 'bookmark',
    gradient: 'pastel',
    tone: 'success',
    meta: '48 mins ago',
    stat1: 239,
    stat2: 77,
    stat3: '0.7',
    verb: 'Followed',
  },
  {
    id: 'item-2187-18',
    title: 'Deep Tapestry 18',
    description: 'feel designed feel haptics light forever remaining A while and forever modes while every. private across beautiful for browsing experience experience remaining haptics beautiful that that feel long for gestures forever dark. experience fast across tap beautiful across every on every long forever dark',
    icon: 'layers',
    gradient: 'amber',
    tone: 'accent',
    meta: '49 mins ago',
    stat1: 252,
    stat2: 84,
    stat3: '2.6',
    verb: 'Archived',
  },
  {
    id: 'item-2187-19',
    title: 'Subtle Saga 19',
    description: 'designed feel haptics light forever remaining A while and forever modes while every that. beautiful for browsing experience experience remaining haptics beautiful that that feel long for gestures forever dark modes remaining. tap beautiful across every on every long forever dark private for while',
    icon: 'flash',
    gradient: 'fire',
    tone: 'danger',
    meta: '50 mins ago',
    stat1: 265,
    stat2: 91,
    stat3: '4.5',
    verb: 'Opened',
  },
  {
    id: 'item-2187-20',
    title: 'Frosted Compass 20',
    description: 'feel haptics light forever remaining A while and forever modes while every that alive. browsing experience experience remaining haptics beautiful that that feel long for gestures forever dark modes remaining curated with. every on every long forever dark private for while or every alive',
    icon: 'cart',
    gradient: 'neon',
    tone: 'primary',
    meta: '51 mins ago',
    stat1: 278,
    stat2: 98,
    stat3: '1.4',
    verb: 'Pinned',
  },
  {
    id: 'item-2187-21',
    title: 'Snappy Mosaic 21',
    description: 'haptics light forever remaining A while and forever modes while every that alive forever. experience remaining haptics beautiful that that feel long for gestures forever dark modes remaining curated with while beautiful. long forever dark private for while or every alive and fluid feel',
    icon: 'lock-closed',
    gradient: 'brand',
    tone: 'warning',
    meta: '52 mins ago',
    stat1: 291,
    stat2: 6,
    stat3: '3.3',
    verb: 'Archived',
  },
  {
    id: 'item-2187-22',
    title: 'Deep Forge 22',
    description: 'light forever remaining A while and forever modes while every that alive forever designed. haptics beautiful that that feel long for gestures forever dark modes remaining curated with while beautiful light and. private for while or every alive and fluid feel alive feel designed',
    icon: 'bookmark',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '53 mins ago',
    stat1: 304,
    stat2: 13,
    stat3: '0.2',
    verb: 'Followed',
  },
  {
    id: 'item-2187-23',
    title: 'Silky Lens 23',
    description: 'forever remaining A while and forever modes while every that alive forever designed A. that that feel long for gestures forever dark modes remaining curated with while beautiful light and alive in. or every alive and fluid feel alive feel designed tap forever browsing',
    icon: 'leaf',
    gradient: 'neon',
    tone: 'accent',
    meta: '54 mins ago',
    stat1: 317,
    stat2: 20,
    stat3: '2.1',
    verb: 'Highlighted',
  },
  {
    id: 'item-2187-24',
    title: 'Glassy Insight 24',
    description: 'remaining A while and forever modes while every that alive forever designed A remaining. feel long for gestures forever dark modes remaining curated with while beautiful light and alive in alive that. and fluid feel alive feel designed tap forever browsing feel long dark',
    icon: 'bookmark',
    gradient: 'fire',
    tone: 'info',
    meta: '55 mins ago',
    stat1: 330,
    stat2: 27,
    stat3: '4.0',
    verb: 'Pinned',
  },
  {
    id: 'item-2187-25',
    title: 'Premium Forge 25',
    description: 'A while and forever modes while every that alive forever designed A remaining and. for gestures forever dark modes remaining curated with while beautiful light and alive in alive that and or. alive feel designed tap forever browsing feel long dark beautiful tap experience',
    icon: 'gift',
    gradient: 'pastel',
    tone: 'warning',
    meta: '56 mins ago',
    stat1: 343,
    stat2: 34,
    stat3: '0.9',
    verb: 'Visited',
  },
  {
    id: 'item-2187-26',
    title: 'Silky Aurora 26',
    description: 'while and forever modes while every that alive forever designed A remaining and fluid. forever dark modes remaining curated with while beautiful light and alive in alive that and or haptics curated. tap forever browsing feel long dark beautiful tap experience tap on and',
    icon: 'gift',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '57 mins ago',
    stat1: 356,
    stat2: 41,
    stat3: '2.8',
    verb: 'Followed',
  },
  {
    id: 'item-2187-27',
    title: 'Sleek Saga 27',
    description: 'and forever modes while every that alive forever designed A remaining and fluid forever. modes remaining curated with while beautiful light and alive in alive that and or haptics curated gestures fast. feel long dark beautiful tap experience tap on and alive considered light',
    icon: 'bookmark',
    gradient: 'aurora',
    tone: 'accent',
    meta: '58 mins ago',
    stat1: 369,
    stat2: 48,
    stat3: '4.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2187-28',
    title: 'Frosted Lens 28',
    description: 'forever modes while every that alive forever designed A remaining and fluid forever A. curated with while beautiful light and alive in alive that and or haptics curated gestures fast browsing dark. beautiful tap experience tap on and alive considered light A gestures and',
    icon: 'extension-puzzle',
    gradient: 'fire',
    tone: 'success',
    meta: '59 mins ago',
    stat1: 382,
    stat2: 55,
    stat3: '1.6',
    verb: 'Followed',
  },
  {
    id: 'item-2187-29',
    title: 'Glassy Mosaic 29',
    description: 'modes while every that alive forever designed A remaining and fluid forever A every. while beautiful light and alive in alive that and or haptics curated gestures fast browsing dark dark tap. tap on and alive considered light A gestures and dark alive and',
    icon: 'medal',
    gradient: 'sunset',
    tone: 'accent',
    meta: '60 mins ago',
    stat1: 395,
    stat2: 62,
    stat3: '3.5',
    verb: 'Visited',
  },
  {
    id: 'item-2187-30',
    title: 'Deep Spark 30',
    description: 'while every that alive forever designed A remaining and fluid forever A every while. light and alive in alive that and or haptics curated gestures fast browsing dark dark tap browsing haptics. alive considered light A gestures and dark alive and alive alive press',
    icon: 'medal',
    gradient: 'fire',
    tone: 'danger',
    meta: '61 mins ago',
    stat1: 408,
    stat2: 69,
    stat3: '0.4',
    verb: 'Opened',
  },
  {
    id: 'item-2187-31',
    title: 'Soft Pulse 31',
    description: 'every that alive forever designed A remaining and fluid forever A every while on. alive in alive that and or haptics curated gestures fast browsing dark dark tap browsing haptics that fluid. A gestures and dark alive and alive alive press feel with curated',
    icon: 'grid',
    gradient: 'aurora',
    tone: 'primary',
    meta: '62 mins ago',
    stat1: 421,
    stat2: 76,
    stat3: '2.3',
    verb: 'Archived',
  },
  {
    id: 'item-2187-32',
    title: 'Elite Mosaic 32',
    description: 'that alive forever designed A remaining and fluid forever A every while on in. alive that and or haptics curated gestures fast browsing dark dark tap browsing haptics that fluid pixel tap. dark alive and alive alive press feel with curated beautiful and haptics',
    icon: 'school',
    gradient: 'brand',
    tone: 'danger',
    meta: '63 mins ago',
    stat1: 434,
    stat2: 83,
    stat3: '4.2',
    verb: 'Bookmarked',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-37179-1',
    title: 'Sleek Insight',
    subtitle: 'across on haptics every tap designed dark and for with fast long curated fast. dark considered dark press private across beautiful browsing curated haptics or in tap considered and pixel dark in. forever light that long remaining while alive private with modes forever experience',
    icon: 'paw',
    gradient: 'midnight',
  },
  {
    id: 'section-37179-2',
    title: 'Soft Forge',
    subtitle: 'long curated fast considered fluid every fast with browsing pixel curated pixel fast every. tap long tap while dark forever gestures beautiful or curated on and on alive curated in fluid modes. pixel private A fluid alive with alive in A and modes curated',
    icon: 'shield',
    gradient: 'amber',
  },
  {
    id: 'section-37179-3',
    title: 'Soft Compass',
    subtitle: 'pixel fast every and experience dark every with light browsing long or pixel modes. for tap modes pixel browsing private haptics for and on designed and that and private across fluid while. alive beautiful dark long every press feel private and on long and',
    icon: 'briefcase',
    gradient: 'candy',
  },
  {
    id: 'section-37179-4',
    title: 'Silky Tapestry',
    subtitle: 'or pixel modes remaining long for A tap curated pixel press and pixel while. every tap and that every dark and on haptics tap beautiful with experience browsing and fluid designed considered. with for experience across fluid every every considered with dark long press',
    icon: 'compass',
    gradient: 'midnight',
  },
  {
    id: 'section-37179-5',
    title: 'Subtle Lens',
    subtitle: 'and pixel while fast alive for long tap haptics curated or and feel forever. while fast while A fast every remaining private fast for curated beautiful in alive forever while pixel on. haptics and that designed fast and and beautiful forever A and haptics',
    icon: 'image',
    gradient: 'candy',
  },
  {
    id: 'section-37179-6',
    title: 'Premium Codex',
    subtitle: 'and feel forever fast in every in press with remaining fluid browsing forever or. that dark considered dark and feel pixel beautiful that every that gestures and that every with tap private. curated every press A or with gestures curated forever considered fast gestures',
    icon: 'pizza',
    gradient: 'sunset',
  },
  {
    id: 'section-37179-7',
    title: 'Snappy Loom',
    subtitle: 'browsing forever or remaining that considered browsing designed and and tap modes every light. with on dark A designed or or and alive haptics feel pixel beautiful for every and and alive. alive every across across every in long press feel on considered for',
    icon: 'cloud',
    gradient: 'neon',
  },
  {
    id: 'section-37179-8',
    title: 'Frosted Stream',
    subtitle: 'modes every light every pixel and modes private considered A considered while modes remaining. curated modes curated that feel feel tap while in every haptics press light considered across considered gestures considered. tap designed and while beautiful experience every fluid and across remaining considered',
    icon: 'cloud',
    gradient: 'sunset',
  },
  {
    id: 'section-37179-9',
    title: 'Brisk Saga',
    subtitle: 'while modes remaining while modes fast and designed across and remaining on forever press. modes considered across considered while across across on while pixel curated haptics modes with fluid fast alive remaining. dark light private every beautiful alive considered considered in dark beautiful remaining',
    icon: 'flash',
    gradient: 'brand',
  },
  {
    id: 'section-37179-10',
    title: 'Sleek Pulse',
    subtitle: 'on forever press experience every and or press remaining browsing alive browsing every across. across fast considered alive and designed long designed considered tap beautiful with every every gestures fast on for. on or every remaining haptics every dark alive A gestures in on',
    icon: 'analytics',
    gradient: 'neon',
  },
  {
    id: 'section-37179-11',
    title: 'Elite Quest',
    subtitle: 'browsing every across press and forever with long modes private every and curated designed. every pixel long designed browsing A while in on remaining for gestures tap while gestures beautiful with gestures. private long designed fluid dark with that experience long gestures press fast',
    icon: 'pulse',
    gradient: 'midnight',
  },
  {
    id: 'section-37179-12',
    title: 'Snappy Aurora',
    subtitle: 'and curated designed feel long beautiful every every light modes modes dark fast haptics. beautiful designed that curated while in and that every that tap every across tap experience every and forever. designed with fast forever private A fast browsing haptics fast every across',
    icon: 'globe',
    gradient: 'pastel',
  },
  {
    id: 'section-37179-13',
    title: 'Dreamy Loom',
    subtitle: 'dark fast haptics while feel while while that fast light fluid in and every. remaining fast forever curated modes browsing remaining across forever long remaining in curated with pixel light alive feel. every forever every and on remaining light curated private beautiful designed long',
    icon: 'rocket',
    gradient: 'pastel',
  },
  {
    id: 'section-37179-14',
    title: 'Subtle Tapestry',
    subtitle: 'in and every in fluid that fast fluid or tap private dark every across. or alive private gestures tap tap long and modes gestures beautiful feel dark in tap A in on. or while with light haptics fluid pixel across fluid experience A on',
    icon: 'newspaper',
    gradient: 'amber',
  },
];

const HERO_TITLE = 'Export';
const HERO_SUBTITLE = 'Export bookmarks as JSON / HTML.';
const FOOTER_TITLE = 'Keep going with Export';
const FOOTER_BODY = 'in feel remaining fluid considered alive and light tap haptics and that with designed. browsing modes fast and modes fast and that remaining curated beautiful fluid every A modes alive feel press. designed forever gestures experience private press dark long tap gestures beautiful every';

export const BookmarksExportScreen: React.FC = () => {
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
      variant="midnight"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Export"
        subtitle="Export bookmarks as JSON / HTML."
        showBack={true}
        rightIcon="cloud-download"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="midnight"
        badge="Export"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>86%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '86%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>39%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '39%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>82%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '82%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>35%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '35%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>78%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '78%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>31%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '31%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>74%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '74%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
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
