import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { BrowserStack } from '@/navigation/BrowserStack';
import { TabsStack } from '@/navigation/TabsStack';
import { BookmarksStack } from '@/navigation/BookmarksStack';
import { HistoryStack } from '@/navigation/HistoryStack';
import { DownloadsStack } from '@/navigation/DownloadsStack';
import { RootTabParamList } from '@/navigation/types';
import { triggerHaptic } from '@/utils/haptics';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const navTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: theme.colors.background,
          card: theme.colors.backgroundElevated,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: theme.colors.backgroundElevated,
            borderTopColor: theme.colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontWeight: '700',
            fontSize: 11,
          },
          tabBarIcon: ({ color, focused, size }) => {
            const map: Record<string, keyof typeof Ionicons.glyphMap> = {
              BrowserTab: focused ? 'compass' : 'compass-outline',
              TabsTab: focused ? 'albums' : 'albums-outline',
              BookmarksTab: focused ? 'bookmark' : 'bookmark-outline',
              HistoryTab: focused ? 'time' : 'time-outline',
              DownloadsTab: focused ? 'download' : 'download-outline',
            };
            const iconName = map[route.name] ?? 'ellipse';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        screenListeners={{
          tabPress: () => triggerHaptic('selection'),
        }}
      >
        <Tab.Screen name="BrowserTab" component={BrowserStack} options={{ tabBarLabel: 'Browser' }} />
        <Tab.Screen name="TabsTab" component={TabsStack} options={{ tabBarLabel: 'Tabs' }} />
        <Tab.Screen
          name="BookmarksTab"
          component={BookmarksStack}
          options={{ tabBarLabel: 'Bookmarks' }}
        />
        <Tab.Screen name="HistoryTab" component={HistoryStack} options={{ tabBarLabel: 'History' }} />
        <Tab.Screen
          name="DownloadsTab"
          component={DownloadsStack}
          options={{ tabBarLabel: 'Downloads' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
