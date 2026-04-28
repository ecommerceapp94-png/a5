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
    id: 'item-2549-1',
    title: 'Vibrant Stream 1',
    description: 'remaining browsing on or across fast and on A press browsing that experience haptics. and every remaining and and considered while A beautiful experience on forever while browsing fluid browsing haptics haptics. across forever with fluid designed designed curated and beautiful private dark forever',
    icon: 'flash',
    gradient: 'midnight',
    tone: 'accent',
    meta: '34 mins ago',
    stat1: 817,
    stat2: 24,
    stat3: '3.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2549-2',
    title: 'Crisp Forge 2',
    description: 'browsing on or across fast and on A press browsing that experience haptics browsing. remaining and and considered while A beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining. fluid designed designed curated and beautiful private dark forever and press tap',
    icon: 'image',
    gradient: 'fire',
    tone: 'success',
    meta: '35 mins ago',
    stat1: 830,
    stat2: 31,
    stat3: '0.0',
    verb: 'Searched',
  },
  {
    id: 'item-2549-3',
    title: 'Silky Saga 3',
    description: 'on or across fast and on A press browsing that experience haptics browsing and. and considered while A beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining with with. curated and beautiful private dark forever and press tap pixel long browsing',
    icon: 'gift',
    gradient: 'sunset',
    tone: 'warning',
    meta: '36 mins ago',
    stat1: 843,
    stat2: 38,
    stat3: '1.9',
    verb: 'Opened',
  },
  {
    id: 'item-2549-4',
    title: 'Frosted Mosaic 4',
    description: 'or across fast and on A press browsing that experience haptics browsing and fast. while A beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining with with long in. private dark forever and press tap pixel long browsing fast press light',
    icon: 'medal',
    gradient: 'ocean',
    tone: 'primary',
    meta: '37 mins ago',
    stat1: 856,
    stat2: 45,
    stat3: '3.8',
    verb: 'Read',
  },
  {
    id: 'item-2549-5',
    title: 'Deep Atlas 5',
    description: 'across fast and on A press browsing that experience haptics browsing and fast feel. beautiful experience on forever while browsing fluid browsing haptics haptics beautiful remaining with with long in in experience. and press tap pixel long browsing fast press light considered haptics press',
    icon: 'cart',
    gradient: 'brand',
    tone: 'success',
    meta: '38 mins ago',
    stat1: 869,
    stat2: 52,
    stat3: '0.7',
    verb: 'Translated',
  },
  {
    id: 'item-2549-6',
    title: 'Lush Studio 6',
    description: 'fast and on A press browsing that experience haptics browsing and fast feel on. on forever while browsing fluid browsing haptics haptics beautiful remaining with with long in in experience considered on. pixel long browsing fast press light considered haptics press feel and designed',
    icon: 'medal',
    gradient: 'amber',
    tone: 'primary',
    meta: '39 mins ago',
    stat1: 882,
    stat2: 59,
    stat3: '2.6',
    verb: 'Followed',
  },
  {
    id: 'item-2549-7',
    title: 'Vibrant Insight 7',
    description: 'and on A press browsing that experience haptics browsing and fast feel on long. while browsing fluid browsing haptics haptics beautiful remaining with with long in in experience considered on long A. fast press light considered haptics press feel and designed browsing experience remaining',
    icon: 'pizza',
    gradient: 'midnight',
    tone: 'accent',
    meta: '40 mins ago',
    stat1: 895,
    stat2: 66,
    stat3: '4.5',
    verb: 'Searched',
  },
  {
    id: 'item-2549-8',
    title: 'Premium Aurora 8',
    description: 'on A press browsing that experience haptics browsing and fast feel on long every. fluid browsing haptics haptics beautiful remaining with with long in in experience considered on long A that in. considered haptics press feel and designed browsing experience remaining across browsing haptics',
    icon: 'medal',
    gradient: 'fire',
    tone: 'warning',
    meta: '41 mins ago',
    stat1: 908,
    stat2: 73,
    stat3: '1.4',
    verb: 'Highlighted',
  },
  {
    id: 'item-2549-9',
    title: 'Sleek Studio 9',
    description: 'A press browsing that experience haptics browsing and fast feel on long every in. haptics haptics beautiful remaining with with long in in experience considered on long A that in and and. feel and designed browsing experience remaining across browsing haptics long browsing private',
    icon: 'pizza',
    gradient: 'ocean',
    tone: 'info',
    meta: '42 mins ago',
    stat1: 921,
    stat2: 80,
    stat3: '3.3',
    verb: 'Translated',
  },
  {
    id: 'item-2549-10',
    title: 'Vibrant Aurora 10',
    description: 'press browsing that experience haptics browsing and fast feel on long every in light. beautiful remaining with with long in in experience considered on long A that in and and every beautiful. browsing experience remaining across browsing haptics long browsing private gestures curated considered',
    icon: 'pricetag',
    gradient: 'pastel',
    tone: 'primary',
    meta: '43 mins ago',
    stat1: 934,
    stat2: 87,
    stat3: '0.2',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2549-11',
    title: 'Sleek Stream 11',
    description: 'browsing that experience haptics browsing and fast feel on long every in light dark. with with long in in experience considered on long A that in and and every beautiful that pixel. across browsing haptics long browsing private gestures curated considered and considered for',
    icon: 'layers',
    gradient: 'midnight',
    tone: 'success',
    meta: '44 mins ago',
    stat1: 947,
    stat2: 94,
    stat3: '2.1',
    verb: 'Followed',
  },
  {
    id: 'item-2549-12',
    title: 'Crisp Saga 12',
    description: 'that experience haptics browsing and fast feel on long every in light dark browsing. long in in experience considered on long A that in and and every beautiful that pixel long experience. long browsing private gestures curated considered and considered for every for light',
    icon: 'cart',
    gradient: 'sunset',
    tone: 'accent',
    meta: '45 mins ago',
    stat1: 960,
    stat2: 2,
    stat3: '4.0',
    verb: 'Opened',
  },
  {
    id: 'item-2549-13',
    title: 'Frosted Halo 13',
    description: 'experience haptics browsing and fast feel on long every in light dark browsing across. in experience considered on long A that in and and every beautiful that pixel long experience fluid light. gestures curated considered and considered for every for light dark dark across',
    icon: 'sparkles',
    gradient: 'fire',
    tone: 'primary',
    meta: '46 mins ago',
    stat1: 973,
    stat2: 9,
    stat3: '0.9',
    verb: 'Searched',
  },
  {
    id: 'item-2549-14',
    title: 'Buttery Pulse 14',
    description: 'haptics browsing and fast feel on long every in light dark browsing across fast. considered on long A that in and and every beautiful that pixel long experience fluid light fluid curated. and considered for every for light dark dark across for private pixel',
    icon: 'flag',
    gradient: 'brand',
    tone: 'warning',
    meta: '47 mins ago',
    stat1: 986,
    stat2: 16,
    stat3: '2.8',
    verb: 'Translated',
  },
  {
    id: 'item-2549-15',
    title: 'Elite Loom 15',
    description: 'browsing and fast feel on long every in light dark browsing across fast haptics. long A that in and and every beautiful that pixel long experience fluid light fluid curated and feel. every for light dark dark across for private pixel or curated while',
    icon: 'trophy',
    gradient: 'ocean',
    tone: 'primary',
    meta: '48 mins ago',
    stat1: 999,
    stat2: 23,
    stat3: '4.7',
    verb: 'Visited',
  },
  {
    id: 'item-2549-16',
    title: 'Punchy Beacon 16',
    description: 'and fast feel on long every in light dark browsing across fast haptics long. that in and and every beautiful that pixel long experience fluid light fluid curated and feel modes considered. dark dark across for private pixel or curated while modes experience considered',
    icon: 'flame',
    gradient: 'midnight',
    tone: 'danger',
    meta: '49 mins ago',
    stat1: 32,
    stat2: 30,
    stat3: '1.6',
    verb: 'Visited',
  },
  {
    id: 'item-2549-17',
    title: 'Velvet Studio 17',
    description: 'fast feel on long every in light dark browsing across fast haptics long that. and and every beautiful that pixel long experience fluid light fluid curated and feel modes considered curated for. for private pixel or curated while modes experience considered curated light long',
    icon: 'flag',
    gradient: 'aurora',
    tone: 'danger',
    meta: '50 mins ago',
    stat1: 45,
    stat2: 37,
    stat3: '3.5',
    verb: 'Read',
  },
  {
    id: 'item-2549-18',
    title: 'Vibrant Halo 18',
    description: 'feel on long every in light dark browsing across fast haptics long that light. every beautiful that pixel long experience fluid light fluid curated and feel modes considered curated for tap pixel. or curated while modes experience considered curated light long beautiful gestures light',
    icon: 'flame',
    gradient: 'aurora',
    tone: 'success',
    meta: '51 mins ago',
    stat1: 58,
    stat2: 44,
    stat3: '0.4',
    verb: 'Archived',
  },
  {
    id: 'item-2549-19',
    title: 'Buttery Aurora 19',
    description: 'on long every in light dark browsing across fast haptics long that light every. that pixel long experience fluid light fluid curated and feel modes considered curated for tap pixel haptics tap. modes experience considered curated light long beautiful gestures light remaining or browsing',
    icon: 'lock-closed',
    gradient: 'amber',
    tone: 'danger',
    meta: '52 mins ago',
    stat1: 71,
    stat2: 51,
    stat3: '2.3',
    verb: 'Translated',
  },
  {
    id: 'item-2549-20',
    title: 'Sleek Compass 20',
    description: 'long every in light dark browsing across fast haptics long that light every across. long experience fluid light fluid curated and feel modes considered curated for tap pixel haptics tap remaining across. curated light long beautiful gestures light remaining or browsing considered gestures experience',
    icon: 'extension-puzzle',
    gradient: 'neon',
    tone: 'primary',
    meta: '53 mins ago',
    stat1: 84,
    stat2: 58,
    stat3: '4.2',
    verb: 'Translated',
  },
  {
    id: 'item-2549-21',
    title: 'Snappy Spark 21',
    description: 'every in light dark browsing across fast haptics long that light every across and. fluid light fluid curated and feel modes considered curated for tap pixel haptics tap remaining across pixel alive. beautiful gestures light remaining or browsing considered gestures experience on A haptics',
    icon: 'planet',
    gradient: 'midnight',
    tone: 'primary',
    meta: '54 mins ago',
    stat1: 97,
    stat2: 65,
    stat3: '1.1',
    verb: 'Followed',
  },
  {
    id: 'item-2549-22',
    title: 'Soft Echo 22',
    description: 'in light dark browsing across fast haptics long that light every across and experience. fluid curated and feel modes considered curated for tap pixel haptics tap remaining across pixel alive and feel. remaining or browsing considered gestures experience on A haptics every long every',
    icon: 'cart',
    gradient: 'midnight',
    tone: 'accent',
    meta: '55 mins ago',
    stat1: 110,
    stat2: 72,
    stat3: '3.0',
    verb: 'Highlighted',
  },
  {
    id: 'item-2549-23',
    title: 'Brisk Studio 23',
    description: 'light dark browsing across fast haptics long that light every across and experience long. and feel modes considered curated for tap pixel haptics tap remaining across pixel alive and feel and in. considered gestures experience on A haptics every long every and in press',
    icon: 'rocket',
    gradient: 'fire',
    tone: 'info',
    meta: '56 mins ago',
    stat1: 123,
    stat2: 79,
    stat3: '4.9',
    verb: 'Translated',
  },
  {
    id: 'item-2549-24',
    title: 'Vibrant Halo 24',
    description: 'dark browsing across fast haptics long that light every across and experience long fast. modes considered curated for tap pixel haptics tap remaining across pixel alive and feel and in every pixel. on A haptics every long every and in press across modes every',
    icon: 'film',
    gradient: 'pastel',
    tone: 'primary',
    meta: '57 mins ago',
    stat1: 136,
    stat2: 86,
    stat3: '1.8',
    verb: 'Followed',
  },
  {
    id: 'item-2549-25',
    title: 'Buttery Compass 25',
    description: 'browsing across fast haptics long that light every across and experience long fast long. curated for tap pixel haptics tap remaining across pixel alive and feel and in every pixel alive every. every long every and in press across modes every that browsing forever',
    icon: 'grid',
    gradient: 'midnight',
    tone: 'accent',
    meta: '58 mins ago',
    stat1: 149,
    stat2: 93,
    stat3: '3.7',
    verb: 'Read',
  },
  {
    id: 'item-2549-26',
    title: 'Snappy Halo 26',
    description: 'across fast haptics long that light every across and experience long fast long and. tap pixel haptics tap remaining across pixel alive and feel and in every pixel alive every on on. and in press across modes every that browsing forever modes A curated',
    icon: 'bookmark',
    gradient: 'fire',
    tone: 'success',
    meta: '59 mins ago',
    stat1: 162,
    stat2: 1,
    stat3: '0.6',
    verb: 'Saved',
  },
  {
    id: 'item-2549-27',
    title: 'Buttery Halo 27',
    description: 'fast haptics long that light every across and experience long fast long and beautiful. haptics tap remaining across pixel alive and feel and in every pixel alive every on on experience private. across modes every that browsing forever modes A curated curated beautiful that',
    icon: 'cart',
    gradient: 'amber',
    tone: 'info',
    meta: '60 mins ago',
    stat1: 175,
    stat2: 8,
    stat3: '2.5',
    verb: 'Translated',
  },
  {
    id: 'item-2549-28',
    title: 'Buttery Mosaic 28',
    description: 'haptics long that light every across and experience long fast long and beautiful long. remaining across pixel alive and feel and in every pixel alive every on on experience private gestures modes. that browsing forever modes A curated curated beautiful that fast or and',
    icon: 'layers',
    gradient: 'forest',
    tone: 'primary',
    meta: '61 mins ago',
    stat1: 188,
    stat2: 15,
    stat3: '4.4',
    verb: 'Archived',
  },
  {
    id: 'item-2549-29',
    title: 'Deep Aurora 29',
    description: 'long that light every across and experience long fast long and beautiful long considered. pixel alive and feel and in every pixel alive every on on experience private gestures modes while long. modes A curated curated beautiful that fast or and that in press',
    icon: 'newspaper',
    gradient: 'midnight',
    tone: 'danger',
    meta: '62 mins ago',
    stat1: 201,
    stat2: 22,
    stat3: '1.3',
    verb: 'Searched',
  },
  {
    id: 'item-2549-30',
    title: 'Sleek Tapestry 30',
    description: 'that light every across and experience long fast long and beautiful long considered alive. and feel and in every pixel alive every on on experience private gestures modes while long every experience. curated beautiful that fast or and that in press and for across',
    icon: 'cart',
    gradient: 'neon',
    tone: 'warning',
    meta: '63 mins ago',
    stat1: 214,
    stat2: 29,
    stat3: '3.2',
    verb: 'Translated',
  },
  {
    id: 'item-2549-31',
    title: 'Subtle Studio 31',
    description: 'light every across and experience long fast long and beautiful long considered alive private. and in every pixel alive every on on experience private gestures modes while long every experience forever or. fast or and that in press and for across experience private with',
    icon: 'lock-closed',
    gradient: 'ocean',
    tone: 'primary',
    meta: '64 mins ago',
    stat1: 227,
    stat2: 36,
    stat3: '0.1',
    verb: 'Followed',
  },
  {
    id: 'item-2549-32',
    title: 'Vibrant Quest 32',
    description: 'every across and experience long fast long and beautiful long considered alive private browsing. every pixel alive every on on experience private gestures modes while long every experience forever or every feel. that in press and for across experience private with across on on',
    icon: 'flag',
    gradient: 'midnight',
    tone: 'accent',
    meta: '65 mins ago',
    stat1: 240,
    stat2: 43,
    stat3: '2.0',
    verb: 'Translated',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-43333-1',
    title: 'Polished Codex',
    subtitle: 'on in long every modes gestures that in modes fluid that curated fast A. feel fast fast experience fast dark in private light tap in feel across fluid alive for with alive. on browsing long that experience designed dark or on light private light',
    icon: 'image',
    gradient: 'aurora',
  },
  {
    id: 'section-43333-2',
    title: 'Velvet Compass',
    subtitle: 'curated fast A across and feel browsing beautiful and remaining fluid or curated while. remaining and and A feel haptics every on A across and private that fluid haptics feel and light. or considered pixel fluid experience and private haptics fluid or for alive',
    icon: 'analytics',
    gradient: 'candy',
  },
  {
    id: 'section-43333-3',
    title: 'Dreamy Stream',
    subtitle: 'or curated while while haptics press every and gestures pixel light tap for across. with across private or forever every experience alive haptics designed forever pixel gestures considered designed across forever browsing. A designed tap with every haptics and press gestures while fast press',
    icon: 'rocket',
    gradient: 'neon',
  },
  {
    id: 'section-43333-4',
    title: 'Punchy Beacon',
    subtitle: 'tap for across beautiful with that forever long every every that or long that. curated gestures and remaining fast remaining long on remaining designed experience A and considered considered tap long feel. modes haptics and feel forever every while every every and or long',
    icon: 'musical-notes',
    gradient: 'candy',
  },
  {
    id: 'section-43333-5',
    title: 'Snappy Loom',
    subtitle: 'or long that designed tap dark for tap in that every press beautiful dark. browsing while haptics with gestures remaining and while A forever feel designed fast and haptics alive beautiful haptics. alive remaining and across tap long tap in haptics every tap fast',
    icon: 'leaf',
    gradient: 'forest',
  },
  {
    id: 'section-43333-6',
    title: 'Lush Lens',
    subtitle: 'press beautiful dark alive in haptics or and remaining long modes and experience and. press considered haptics every pixel light designed every or fast dark browsing browsing browsing fast tap remaining for. light that while that fast modes experience for curated or on while',
    icon: 'paw',
    gradient: 'fire',
  },
  {
    id: 'section-43333-7',
    title: 'Crisp Forge',
    subtitle: 'and experience and long press that and with fast in fluid browsing fluid with. browsing pixel every for that on fluid for designed gestures considered with with private modes light for and. and that and haptics long press beautiful every curated or every light',
    icon: 'film',
    gradient: 'midnight',
  },
  {
    id: 'section-43333-8',
    title: 'Snappy Quest',
    subtitle: 'browsing fluid with curated long alive across fluid private private fluid modes and fluid. modes and considered alive pixel gestures modes long in fast every and light every designed long on with. remaining and for and experience haptics long fluid designed across every forever',
    icon: 'trophy',
    gradient: 'aurora',
  },
  {
    id: 'section-43333-9',
    title: 'Polished Stream',
    subtitle: 'modes and fluid and long considered haptics beautiful every experience and or fast considered. A press gestures experience with that private forever remaining A curated with experience and browsing or gestures or. considered that pixel light while light forever A with pixel experience private',
    icon: 'book',
    gradient: 'pastel',
  },
  {
    id: 'section-43333-10',
    title: 'Cosmic Stream',
    subtitle: 'or fast considered press that or and dark beautiful that in or across with. fluid fluid browsing haptics remaining in A or long gestures while gestures dark feel designed considered in fast. across while designed dark curated in or every on that haptics across',
    icon: 'cart',
    gradient: 'ocean',
  },
  {
    id: 'section-43333-11',
    title: 'Polished Beacon',
    subtitle: 'or across with every every for designed in gestures and fluid haptics experience tap. press beautiful and light across tap with experience remaining tap gestures browsing alive every modes alive light remaining. gestures beautiful designed fast A haptics private A haptics considered every remaining',
    icon: 'compass',
    gradient: 'fire',
  },
  {
    id: 'section-43333-12',
    title: 'Dreamy Loom',
    subtitle: 'haptics experience tap forever haptics and light dark remaining every dark dark experience and. A A and forever designed press experience fast every remaining for with press across fast haptics private every. experience pixel light fast private pixel alive and with press every private',
    icon: 'gift',
    gradient: 'neon',
  },
  {
    id: 'section-43333-13',
    title: 'Lush Compass',
    subtitle: 'dark experience and private gestures press in while and that in and long or. fast gestures feel every with light and that with in fluid browsing that beautiful feel fast and experience. private feel while A tap alive fast with curated tap browsing gestures',
    icon: 'heart',
    gradient: 'aurora',
  },
  {
    id: 'section-43333-14',
    title: 'Snappy Compass',
    subtitle: 'and long or gestures haptics modes remaining and press fluid long browsing or alive. feel and tap feel haptics fast forever dark and browsing every gestures pixel pixel light feel pixel remaining. dark press dark gestures fast pixel across forever forever light curated tap',
    icon: 'rocket',
    gradient: 'fire',
  },
];

const HERO_TITLE = 'Device';
const HERO_SUBTITLE = 'Per-device synced history details.';
const FOOTER_TITLE = 'Keep going with Device';
const FOOTER_BODY = 'across forever with fluid designed designed curated and beautiful private dark forever and press. browsing considered that tap across with or forever or light and remaining considered that across considered for for. with modes browsing that and light or every A designed and in';

export const HistoryDeviceDetailScreen: React.FC = () => {
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
      variant="ocean"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Device"
        subtitle="Per-device synced history details."
        showBack={true}
        rightIcon="phone-portrait"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="ocean"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Atlas</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>22%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.neon as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '22%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>65%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.forest as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '65%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Mosaic</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>18%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '18%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>61%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '61%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>14%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.midnight as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '14%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>57%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '57%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Polished Tapestry</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>10%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '10%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>53%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '53%' }]}
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
