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
    id: 'item-2483-1',
    title: 'Subtle Drift 1',
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
    id: 'item-2483-2',
    title: 'Dreamy Atlas 2',
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
    id: 'item-2483-3',
    title: 'Lush Studio 3',
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
    id: 'item-2483-4',
    title: 'Vibrant Drift 4',
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
    id: 'item-2483-5',
    title: 'Dreamy Insight 5',
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
    id: 'item-2483-6',
    title: 'Premium Beacon 6',
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
    id: 'item-2483-7',
    title: 'Velvet Drift 7',
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
    id: 'item-2483-8',
    title: 'Dreamy Codex 8',
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
    id: 'item-2483-9',
    title: 'Cosmic Lens 9',
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
    id: 'item-2483-10',
    title: 'Glassy Aurora 10',
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
    id: 'item-2483-11',
    title: 'Sleek Halo 11',
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
    id: 'item-2483-12',
    title: 'Buttery Forge 12',
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
    id: 'item-2483-13',
    title: 'Silky Saga 13',
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
    id: 'item-2483-14',
    title: 'Frosted Spark 14',
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
    id: 'item-2483-15',
    title: 'Soft Echo 15',
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
    id: 'item-2483-16',
    title: 'Brisk Lens 16',
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
    id: 'item-2483-17',
    title: 'Glassy Atlas 17',
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
    id: 'item-2483-18',
    title: 'Lush Mosaic 18',
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
    id: 'item-2483-19',
    title: 'Deep Aurora 19',
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
    id: 'item-2483-20',
    title: 'Sleek Codex 20',
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
    id: 'item-2483-21',
    title: 'Cosmic Drift 21',
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
    id: 'item-2483-22',
    title: 'Dreamy Pulse 22',
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
    id: 'item-2483-23',
    title: 'Elite Stream 23',
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
    id: 'item-2483-24',
    title: 'Crisp Drift 24',
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
    id: 'item-2483-25',
    title: 'Dreamy Lens 25',
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
    id: 'item-2483-26',
    title: 'Glassy Stream 26',
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
    id: 'item-2483-27',
    title: 'Crisp Mosaic 27',
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
    id: 'item-2483-28',
    title: 'Deep Mosaic 28',
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
    id: 'item-2483-29',
    title: 'Deep Compass 29',
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
    id: 'item-2483-30',
    title: 'Snappy Loom 30',
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
    id: 'item-2483-31',
    title: 'Punchy Spark 31',
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
    id: 'item-2483-32',
    title: 'Soft Beacon 32',
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
];

