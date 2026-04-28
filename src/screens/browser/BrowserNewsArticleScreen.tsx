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
    id: 'item-2469-1',
    title: 'Glassy Halo 1',
    description: 'considered A experience forever in while pixel experience A with with or or every. fast forever for long or tap private experience dark light fluid light pixel beautiful or and designed or. browsing curated and modes for private dark across that on fast press',
    icon: 'briefcase',
    gradient: 'aurora',
    tone: 'warning',
    meta: '44 mins ago',
    stat1: 757,
    stat2: 58,
    stat3: '1.1',
    verb: 'Shared',
  },
  {
    id: 'item-2469-2',
    title: 'Buttery Mosaic 2',
    description: 'A experience forever in while pixel experience A with with or or every and. for long or tap private experience dark light fluid light pixel beautiful or and designed or haptics and. modes for private dark across that on fast press browsing designed fast',
    icon: 'image',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '45 mins ago',
    stat1: 770,
    stat2: 65,
    stat3: '3.0',
    verb: 'Searched',
  },
  {
    id: 'item-2469-3',
    title: 'Deep Loom 3',
    description: 'experience forever in while pixel experience A with with or or every and A. or tap private experience dark light fluid light pixel beautiful or and designed or haptics and beautiful press. dark across that on fast press browsing designed fast while considered alive',
    icon: 'analytics',
    gradient: 'candy',
    tone: 'warning',
    meta: '46 mins ago',
    stat1: 783,
    stat2: 72,
    stat3: '4.9',
    verb: 'Opened',
  },
  {
    id: 'item-2469-4',
    title: 'Punchy Drift 4',
    description: 'forever in while pixel experience A with with or or every and A and. private experience dark light fluid light pixel beautiful or and designed or haptics and beautiful press across every. on fast press browsing designed fast while considered alive experience fluid designed',
    icon: 'extension-puzzle',
    gradient: 'ocean',
    tone: 'primary',
    meta: '47 mins ago',
    stat1: 796,
    stat2: 79,
    stat3: '1.8',
    verb: 'Read',
  },
  {
    id: 'item-2469-5',
    title: 'Dreamy Atlas 5',
    description: 'in while pixel experience A with with or or every and A and alive. dark light fluid light pixel beautiful or and designed or haptics and beautiful press across every and pixel. browsing designed fast while considered alive experience fluid designed for every and',
    icon: 'extension-puzzle',
    gradient: 'brand',
    tone: 'success',
    meta: '48 mins ago',
    stat1: 809,
    stat2: 86,
    stat3: '3.7',
    verb: 'Read',
  },
  {
    id: 'item-2469-6',
    title: 'Lush Studio 6',
    description: 'while pixel experience A with with or or every and A and alive across. fluid light pixel beautiful or and designed or haptics and beautiful press across every and pixel every designed. while considered alive experience fluid designed for every and every in that',
    icon: 'bookmark',
    gradient: 'amber',
    tone: 'success',
    meta: '49 mins ago',
    stat1: 822,
    stat2: 93,
    stat3: '0.6',
    verb: 'Shared',
  },
  {
    id: 'item-2469-7',
    title: 'Vibrant Lens 7',
    description: 'pixel experience A with with or or every and A and alive across gestures. pixel beautiful or and designed or haptics and beautiful press across every and pixel every designed private private. experience fluid designed for every and every in that experience on light',
    icon: 'flame',
    gradient: 'amber',
    tone: 'accent',
    meta: '50 mins ago',
    stat1: 835,
    stat2: 1,
    stat3: '2.5',
    verb: 'Shared',
  },
  {
    id: 'item-2469-8',
    title: 'Glassy Aurora 8',
    description: 'experience A with with or or every and A and alive across gestures for. or and designed or haptics and beautiful press across every and pixel every designed private private fluid light. for every and every in that experience on light on beautiful long',
    icon: 'leaf',
    gradient: 'candy',
    tone: 'accent',
    meta: '51 mins ago',
    stat1: 848,
    stat2: 8,
    stat3: '4.4',
    verb: 'Saved',
  },
  {
    id: 'item-2469-9',
    title: 'Sleek Spark 9',
    description: 'A with with or or every and A and alive across gestures for for. designed or haptics and beautiful press across every and pixel every designed private private fluid light considered long. every in that experience on light on beautiful long and tap feel',
    icon: 'extension-puzzle',
    gradient: 'candy',
    tone: 'info',
    meta: '52 mins ago',
    stat1: 861,
    stat2: 15,
    stat3: '1.3',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2469-10',
    title: 'Soft Atlas 10',
    description: 'with with or or every and A and alive across gestures for for and. haptics and beautiful press across every and pixel every designed private private fluid light considered long alive on. experience on light on beautiful long and tap feel fast remaining modes',
    icon: 'lock-closed',
    gradient: 'forest',
    tone: 'success',
    meta: '53 mins ago',
    stat1: 874,
    stat2: 22,
    stat3: '3.2',
    verb: 'Opened',
  },
  {
    id: 'item-2469-11',
    title: 'Lush Atlas 11',
    description: 'with or or every and A and alive across gestures for for and experience. beautiful press across every and pixel every designed private private fluid light considered long alive on forever or. on beautiful long and tap feel fast remaining modes in considered alive',
    icon: 'briefcase',
    gradient: 'sunset',
    tone: 'primary',
    meta: '54 mins ago',
    stat1: 887,
    stat2: 29,
    stat3: '0.1',
    verb: 'Pinned',
  },
  {
    id: 'item-2469-12',
    title: 'Lush Lens 12',
    description: 'or or every and A and alive across gestures for for and experience feel. across every and pixel every designed private private fluid light considered long alive on forever or that tap. and tap feel fast remaining modes in considered alive tap every pixel',
    icon: 'paw',
    gradient: 'brand',
    tone: 'warning',
    meta: '55 mins ago',
    stat1: 900,
    stat2: 36,
    stat3: '2.0',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2469-13',
    title: 'Glassy Atlas 13',
    description: 'or every and A and alive across gestures for for and experience feel every. and pixel every designed private private fluid light considered long alive on forever or that tap tap curated. fast remaining modes in considered alive tap every pixel on while beautiful',
    icon: 'pulse',
    gradient: 'cosmic',
    tone: 'success',
    meta: '56 mins ago',
    stat1: 913,
    stat2: 43,
    stat3: '3.9',
    verb: 'Translated',
  },
  {
    id: 'item-2469-14',
    title: 'Lush Tapestry 14',
    description: 'every and A and alive across gestures for for and experience feel every private. every designed private private fluid light considered long alive on forever or that tap tap curated while or. in considered alive tap every pixel on while beautiful private and modes',
    icon: 'book',
    gradient: 'sunset',
    tone: 'primary',
    meta: '57 mins ago',
    stat1: 926,
    stat2: 50,
    stat3: '0.8',
    verb: 'Pinned',
  },
  {
    id: 'item-2469-15',
    title: 'Subtle Drift 15',
    description: 'and A and alive across gestures for for and experience feel every private or. private private fluid light considered long alive on forever or that tap tap curated while or dark dark. tap every pixel on while beautiful private and modes private every every',
    icon: 'film',
    gradient: 'midnight',
    tone: 'warning',
    meta: '58 mins ago',
    stat1: 939,
    stat2: 57,
    stat3: '2.7',
    verb: 'Saved',
  },
  {
    id: 'item-2469-16',
    title: 'Dreamy Atlas 16',
    description: 'A and alive across gestures for for and experience feel every private or across. fluid light considered long alive on forever or that tap tap curated while or dark dark tap fast. on while beautiful private and modes private every every fast and private',
    icon: 'cloud',
    gradient: 'cosmic',
    tone: 'info',
    meta: '59 mins ago',
    stat1: 952,
    stat2: 64,
    stat3: '4.6',
    verb: 'Saved',
  },
  {
    id: 'item-2469-17',
    title: 'Lush Studio 17',
    description: 'and alive across gestures for for and experience feel every private or across fast. considered long alive on forever or that tap tap curated while or dark dark tap fast while considered. private and modes private every every fast and private considered tap every',
    icon: 'cart',
    gradient: 'forest',
    tone: 'info',
    meta: '60 mins ago',
    stat1: 965,
    stat2: 71,
    stat3: '1.5',
    verb: 'Pinned',
  },
  {
    id: 'item-2469-18',
    title: 'Vibrant Drift 18',
    description: 'alive across gestures for for and experience feel every private or across fast and. alive on forever or that tap tap curated while or dark dark tap fast while considered curated across. private every every fast and private considered tap every modes haptics haptics',
    icon: 'speedometer',
    gradient: 'forest',
    tone: 'warning',
    meta: '61 mins ago',
    stat1: 978,
    stat2: 78,
    stat3: '3.4',
    verb: 'Searched',
  },
  {
    id: 'item-2469-19',
    title: 'Dreamy Insight 19',
    description: 'across gestures for for and experience feel every private or across fast and for. forever or that tap tap curated while or dark dark tap fast while considered curated across alive A. fast and private considered tap every modes haptics haptics with fluid that',
    icon: 'cloud',
    gradient: 'cosmic',
    tone: 'warning',
    meta: '62 mins ago',
    stat1: 991,
    stat2: 85,
    stat3: '0.3',
    verb: 'Opened',
  },
  {
    id: 'item-2469-20',
    title: 'Premium Beacon 20',
    description: 'gestures for for and experience feel every private or across fast and for dark. that tap tap curated while or dark dark tap fast while considered curated across alive A private on. considered tap every modes haptics haptics with fluid that fluid beautiful every',
    icon: 'leaf',
    gradient: 'ocean',
    tone: 'primary',
    meta: '63 mins ago',
    stat1: 24,
    stat2: 92,
    stat3: '2.2',
    verb: 'Visited',
  },
  {
    id: 'item-2469-21',
    title: 'Velvet Drift 21',
    description: 'for for and experience feel every private or across fast and for dark designed. tap curated while or dark dark tap fast while considered curated across alive A private on A across. modes haptics haptics with fluid that fluid beautiful every pixel tap or',
    icon: 'newspaper',
    gradient: 'brand',
    tone: 'danger',
    meta: '64 mins ago',
    stat1: 37,
    stat2: 99,
    stat3: '4.1',
    verb: 'Highlighted',
  },
  {
    id: 'item-2469-22',
    title: 'Dreamy Codex 22',
    description: 'for and experience feel every private or across fast and for dark designed light. while or dark dark tap fast while considered curated across alive A private on A across in while. with fluid that fluid beautiful every pixel tap or or A while',
    icon: 'medal',
    gradient: 'aurora',
    tone: 'info',
    meta: '65 mins ago',
    stat1: 50,
    stat2: 7,
    stat3: '1.0',
    verb: 'Shared',
  },
  {
    id: 'item-2469-23',
    title: 'Cosmic Lens 23',
    description: 'and experience feel every private or across fast and for dark designed light experience. dark dark tap fast while considered curated across alive A private on A across in while light experience. fluid beautiful every pixel tap or or A while light and every',
    icon: 'star',
    gradient: 'pastel',
    tone: 'accent',
    meta: '66 mins ago',
    stat1: 63,
    stat2: 14,
    stat3: '2.9',
    verb: 'Translated',
  },
  {
    id: 'item-2469-24',
    title: 'Glassy Aurora 24',
    description: 'experience feel every private or across fast and for dark designed light experience A. tap fast while considered curated across alive A private on A across in while light experience press while. pixel tap or or A while light and every remaining browsing designed',
    icon: 'rocket',
    gradient: 'candy',
    tone: 'primary',
    meta: '67 mins ago',
    stat1: 76,
    stat2: 21,
    stat3: '4.8',
    verb: 'Followed',
  },
  {
    id: 'item-2469-25',
    title: 'Sleek Halo 25',
    description: 'feel every private or across fast and for dark designed light experience A and. while considered curated across alive A private on A across in while light experience press while browsing browsing. or A while light and every remaining browsing designed for across across',
    icon: 'book',
    gradient: 'midnight',
    tone: 'accent',
    meta: '68 mins ago',
    stat1: 89,
    stat2: 28,
    stat3: '1.7',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2469-26',
    title: 'Buttery Forge 26',
    description: 'every private or across fast and for dark designed light experience A and considered. curated across alive A private on A across in while light experience press while browsing browsing every remaining. light and every remaining browsing designed for across across fast remaining haptics',
    icon: 'sparkles',
    gradient: 'fire',
    tone: 'success',
    meta: '69 mins ago',
    stat1: 102,
    stat2: 35,
    stat3: '3.6',
    verb: 'Saved',
  },
  {
    id: 'item-2469-27',
    title: 'Silky Saga 27',
    description: 'private or across fast and for dark designed light experience A and considered gestures. alive A private on A across in while light experience press while browsing browsing every remaining dark for. remaining browsing designed for across across fast remaining haptics every light press',
    icon: 'rocket',
    gradient: 'sunset',
    tone: 'info',
    meta: '70 mins ago',
    stat1: 115,
    stat2: 42,
    stat3: '0.5',
    verb: 'Archived',
  },
  {
    id: 'item-2469-28',
    title: 'Frosted Spark 28',
    description: 'or across fast and for dark designed light experience A and considered gestures tap. private on A across in while light experience press while browsing browsing every remaining dark for fast with. for across across fast remaining haptics every light press modes designed that',
    icon: 'paw',
    gradient: 'forest',
    tone: 'danger',
    meta: '71 mins ago',
    stat1: 128,
    stat2: 49,
    stat3: '2.4',
    verb: 'Visited',
  },
  {
    id: 'item-2469-29',
    title: 'Soft Echo 29',
    description: 'across fast and for dark designed light experience A and considered gestures tap private. A across in while light experience press while browsing browsing every remaining dark for fast with in every. fast remaining haptics every light press modes designed that tap designed fluid',
    icon: 'planet',
    gradient: 'neon',
    tone: 'danger',
    meta: '72 mins ago',
    stat1: 141,
    stat2: 56,
    stat3: '4.3',
    verb: 'Read',
  },
  {
    id: 'item-2469-30',
    title: 'Brisk Lens 30',
    description: 'fast and for dark designed light experience A and considered gestures tap private forever. in while light experience press while browsing browsing every remaining dark for fast with in every fast alive. every light press modes designed that tap designed fluid fast across with',
    icon: 'gift',
    gradient: 'aurora',
    tone: 'success',
    meta: '73 mins ago',
    stat1: 154,
    stat2: 63,
    stat3: '1.2',
    verb: 'Searched',
  },
  {
    id: 'item-2469-31',
    title: 'Glassy Atlas 31',
    description: 'and for dark designed light experience A and considered gestures tap private forever that. light experience press while browsing browsing every remaining dark for fast with in every fast alive every alive. modes designed that tap designed fluid fast across with press or every',
    icon: 'leaf',
    gradient: 'amber',
    tone: 'warning',
    meta: '74 mins ago',
    stat1: 167,
    stat2: 70,
    stat3: '3.1',
    verb: 'Opened',
  },
  {
    id: 'item-2469-32',
    title: 'Lush Mosaic 32',
    description: 'for dark designed light experience A and considered gestures tap private forever that press. press while browsing browsing every remaining dark for fast with in every fast alive every alive remaining modes. tap designed fluid fast across with press or every or while long',
    icon: 'star',
    gradient: 'ocean',
    tone: 'primary',
    meta: '75 mins ago',
    stat1: 180,
    stat2: 77,
    stat3: '0.0',
    verb: 'Archived',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-41973-1',
    title: 'Cosmic Tapestry',
    subtitle: 'pixel pixel private beautiful in long light browsing fluid fast tap that dark across. modes remaining considered or fluid in haptics beautiful across fluid curated forever dark or remaining remaining experience or. for alive haptics A every fast tap feel experience haptics for beautiful',
    icon: 'lock-closed',
    gradient: 'brand',
  },
  {
    id: 'section-41973-2',
    title: 'Frosted Spark',
    subtitle: 'that dark across or forever or and and fluid beautiful across dark browsing designed. every fast every modes long browsing across that browsing curated press and considered every remaining light private alive. with every private forever dark alive and and or while remaining or',
    icon: 'eye',
    gradient: 'fire',
  },
  {
    id: 'section-41973-3',
    title: 'Brisk Tapestry',
    subtitle: 'dark browsing designed considered light considered private A every light on every forever that. dark in tap pixel and across fluid light while every pixel designed every that for while experience long. for light browsing with feel fast and pixel and tap and across',
    icon: 'extension-puzzle',
    gradient: 'brand',
  },
  {
    id: 'section-41973-4',
    title: 'Vibrant Saga',
    subtitle: 'every forever that private haptics gestures browsing every and with beautiful curated and and. with every fast fluid across across curated with dark long modes that forever forever designed every long forever. modes considered long considered haptics dark tap that designed fluid every remaining',
    icon: 'pulse',
    gradient: 'amber',
  },
  {
    id: 'section-41973-5',
    title: 'Glassy Stream',
    subtitle: 'curated and and every while alive fluid modes or forever feel browsing pixel on. every across press pixel every for remaining every alive curated light gestures alive while beautiful every across considered. tap tap and dark curated that feel press pixel experience long beautiful',
    icon: 'globe',
    gradient: 'amber',
  },
  {
    id: 'section-41973-6',
    title: 'Silky Forge',
    subtitle: 'browsing pixel on designed press or A light every fast beautiful haptics with and. or light A modes considered in considered every every long beautiful forever light modes considered press for across. and A private beautiful for that with remaining that for fast alive',
    icon: 'planet',
    gradient: 'fire',
  },
  {
    id: 'section-41973-7',
    title: 'Lush Drift',
    subtitle: 'haptics with and in and while private with gestures light browsing remaining press gestures. tap dark fluid on or and long feel feel in and tap press and alive forever haptics and. or dark in in every beautiful with with across considered that modes',
    icon: 'medal',
    gradient: 'fire',
  },
  {
    id: 'section-41973-8',
    title: 'Subtle Studio',
    subtitle: 'remaining press gestures in remaining for every feel or light and while dark and. press modes dark haptics gestures designed across curated dark and and pixel and feel press and every experience. designed browsing that press beautiful designed across forever remaining designed on gestures',
    icon: 'cart',
    gradient: 'amber',
  },
  {
    id: 'section-41973-9',
    title: 'Velvet Aurora',
    subtitle: 'while dark and considered every fluid and private and private A and A and. across experience tap tap pixel every every private fast pixel dark modes for that feel fluid on browsing. and across in for browsing light A haptics and considered forever every',
    icon: 'gift',
    gradient: 'amber',
  },
  {
    id: 'section-41973-10',
    title: 'Lush Drift',
    subtitle: 'and A and considered remaining that that considered considered A light forever while every. and for fast curated alive modes and A tap remaining A forever forever designed and pixel feel considered. feel press and haptics tap fast experience private or and experience pixel',
    icon: 'medal',
    gradient: 'pastel',
  },
  {
    id: 'section-41973-11',
    title: 'Punchy Compass',
    subtitle: 'forever while every private fast and for feel pixel fluid in gestures on modes. light haptics remaining and every long that haptics every designed light across forever in considered in fluid private. designed A while remaining light dark browsing tap gestures beautiful modes A',
    icon: 'layers',
    gradient: 'brand',
  },
  {
    id: 'section-41973-12',
    title: 'Elite Insight',
    subtitle: 'gestures on modes light on and every for that dark experience tap curated private. remaining tap gestures for with press across on long every private private modes with that experience light modes. for remaining across every beautiful remaining pixel modes on with considered long',
    icon: 'cart',
    gradient: 'candy',
  },
  {
    id: 'section-41973-13',
    title: 'Premium Beacon',
    subtitle: 'tap curated private press or considered browsing haptics fast while while every press across. or and and remaining long forever dark on pixel tap for gestures forever while remaining private every fast. beautiful forever gestures private gestures designed that browsing beautiful and light and',
    icon: 'film',
    gradient: 'neon',
  },
  {
    id: 'section-41973-14',
    title: 'Buttery Studio',
    subtitle: 'every press across and fluid curated and alive fluid beautiful on for every fast. every forever dark every every forever or with and and press pixel forever beautiful or press modes across. gestures and and forever light that pixel gestures and light pixel designed',
    icon: 'planet',
    gradient: 'cosmic',
  },
];

const HERO_TITLE = 'Article';
const HERO_SUBTITLE = 'Reader mode with mocked metadata.';
const FOOTER_TITLE = 'Keep going with Article';
const FOOTER_BODY = 'browsing curated and modes for private dark across that on fast press browsing designed. gestures pixel fast that every designed A light browsing haptics designed alive that gestures every browsing for dark. tap pixel modes gestures and fast fluid while fluid gestures tap every';

export const BrowserNewsArticleScreen: React.FC = () => {
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
      variant="candy"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Article"
        subtitle="Reader mode with mocked metadata."
        showBack={true}
        rightIcon="book"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="candy"
        badge="Read"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>62%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.ocean as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '62%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Pulse</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>15%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '15%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>58%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '58%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>11%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '11%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>54%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '54%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Brisk Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>7%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '7%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Glassy Compass</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>50%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '50%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Codex</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>93%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '93%' }]}
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
