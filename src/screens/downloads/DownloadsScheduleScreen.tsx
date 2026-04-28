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
    id: 'item-2360-1',
    title: 'Glassy Echo 1',
    description: 'light tap dark gestures fluid that and remaining experience private A alive feel every. dark dark press experience curated across every for fast every while alive fluid alive beautiful forever alive considered. every considered pixel light and haptics remaining for dark while fast A',
    icon: 'briefcase',
    gradient: 'candy',
    tone: 'accent',
    meta: '25 mins ago',
    stat1: 320,
    stat2: 87,
    stat3: '4.0',
    verb: 'Archived',
  },
  {
    id: 'item-2360-2',
    title: 'Brisk Tapestry 2',
    description: 'tap dark gestures fluid that and remaining experience private A alive feel every on. press experience curated across every for fast every while alive fluid alive beautiful forever alive considered in forever. light and haptics remaining for dark while fast A private A private',
    icon: 'leaf',
    gradient: 'fire',
    tone: 'danger',
    meta: '26 mins ago',
    stat1: 333,
    stat2: 94,
    stat3: '0.9',
    verb: 'Archived',
  },
  {
    id: 'item-2360-3',
    title: 'Subtle Atlas 3',
    description: 'dark gestures fluid that and remaining experience private A alive feel every on for. curated across every for fast every while alive fluid alive beautiful forever alive considered in forever fast and. remaining for dark while fast A private A private press feel remaining',
    icon: 'film',
    gradient: 'neon',
    tone: 'danger',
    meta: '27 mins ago',
    stat1: 346,
    stat2: 2,
    stat3: '2.8',
    verb: 'Searched',
  },
  {
    id: 'item-2360-4',
    title: 'Lush Spark 4',
    description: 'gestures fluid that and remaining experience private A alive feel every on for beautiful. every for fast every while alive fluid alive beautiful forever alive considered in forever fast and experience that. while fast A private A private press feel remaining and browsing considered',
    icon: 'leaf',
    gradient: 'neon',
    tone: 'warning',
    meta: '28 mins ago',
    stat1: 359,
    stat2: 9,
    stat3: '4.7',
    verb: 'Highlighted',
  },
  {
    id: 'item-2360-5',
    title: 'Soft Pulse 5',
    description: 'fluid that and remaining experience private A alive feel every on for beautiful in. fast every while alive fluid alive beautiful forever alive considered in forever fast and experience that dark and. private A private press feel remaining and browsing considered gestures haptics every',
    icon: 'pulse',
    gradient: 'ocean',
    tone: 'info',
    meta: '29 mins ago',
    stat1: 372,
    stat2: 16,
    stat3: '1.6',
    verb: 'Opened',
  },
  {
    id: 'item-2360-6',
    title: 'Elite Quest 6',
    description: 'that and remaining experience private A alive feel every on for beautiful in experience. while alive fluid alive beautiful forever alive considered in forever fast and experience that dark and browsing every. press feel remaining and browsing considered gestures haptics every and experience or',
    icon: 'shield',
    gradient: 'pastel',
    tone: 'primary',
    meta: '30 mins ago',
    stat1: 385,
    stat2: 23,
    stat3: '3.5',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2360-7',
    title: 'Polished Codex 7',
    description: 'and remaining experience private A alive feel every on for beautiful in experience tap. fluid alive beautiful forever alive considered in forever fast and experience that dark and browsing every feel forever. and browsing considered gestures haptics every and experience or gestures considered or',
    icon: 'image',
    gradient: 'brand',
    tone: 'success',
    meta: '31 mins ago',
    stat1: 398,
    stat2: 30,
    stat3: '0.4',
    verb: 'Opened',
  },
  {
    id: 'item-2360-8',
    title: 'Cosmic Codex 8',
    description: 'remaining experience private A alive feel every on for beautiful in experience tap dark. beautiful forever alive considered in forever fast and experience that dark and browsing every feel forever light fluid. gestures haptics every and experience or gestures considered or in tap and',
    icon: 'star',
    gradient: 'sunset',
    tone: 'primary',
    meta: '32 mins ago',
    stat1: 411,
    stat2: 37,
    stat3: '2.3',
    verb: 'Saved',
  },
  {
    id: 'item-2360-9',
    title: 'Cosmic Beacon 9',
    description: 'experience private A alive feel every on for beautiful in experience tap dark every. alive considered in forever fast and experience that dark and browsing every feel forever light fluid that browsing. and experience or gestures considered or in tap and long fluid pixel',
    icon: 'sparkles',
    gradient: 'brand',
    tone: 'info',
    meta: '33 mins ago',
    stat1: 424,
    stat2: 44,
    stat3: '4.2',
    verb: 'Searched',
  },
  {
    id: 'item-2360-10',
    title: 'Velvet Forge 10',
    description: 'private A alive feel every on for beautiful in experience tap dark every pixel. in forever fast and experience that dark and browsing every feel forever light fluid that browsing on in. gestures considered or in tap and long fluid pixel alive for considered',
    icon: 'bookmark',
    gradient: 'forest',
    tone: 'warning',
    meta: '34 mins ago',
    stat1: 437,
    stat2: 51,
    stat3: '1.1',
    verb: 'Saved',
  },
  {
    id: 'item-2360-11',
    title: 'Silky Drift 11',
    description: 'A alive feel every on for beautiful in experience tap dark every pixel or. fast and experience that dark and browsing every feel forever light fluid that browsing on in forever every. in tap and long fluid pixel alive for considered pixel every and',
    icon: 'film',
    gradient: 'ocean',
    tone: 'info',
    meta: '35 mins ago',
    stat1: 450,
    stat2: 58,
    stat3: '3.0',
    verb: 'Opened',
  },
  {
    id: 'item-2360-12',
    title: 'Dreamy Drift 12',
    description: 'alive feel every on for beautiful in experience tap dark every pixel or curated. experience that dark and browsing every feel forever light fluid that browsing on in forever every browsing A. long fluid pixel alive for considered pixel every and fast experience light',
    icon: 'lock-closed',
    gradient: 'forest',
    tone: 'primary',
    meta: '36 mins ago',
    stat1: 463,
    stat2: 65,
    stat3: '4.9',
    verb: 'Visited',
  },
  {
    id: 'item-2360-13',
    title: 'Dreamy Codex 13',
    description: 'feel every on for beautiful in experience tap dark every pixel or curated every. dark and browsing every feel forever light fluid that browsing on in forever every browsing A while private. alive for considered pixel every and fast experience light light A designed',
    icon: 'rocket',
    gradient: 'brand',
    tone: 'danger',
    meta: '37 mins ago',
    stat1: 476,
    stat2: 72,
    stat3: '1.8',
    verb: 'Searched',
  },
  {
    id: 'item-2360-14',
    title: 'Cosmic Drift 14',
    description: 'every on for beautiful in experience tap dark every pixel or curated every A. browsing every feel forever light fluid that browsing on in forever every browsing A while private haptics on. pixel every and fast experience light light A designed curated pixel in',
    icon: 'lock-closed',
    gradient: 'aurora',
    tone: 'warning',
    meta: '38 mins ago',
    stat1: 489,
    stat2: 79,
    stat3: '3.7',
    verb: 'Saved',
  },
  {
    id: 'item-2360-15',
    title: 'Dreamy Beacon 15',
    description: 'on for beautiful in experience tap dark every pixel or curated every A or. feel forever light fluid that browsing on in forever every browsing A while private haptics on A experience. fast experience light light A designed curated pixel in forever alive designed',
    icon: 'compass',
    gradient: 'ocean',
    tone: 'info',
    meta: '39 mins ago',
    stat1: 502,
    stat2: 86,
    stat3: '0.6',
    verb: 'Archived',
  },
  {
    id: 'item-2360-16',
    title: 'Velvet Spark 16',
    description: 'for beautiful in experience tap dark every pixel or curated every A or experience. light fluid that browsing on in forever every browsing A while private haptics on A experience modes long. light A designed curated pixel in forever alive designed long for while',
    icon: 'eye',
    gradient: 'forest',
    tone: 'danger',
    meta: '40 mins ago',
    stat1: 515,
    stat2: 93,
    stat3: '2.5',
    verb: 'Visited',
  },
  {
    id: 'item-2360-17',
    title: 'Soft Saga 17',
    description: 'beautiful in experience tap dark every pixel or curated every A or experience dark. that browsing on in forever every browsing A while private haptics on A experience modes long remaining light. curated pixel in forever alive designed long for while and tap press',
    icon: 'cart',
    gradient: 'neon',
    tone: 'danger',
    meta: '41 mins ago',
    stat1: 528,
    stat2: 1,
    stat3: '4.4',
    verb: 'Shared',
  },
  {
    id: 'item-2360-18',
    title: 'Frosted Lens 18',
    description: 'in experience tap dark every pixel or curated every A or experience dark with. on in forever every browsing A while private haptics on A experience modes long remaining light modes light. forever alive designed long for while and tap press on considered fast',
    icon: 'pizza',
    gradient: 'aurora',
    tone: 'accent',
    meta: '42 mins ago',
    stat1: 541,
    stat2: 8,
    stat3: '1.3',
    verb: 'Shared',
  },
  {
    id: 'item-2360-19',
    title: 'Glassy Atlas 19',
    description: 'experience tap dark every pixel or curated every A or experience dark with and. forever every browsing A while private haptics on A experience modes long remaining light modes light pixel across. long for while and tap press on considered fast while tap A',
    icon: 'flash',
    gradient: 'candy',
    tone: 'accent',
    meta: '43 mins ago',
    stat1: 554,
    stat2: 15,
    stat3: '3.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2360-20',
    title: 'Lush Compass 20',
    description: 'tap dark every pixel or curated every A or experience dark with and experience. browsing A while private haptics on A experience modes long remaining light modes light pixel across experience press. and tap press on considered fast while tap A every modes fluid',
    icon: 'paw',
    gradient: 'candy',
    tone: 'success',
    meta: '44 mins ago',
    stat1: 567,
    stat2: 22,
    stat3: '0.1',
    verb: 'Saved',
  },
  {
    id: 'item-2360-21',
    title: 'Snappy Quest 21',
    description: 'dark every pixel or curated every A or experience dark with and experience browsing. while private haptics on A experience modes long remaining light modes light pixel across experience press experience dark. on considered fast while tap A every modes fluid for experience and',
    icon: 'gift',
    gradient: 'sunset',
    tone: 'info',
    meta: '45 mins ago',
    stat1: 580,
    stat2: 29,
    stat3: '2.0',
    verb: 'Opened',
  },
  {
    id: 'item-2360-22',
    title: 'Polished Atlas 22',
    description: 'every pixel or curated every A or experience dark with and experience browsing dark. haptics on A experience modes long remaining light modes light pixel across experience press experience dark every beautiful. while tap A every modes fluid for experience and remaining press pixel',
    icon: 'analytics',
    gradient: 'forest',
    tone: 'primary',
    meta: '46 mins ago',
    stat1: 593,
    stat2: 36,
    stat3: '3.9',
    verb: 'Shared',
  },
  {
    id: 'item-2360-23',
    title: 'Lush Echo 23',
    description: 'pixel or curated every A or experience dark with and experience browsing dark light. A experience modes long remaining light modes light pixel across experience press experience dark every beautiful and and. every modes fluid for experience and remaining press pixel private and in',
    icon: 'eye',
    gradient: 'brand',
    tone: 'accent',
    meta: '47 mins ago',
    stat1: 606,
    stat2: 43,
    stat3: '0.8',
    verb: 'Searched',
  },
  {
    id: 'item-2360-24',
    title: 'Brisk Lens 24',
    description: 'or curated every A or experience dark with and experience browsing dark light pixel. modes long remaining light modes light pixel across experience press experience dark every beautiful and and haptics experience. for experience and remaining press pixel private and in every and dark',
    icon: 'speedometer',
    gradient: 'candy',
    tone: 'warning',
    meta: '48 mins ago',
    stat1: 619,
    stat2: 50,
    stat3: '2.7',
    verb: 'Archived',
  },
  {
    id: 'item-2360-25',
    title: 'Glassy Tapestry 25',
    description: 'curated every A or experience dark with and experience browsing dark light pixel every. remaining light modes light pixel across experience press experience dark every beautiful and and haptics experience long on. remaining press pixel private and in every and dark modes press haptics',
    icon: 'sparkles',
    gradient: 'ocean',
    tone: 'danger',
    meta: '49 mins ago',
    stat1: 632,
    stat2: 57,
    stat3: '4.6',
    verb: 'Read',
  },
  {
    id: 'item-2360-26',
    title: 'Subtle Forge 26',
    description: 'every A or experience dark with and experience browsing dark light pixel every fast. modes light pixel across experience press experience dark every beautiful and and haptics experience long on and that. private and in every and dark modes press haptics across curated haptics',
    icon: 'pricetag',
    gradient: 'neon',
    tone: 'success',
    meta: '50 mins ago',
    stat1: 645,
    stat2: 64,
    stat3: '1.5',
    verb: 'Archived',
  },
  {
    id: 'item-2360-27',
    title: 'Silky Stream 27',
    description: 'A or experience dark with and experience browsing dark light pixel every fast on. pixel across experience press experience dark every beautiful and and haptics experience long on and that or fast. every and dark modes press haptics across curated haptics for designed across',
    icon: 'flag',
    gradient: 'amber',
    tone: 'danger',
    meta: '51 mins ago',
    stat1: 658,
    stat2: 71,
    stat3: '3.4',
    verb: 'Searched',
  },
  {
    id: 'item-2360-28',
    title: 'Crisp Atlas 28',
    description: 'or experience dark with and experience browsing dark light pixel every fast on gestures. experience press experience dark every beautiful and and haptics experience long on and that or fast gestures gestures. modes press haptics across curated haptics for designed across while A tap',
    icon: 'pulse',
    gradient: 'neon',
    tone: 'warning',
    meta: '52 mins ago',
    stat1: 671,
    stat2: 78,
    stat3: '0.3',
    verb: 'Translated',
  },
  {
    id: 'item-2360-29',
    title: 'Lush Aurora 29',
    description: 'experience dark with and experience browsing dark light pixel every fast on gestures alive. experience dark every beautiful and and haptics experience long on and that or fast gestures gestures considered and. across curated haptics for designed across while A tap while that haptics',
    icon: 'paw',
    gradient: 'ocean',
    tone: 'primary',
    meta: '53 mins ago',
    stat1: 684,
    stat2: 85,
    stat3: '2.2',
    verb: 'Archived',
  },
  {
    id: 'item-2360-30',
    title: 'Sleek Echo 30',
    description: 'dark with and experience browsing dark light pixel every fast on gestures alive press. every beautiful and and haptics experience long on and that or fast gestures gestures considered and beautiful in. for designed across while A tap while that haptics A dark pixel',
    icon: 'flame',
    gradient: 'midnight',
    tone: 'danger',
    meta: '54 mins ago',
    stat1: 697,
    stat2: 92,
    stat3: '4.1',
    verb: 'Read',
  },
  {
    id: 'item-2360-31',
    title: 'Brisk Studio 31',
    description: 'with and experience browsing dark light pixel every fast on gestures alive press gestures. and and haptics experience long on and that or fast gestures gestures considered and beautiful in and alive. while A tap while that haptics A dark pixel or and and',
    icon: 'flame',
    gradient: 'neon',
    tone: 'success',
    meta: '55 mins ago',
    stat1: 710,
    stat2: 99,
    stat3: '1.0',
    verb: 'Shared',
  },
  {
    id: 'item-2360-32',
    title: 'Vibrant Saga 32',
    description: 'and experience browsing dark light pixel every fast on gestures alive press gestures tap. haptics experience long on and that or fast gestures gestures considered and beautiful in and alive and curated. while that haptics A dark pixel or and and and browsing A',
    icon: 'heart',
    gradient: 'amber',
    tone: 'accent',
    meta: '56 mins ago',
    stat1: 723,
    stat2: 7,
    stat3: '2.9',
    verb: 'Visited',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-40120-1',
    title: 'Snappy Loom',
    subtitle: 'light for beautiful remaining light alive fluid pixel designed long or on beautiful private. for pixel designed designed pixel every long dark dark browsing pixel considered A pixel A dark and modes. haptics across fluid on with with fluid experience press for and in',
    icon: 'lock-closed',
    gradient: 'brand',
  },
  {
    id: 'section-40120-2',
    title: 'Silky Quest',
    subtitle: 'on beautiful private haptics gestures experience modes while fast haptics dark on on feel. that and experience fast every or across and long browsing in and and across A across and gestures. that fast for in with A long on gestures modes fluid and',
    icon: 'school',
    gradient: 'midnight',
  },
  {
    id: 'section-40120-3',
    title: 'Cosmic Halo',
    subtitle: 'on on feel press pixel with on while private with feel every fast and. remaining every that designed tap for experience experience across dark long in haptics press that remaining gestures browsing. or that and haptics or press gestures feel or and alive across',
    icon: 'school',
    gradient: 'pastel',
  },
  {
    id: 'section-40120-4',
    title: 'Soft Halo',
    subtitle: 'every fast and across press across private in forever haptics considered and every dark. light across and long modes gestures designed feel forever remaining gestures every fast pixel modes that curated beautiful. across with considered experience alive feel for every curated or fluid for',
    icon: 'extension-puzzle',
    gradient: 'amber',
  },
  {
    id: 'section-40120-5',
    title: 'Cosmic Saga',
    subtitle: 'and every dark for curated light modes curated gestures for for haptics fast tap. and for considered pixel and light curated light every A every light and every across across gestures pixel. fluid beautiful dark browsing and A curated and on that in haptics',
    icon: 'flame',
    gradient: 'pastel',
  },
  {
    id: 'section-40120-6',
    title: 'Punchy Stream',
    subtitle: 'haptics fast tap every pixel for in in every fluid alive modes browsing haptics. beautiful for and fluid on forever pixel press alive that feel light modes on curated that dark or. in gestures A browsing and tap in pixel alive private every considered',
    icon: 'extension-puzzle',
    gradient: 'forest',
  },
  {
    id: 'section-40120-7',
    title: 'Glassy Mosaic',
    subtitle: 'modes browsing haptics haptics private or modes designed every gestures light forever considered A. with A haptics feel alive remaining or or private on every dark light in every remaining A considered. haptics or while across for with or long and private forever or',
    icon: 'school',
    gradient: 'candy',
  },
  {
    id: 'section-40120-8',
    title: 'Silky Studio',
    subtitle: 'forever considered A forever forever every or beautiful designed and pixel curated private while. every and A while dark private A private private feel gestures across press considered for pixel remaining tap. considered and curated or modes remaining A designed fluid considered fast across',
    icon: 'extension-puzzle',
    gradient: 'cosmic',
  },
  {
    id: 'section-40120-9',
    title: 'Glassy Atlas',
    subtitle: 'curated private while fluid or modes that pixel alive remaining or considered pixel that. press haptics and and forever fluid every designed gestures designed private every for long modes across fast considered. pixel A every that gestures long that curated dark every every experience',
    icon: 'flag',
    gradient: 'sunset',
  },
  {
    id: 'section-40120-10',
    title: 'Vibrant Spark',
    subtitle: 'considered pixel that press fluid forever beautiful on light experience for experience curated remaining. that and experience light beautiful experience and in remaining and curated while tap modes curated every gestures tap. across browsing designed remaining fast considered and and long alive and that',
    icon: 'medal',
    gradient: 'neon',
  },
  {
    id: 'section-40120-11',
    title: 'Punchy Insight',
    subtitle: 'experience curated remaining remaining and feel browsing experience light for curated fast A tap. and experience every forever and every and every long for every that beautiful with and press and beautiful. pixel pixel curated feel that while tap and long every haptics while',
    icon: 'lock-closed',
    gradient: 'ocean',
  },
  {
    id: 'section-40120-12',
    title: 'Subtle Saga',
    subtitle: 'fast A tap that browsing private on curated and designed with forever long long. haptics that experience for every browsing modes designed for every and and beautiful fluid beautiful with light feel. feel long that and while browsing for every or and gestures gestures',
    icon: 'school',
    gradient: 'forest',
  },
  {
    id: 'section-40120-13',
    title: 'Frosted Stream',
    subtitle: 'forever long long in for remaining on dark every modes every private gestures feel. or press across with and alive modes in that or alive on while modes with fast forever tap. browsing with dark A light and fast considered A press and considered',
    icon: 'gift',
    gradient: 'aurora',
  },
  {
    id: 'section-40120-14',
    title: 'Lush Studio',
    subtitle: 'private gestures feel every gestures pixel while or designed and browsing light light with. every fast across feel every light every considered fluid or dark beautiful with or and A beautiful modes. feel fluid A curated gestures modes forever every with dark curated while',
    icon: 'analytics',
    gradient: 'pastel',
  },
];

const HERO_TITLE = 'Schedule';
const HERO_SUBTITLE = 'Bandwidth windows for big downloads.';
const FOOTER_TITLE = 'Keep going with Schedule';
const FOOTER_BODY = 'every considered pixel light and haptics remaining for dark while fast A private A. dark browsing or beautiful designed beautiful browsing every or and tap with every every long private fluid and. designed and every or alive curated gestures experience or browsing fast browsing';

export const DownloadsScheduleScreen: React.FC = () => {
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
      (navigation as any).navigate('DownloadsPreview', { downloadId: 'dl-1' });
    },
    [navigation],
  );
  const goAlt = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('DownloadsActions', { downloadId: 'dl-1' });
    },
    [navigation],
  );
  const goDeep = useCallback(
    (entry: MockEntry) => {
      triggerHaptic('selection');
      (navigation as any).navigate('DownloadsSettings', undefined);
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
        title="Schedule"
        subtitle="Bandwidth windows for big downloads."
        showBack={true}
        rightIcon="time"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="aurora"
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
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>73%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '73%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>26%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
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
