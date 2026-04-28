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
    id: 'item-2494-1',
    title: 'Buttery Forge 1',
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
    id: 'item-2494-2',
    title: 'Silky Saga 2',
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
    id: 'item-2494-3',
    title: 'Frosted Spark 3',
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
    id: 'item-2494-4',
    title: 'Soft Echo 4',
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
    id: 'item-2494-5',
    title: 'Brisk Lens 5',
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
    id: 'item-2494-6',
    title: 'Glassy Atlas 6',
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
    id: 'item-2494-7',
    title: 'Lush Mosaic 7',
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
  {
    id: 'item-2494-8',
    title: 'Deep Aurora 8',
    description: 'dark designed light experience A and considered gestures tap private forever that press fast. browsing browsing every remaining dark for fast with in every fast alive every alive remaining modes dark private. fast across with press or every or while long press and private',
    icon: 'shield',
    gradient: 'brand',
    tone: 'danger',
    meta: '76 mins ago',
    stat1: 193,
    stat2: 84,
    stat3: '1.9',
    verb: 'Searched',
  },
  {
    id: 'item-2494-9',
    title: 'Sleek Codex 9',
    description: 'designed light experience A and considered gestures tap private forever that press fast every. every remaining dark for fast with in every fast alive every alive remaining modes dark private and browsing. press or every or while long press and private and for modes',
    icon: 'film',
    gradient: 'neon',
    tone: 'warning',
    meta: '77 mins ago',
    stat1: 206,
    stat2: 91,
    stat3: '3.8',
    verb: 'Pinned',
  },
  {
    id: 'item-2494-10',
    title: 'Cosmic Drift 10',
    description: 'light experience A and considered gestures tap private forever that press fast every and. dark for fast with in every fast alive every alive remaining modes dark private and browsing on fluid. or while long press and private and for modes for browsing remaining',
    icon: 'bookmark',
    gradient: 'ocean',
    tone: 'warning',
    meta: '78 mins ago',
    stat1: 219,
    stat2: 98,
    stat3: '0.7',
    verb: 'Saved',
  },
  {
    id: 'item-2494-11',
    title: 'Dreamy Pulse 11',
    description: 'experience A and considered gestures tap private forever that press fast every and that. fast with in every fast alive every alive remaining modes dark private and browsing on fluid fast considered. press and private and for modes for browsing remaining designed press beautiful',
    icon: 'pricetag',
    gradient: 'cosmic',
    tone: 'info',
    meta: '79 mins ago',
    stat1: 232,
    stat2: 6,
    stat3: '2.6',
    verb: 'Highlighted',
  },
  {
    id: 'item-2494-12',
    title: 'Elite Stream 12',
    description: 'A and considered gestures tap private forever that press fast every and that haptics. in every fast alive every alive remaining modes dark private and browsing on fluid fast considered press gestures. and for modes for browsing remaining designed press beautiful forever for in',
    icon: 'speedometer',
    gradient: 'forest',
    tone: 'info',
    meta: '80 mins ago',
    stat1: 245,
    stat2: 13,
    stat3: '4.5',
    verb: 'Followed',
  },
  {
    id: 'item-2494-13',
    title: 'Crisp Drift 13',
    description: 'and considered gestures tap private forever that press fast every and that haptics every. fast alive every alive remaining modes dark private and browsing on fluid fast considered press gestures browsing for. for browsing remaining designed press beautiful forever for in beautiful fluid fluid',
    icon: 'school',
    gradient: 'pastel',
    tone: 'accent',
    meta: '81 mins ago',
    stat1: 258,
    stat2: 20,
    stat3: '1.4',
    verb: 'Followed',
  },
  {
    id: 'item-2494-14',
    title: 'Dreamy Lens 14',
    description: 'considered gestures tap private forever that press fast every and that haptics every and. every alive remaining modes dark private and browsing on fluid fast considered press gestures browsing for fluid fast. designed press beautiful forever for in beautiful fluid fluid long considered dark',
    icon: 'lock-closed',
    gradient: 'fire',
    tone: 'accent',
    meta: '82 mins ago',
    stat1: 271,
    stat2: 27,
    stat3: '3.3',
    verb: 'Read',
  },
  {
    id: 'item-2494-15',
    title: 'Glassy Stream 15',
    description: 'gestures tap private forever that press fast every and that haptics every and fluid. remaining modes dark private and browsing on fluid fast considered press gestures browsing for fluid fast dark that. forever for in beautiful fluid fluid long considered dark for with modes',
    icon: 'shield',
    gradient: 'fire',
    tone: 'success',
    meta: '83 mins ago',
    stat1: 284,
    stat2: 34,
    stat3: '0.2',
    verb: 'Followed',
  },
  {
    id: 'item-2494-16',
    title: 'Crisp Mosaic 16',
    description: 'tap private forever that press fast every and that haptics every and fluid while. dark private and browsing on fluid fast considered press gestures browsing for fluid fast dark that light light. beautiful fluid fluid long considered dark for with modes gestures long every',
    icon: 'pulse',
    gradient: 'amber',
    tone: 'accent',
    meta: '84 mins ago',
    stat1: 297,
    stat2: 41,
    stat3: '2.1',
    verb: 'Visited',
  },
  {
    id: 'item-2494-17',
    title: 'Deep Mosaic 17',
    description: 'private forever that press fast every and that haptics every and fluid while designed. and browsing on fluid fast considered press gestures browsing for fluid fast dark that light light haptics press. long considered dark for with modes gestures long every tap haptics alive',
    icon: 'cafe',
    gradient: 'fire',
    tone: 'danger',
    meta: '85 mins ago',
    stat1: 310,
    stat2: 48,
    stat3: '4.0',
    verb: 'Pinned',
  },
  {
    id: 'item-2494-18',
    title: 'Deep Compass 18',
    description: 'forever that press fast every and that haptics every and fluid while designed beautiful. on fluid fast considered press gestures browsing for fluid fast dark that light light haptics press haptics across. for with modes gestures long every tap haptics alive and light pixel',
    icon: 'cafe',
    gradient: 'aurora',
    tone: 'warning',
    meta: '86 mins ago',
    stat1: 323,
    stat2: 55,
    stat3: '0.9',
    verb: 'Followed',
  },
  {
    id: 'item-2494-19',
    title: 'Snappy Loom 19',
    description: 'that press fast every and that haptics every and fluid while designed beautiful and. fast considered press gestures browsing for fluid fast dark that light light haptics press haptics across alive while. gestures long every tap haptics alive and light pixel alive fast across',
    icon: 'briefcase',
    gradient: 'cosmic',
    tone: 'accent',
    meta: '87 mins ago',
    stat1: 336,
    stat2: 62,
    stat3: '2.8',
    verb: 'Highlighted',
  },
  {
    id: 'item-2494-20',
    title: 'Punchy Spark 20',
    description: 'press fast every and that haptics every and fluid while designed beautiful and forever. press gestures browsing for fluid fast dark that light light haptics press haptics across alive while that light. tap haptics alive and light pixel alive fast across remaining long feel',
    icon: 'newspaper',
    gradient: 'fire',
    tone: 'info',
    meta: '88 mins ago',
    stat1: 349,
    stat2: 69,
    stat3: '4.7',
    verb: 'Saved',
  },
  {
    id: 'item-2494-21',
    title: 'Soft Beacon 21',
    description: 'fast every and that haptics every and fluid while designed beautiful and forever and. browsing for fluid fast dark that light light haptics press haptics across alive while that light browsing dark. and light pixel alive fast across remaining long feel considered every beautiful',
    icon: 'heart',
    gradient: 'pastel',
    tone: 'info',
    meta: '89 mins ago',
    stat1: 362,
    stat2: 76,
    stat3: '1.6',
    verb: 'Archived',
  },
  {
    id: 'item-2494-22',
    title: 'Velvet Compass 22',
    description: 'every and that haptics every and fluid while designed beautiful and forever and remaining. fluid fast dark that light light haptics press haptics across alive while that light browsing dark light experience. alive fast across remaining long feel considered every beautiful curated press forever',
    icon: 'medal',
    gradient: 'forest',
    tone: 'danger',
    meta: '90 mins ago',
    stat1: 375,
    stat2: 83,
    stat3: '3.5',
    verb: 'Shared',
  },
  {
    id: 'item-2494-23',
    title: 'Snappy Studio 23',
    description: 'and that haptics every and fluid while designed beautiful and forever and remaining remaining. dark that light light haptics press haptics across alive while that light browsing dark light experience for forever. remaining long feel considered every beautiful curated press forever light long remaining',
    icon: 'newspaper',
    gradient: 'neon',
    tone: 'accent',
    meta: '91 mins ago',
    stat1: 388,
    stat2: 90,
    stat3: '0.4',
    verb: 'Pinned',
  },
  {
    id: 'item-2494-24',
    title: 'Vibrant Beacon 24',
    description: 'that haptics every and fluid while designed beautiful and forever and remaining remaining that. light light haptics press haptics across alive while that light browsing dark light experience for forever feel pixel. considered every beautiful curated press forever light long remaining press that for',
    icon: 'school',
    gradient: 'candy',
    tone: 'warning',
    meta: '92 mins ago',
    stat1: 401,
    stat2: 97,
    stat3: '2.3',
    verb: 'Visited',
  },
  {
    id: 'item-2494-25',
    title: 'Velvet Quest 25',
    description: 'haptics every and fluid while designed beautiful and forever and remaining remaining that browsing. haptics press haptics across alive while that light browsing dark light experience for forever feel pixel dark dark. curated press forever light long remaining press that for remaining browsing press',
    icon: 'film',
    gradient: 'cosmic',
    tone: 'danger',
    meta: '93 mins ago',
    stat1: 414,
    stat2: 5,
    stat3: '4.2',
    verb: 'Opened',
  },
  {
    id: 'item-2494-26',
    title: 'Polished Atlas 26',
    description: 'every and fluid while designed beautiful and forever and remaining remaining that browsing every. haptics across alive while that light browsing dark light experience for forever feel pixel dark dark every while. light long remaining press that for remaining browsing press fluid experience forever',
    icon: 'film',
    gradient: 'aurora',
    tone: 'primary',
    meta: '94 mins ago',
    stat1: 427,
    stat2: 12,
    stat3: '1.1',
    verb: 'Bookmarked',
  },
  {
    id: 'item-2494-27',
    title: 'Lush Tapestry 27',
    description: 'and fluid while designed beautiful and forever and remaining remaining that browsing every fluid. alive while that light browsing dark light experience for forever feel pixel dark dark every while fluid private. press that for remaining browsing press fluid experience forever dark alive light',
    icon: 'cart',
    gradient: 'brand',
    tone: 'success',
    meta: '5 mins ago',
    stat1: 440,
    stat2: 19,
    stat3: '3.0',
    verb: 'Followed',
  },
  {
    id: 'item-2494-28',
    title: 'Subtle Loom 28',
    description: 'fluid while designed beautiful and forever and remaining remaining that browsing every fluid alive. that light browsing dark light experience for forever feel pixel dark dark every while fluid private A every. remaining browsing press fluid experience forever dark alive light A for tap',
    icon: 'rocket',
    gradient: 'sunset',
    tone: 'accent',
    meta: '6 mins ago',
    stat1: 453,
    stat2: 26,
    stat3: '4.9',
    verb: 'Archived',
  },
  {
    id: 'item-2494-29',
    title: 'Punchy Drift 29',
    description: 'while designed beautiful and forever and remaining remaining that browsing every fluid alive press. browsing dark light experience for forever feel pixel dark dark every while fluid private A every forever every. fluid experience forever dark alive light A for tap every curated dark',
    icon: 'lock-closed',
    gradient: 'fire',
    tone: 'danger',
    meta: '7 mins ago',
    stat1: 466,
    stat2: 33,
    stat3: '1.8',
    verb: 'Archived',
  },
  {
    id: 'item-2494-30',
    title: 'Dreamy Quest 30',
    description: 'designed beautiful and forever and remaining remaining that browsing every fluid alive press across. light experience for forever feel pixel dark dark every while fluid private A every forever every with or. dark alive light A for tap every curated dark and remaining alive',
    icon: 'book',
    gradient: 'neon',
    tone: 'danger',
    meta: '8 mins ago',
    stat1: 479,
    stat2: 40,
    stat3: '3.7',
    verb: 'Archived',
  },
  {
    id: 'item-2494-31',
    title: 'Polished Loom 31',
    description: 'beautiful and forever and remaining remaining that browsing every fluid alive press across on. for forever feel pixel dark dark every while fluid private A every forever every with or with curated. A for tap every curated dark and remaining alive curated remaining fast',
    icon: 'flash',
    gradient: 'neon',
    tone: 'danger',
    meta: '9 mins ago',
    stat1: 492,
    stat2: 47,
    stat3: '0.6',
    verb: 'Followed',
  },
  {
    id: 'item-2494-32',
    title: 'Punchy Atlas 32',
    description: 'and forever and remaining remaining that browsing every fluid alive press across on while. feel pixel dark dark every while fluid private A every forever every with or with curated in pixel. every curated dark and remaining alive curated remaining fast long considered and',
    icon: 'bookmark',
    gradient: 'neon',
    tone: 'accent',
    meta: '10 mins ago',
    stat1: 505,
    stat2: 54,
    stat3: '2.5',
    verb: 'Translated',
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-42398-1',
    title: 'Premium Quest',
    subtitle: 'dark for every on dark pixel or haptics while press while pixel while with. pixel browsing and experience experience long for remaining in fluid considered with and in tap and haptics alive. for across while modes experience and for every light press modes across',
    icon: 'cafe',
    gradient: 'forest',
  },
  {
    id: 'section-42398-2',
    title: 'Polished Forge',
    subtitle: 'pixel while with private modes considered for browsing for considered every remaining in in. on that and on in while haptics long and modes A light tap fluid considered feel pixel press. tap remaining feel while considered pixel and designed press beautiful with and',
    icon: 'book',
    gradient: 'amber',
  },
  {
    id: 'section-42398-3',
    title: 'Vibrant Beacon',
    subtitle: 'remaining in in light feel long gestures beautiful designed experience or considered beautiful fluid. for gestures and press private press experience in across experience curated private gestures forever fluid on forever for. that designed beautiful and experience with and gestures on pixel and tap',
    icon: 'newspaper',
    gradient: 'ocean',
  },
  {
    id: 'section-42398-4',
    title: 'Frosted Beacon',
    subtitle: 'considered beautiful fluid curated and pixel gestures while and that feel across pixel and. and forever forever while long that every on every remaining fast that fluid pixel in while dark modes. across alive curated dark experience for curated or tap light light on',
    icon: 'analytics',
    gradient: 'ocean',
  },
  {
    id: 'section-42398-5',
    title: 'Polished Beacon',
    subtitle: 'across pixel and press long designed curated dark on gestures beautiful remaining that while. and or pixel on or modes every feel while or forever experience feel while tap and remaining browsing. designed fluid long and remaining experience haptics pixel or experience pixel gestures',
    icon: 'pricetag',
    gradient: 'fire',
  },
  {
    id: 'section-42398-6',
    title: 'Soft Atlas',
    subtitle: 'remaining that while alive every every or experience gestures designed with fast feel A. modes every while browsing tap on A fast haptics pixel across considered fast haptics that modes curated fast. browsing forever for experience or with dark feel or browsing curated considered',
    icon: 'book',
    gradient: 'cosmic',
  },
  {
    id: 'section-42398-7',
    title: 'Dreamy Echo',
    subtitle: 'fast feel A long and tap every browsing remaining with A and on press. and pixel experience in or and and with across or on tap and across and with and tap. considered remaining for feel experience and or with A remaining considered and',
    icon: 'flame',
    gradient: 'aurora',
  },
  {
    id: 'section-42398-8',
    title: 'Velvet Lens',
    subtitle: 'and on press beautiful fast or in fast while fluid designed experience gestures dark. and private every feel tap pixel fluid for that beautiful tap designed curated alive alive remaining that or. and and with press modes tap with across with curated press and',
    icon: 'medal',
    gradient: 'amber',
  },
  {
    id: 'section-42398-9',
    title: 'Elite Spark',
    subtitle: 'experience gestures dark in in and remaining and while across while across A dark. on for remaining every or pixel in gestures fast gestures fluid every for and press forever for across. pixel dark and dark designed and dark and beautiful private and in',
    icon: 'rocket',
    gradient: 'candy',
  },
  {
    id: 'section-42398-10',
    title: 'Polished Echo',
    subtitle: 'across A dark and considered A for every and alive and curated private every. and alive private gestures every while forever fast and haptics that feel on dark pixel press across every. beautiful beautiful beautiful designed in long every modes A for press long',
    icon: 'cafe',
    gradient: 'midnight',
  },
  {
    id: 'section-42398-11',
    title: 'Velvet Drift',
    subtitle: 'curated private every feel pixel considered feel that on that and gestures for pixel. every gestures every remaining alive gestures forever gestures modes every experience dark forever modes fluid for on haptics. beautiful and A for experience browsing light forever feel press with forever',
    icon: 'planet',
    gradient: 'sunset',
  },
  {
    id: 'section-42398-12',
    title: 'Crisp Lens',
    subtitle: 'gestures for pixel designed with and or and experience across in and feel or. every light for forever with fast private designed modes every haptics every every pixel private light across feel. that browsing fluid that forever considered and across tap light and pixel',
    icon: 'pricetag',
    gradient: 'fire',
  },
  {
    id: 'section-42398-13',
    title: 'Brisk Quest',
    subtitle: 'and feel or with while beautiful with fluid A or fluid press pixel designed. or designed remaining that forever modes experience designed considered and curated and modes every designed and browsing beautiful. across alive with with while private in feel in press designed with',
    icon: 'speedometer',
    gradient: 'midnight',
  },
  {
    id: 'section-42398-14',
    title: 'Subtle Aurora',
    subtitle: 'press pixel designed fluid modes haptics modes haptics haptics or while modes or fluid. every A modes and private A with that tap haptics with and alive light fast beautiful tap browsing. considered on curated forever across in haptics press dark A every in',
    icon: 'shield',
    gradient: 'candy',
  },
];

const HERO_TITLE = 'Page actions';
const HERO_SUBTITLE = 'Save, share, copy and translate options.';
const FOOTER_TITLE = 'Keep going with Page actions';
const FOOTER_BODY = 'light and every remaining browsing designed for across across fast remaining haptics every light. designed with press that modes curated or beautiful for every curated fast and fast modes while with haptics. light and fluid long and pixel browsing curated and remaining fast across';

export const BrowserContextMenuScreen: React.FC = () => {
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
      variant="fire"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Page actions"
        subtitle="Save, share, copy and translate options."
        showBack={true}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="fire"
        badge="Actions"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Brisk Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>27%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '27%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Deep Halo</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Crisp Saga</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Halo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>66%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '66%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Cosmic Drift</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>19%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '19%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Punchy Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>62%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '62%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Frosted Spark</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>15%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '15%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Forge</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>58%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.brand as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '58%' }]}
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
