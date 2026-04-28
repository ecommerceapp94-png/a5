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
    id: 'item-2640-1',
    title: 'Lush Halo 1',
    description: 'long and across every every tap or modes for fast gestures fast light and. remaining fluid across dark pixel modes considered tap and pixel fast on or dark every haptics and and. on remaining considered browsing every designed curated private forever and designed modes',
    icon: 'bookmark',
    gradient: 'forest',
    tone: 'info',
    meta: '35 mins ago',
    stat1: 40,
    stat2: 67,
    stat3: '1.0',
    verb: 'Shared',
  },
  {
    id: 'item-2640-2',
    title: 'Buttery Drift 2',
    description: 'and across every every tap or modes for fast gestures fast light and press. across dark pixel modes considered tap and pixel fast on or dark every haptics and and fast curated. browsing every designed curated private forever and designed modes browsing or and',
    icon: 'eye',
    gradient: 'forest',
    tone: 'accent',
    meta: '36 mins ago',
    stat1: 53,
    stat2: 74,
    stat3: '2.9',
    verb: 'Highlighted',
  },
  {
    id: 'item-2640-3',
    title: 'Dreamy Lens 3',
    description: 'across every every tap or modes for fast gestures fast light and press beautiful. pixel modes considered tap and pixel fast on or dark every haptics and and fast curated and that. curated private forever and designed modes browsing or and considered every in',
    icon: 'grid',
    gradient: 'candy',
    tone: 'info',
    meta: '37 mins ago',
    stat1: 66,
    stat2: 81,
    stat3: '4.8',
    verb: 'Saved',
  },
  {
    id: 'item-2640-4',
    title: 'Glassy Insight 4',
    description: 'every every tap or modes for fast gestures fast light and press beautiful pixel. considered tap and pixel fast on or dark every haptics and and fast curated and that tap feel. and designed modes browsing or and considered every in experience feel experience',
    icon: 'planet',
    gradient: 'pastel',
    tone: 'info',
    meta: '38 mins ago',
    stat1: 79,
    stat2: 88,
    stat3: '1.7',
    verb: 'Followed',
  },
  {
    id: 'item-2640-5',
    title: 'Premium Echo 5',
    description: 'every tap or modes for fast gestures fast light and press beautiful pixel light. and pixel fast on or dark every haptics and and fast curated and that tap feel that tap. browsing or and considered every in experience feel experience every dark curated',
    icon: 'lock-closed',
    gradient: 'forest',
    tone: 'accent',
    meta: '39 mins ago',
    stat1: 92,
    stat2: 95,
    stat3: '3.6',
    verb: 'Pinned',
  },
  {
    id: 'item-2640-6',
    title: 'Brisk Codex 6',
    description: 'tap or modes for fast gestures fast light and press beautiful pixel light while. fast on or dark every haptics and and fast curated and that tap feel that tap across experience. considered every in experience feel experience every dark curated or feel every',
    icon: 'analytics',
    gradient: 'fire',
    tone: 'warning',
    meta: '40 mins ago',
    stat1: 105,
    stat2: 3,
    stat3: '0.5',
    verb: 'Followed',
  },
  {
    id: 'item-2640-7',
    title: 'Cosmic Drift 7',
    description: 'or modes for fast gestures fast light and press beautiful pixel light while light. or dark every haptics and and fast curated and that tap feel that tap across experience curated that. experience feel experience every dark curated or feel every pixel light every',
    icon: 'grid',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '41 mins ago',
    stat1: 118,
    stat2: 10,
    stat3: '2.4',
    verb: 'Read',
  },
  {
    id: 'item-2640-8',
    title: 'Dreamy Compass 8',
    description: 'modes for fast gestures fast light and press beautiful pixel light while light gestures. every haptics and and fast curated and that tap feel that tap across experience curated that designed fluid. every dark curated or feel every pixel light every gestures dark while',
    icon: 'sparkles',
    gradient: 'fire',
    tone: 'success',
    meta: '42 mins ago',
    stat1: 131,
    stat2: 17,
    stat3: '4.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2640-9',
    title: 'Snappy Beacon 9',
    description: 'for fast gestures fast light and press beautiful pixel light while light gestures with. and and fast curated and that tap feel that tap across experience curated that designed fluid and every. or feel every pixel light every gestures dark while every tap with',
    icon: 'globe',
    gradient: 'amber',
    tone: 'success',
    meta: '43 mins ago',
    stat1: 144,
    stat2: 24,
    stat3: '1.2',
    verb: 'Read',
  },
  {
    id: 'item-2640-10',
    title: 'Velvet Aurora 10',
    description: 'fast gestures fast light and press beautiful pixel light while light gestures with that. fast curated and that tap feel that tap across experience curated that designed fluid and every remaining browsing. pixel light every gestures dark while every tap with gestures and long',
    icon: 'newspaper',
    gradient: 'sunset',
    tone: 'success',
    meta: '44 mins ago',
    stat1: 157,
    stat2: 31,
    stat3: '3.1',
    verb: 'Opened',
  },
  {
    id: 'item-2640-11',
    title: 'Sleek Mosaic 11',
    description: 'gestures fast light and press beautiful pixel light while light gestures with that that. and that tap feel that tap across experience curated that designed fluid and every remaining browsing browsing forever. gestures dark while every tap with gestures and long and pixel that',
    icon: 'rocket',
    gradient: 'amber',
    tone: 'primary',
    meta: '45 mins ago',
    stat1: 170,
    stat2: 38,
    stat3: '0.0',
    verb: 'Shared',
  },
  {
    id: 'item-2640-12',
    title: 'Deep Forge 12',
    description: 'fast light and press beautiful pixel light while light gestures with that that beautiful. tap feel that tap across experience curated that designed fluid and every remaining browsing browsing forever fluid private. every tap with gestures and long and pixel that browsing for every',
    icon: 'newspaper',
    gradient: 'brand',
    tone: 'accent',
    meta: '46 mins ago',
    stat1: 183,
    stat2: 45,
    stat3: '1.9',
    verb: 'Read',
  },
  {
    id: 'item-2640-13',
    title: 'Silky Loom 13',
    description: 'light and press beautiful pixel light while light gestures with that that beautiful considered. that tap across experience curated that designed fluid and every remaining browsing browsing forever fluid private alive designed. gestures and long and pixel that browsing for every fast feel feel',
    icon: 'leaf',
    gradient: 'candy',
    tone: 'success',
    meta: '47 mins ago',
    stat1: 196,
    stat2: 52,
    stat3: '3.8',
    verb: 'Pinned',
  },
  {
    id: 'item-2640-14',
    title: 'Punchy Lens 14',
    description: 'and press beautiful pixel light while light gestures with that that beautiful considered or. across experience curated that designed fluid and every remaining browsing browsing forever fluid private alive designed every or. and pixel that browsing for every fast feel feel alive tap browsing',
    icon: 'medal',
    gradient: 'amber',
    tone: 'warning',
    meta: '48 mins ago',
    stat1: 209,
    stat2: 59,
    stat3: '0.7',
    verb: 'Read',
  },
  {
    id: 'item-2640-15',
    title: 'Glassy Echo 15',
    description: 'press beautiful pixel light while light gestures with that that beautiful considered or haptics. curated that designed fluid and every remaining browsing browsing forever fluid private alive designed every or on remaining. browsing for every fast feel feel alive tap browsing tap on every',
    icon: 'globe',
    gradient: 'cosmic',
    tone: 'success',
    meta: '49 mins ago',
    stat1: 222,
    stat2: 66,
    stat3: '2.6',
    verb: 'Pinned',
  },
  {
    id: 'item-2640-16',
    title: 'Brisk Loom 16',
    description: 'beautiful pixel light while light gestures with that that beautiful considered or haptics considered. designed fluid and every remaining browsing browsing forever fluid private alive designed every or on remaining A experience. fast feel feel alive tap browsing tap on every and alive private',
    icon: 'sparkles',
    gradient: 'amber',
    tone: 'warning',
    meta: '50 mins ago',
    stat1: 235,
    stat2: 73,
    stat3: '4.5',
    verb: 'Read',
  },
  {
    id: 'item-2640-17',
    title: 'Punchy Tapestry 17',
    description: 'pixel light while light gestures with that that beautiful considered or haptics considered designed. and every remaining browsing browsing forever fluid private alive designed every or on remaining A experience remaining or. alive tap browsing tap on every and alive private modes fast press',
    icon: 'musical-notes',
    gradient: 'cosmic',
    tone: 'success',
    meta: '51 mins ago',
    stat1: 248,
    stat2: 80,
    stat3: '1.4',
    verb: 'Followed',
  },
  {
    id: 'item-2640-18',
    title: 'Subtle Mosaic 18',
    description: 'light while light gestures with that that beautiful considered or haptics considered designed and. remaining browsing browsing forever fluid private alive designed every or on remaining A experience remaining or with or. tap on every and alive private modes fast press every or forever',
    icon: 'grid',
    gradient: 'amber',
    tone: 'accent',
    meta: '52 mins ago',
    stat1: 261,
    stat2: 87,
    stat3: '3.3',
    verb: 'Followed',
  },
  {
    id: 'item-2640-19',
    title: 'Deep Lens 19',
    description: 'while light gestures with that that beautiful considered or haptics considered designed and while. browsing forever fluid private alive designed every or on remaining A experience remaining or with or for alive. and alive private modes fast press every or forever light that considered',
    icon: 'pricetag',
    gradient: 'fire',
    tone: 'accent',
    meta: '53 mins ago',
    stat1: 274,
    stat2: 94,
    stat3: '0.2',
    verb: 'Opened',
  },
  {
    id: 'item-2640-20',
    title: 'Glassy Compass 20',
    description: 'light gestures with that that beautiful considered or haptics considered designed and while in. fluid private alive designed every or on remaining A experience remaining or with or for alive that gestures. modes fast press every or forever light that considered and that and',
    icon: 'shield',
    gradient: 'fire',
    tone: 'primary',
    meta: '54 mins ago',
    stat1: 287,
    stat2: 2,
    stat3: '2.1',
    verb: 'Searched',
  },
  {
    id: 'item-2640-21',
    title: 'Snappy Loom 21',
    description: 'gestures with that that beautiful considered or haptics considered designed and while in across. alive designed every or on remaining A experience remaining or with or for alive that gestures tap with. every or forever light that considered and that and for haptics designed',
    icon: 'film',
    gradient: 'brand',
    tone: 'warning',
    meta: '55 mins ago',
    stat1: 300,
    stat2: 9,
    stat3: '4.0',
    verb: 'Shared',
  },
  {
    id: 'item-2640-22',
    title: 'Punchy Mosaic 22',
    description: 'with that that beautiful considered or haptics considered designed and while in across fast. every or on remaining A experience remaining or with or for alive that gestures tap with considered private. light that considered and that and for haptics designed curated while alive',
    icon: 'book',
    gradient: 'ocean',
    tone: 'accent',
    meta: '56 mins ago',
    stat1: 313,
    stat2: 16,
    stat3: '0.9',
    verb: 'Highlighted',
  },
  {
    id: 'item-2640-23',
    title: 'Deep Drift 23',
    description: 'that that beautiful considered or haptics considered designed and while in across fast experience. on remaining A experience remaining or with or for alive that gestures tap with considered private curated feel. and that and for haptics designed curated while alive designed private pixel',
    icon: 'star',
    gradient: 'candy',
    tone: 'info',
    meta: '57 mins ago',
    stat1: 326,
    stat2: 23,
    stat3: '2.8',
    verb: 'Searched',
  },
  {
    id: 'item-2640-24',
    title: 'Dreamy Halo 24',
    description: 'that beautiful considered or haptics considered designed and while in across fast experience press. A experience remaining or with or for alive that gestures tap with considered private curated feel dark tap. for haptics designed curated while alive designed private pixel pixel private light',
    icon: 'eye',
    gradient: 'pastel',
    tone: 'warning',
    meta: '58 mins ago',
    stat1: 339,
    stat2: 30,
    stat3: '4.7',
    verb: 'Visited',
  },
  {
    id: 'item-2640-25',
    title: 'Buttery Echo 25',
    description: 'beautiful considered or haptics considered designed and while in across fast experience press light. remaining or with or for alive that gestures tap with considered private curated feel dark tap and considered. curated while alive designed private pixel pixel private light every fast browsing',
    icon: 'heart',
    gradient: 'ocean',
    tone: 'danger',
    meta: '59 mins ago',
    stat1: 352,
    stat2: 37,
    stat3: '1.6',
    verb: 'Pinned',
  },
  {
    id: 'item-2640-26',
    title: 'Brisk Saga 26',
    description: 'considered or haptics considered designed and while in across fast experience press light while. with or for alive that gestures tap with considered private curated feel dark tap and considered while every. designed private pixel pixel private light every fast browsing fast dark feel',
    icon: 'trophy',
    gradient: 'aurora',
    tone: 'warning',
    meta: '60 mins ago',
    stat1: 365,
    stat2: 44,
    stat3: '3.5',
    verb: 'Pinned',
  },
  {
    id: 'item-2640-27',
    title: 'Frosted Studio 27',
    description: 'or haptics considered designed and while in across fast experience press light while while. for alive that gestures tap with considered private curated feel dark tap and considered while every pixel private. pixel private light every fast browsing fast dark feel while and for',
    icon: 'globe',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '61 mins ago',
    stat1: 378,
    stat2: 51,
    stat3: '0.4',
    verb: 'Visited',
  },
  {
    id: 'item-2640-28',
    title: 'Vibrant Spark 28',
    description: 'haptics considered designed and while in across fast experience press light while while and. that gestures tap with considered private curated feel dark tap and considered while every pixel private forever that. every fast browsing fast dark feel while and for that pixel on',
    icon: 'analytics',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '62 mins ago',
    stat1: 391,
    stat2: 58,
    stat3: '2.3',
    verb: 'Translated',
  },
  {
    id: 'item-2640-29',
    title: 'Soft Beacon 29',
    description: 'considered designed and while in across fast experience press light while while and designed. tap with considered private curated feel dark tap and considered while every pixel private forever that feel designed. fast dark feel while and for that pixel on fast on browsing',
    icon: 'flag',
    gradient: 'aurora',
    tone: 'primary',
    meta: '63 mins ago',
    stat1: 404,
    stat2: 65,
    stat3: '4.2',
    verb: 'Followed',
  },
  {
    id: 'item-2640-30',
    title: 'Velvet Drift 30',
    description: 'designed and while in across fast experience press light while while and designed with. considered private curated feel dark tap and considered while every pixel private forever that feel designed beautiful alive. while and for that pixel on fast on browsing haptics curated fluid',
    icon: 'sparkles',
    gradient: 'midnight',
    tone: 'accent',
    meta: '64 mins ago',
    stat1: 417,
    stat2: 72,
    stat3: '1.1',
    verb: 'Searched',
  },
  {
    id: 'item-2640-31',
    title: 'Dreamy Mosaic 31',
    description: 'and while in across fast experience press light while while and designed with feel. curated feel dark tap and considered while every pixel private forever that feel designed beautiful alive in and. that pixel on fast on browsing haptics curated fluid experience and haptics',
    icon: 'paw',
    gradient: 'fire',
    tone: 'warning',
    meta: '65 mins ago',
    stat1: 430,
    stat2: 79,
    stat3: '3.0',
    verb: 'Read',
  },
  {
    id: 'item-2640-32',
    title: 'Deep Halo 32',
    description: 'while in across fast experience press light while while and designed with feel browsing. dark tap and considered while every pixel private forever that feel designed beautiful alive in and browsing designed. fast on browsing haptics curated fluid experience and haptics dark experience curated',
    icon: 'school',
    gradient: 'ocean',
    tone: 'success',
    meta: '66 mins ago',
    stat1: 443,
    stat2: 86,
    stat3: '4.9',
    verb: 'Read',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-44880-1',
    title: 'Glassy Echo',
    subtitle: 'long modes tap browsing that gestures dark remaining on haptics tap A light curated. dark and pixel and and press with experience feel gestures in gestures haptics light for long feel for. with pixel fast tap every fast with experience remaining fluid on long',
    icon: 'paw',
    gradient: 'neon',
  },
  {
    id: 'section-44880-2',
    title: 'Premium Echo',
    subtitle: 'A light curated A on modes beautiful tap while and feel gestures gestures alive. beautiful experience tap gestures modes designed considered fluid fast press every with alive in for gestures private beautiful. pixel or considered across and private beautiful considered with modes on fluid',
    icon: 'eye',
    gradient: 'pastel',
  },
  {
    id: 'section-44880-3',
    title: 'Crisp Lens',
    subtitle: 'gestures gestures alive light light tap that curated designed designed in every that forever. browsing fluid dark and across while on A in remaining gestures experience for modes A and private that. every with that designed browsing press modes tap and designed every designed',
    icon: 'medal',
    gradient: 'cosmic',
  },
  {
    id: 'section-44880-4',
    title: 'Premium Mosaic',
    subtitle: 'every that forever modes long across A beautiful and A and light considered with. feel private alive curated with across fluid and considered while experience and on while pixel considered with dark. experience light browsing while for or A dark considered modes and considered',
    icon: 'briefcase',
    gradient: 'aurora',
  },
  {
    id: 'section-44880-5',
    title: 'Buttery Beacon',
    subtitle: 'light considered with designed dark remaining curated designed while across experience in long designed. haptics on beautiful press browsing A designed fluid or feel forever and that or long long long while. pixel long light designed A modes fast fluid remaining press alive long',
    icon: 'flash',
    gradient: 'brand',
  },
  {
    id: 'section-44880-6',
    title: 'Lush Forge',
    subtitle: 'in long designed and experience that that with remaining browsing for feel long experience. dark press forever while private A for on designed experience and remaining across in for in alive fluid. A considered forever every experience feel across fluid on modes modes every',
    icon: 'newspaper',
    gradient: 'midnight',
  },
  {
    id: 'section-44880-7',
    title: 'Soft Aurora',
    subtitle: 'feel long experience and alive remaining modes and dark remaining with across alive tap. alive and fluid forever fast and on alive long private and pixel curated haptics while alive and every. considered tap long experience every and fast pixel in forever remaining remaining',
    icon: 'shield',
    gradient: 'midnight',
  },
  {
    id: 'section-44880-8',
    title: 'Polished Saga',
    subtitle: 'across alive tap on fluid with press modes feel every considered considered or across. while fast feel dark for remaining every for every fluid across pixel light fluid modes or modes feel. beautiful while press haptics dark in curated in browsing while browsing considered',
    icon: 'briefcase',
    gradient: 'neon',
  },
  {
    id: 'section-44880-9',
    title: 'Soft Mosaic',
    subtitle: 'considered or across and haptics long gestures haptics experience that feel every experience modes. private remaining on feel for with tap press pixel press pixel and on gestures browsing modes remaining and. across private haptics alive for tap long across haptics in in feel',
    icon: 'extension-puzzle',
    gradient: 'aurora',
  },
  {
    id: 'section-44880-10',
    title: 'Cosmic Tapestry',
    subtitle: 'every experience modes light and private in designed pixel and alive A considered fast. every light or that press fast and considered in dark and alive while remaining that modes in alive. and fast or forever browsing fluid haptics forever while fast every with',
    icon: 'eye',
    gradient: 'fire',
  },
  {
    id: 'section-44880-11',
    title: 'Crisp Loom',
    subtitle: 'A considered fast haptics while haptics considered alive designed for haptics press every beautiful. fluid alive tap in or A on press tap gestures remaining and long fluid haptics alive or light. long in tap beautiful while beautiful remaining dark haptics every and remaining',
    icon: 'shield',
    gradient: 'sunset',
  },
  {
    id: 'section-44880-12',
    title: 'Crisp Studio',
    subtitle: 'press every beautiful and pixel tap across tap designed designed gestures gestures designed every. beautiful fluid or across pixel browsing considered designed experience remaining alive gestures designed forever browsing that beautiful and. and long browsing fast curated designed or with browsing pixel pixel remaining',
    icon: 'cloud',
    gradient: 'forest',
  },
  {
    id: 'section-44880-13',
    title: 'Velvet Studio',
    subtitle: 'gestures designed every and haptics forever fast curated dark and browsing fluid fast or. fluid for on every private that on and every light for every or modes light and on fast. on every experience that press and long while fast that every alive',
    icon: 'rocket',
    gradient: 'aurora',
  },
  {
    id: 'section-44880-14',
    title: 'Snappy Compass',
    subtitle: 'fluid fast or tap every every dark with designed tap browsing on considered gestures. tap alive alive beautiful pixel and that for beautiful with and on while fluid or beautiful press and. dark on gestures haptics forever forever that remaining while and beautiful long',
    icon: 'grid',
    gradient: 'cosmic',
  },
];

const HERO_TITLE = 'Options';
const HERO_SUBTITLE = 'Per-entry context menu actions.';
const FOOTER_TITLE = 'Keep going with Options';
const FOOTER_BODY = 'on remaining considered browsing every designed curated private forever and designed modes browsing or. with or and and while every that and and across dark or fast every beautiful on every while. experience considered with every for fast every every A remaining for fluid';

export const HistoryEntryOptionsScreen: React.FC = () => {
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
      variant="fire"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Options"
        subtitle="Per-entry context menu actions."
        showBack={true}
        rightIcon="ellipsis-vertical"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="fire"
        badge="L4"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Echo</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Mosaic</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Compass</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>74%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '74%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>70%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '70%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>23%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '23%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>66%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
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
