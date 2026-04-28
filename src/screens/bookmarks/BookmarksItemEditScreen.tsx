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
    id: 'item-2334-1',
    title: 'Velvet Stream 1',
    description: 'press every haptics fast press with considered private browsing dark press curated feel long. modes dark considered gestures long for every that on tap press while alive on experience fast fast light. press browsing dark haptics every or feel in in haptics while pixel',
    icon: 'image',
    gradient: 'amber',
    tone: 'success',
    meta: '89 mins ago',
    stat1: 962,
    stat2: 4,
    stat3: '4.6',
    verb: 'Searched',
  },
  {
    id: 'item-2334-2',
    title: 'Crisp Mosaic 2',
    description: 'every haptics fast press with considered private browsing dark press curated feel long dark. considered gestures long for every that on tap press while alive on experience fast fast light across fluid. haptics every or feel in in haptics while pixel browsing long pixel',
    icon: 'star',
    gradient: 'amber',
    tone: 'warning',
    meta: '90 mins ago',
    stat1: 975,
    stat2: 11,
    stat3: '1.5',
    verb: 'Highlighted',
  },
  {
    id: 'item-2334-3',
    title: 'Deep Loom 3',
    description: 'haptics fast press with considered private browsing dark press curated feel long dark and. long for every that on tap press while alive on experience fast fast light across fluid gestures haptics. feel in in haptics while pixel browsing long pixel across dark and',
    icon: 'flash',
    gradient: 'ocean',
    tone: 'info',
    meta: '91 mins ago',
    stat1: 988,
    stat2: 18,
    stat3: '3.4',
    verb: 'Translated',
  },
  {
    id: 'item-2334-4',
    title: 'Punchy Loom 4',
    description: 'fast press with considered private browsing dark press curated feel long dark and long. every that on tap press while alive on experience fast fast light across fluid gestures haptics beautiful with. haptics while pixel browsing long pixel across dark and fluid tap while',
    icon: 'newspaper',
    gradient: 'pastel',
    tone: 'primary',
    meta: '92 mins ago',
    stat1: 21,
    stat2: 25,
    stat3: '0.3',
    verb: 'Archived',
  },
  {
    id: 'item-2334-5',
    title: 'Punchy Halo 5',
    description: 'press with considered private browsing dark press curated feel long dark and long considered. on tap press while alive on experience fast fast light across fluid gestures haptics beautiful with for light. browsing long pixel across dark and fluid tap while forever every fluid',
    icon: 'speedometer',
    gradient: 'midnight',
    tone: 'danger',
    meta: '93 mins ago',
    stat1: 34,
    stat2: 32,
    stat3: '2.2',
    verb: 'Read',
  },
  {
    id: 'item-2334-6',
    title: 'Buttery Codex 6',
    description: 'with considered private browsing dark press curated feel long dark and long considered curated. press while alive on experience fast fast light across fluid gestures haptics beautiful with for light with with. across dark and fluid tap while forever every fluid curated light light',
    icon: 'school',
    gradient: 'neon',
    tone: 'success',
    meta: '94 mins ago',
    stat1: 47,
    stat2: 39,
    stat3: '4.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2334-7',
    title: 'Cosmic Halo 7',
    description: 'considered private browsing dark press curated feel long dark and long considered curated beautiful. alive on experience fast fast light across fluid gestures haptics beautiful with for light with with every fluid. fluid tap while forever every fluid curated light light alive alive designed',
    icon: 'musical-notes',
    gradient: 'amber',
    tone: 'success',
    meta: '5 mins ago',
    stat1: 60,
    stat2: 46,
    stat3: '1.0',
    verb: 'Opened',
  },
  {
    id: 'item-2334-8',
    title: 'Buttery Atlas 8',
    description: 'private browsing dark press curated feel long dark and long considered curated beautiful forever. experience fast fast light across fluid gestures haptics beautiful with for light with with every fluid in A. forever every fluid curated light light alive alive designed every in every',
    icon: 'book',
    gradient: 'sunset',
    tone: 'primary',
    meta: '6 mins ago',
    stat1: 73,
    stat2: 53,
    stat3: '2.9',
    verb: 'Translated',
  },
  {
    id: 'item-2334-9',
    title: 'Lush Aurora 9',
    description: 'browsing dark press curated feel long dark and long considered curated beautiful forever fluid. fast light across fluid gestures haptics beautiful with for light with with every fluid in A and every. curated light light alive alive designed every in every and considered haptics',
    icon: 'flame',
    gradient: 'brand',
    tone: 'primary',
    meta: '7 mins ago',
    stat1: 86,
    stat2: 60,
    stat3: '4.8',
    verb: 'Archived',
  },
  {
    id: 'item-2334-10',
    title: 'Sleek Pulse 10',
    description: 'dark press curated feel long dark and long considered curated beautiful forever fluid press. across fluid gestures haptics beautiful with for light with with every fluid in A and every experience browsing. alive alive designed every in every and considered haptics experience and A',
    icon: 'grid',
    gradient: 'midnight',
    tone: 'danger',
    meta: '8 mins ago',
    stat1: 99,
    stat2: 67,
    stat3: '1.7',
    verb: 'Pinned',
  },
  {
    id: 'item-2334-11',
    title: 'Elite Lens 11',
    description: 'press curated feel long dark and long considered curated beautiful forever fluid press light. gestures haptics beautiful with for light with with every fluid in A and every experience browsing on on. every in every and considered haptics experience and A designed pixel fast',
    icon: 'sparkles',
    gradient: 'neon',
    tone: 'warning',
    meta: '9 mins ago',
    stat1: 112,
    stat2: 74,
    stat3: '3.6',
    verb: 'Translated',
  },
  {
    id: 'item-2334-12',
    title: 'Glassy Halo 12',
    description: 'curated feel long dark and long considered curated beautiful forever fluid press light fluid. beautiful with for light with with every fluid in A and every experience browsing on on haptics fast. and considered haptics experience and A designed pixel fast pixel feel A',
    icon: 'leaf',
    gradient: 'cosmic',
    tone: 'primary',
    meta: '10 mins ago',
    stat1: 125,
    stat2: 81,
    stat3: '0.5',
    verb: 'Searched',
  },
  {
    id: 'item-2334-13',
    title: 'Buttery Atlas 13',
    description: 'feel long dark and long considered curated beautiful forever fluid press light fluid light. for light with with every fluid in A and every experience browsing on on haptics fast and A. experience and A designed pixel fast pixel feel A that experience experience',
    icon: 'trophy',
    gradient: 'midnight',
    tone: 'warning',
    meta: '11 mins ago',
    stat1: 138,
    stat2: 88,
    stat3: '2.4',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2334-14',
    title: 'Lush Beacon 14',
    description: 'long dark and long considered curated beautiful forever fluid press light fluid light light. with with every fluid in A and every experience browsing on on haptics fast and A tap dark. designed pixel fast pixel feel A that experience experience feel fluid beautiful',
    icon: 'compass',
    gradient: 'ocean',
    tone: 'success',
    meta: '12 mins ago',
    stat1: 151,
    stat2: 95,
    stat3: '4.3',
    verb: 'Opened',
  },
  {
    id: 'item-2334-15',
    title: 'Velvet Halo 15',
    description: 'dark and long considered curated beautiful forever fluid press light fluid light light tap. every fluid in A and every experience browsing on on haptics fast and A tap dark private browsing. pixel feel A that experience experience feel fluid beautiful gestures dark every',
    icon: 'film',
    gradient: 'sunset',
    tone: 'primary',
    meta: '13 mins ago',
    stat1: 164,
    stat2: 3,
    stat3: '1.2',
    verb: 'Followed',
  },
  {
    id: 'item-2334-16',
    title: 'Buttery Stream 16',
    description: 'and long considered curated beautiful forever fluid press light fluid light light tap dark. in A and every experience browsing on on haptics fast and A tap dark private browsing that that. that experience experience feel fluid beautiful gestures dark every A fluid gestures',
    icon: 'book',
    gradient: 'brand',
    tone: 'accent',
    meta: '14 mins ago',
    stat1: 177,
    stat2: 10,
    stat3: '3.1',
    verb: 'Shared',
  },
  {
    id: 'item-2334-17',
    title: 'Crisp Pulse 17',
    description: 'long considered curated beautiful forever fluid press light fluid light light tap dark gestures. and every experience browsing on on haptics fast and A tap dark private browsing that that A with. feel fluid beautiful gestures dark every A fluid gestures fast every fast',
    icon: 'paw',
    gradient: 'fire',
    tone: 'accent',
    meta: '15 mins ago',
    stat1: 190,
    stat2: 17,
    stat3: '0.0',
    verb: 'Read',
  },
  {
    id: 'item-2334-18',
    title: 'Elite Drift 18',
    description: 'considered curated beautiful forever fluid press light fluid light light tap dark gestures fluid. experience browsing on on haptics fast and A tap dark private browsing that that A with in and. gestures dark every A fluid gestures fast every fast or light and',
    icon: 'trophy',
    gradient: 'candy',
    tone: 'success',
    meta: '16 mins ago',
    stat1: 203,
    stat2: 24,
    stat3: '1.9',
    verb: 'Read',
  },
  {
    id: 'item-2334-19',
    title: 'Dreamy Aurora 19',
    description: 'curated beautiful forever fluid press light fluid light light tap dark gestures fluid that. on on haptics fast and A tap dark private browsing that that A with in and dark dark. A fluid gestures fast every fast or light and pixel forever while',
    icon: 'pricetag',
    gradient: 'amber',
    tone: 'success',
    meta: '17 mins ago',
    stat1: 216,
    stat2: 31,
    stat3: '3.8',
    verb: 'Shared',
  },
  {
    id: 'item-2334-20',
    title: 'Sleek Forge 20',
    description: 'beautiful forever fluid press light fluid light light tap dark gestures fluid that and. haptics fast and A tap dark private browsing that that A with in and dark dark press experience. fast every fast or light and pixel forever while tap remaining and',
    icon: 'cart',
    gradient: 'amber',
    tone: 'accent',
    meta: '18 mins ago',
    stat1: 229,
    stat2: 38,
    stat3: '0.7',
    verb: 'Read',
  },
  {
    id: 'item-2334-21',
    title: 'Silky Aurora 21',
    description: 'forever fluid press light fluid light light tap dark gestures fluid that and remaining. and A tap dark private browsing that that A with in and dark dark press experience curated across. or light and pixel forever while tap remaining and considered that and',
    icon: 'cart',
    gradient: 'candy',
    tone: 'success',
    meta: '19 mins ago',
    stat1: 242,
    stat2: 45,
    stat3: '2.6',
    verb: 'Read',
  },
  {
    id: 'item-2334-22',
    title: 'Sleek Compass 22',
    description: 'fluid press light fluid light light tap dark gestures fluid that and remaining experience. tap dark private browsing that that A with in and dark dark press experience curated across every for. pixel forever while tap remaining and considered that and alive curated curated',
    icon: 'paw',
    gradient: 'amber',
    tone: 'success',
    meta: '20 mins ago',
    stat1: 255,
    stat2: 52,
    stat3: '4.5',
    verb: 'Saved',
  },
  {
    id: 'item-2334-23',
    title: 'Snappy Pulse 23',
    description: 'press light fluid light light tap dark gestures fluid that and remaining experience private. private browsing that that A with in and dark dark press experience curated across every for fast every. tap remaining and considered that and alive curated curated with for private',
    icon: 'leaf',
    gradient: 'amber',
    tone: 'info',
    meta: '21 mins ago',
    stat1: 268,
    stat2: 59,
    stat3: '1.4',
    verb: 'Archived',
  },
  {
    id: 'item-2334-24',
    title: 'Elite Loom 24',
    description: 'light fluid light light tap dark gestures fluid that and remaining experience private A. that that A with in and dark dark press experience curated across every for fast every while alive. considered that and alive curated curated with for private every considered pixel',
    icon: 'cloud',
    gradient: 'forest',
    tone: 'danger',
    meta: '22 mins ago',
    stat1: 281,
    stat2: 66,
    stat3: '3.3',
    verb: 'Pinned',
  },
  {
    id: 'item-2334-25',
    title: 'Punchy Aurora 25',
    description: 'fluid light light tap dark gestures fluid that and remaining experience private A alive. A with in and dark dark press experience curated across every for fast every while alive fluid alive. alive curated curated with for private every considered pixel light and haptics',
    icon: 'globe',
    gradient: 'neon',
    tone: 'warning',
    meta: '23 mins ago',
    stat1: 294,
    stat2: 73,
    stat3: '0.2',
    verb: 'Shared',
  },
  {
    id: 'item-2334-26',
    title: 'Sleek Lens 26',
    description: 'light light tap dark gestures fluid that and remaining experience private A alive feel. in and dark dark press experience curated across every for fast every while alive fluid alive beautiful forever. with for private every considered pixel light and haptics remaining for dark',
    icon: 'image',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '24 mins ago',
    stat1: 307,
    stat2: 80,
    stat3: '2.1',
    verb: 'Followed',
  },
  {
    id: 'item-2334-27',
    title: 'Glassy Echo 27',
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
    id: 'item-2334-28',
    title: 'Brisk Tapestry 28',
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
    id: 'item-2334-29',
    title: 'Subtle Atlas 29',
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
    id: 'item-2334-30',
    title: 'Lush Spark 30',
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
    id: 'item-2334-31',
    title: 'Soft Pulse 31',
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
    id: 'item-2334-32',
    title: 'Elite Quest 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-39678-1',
    title: 'Cosmic Studio',
    subtitle: 'designed for experience feel curated or private while in every designed on that across. alive forever every haptics feel light while modes long fast on or and curated designed or or remaining. forever long remaining press beautiful browsing browsing light feel forever curated and',
    icon: 'extension-puzzle',
    gradient: 'cosmic',
  },
  {
    id: 'section-39678-2',
    title: 'Silky Halo',
    subtitle: 'on that across gestures remaining on or and tap and curated A or every. feel that browsing remaining dark and every on curated beautiful haptics A curated private feel for experience long. light while remaining press pixel dark alive every long designed in and',
    icon: 'image',
    gradient: 'forest',
  },
  {
    id: 'section-39678-3',
    title: 'Buttery Atlas',
    subtitle: 'A or every fast browsing and fast designed across forever every and while curated. and long fluid remaining every and for while gestures modes for for gestures designed across while considered remaining. pixel in A tap alive for and and or on gestures dark',
    icon: 'book',
    gradient: 'cosmic',
  },
  {
    id: 'section-39678-4',
    title: 'Silky Compass',
    subtitle: 'and while curated modes light considered and fluid and every for forever private A. long private long browsing beautiful for in fast and feel in and dark while and and every every. alive forever tap private that fluid gestures tap and while modes every',
    icon: 'pulse',
    gradient: 'fire',
  },
  {
    id: 'section-39678-5',
    title: 'Buttery Pulse',
    subtitle: 'forever private A every and every alive remaining A designed and with press while. fast while for every across fast gestures or A dark haptics light A and across fast browsing browsing. for or considered experience designed designed on feel every and tap with',
    icon: 'layers',
    gradient: 'aurora',
  },
  {
    id: 'section-39678-6',
    title: 'Punchy Echo',
    subtitle: 'with press while press tap and dark fluid across in dark fluid beautiful across. gestures or fluid with every browsing remaining with private remaining private press while with alive and dark fast. while gestures light dark pixel every every considered every in haptics feel',
    icon: 'rocket',
    gradient: 'aurora',
  },
  {
    id: 'section-39678-7',
    title: 'Silky Pulse',
    subtitle: 'fluid beautiful across press gestures light across browsing every every considered designed for or. for and long fast private light considered and forever on light across tap alive with private in feel. across for for A A long alive long and tap and or',
    icon: 'grid',
    gradient: 'aurora',
  },
  {
    id: 'section-39678-8',
    title: 'Punchy Stream',
    subtitle: 'designed for or experience or gestures alive gestures that modes remaining feel press with. every A haptics private and while in experience with gestures and fast every long tap remaining press browsing. curated every pixel pixel A light fast A dark and alive while',
    icon: 'rocket',
    gradient: 'forest',
  },
  {
    id: 'section-39678-9',
    title: 'Glassy Pulse',
    subtitle: 'feel press with designed browsing considered modes and dark beautiful forever experience or considered. curated remaining every browsing every tap press with gestures with pixel for on or A haptics on gestures. considered light in browsing long forever every every gestures every gestures feel',
    icon: 'musical-notes',
    gradient: 'pastel',
  },
  {
    id: 'section-39678-10',
    title: 'Frosted Saga',
    subtitle: 'experience or considered tap across feel considered tap while dark experience beautiful haptics with. A browsing experience and for every fluid with browsing browsing long for every every curated while browsing every. fluid on or across that that designed dark beautiful long press across',
    icon: 'heart',
    gradient: 'brand',
  },
  {
    id: 'section-39678-11',
    title: 'Subtle Codex',
    subtitle: 'beautiful haptics with forever modes dark every that beautiful or feel A long feel. and private experience and alive remaining tap A modes and for across considered with alive press curated and. in and experience haptics every forever long while alive browsing experience gestures',
    icon: 'flag',
    gradient: 'neon',
  },
  {
    id: 'section-39678-12',
    title: 'Brisk Tapestry',
    subtitle: 'A long feel pixel beautiful modes light considered private in tap A pixel in. light experience remaining A every and remaining beautiful beautiful haptics long for alive dark with curated every press. while while pixel every every gestures considered dark and light tap fluid',
    icon: 'gift',
    gradient: 'candy',
  },
  {
    id: 'section-39678-13',
    title: 'Vibrant Loom',
    subtitle: 'A pixel in and beautiful press with light remaining haptics and curated that gestures. and alive press beautiful alive every every designed and alive in for and tap on browsing remaining or. fast tap remaining with gestures light for modes in or press considered',
    icon: 'compass',
    gradient: 'aurora',
  },
  {
    id: 'section-39678-14',
    title: 'Snappy Compass',
    subtitle: 'curated that gestures curated and browsing dark gestures every alive fast tap gestures forever. and and curated every fluid designed curated every pixel on pixel considered tap modes designed across that remaining. private forever experience fluid pixel while across private private press or haptics',
    icon: 'leaf',
    gradient: 'pastel',
  },
];

const HERO_TITLE = 'Edit bookmark';
const HERO_SUBTITLE = 'Title, URL, tags, and notes.';
const FOOTER_TITLE = 'Keep going with Edit bookmark';
const FOOTER_BODY = 'press browsing dark haptics every or feel in in haptics while pixel browsing long. remaining that while on experience browsing every with tap beautiful for every while modes in and browsing dark. that or or private beautiful dark forever fast alive gestures and light';

export const BookmarksItemEditScreen: React.FC = () => {
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
      variant="amber"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Edit bookmark"
        subtitle="Title, URL, tags, and notes."
        showBack={true}
        rightIcon="create"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="amber"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>17%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '17%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>60%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '60%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>13%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '13%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Buttery Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>56%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '56%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Elite Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>9%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '9%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Sleek Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>52%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '52%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Loom</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>5%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '5%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>48%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '48%' }]}
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
