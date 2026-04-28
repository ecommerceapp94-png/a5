import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { HistoryStackParamList } from '@/navigation/types';
import { HistoryHomeScreen } from '@/screens/history/HistoryHomeScreen';
import { HistoryDayScreen } from '@/screens/history/HistoryDayScreen';
import { HistoryEntryScreen } from '@/screens/history/HistoryEntryScreen';
import { HistoryEntryOptionsScreen } from '@/screens/history/HistoryEntryOptionsScreen';
import { HistorySearchScreen } from '@/screens/history/HistorySearchScreen';
import { HistoryClearScreen } from '@/screens/history/HistoryClearScreen';
import { HistoryAnalyticsScreen } from '@/screens/history/HistoryAnalyticsScreen';
import { HistoryDeviceDetailScreen } from '@/screens/history/HistoryDeviceDetailScreen';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export const HistoryStack: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HistoryHome" component={HistoryHomeScreen} />
      <Stack.Screen name="HistoryDay" component={HistoryDayScreen} />
      <Stack.Screen name="HistoryEntry" component={HistoryEntryScreen} />
      <Stack.Screen name="HistoryEntryOptions" component={HistoryEntryOptionsScreen} />
      <Stack.Screen name="HistorySearch" component={HistorySearchScreen} />
      <Stack.Screen name="HistoryClear" component={HistoryClearScreen} />
      <Stack.Screen name="HistoryAnalytics" component={HistoryAnalyticsScreen} />
      <Stack.Screen name="HistoryDeviceDetail" component={HistoryDeviceDetailScreen} />
    </Stack.Navigator>
  );
};