const SECTIONS: SectionConfig[] = [
  {
    id: 'section-42211-1',
    title: 'Polished Studio',
    subtitle: 'dark while with designed and and light in and tap dark light for experience. gestures fast for for that feel haptics haptics browsing dark or light while that forever haptics dark for. experience tap modes in designed light fast modes designed alive curated on',
    icon: 'pulse',
    gradient: 'fire',
  },
  {
    id: 'section-42211-2',
    title: 'Lush Mosaic',
    subtitle: 'light for experience pixel pixel every A tap or alive browsing and curated private. every and feel considered pixel while considered light across that remaining A fast fluid pixel modes and long. across A on pixel pixel or dark pixel in across or across',
    icon: 'speedometer',
    gradient: 'forest',
  },
  {
    id: 'section-42211-3',
    title: 'Premium Lens',
    subtitle: 'and curated private while with beautiful and fast feel haptics feel pixel fast long. designed curated or dark beautiful private or with while modes haptics and beautiful remaining curated remaining A on. remaining on alive with gestures curated every experience with fluid experience and',
    icon: 'pizza',
    gradient: 'sunset',
  },
  {
    id: 'section-42211-4',
    title: 'Glassy Beacon',
    subtitle: 'pixel fast long and with light private beautiful feel in beautiful considered pixel in. haptics across on beautiful forever fast fast browsing and beautiful browsing considered every across while designed for and. fluid remaining for alive in curated and dark alive fluid A pixel',
    icon: 'rocket',
    gradient: 'pastel',
  },
  {
    id: 'section-42211-5',
    title: 'Sleek Stream',
    subtitle: 'considered pixel in for considered long experience long fast press considered gestures and in. and every gestures designed while press fluid light A fast modes haptics and considered tap while considered and. and curated pixel dark in fast A across beautiful browsing with haptics',
    icon: 'leaf',
    gradient: 'aurora',
  },
  {
    id: 'section-42211-6',
    title: 'Buttery Codex',
    subtitle: 'gestures and in curated tap across for dark forever beautiful remaining long A press. fluid and across curated while alive experience for and every in curated designed every private dark and or. modes modes across private forever modes and and across in alive beautiful',
    icon: 'globe',
    gradient: 'amber',
  },
  {
    id: 'section-42211-7',
    title: 'Buttery Tapestry',
    subtitle: 'long A press private on alive every or and experience A forever feel dark. light considered feel beautiful pixel curated feel experience tap browsing every light that across fluid and with long. private feel fast while considered and every designed in designed every while',
    icon: 'rocket',
    gradient: 'brand',
  },
  {
    id: 'section-42211-8',
    title: 'Silky Compass',
    subtitle: 'forever feel dark alive tap remaining every haptics long gestures pixel fluid press A. press and remaining and tap beautiful designed press for considered curated light private for and or for for. long considered every modes and light remaining while forever and browsing modes',
    icon: 'medal',
    gradient: 'ocean',
  },
  {
    id: 'section-42211-9',
    title: 'Silky Aurora',
    subtitle: 'fluid press A browsing haptics for light every tap modes and and tap light. curated in in across haptics for gestures beautiful across while long dark modes for A and private fluid. feel or every remaining for and every and curated haptics or pixel',
    icon: 'image',
    gradient: 'cosmic',
  },
  {
    id: 'section-42211-10',
    title: 'Subtle Loom',
    subtitle: 'and tap light every haptics with fast fast across alive on considered press curated. while considered and on tap or across haptics tap remaining and fluid every forever that across while and. gestures haptics remaining while fluid fast with fluid feel beautiful across on',
    icon: 'globe',
    gradient: 'pastel',
  },
  {
    id: 'section-42211-11',
    title: 'Snappy Spark',
    subtitle: 'considered press curated beautiful feel light long tap A for alive and fluid in. modes considered press beautiful pixel beautiful light press designed dark experience on dark beautiful modes forever designed fast. A long remaining considered curated browsing alive experience in on on press',
    icon: 'shield',
    gradient: 'sunset',
  },
  {
    id: 'section-42211-12',
    title: 'Snappy Saga',
    subtitle: 'and fluid in every pixel remaining and designed curated with gestures fluid light considered. alive private fluid private or pixel on gestures private tap fluid every while and every curated for for. every with that and experience dark across pixel in feel forever or',
    icon: 'flash',
    gradient: 'forest',
  },
  {
    id: 'section-42211-13',
    title: 'Brisk Forge',
    subtitle: 'fluid light considered gestures beautiful long gestures long that private or designed haptics every. and or private feel haptics in alive or browsing feel modes with and fast and for pixel modes. feel private and tap tap alive haptics and or pixel modes modes',
    icon: 'layers',
    gradient: 'amber',
  },
  {
    id: 'section-42211-14',
    title: 'Cosmic Lens',
    subtitle: 'designed haptics every with fluid light and or curated private every long beautiful forever. designed gestures light considered feel private and with private tap private considered fluid curated browsing fluid A haptics. remaining and and for while while and in every curated A curated',
    icon: 'planet',
    gradient: 'pastel',
  },
];

const HERO_TITLE = 'Download analytics';
const HERO_SUBTITLE = 'Volumes by type and source.';
const FOOTER_TITLE = 'Keep going with Download analytics';
const FOOTER_BODY = 'tap every pixel on while beautiful private and modes private every every fast and. tap fast browsing every haptics for haptics considered haptics across and with browsing browsing remaining browsing haptics pixel. while modes pixel remaining remaining on that and every every every pixel';

export const DownloadsAnalyticsScreen: React.FC = () => {
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
      variant="neon"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScreenHeader
        title="Download analytics"
        subtitle="Volumes by type and source."
        showBack={true}
        rightIcon="analytics"
        onRightPress={() => Toast.show({ type: 'info', text1: 'Quick actions', text2: 'Open the bottom sheet from any list item.' })}
        variant="neon"
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Insight</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>64%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.sunset as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '64%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Velvet Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>17%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.fire as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '17%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Stream</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>60%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.amber as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '60%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Vibrant Quest</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>13%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.pastel as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '13%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Premium Drift</Text>
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
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Dreamy Lens</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>9%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '9%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Snappy Saga</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>52%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.aurora as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '52%' }]}
                />
              </View>
            </View>
            <View style={styles.barColumn}>
              <View style={styles.rowSpread}>
                <Text style={[styles.barTitle, { color: theme.colors.text }]}>Silky Echo</Text>
                <Text style={[styles.barTitle, { color: theme.colors.textMuted, fontWeight: '600' }]}>5%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
                <LinearGradient
                  colors={theme.gradients.cosmic as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: '5%' }]}
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
