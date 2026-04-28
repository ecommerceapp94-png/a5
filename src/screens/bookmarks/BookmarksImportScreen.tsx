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
    id: 'item-2180-1',
    title: 'Snappy Halo 1',
    description: 'alive with long that for and and with on haptics in dark every considered. experience gestures designed alive or in press and considered or curated on press long gestures pixel fluid while. fluid curated forever designed experience curated dark beautiful feel remaining every experience',
    icon: 'heart',
    gradient: 'forest',
    tone: 'warning',
    meta: '25 mins ago',
    stat1: 920,
    stat2: 15,
    stat3: '2.0',
    verb: 'Archived',
  },
  {
    id: 'item-2180-2',
    title: 'Buttery Spark 2',
    description: 'with long that for and and with on haptics in dark every considered gestures. designed alive or in press and considered or curated on press long gestures pixel fluid while while or. designed experience curated dark beautiful feel remaining every experience designed press A',
    icon: 'eye',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '26 mins ago',
    stat1: 933,
    stat2: 22,
    stat3: '3.9',
    verb: 'Read',
  },
  {
    id: 'item-2180-3',
    title: 'Soft Insight 3',
    description: 'long that for and and with on haptics in dark every considered gestures private. or in press and considered or curated on press long gestures pixel fluid while while or and alive. dark beautiful feel remaining every experience designed press A remaining while A',
    icon: 'pizza',
    gradient: 'neon',
    tone: 'success',
    meta: '27 mins ago',
    stat1: 946,
    stat2: 29,
    stat3: '0.8',
    verb: 'Searched',
  },
  {
    id: 'item-2180-4',
    title: 'Premium Drift 4',
    description: 'that for and and with on haptics in dark every considered gestures private while. press and considered or curated on press long gestures pixel fluid while while or and alive every curated. remaining every experience designed press A remaining while A on with haptics',
    icon: 'analytics',
    gradient: 'amber',
    tone: 'warning',
    meta: '28 mins ago',
    stat1: 959,
    stat2: 36,
    stat3: '2.7',
    verb: 'Highlighted',
  },
  {
    id: 'item-2180-5',
    title: 'Dreamy Echo 5',
    description: 'for and and with on haptics in dark every considered gestures private while experience. considered or curated on press long gestures pixel fluid while while or and alive every curated dark feel. designed press A remaining while A on with haptics in feel remaining',
    icon: 'gift',
    gradient: 'ocean',
    tone: 'info',
    meta: '29 mins ago',
    stat1: 972,
    stat2: 43,
    stat3: '4.6',
    verb: 'Visited',
  },
  {
    id: 'item-2180-6',
    title: 'Brisk Aurora 6',
    description: 'and and with on haptics in dark every considered gestures private while experience and. curated on press long gestures pixel fluid while while or and alive every curated dark feel and across. remaining while A on with haptics in feel remaining fluid considered alive',
    icon: 'paw',
    gradient: 'pastel',
    tone: 'danger',
    meta: '30 mins ago',
    stat1: 985,
    stat2: 50,
    stat3: '1.5',
    verb: 'Archived',
  },
  {
    id: 'item-2180-7',
    title: 'Sleek Saga 7',
    description: 'and with on haptics in dark every considered gestures private while experience and long. press long gestures pixel fluid while while or and alive every curated dark feel and across light fluid. on with haptics in feel remaining fluid considered alive and light tap',
    icon: 'pulse',
    gradient: 'aurora',
    tone: 'danger',
    meta: '31 mins ago',
    stat1: 998,
    stat2: 57,
    stat3: '3.4',
    verb: 'Visited',
  },
  {
    id: 'item-2180-8',
    title: 'Frosted Halo 8',
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
    id: 'item-2180-9',
    title: 'Buttery Compass 9',
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
    id: 'item-2180-10',
    title: 'Snappy Atlas 10',
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
    id: 'item-2180-11',
    title: 'Lush Spark 11',
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
    id: 'item-2180-12',
    title: 'Soft Saga 12',
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
    id: 'item-2180-13',
    title: 'Frosted Tapestry 13',
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
    id: 'item-2180-14',
    title: 'Subtle Codex 14',
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
    id: 'item-2180-15',
    title: 'Cosmic Drift 15',
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
    id: 'item-2180-16',
    title: 'Dreamy Saga 16',
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
    id: 'item-2180-17',
    title: 'Frosted Forge 17',
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
    id: 'item-2180-18',
    title: 'Silky Codex 18',
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
    id: 'item-2180-19',
    title: 'Cosmic Atlas 19',
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
    id: 'item-2180-20',
    title: 'Lush Halo 20',
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
    id: 'item-2180-21',
    title: 'Buttery Lens 21',
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
    id: 'item-2180-22',
    title: 'Glassy Codex 22',
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
    id: 'item-2180-23',
    title: 'Cosmic Tapestry 23',
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
    id: 'item-2180-24',
    title: 'Subtle Mosaic 24',
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
    id: 'item-2180-25',
    title: 'Deep Tapestry 25',
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
    id: 'item-2180-26',
    title: 'Subtle Saga 26',
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
    id: 'item-2180-27',
    title: 'Frosted Compass 27',
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
    id: 'item-2180-28',
    title: 'Snappy Mosaic 28',
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
    id: 'item-2180-29',
    title: 'Deep Forge 29',
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
    id: 'item-2180-30',
    title: 'Silky Lens 30',
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
    id: 'item-2180-31',
    title: 'Glassy Insight 31',
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
    id: 'item-2180-32',
    title: 'Premium Forge 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-37060-1',
    title: 'Glassy Forge',
    subtitle: 'considered experience modes and press and on modes forever across and across pixel fluid. dark fluid in on modes remaining that long on haptics gestures modes gestures forever browsing pixel pixel considered. curated dark browsing or considered alive curated every browsing curated on in',
    icon: 'compass',
    gradient: 'candy',
  },
  {
    id: 'section-37060-2',
    title: 'Elite Stream',
    subtitle: 'across pixel fluid gestures designed browsing pixel beautiful tap haptics beautiful private every for. and fluid beautiful or remaining modes designed for fluid every A tap remaining press across and every and. forever every and alive and experience A every gestures alive fluid alive',
    icon: 'heart',
    gradient: 'midnight',
  },
  {
    id: 'section-37060-3',
    title: 'Buttery Forge',
    subtitle: 'private every for every forever haptics press with for with private and and and. pixel remaining fluid on and with in remaining modes designed that tap dark long browsing remaining browsing curated. press experience long and that that modes light with A across fluid',
    icon: 'briefcase',
    gradient: 'pastel',
  },
  {
    id: 'section-37060-4',
    title: 'Buttery Mosaic',
    subtitle: 'and and and and or private alive press feel beautiful haptics fluid every with. private feel gestures browsing designed gestures browsing pixel and haptics and considered designed every gestures press fluid light. for on and across alive pixel light forever gestures that on beautiful',
    icon: 'sparkles',
    gradient: 'amber',
  },
  {
    id: 'section-37060-5',
    title: 'Buttery Atlas',
    subtitle: 'fluid every with beautiful and in light feel on considered and and light fluid. alive while pixel every modes for or forever light and in tap and or light every gestures and. fast every or and in modes for press experience for gestures across',
    icon: 'lock-closed',
    gradient: 'brand',
  },
  {
    id: 'section-37060-6',
    title: 'Soft Compass',
    subtitle: 'and light fluid designed every on press browsing fluid curated in tap modes for. forever browsing A haptics A considered press dark modes for and tap gestures long gestures alive remaining tap. remaining fluid fluid with every modes fluid tap for beautiful fluid tap',
    icon: 'leaf',
    gradient: 'ocean',
  },
  {
    id: 'section-37060-7',
    title: 'Frosted Loom',
    subtitle: 'tap modes for feel alive gestures press and beautiful that considered pixel light A. remaining and beautiful while browsing browsing long every A every private across browsing A fluid and for browsing. haptics long long curated gestures beautiful feel for alive modes press browsing',
    icon: 'flame',
    gradient: 'sunset',
  },
  {
    id: 'section-37060-8',
    title: 'Glassy Loom',
    subtitle: 'pixel light A fast dark alive every and forever haptics A every alive modes. designed in dark every while feel gestures long fluid feel curated or modes light considered browsing and in. A long press pixel with remaining on and fast in dark fast',
    icon: 'flag',
    gradient: 'fire',
  },
  {
    id: 'section-37060-9',
    title: 'Elite Loom',
    subtitle: 'every alive modes press that remaining every A designed curated fluid and pixel on. while every private pixel designed haptics pixel with gestures fast curated tap fast with across curated across haptics. browsing or fluid while for dark with and press gestures curated in',
    icon: 'analytics',
    gradient: 'pastel',
  },
  {
    id: 'section-37060-10',
    title: 'Elite Mosaic',
    subtitle: 'and pixel on beautiful A beautiful dark A every or for browsing modes remaining. modes and across considered light and with in alive light every fast browsing and while dark designed fast. considered fluid while haptics experience remaining forever experience across curated with A',
    icon: 'speedometer',
    gradient: 'sunset',
  },
  {
    id: 'section-37060-11',
    title: 'Velvet Pulse',
    subtitle: 'browsing modes remaining with every forever beautiful long long across on haptics every tap. feel that long long pixel and tap that on across fluid fluid fast fluid every and while and. haptics pixel in fluid press feel press private browsing long in A',
    icon: 'film',
    gradient: 'candy',
  },
  {
    id: 'section-37060-12',
    title: 'Snappy Insight',
    subtitle: 'haptics every tap designed dark and for with fast long curated fast considered fluid. private across beautiful browsing curated haptics or in tap considered and pixel dark in remaining or that dark. alive private with modes forever experience alive gestures press every press or',
    icon: 'leaf',
    gradient: 'midnight',
  },
  {
    id: 'section-37060-13',
    title: 'Elite Beacon',
    subtitle: 'fast considered fluid every fast with browsing pixel curated pixel fast every and experience. dark forever gestures beautiful or curated on and on alive curated in fluid modes light browsing that pixel. alive in A and modes curated modes modes beautiful while modes press',
    icon: 'pulse',
    gradient: 'midnight',
  },
  {
    id: 'section-37060-14',
    title: 'Sleek Stream',
    subtitle: 'every and experience dark every with light browsing long or pixel modes remaining long. browsing private haptics for and on designed and that and private across fluid while beautiful light fast tap. feel private and on long and forever tap every press feel light',
    icon: 'grid',
    gradient: 'candy',
  },
];

const HERO_TITLE = 'Import';
const HERO_SUBTITLE = 'Import bookmarks from another browser.';
const FOOTER_TITLE = 'Keep going with Import';
const FOOTER_BODY = 'fluid curated forever designed experience curated dark beautiful feel remaining every experience designed press. beautiful gestures alive feel or designed tap remaining that curated dark considered experience press private gestures pixel light. for while experience forever light forever alive considered with press alive in';

export const BookmarksImportScreen: React.FC = () => {
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
      variant="ocean"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Import"
        subtitle="Import bookmarks from another browser."
        showBack={true}
        rightIcon="cloud-upload"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="ocean"
        badge="Import"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>85%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '85%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>38%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '38%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>81%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '81%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Studio</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>34%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '34%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>77%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '77%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>30%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '30%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>73%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '73%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>26%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '26%' }]}
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
