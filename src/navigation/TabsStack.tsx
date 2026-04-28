import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { TabsStackParamList } from '@/navigation/types';
import { TabsListScreen } from '@/screens/tabs/TabsListScreen';
import { TabsPreviewScreen } from '@/screens/tabs/TabsPreviewScreen';
import { TabsSettingsScreen } from '@/screens/tabs/TabsSettingsScreen';
import { TabsAdvancedScreen } from '@/screens/tabs/TabsAdvancedScreen';
import { TabsGroupScreen } from '@/screens/tabs/TabsGroupScreen';
import { TabsArchiveScreen } from '@/screens/tabs/TabsArchiveScreen';
import { TabsArchiveItemScreen } from '@/screens/tabs/TabsArchiveItemScreen';
import { TabsCloseAllScreen } from '@/screens/tabs/TabsCloseAllScreen';
import { TabsAnalyticsScreen } from '@/screens/tabs/TabsAnalyticsScreen';
import { TabsAnalyticsDetailScreen } from '@/screens/tabs/TabsAnalyticsDetailScreen';

const Stack = createNativeStackNavigator<TabsStackParamList>();

export const TabsStack: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TabsList" component={TabsListScreen} />
      <Stack.Screen name="TabsPreview" component={TabsPreviewScreen} />
      <Stack.Screen name="TabsSettings" component={TabsSettingsScreen} />
      <Stack.Screen name="TabsAdvanced" component={TabsAdvancedScreen} />
      <Stack.Screen name="TabsGroup" component={TabsGroupScreen} />
      <Stack.Screen name="TabsArchive" component={TabsArchiveScreen} />
      <Stack.Screen name="TabsArchiveItem" component={TabsArchiveItemScreen} />
      <Stack.Screen name="TabsCloseAll" component={TabsCloseAllScreen} />
      <Stack.Screen name="TabsAnalytics" component={TabsAnalyticsScreen} />
      <Stack.Screen name="TabsAnalyticsDetail" component={TabsAnalyticsDetailScreen} />
    </Stack.Navigator>
  );
};
