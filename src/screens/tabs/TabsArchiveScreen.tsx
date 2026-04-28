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
    id: 'item-1708-1',
    title: 'Elite Quest 1',
    description: 'haptics alive pixel private fast fast press A on haptics dark for designed or. dark pixel with every with curated fast while press pixel browsing fast every haptics haptics press curated with. considered on long A that in and and every beautiful that pixel',
    icon: 'globe',
    gradient: 'fire',
    tone: 'accent',
    meta: '93 mins ago',
    stat1: 664,
    stat2: 77,
    stat3: '0.2',
    verb: 'Read',
  },
  {
    id: 'item-1708-2',
    title: 'Polished Codex 2',
    description: 'alive pixel private fast fast press A on haptics dark for designed or in. with every with curated fast while press pixel browsing fast every haptics haptics press curated with designed across. A that in and and every beautiful that pixel long experience fluid',
    icon: 'flash',
    gradient: 'fire',
    tone: 'success',
    meta: '94 mins ago',
    stat1: 677,
    stat2: 84,
    stat3: '2.1',
    verb: 'Opened',
  },
  {
    id: 'item-1708-3',
    title: 'Cosmic Aurora 3',
    description: 'pixel private fast fast press A on haptics dark for designed or in A. with curated fast while press pixel browsing fast every haptics haptics press curated with designed across across pixel. and and every beautiful that pixel long experience fluid light fluid curated',
    icon: 'gift',
    gradient: 'amber',
    tone: 'primary',
    meta: '5 mins ago',
    stat1: 690,
    stat2: 91,
    stat3: '4.0',
    verb: 'Searched',
  },
  {
    id: 'item-1708-4',
    title: 'Sleek Compass 4',
    description: 'private fast fast press A on haptics dark for designed or in A alive. fast while press pixel browsing fast every haptics haptics press curated with designed across across pixel dark designed. beautiful that pixel long experience fluid light fluid curated and feel modes',
    icon: 'cloud',
    gradient: 'brand',
    tone: 'warning',
    meta: '6 mins ago',
    stat1: 703,
    stat2: 98,
    stat3: '0.9',
    verb: 'Highlighted',
  },
  {
    id: 'item-1708-5',
    title: 'Snappy Spark 5',
    description: 'fast fast press A on haptics dark for designed or in A alive and. press pixel browsing fast every haptics haptics press curated with designed across across pixel dark designed remaining fluid. long experience fluid light fluid curated and feel modes considered curated for',
    icon: 'leaf',
    gradient: 'ocean',
    tone: 'info',
    meta: '7 mins ago',
    stat1: 716,
    stat2: 6,
    stat3: '2.8',
    verb: 'Archived',
  },
  {
    id: 'item-1708-6',
    title: 'Soft Lens 6',
    description: 'fast press A on haptics dark for designed or in A alive and on. browsing fast every haptics haptics press curated with designed across across pixel dark designed remaining fluid across private. light fluid curated and feel modes considered curated for tap pixel haptics',
    icon: 'leaf',
    gradient: 'pastel',
    tone: 'danger',
    meta: '8 mins ago',
    stat1: 729,
    stat2: 13,
    stat3: '4.7',
    verb: 'Saved',
  },
  {
    id: 'item-1708-7',
    title: 'Glassy Saga 7',
    description: 'press A on haptics dark for designed or in A alive and on in. every haptics haptics press curated with designed across across pixel dark designed remaining fluid across private fluid haptics. and feel modes considered curated for tap pixel haptics tap remaining across',
    icon: 'layers',
    gradient: 'neon',
    tone: 'info',
    meta: '9 mins ago',
    stat1: 742,
    stat2: 20,
    stat3: '1.6',
    verb: 'Visited',
  },
  {
    id: 'item-1708-8',
    title: 'Frosted Saga 8',
    description: 'A on haptics dark for designed or in A alive and on in considered. haptics press curated with designed across across pixel dark designed remaining fluid across private fluid haptics A pixel. considered curated for tap pixel haptics tap remaining across pixel alive and',
    icon: 'trophy',
    gradient: 'forest',
    tone: 'danger',
    meta: '10 mins ago',
    stat1: 755,
    stat2: 27,
    stat3: '3.5',
    verb: 'Shared',
  },
  {
    id: 'item-1708-9',
    title: 'Frosted Forge 9',
    description: 'on haptics dark for designed or in A alive and on in considered or. curated with designed across across pixel dark designed remaining fluid across private fluid haptics A pixel and pixel. tap pixel haptics tap remaining across pixel alive and feel and in',
    icon: 'flag',
    gradient: 'aurora',
    tone: 'accent',
    meta: '11 mins ago',
    stat1: 768,
    stat2: 34,
    stat3: '0.4',
    verb: 'Visited',
  },
  {
    id: 'item-1708-10',
    title: 'Silky Insight 10',
    description: 'haptics dark for designed or in A alive and on in considered or A. designed across across pixel dark designed remaining fluid across private fluid haptics A pixel and pixel dark experience. tap remaining across pixel alive and feel and in every pixel alive',
    icon: 'extension-puzzle',
    gradient: 'candy',
    tone: 'danger',
    meta: '12 mins ago',
    stat1: 781,
    stat2: 41,
    stat3: '2.3',
    verb: 'Opened',
  },
  {
    id: 'item-1708-11',
    title: 'Premium Spark 11',
    description: 'dark for designed or in A alive and on in considered or A press. across pixel dark designed remaining fluid across private fluid haptics A pixel and pixel dark experience on every. pixel alive and feel and in every pixel alive every on on',
    icon: 'rocket',
    gradient: 'aurora',
    tone: 'primary',
    meta: '13 mins ago',
    stat1: 794,
    stat2: 48,
    stat3: '4.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1708-12',
    title: 'Soft Atlas 12',
    description: 'for designed or in A alive and on in considered or A press with. dark designed remaining fluid across private fluid haptics A pixel and pixel dark experience on every every on. feel and in every pixel alive every on on experience private gestures',
    icon: 'lock-closed',
    gradient: 'brand',
    tone: 'success',
    meta: '14 mins ago',
    stat1: 807,
    stat2: 55,
    stat3: '1.1',
    verb: 'Archived',
  },
  {
    id: 'item-1708-13',
    title: 'Lush Compass 13',
    description: 'designed or in A alive and on in considered or A press with haptics. remaining fluid across private fluid haptics A pixel and pixel dark experience on every every on beautiful pixel. every pixel alive every on on experience private gestures modes while long',
    icon: 'leaf',
    gradient: 'sunset',
    tone: 'danger',
    meta: '15 mins ago',
    stat1: 820,
    stat2: 62,
    stat3: '3.0',
    verb: 'Searched',
  },
  {
    id: 'item-1708-14',
    title: 'Snappy Drift 14',
    description: 'or in A alive and on in considered or A press with haptics experience. across private fluid haptics A pixel and pixel dark experience on every every on beautiful pixel remaining tap. every on on experience private gestures modes while long every experience forever',
    icon: 'leaf',
    gradient: 'neon',
    tone: 'warning',
    meta: '16 mins ago',
    stat1: 833,
    stat2: 69,
    stat3: '4.9',
    verb: 'Visited',
  },
  {
    id: 'item-1708-15',
    title: 'Dreamy Echo 15',
    description: 'in A alive and on in considered or A press with haptics experience alive. fluid haptics A pixel and pixel dark experience on every every on beautiful pixel remaining tap A while. experience private gestures modes while long every experience forever or every feel',
    icon: 'star',
    gradient: 'ocean',
    tone: 'danger',
    meta: '17 mins ago',
    stat1: 846,
    stat2: 76,
    stat3: '1.8',
    verb: 'Searched',
  },
  {
    id: 'item-1708-16',
    title: 'Brisk Pulse 16',
    description: 'A alive and on in considered or A press with haptics experience alive forever. A pixel and pixel dark experience on every every on beautiful pixel remaining tap A while modes curated. modes while long every experience forever or every feel across fast pixel',
    icon: 'pizza',
    gradient: 'aurora',
    tone: 'warning',
    meta: '18 mins ago',
    stat1: 859,
    stat2: 83,
    stat3: '3.7',
    verb: 'Shared',
  },
  {
    id: 'item-1708-17',
    title: 'Elite Halo 17',
    description: 'alive and on in considered or A press with haptics experience alive forever tap. and pixel dark experience on every every on beautiful pixel remaining tap A while modes curated on considered. every experience forever or every feel across fast pixel tap while long',
    icon: 'rocket',
    gradient: 'ocean',
    tone: 'accent',
    meta: '19 mins ago',
    stat1: 872,
    stat2: 90,
    stat3: '0.6',
    verb: 'Opened',
  },
  {
    id: 'item-1708-18',
    title: 'Buttery Spark 18',
    description: 'and on in considered or A press with haptics experience alive forever tap haptics. dark experience on every every on beautiful pixel remaining tap A while modes curated on considered for modes. or every feel across fast pixel tap while long every alive press',
    icon: 'speedometer',
    gradient: 'candy',
    tone: 'primary',
    meta: '20 mins ago',
    stat1: 885,
    stat2: 97,
    stat3: '2.5',
    verb: 'Read',
  },
  {
    id: 'item-1708-19',
    title: 'Soft Stream 19',
    description: 'on in considered or A press with haptics experience alive forever tap haptics and. on every every on beautiful pixel remaining tap A while modes curated on considered for modes light on. across fast pixel tap while long every alive press curated browsing pixel',
    icon: 'lock-closed',
    gradient: 'brand',
    tone: 'success',
    meta: '21 mins ago',
    stat1: 898,
    stat2: 5,
    stat3: '4.4',
    verb: 'Read',
  },
  {
    id: 'item-1708-20',
    title: 'Crisp Quest 20',
    description: 'in considered or A press with haptics experience alive forever tap haptics and with. every on beautiful pixel remaining tap A while modes curated on considered for modes light on designed modes. tap while long every alive press curated browsing pixel with across and',
    icon: 'cloud',
    gradient: 'amber',
    tone: 'success',
    meta: '22 mins ago',
    stat1: 911,
    stat2: 12,
    stat3: '1.3',
    verb: 'Highlighted',
  },
  {
    id: 'item-1708-21',
    title: 'Polished Beacon 21',
    description: 'considered or A press with haptics experience alive forever tap haptics and with haptics. beautiful pixel remaining tap A while modes curated on considered for modes light on designed modes on considered. every alive press curated browsing pixel with across and A and beautiful',
    icon: 'pulse',
    gradient: 'amber',
    tone: 'info',
    meta: '23 mins ago',
    stat1: 924,
    stat2: 19,
    stat3: '3.2',
    verb: 'Searched',
  },
  {
    id: 'item-1708-22',
    title: 'Velvet Loom 22',
    description: 'or A press with haptics experience alive forever tap haptics and with haptics alive. remaining tap A while modes curated on considered for modes light on designed modes on considered feel every. curated browsing pixel with across and A and beautiful modes long while',
    icon: 'briefcase',
    gradient: 'pastel',
    tone: 'warning',
    meta: '24 mins ago',
    stat1: 937,
    stat2: 26,
    stat3: '0.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1708-23',
    title: 'Punchy Spark 23',
    description: 'A press with haptics experience alive forever tap haptics and with haptics alive and. A while modes curated on considered for modes light on designed modes on considered feel every remaining experience. with across and A and beautiful modes long while press fluid pixel',
    icon: 'cloud',
    gradient: 'ocean',
    tone: 'success',
    meta: '25 mins ago',
    stat1: 950,
    stat2: 33,
    stat3: '2.0',
    verb: 'Followed',
  },
  {
    id: 'item-1708-24',
    title: 'Soft Stream 24',
    description: 'press with haptics experience alive forever tap haptics and with haptics alive and for. modes curated on considered for modes light on designed modes on considered feel every remaining experience in every. A and beautiful modes long while press fluid pixel modes curated or',
    icon: 'flame',
    gradient: 'sunset',
    tone: 'accent',
    meta: '26 mins ago',
    stat1: 963,
    stat2: 40,
    stat3: '3.9',
    verb: 'Saved',
  },
  {
    id: 'item-1708-25',
    title: 'Crisp Saga 25',
    description: 'with haptics experience alive forever tap haptics and with haptics alive and for forever. on considered for modes light on designed modes on considered feel every remaining experience in every beautiful every. modes long while press fluid pixel modes curated or across tap across',
    icon: 'layers',
    gradient: 'fire',
    tone: 'info',
    meta: '27 mins ago',
    stat1: 976,
    stat2: 47,
    stat3: '0.8',
    verb: 'Highlighted',
  },
  {
    id: 'item-1708-26',
    title: 'Frosted Quest 26',
    description: 'haptics experience alive forever tap haptics and with haptics alive and for forever browsing. for modes light on designed modes on considered feel every remaining experience in every beautiful every for designed. press fluid pixel modes curated or across tap across with for browsing',
    icon: 'cart',
    gradient: 'forest',
    tone: 'info',
    meta: '28 mins ago',
    stat1: 989,
    stat2: 54,
    stat3: '2.7',
    verb: 'Pinned',
  },
  {
    id: 'item-1708-27',
    title: 'Polished Mosaic 27',
    description: 'experience alive forever tap haptics and with haptics alive and for forever browsing browsing. light on designed modes on considered feel every remaining experience in every beautiful every for designed fluid with. modes curated or across tap across with for browsing gestures A across',
    icon: 'rocket',
    gradient: 'pastel',
    tone: 'warning',
    meta: '29 mins ago',
    stat1: 22,
    stat2: 61,
    stat3: '4.6',
    verb: 'Read',
  },
  {
    id: 'item-1708-28',
    title: 'Deep Beacon 28',
    description: 'alive forever tap haptics and with haptics alive and for forever browsing browsing with. designed modes on considered feel every remaining experience in every beautiful every for designed fluid with A press. across tap across with for browsing gestures A across curated every press',
    icon: 'rocket',
    gradient: 'cosmic',
    tone: 'success',
    meta: '30 mins ago',
    stat1: 35,
    stat2: 68,
    stat3: '1.5',
    verb: 'Highlighted',
  },
  {
    id: 'item-1708-29',
    title: 'Velvet Saga 29',
    description: 'forever tap haptics and with haptics alive and for forever browsing browsing with tap. on considered feel every remaining experience in every beautiful every for designed fluid with A press every every. with for browsing gestures A across curated every press gestures or curated',
    icon: 'pizza',
    gradient: 'amber',
    tone: 'info',
    meta: '31 mins ago',
    stat1: 48,
    stat2: 75,
    stat3: '3.4',
    verb: 'Bookmarked',
  },
  {
    id: 'item-1708-30',
    title: 'Frosted Insight 30',
    description: 'tap haptics and with haptics alive and for forever browsing browsing with tap private. feel every remaining experience in every beautiful every for designed fluid with A press every every forever fast. gestures A across curated every press gestures or curated that designed experience',
    icon: 'speedometer',
    gradient: 'pastel',
    tone: 'success',
    meta: '32 mins ago',
    stat1: 61,
    stat2: 82,
    stat3: '0.3',
    verb: 'Pinned',
  },
  {
    id: 'item-1708-31',
    title: 'Premium Aurora 31',
    description: 'haptics and with haptics alive and for forever browsing browsing with tap private in. remaining experience in every beautiful every for designed fluid with A press every every forever fast pixel browsing. curated every press gestures or curated that designed experience every experience while',
    icon: 'paw',
    gradient: 'sunset',
    tone: 'warning',
    meta: '33 mins ago',
    stat1: 74,
    stat2: 89,
    stat3: '2.2',
    verb: 'Saved',
  },
  {
    id: 'item-1708-32',
    title: 'Sleek Studio 32',
    description: 'and with haptics alive and for forever browsing browsing with tap private in dark. in every beautiful every for designed fluid with A press every every forever fast pixel browsing beautiful fluid. gestures or curated that designed experience every experience while and A haptics',
    icon: 'briefcase',
    gradient: 'cosmic',
    tone: 'info',
    meta: '34 mins ago',
    stat1: 87,
    stat2: 96,
    stat3: '4.1',
    verb: 'Followed',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-29036-1',
    title: 'Vibrant Saga',
    subtitle: 'pixel and curated that designed forever every press designed while and experience on dark. every and every or long tap in haptics and with and A curated gestures for fluid designed remaining. and dark remaining for light pixel across pixel experience press alive and',
    icon: 'medal',
    gradient: 'fire',
  },
  {
    id: 'section-29036-2',
    title: 'Snappy Tapestry',
    subtitle: 'experience on dark modes tap or every beautiful alive considered haptics designed designed and. on A in haptics designed pixel every and pixel or pixel fast modes light while remaining feel A. A fluid in long dark dark modes browsing modes private and modes',
    icon: 'gift',
    gradient: 'cosmic',
  },
  {
    id: 'section-29036-3',
    title: 'Polished Spark',
    subtitle: 'designed designed and on alive feel considered light while press light forever browsing designed. or or experience gestures private in while every that that long and pixel on across fluid every and. pixel and alive across and and A curated dark considered A designed',
    icon: 'image',
    gradient: 'ocean',
  },
  {
    id: 'section-29036-4',
    title: 'Premium Saga',
    subtitle: 'forever browsing designed curated pixel across and A considered or A tap with forever. while curated gestures tap browsing feel curated pixel experience light for forever long beautiful across and on alive. every with modes browsing experience modes that remaining experience pixel with light',
    icon: 'compass',
    gradient: 'amber',
  },
  {
    id: 'section-29036-5',
    title: 'Crisp Atlas',
    subtitle: 'tap with forever long alive curated long press beautiful every forever and considered curated. considered pixel every every beautiful press modes browsing gestures modes long and for across beautiful considered browsing that. A on for remaining and light remaining modes and press press long',
    icon: 'cart',
    gradient: 'candy',
  },
  {
    id: 'section-29036-6',
    title: 'Brisk Saga',
    subtitle: 'and considered curated haptics designed across tap browsing feel forever every curated fast with. and fast press on and tap browsing alive and beautiful every while long in haptics considered across and. haptics or fluid that browsing alive feel beautiful and tap alive long',
    icon: 'rocket',
    gradient: 'aurora',
  },
  {
    id: 'section-29036-7',
    title: 'Crisp Lens',
    subtitle: 'curated fast with private A for and private feel designed fluid haptics fluid across. for considered that designed pixel A pixel press private dark across or in remaining in every that A. across that haptics forever across across modes alive fast while every tap',
    icon: 'shield',
    gradient: 'fire',
  },
  {
    id: 'section-29036-8',
    title: 'Subtle Pulse',
    subtitle: 'haptics fluid across while browsing feel experience that alive for press in while fast. that dark with curated every haptics in while light every pixel press every browsing curated dark beautiful in. pixel while pixel pixel press pixel curated dark modes haptics fast tap',
    icon: 'newspaper',
    gradient: 'aurora',
  },
  {
    id: 'section-29036-9',
    title: 'Glassy Studio',
    subtitle: 'in while fast every on press across curated remaining beautiful tap fast that every. while alive A experience A and experience press private fluid remaining beautiful fast private with for pixel experience. and haptics forever tap tap for every pixel every with alive experience',
    icon: 'image',
    gradient: 'forest',
  },
  {
    id: 'section-29036-10',
    title: 'Deep Studio',
    subtitle: 'fast that every A fluid or A that considered forever feel and alive with. every dark pixel haptics and curated beautiful every considered for haptics curated with across with alive light curated. modes every private pixel considered fast gestures private every gestures tap for',
    icon: 'paw',
    gradient: 'brand',
  },
  {
    id: 'section-29036-11',
    title: 'Lush Lens',
    subtitle: 'and alive with dark every that every dark alive curated across across on dark. curated every long remaining on long private haptics alive press in or private modes fluid private beautiful remaining. gestures and remaining with with every every experience every experience dark alive',
    icon: 'trophy',
    gradient: 'fire',
  },
  {
    id: 'section-29036-12',
    title: 'Deep Aurora',
    subtitle: 'across on dark every and browsing feel and long tap designed in with modes. with every fluid experience with pixel pixel curated every long browsing browsing and across modes and on light. dark every A fluid experience remaining A that designed designed designed experience',
    icon: 'analytics',
    gradient: 'sunset',
  },
  {
    id: 'section-29036-13',
    title: 'Vibrant Beacon',
    subtitle: 'in with modes fluid and alive light with considered that every in gestures gestures. every experience fast remaining A light feel in curated and alive A while remaining and for and in. in light alive pixel and and while and remaining while in while',
    icon: 'analytics',
    gradient: 'forest',
  },
  {
    id: 'section-29036-14',
    title: 'Polished Aurora',
    subtitle: 'in gestures gestures forever press press forever experience fast remaining dark designed and in. while press experience haptics forever every designed every designed across long fluid designed fluid alive on and on. and dark and curated for A fluid and press across A beautiful',
    icon: 'leaf',
    gradient: 'fire',
  },
];

const HERO_TITLE = 'Archive';
const HERO_SUBTITLE = 'Recently closed tabs.';
const FOOTER_TITLE = 'Keep going with Archive';
const FOOTER_BODY = 'considered on long A that in and and every beautiful that pixel long experience. beautiful fluid every every feel gestures gestures in remaining and beautiful that curated feel fast fluid long designed. gestures or press dark on fast fast that alive modes that private';

export const TabsArchiveScreen: React.FC = () => {
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
      variant="midnight"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Archive"
        subtitle="Recently closed tabs."
        showBack={true}
        rightIcon="archive"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="midnight"
        badge="Archive"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>69%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '69%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Subtle Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>22%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '22%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>65%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '65%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>18%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '18%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Soft Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>61%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '61%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>14%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.candy as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '14%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>57%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '57%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Lush Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>10%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '10%' }]}
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
