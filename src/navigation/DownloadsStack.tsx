import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { DownloadsStackParamList } from '@/navigation/types';
import { DownloadsListScreen } from '@/screens/downloads/DownloadsListScreen';
import { DownloadsPreviewScreen } from '@/screens/downloads/DownloadsPreviewScreen';
import { DownloadsActionsScreen } from '@/screens/downloads/DownloadsActionsScreen';
import { DownloadsSettingsScreen } from '@/screens/downloads/DownloadsSettingsScreen';
import { DownloadsLocationsScreen } from '@/screens/downloads/DownloadsLocationsScreen';
import { DownloadsScheduleScreen } from '@/screens/downloads/DownloadsScheduleScreen';
import { DownloadsAnalyticsScreen } from '@/screens/downloads/DownloadsAnalyticsScreen';
import { DownloadsCategoryDetailScreen } from '@/screens/downloads/DownloadsCategoryDetailScreen';

const Stack = createNativeStackNavigator<DownloadsStackParamList>();

export const DownloadsStack: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DownloadsList" component={DownloadsListScreen} />
      <Stack.Screen name="DownloadsPreview" component={DownloadsPreviewScreen} />
      <Stack.Screen name="DownloadsActions" component={DownloadsActionsScreen} />
      <Stack.Screen name="DownloadsSettings" component={DownloadsSettingsScreen} />
      <Stack.Screen name="DownloadsLocations" component={DownloadsLocationsScreen} />
      <Stack.Screen name="DownloadsSchedule" component={DownloadsScheduleScreen} />
      <Stack.Screen name="DownloadsAnalytics" component={DownloadsAnalyticsScreen} />
      <Stack.Screen name="DownloadsCategoryDetail" component={DownloadsCategoryDetailScreen} />
    </Stack.Navigator>
  );
};
