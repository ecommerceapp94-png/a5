import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { BrowserStackParamList } from '@/navigation/types';
import { BrowserHomeScreen } from '@/screens/browser/BrowserHomeScreen';
import { BrowserSpeedDialDetailScreen } from '@/screens/browser/BrowserSpeedDialDetailScreen';
import { BrowserWebViewScreen } from '@/screens/browser/BrowserWebViewScreen';
import { BrowserUrlEditorScreen } from '@/screens/browser/BrowserUrlEditorScreen';
import { BrowserContextMenuScreen } from '@/screens/browser/BrowserContextMenuScreen';
import { BrowserExtrasScreen } from '@/screens/browser/BrowserExtrasScreen';
import { BrowserCategoryScreen } from '@/screens/browser/BrowserCategoryScreen';
import { BrowserNewsFeedScreen } from '@/screens/browser/BrowserNewsFeedScreen';
import { BrowserNewsArticleScreen } from '@/screens/browser/BrowserNewsArticleScreen';
import { BrowserHistorySnippetScreen } from '@/screens/browser/BrowserHistorySnippetScreen';
import { BrowserSearchSuggestionsScreen } from '@/screens/browser/BrowserSearchSuggestionsScreen';

const Stack = createNativeStackNavigator<BrowserStackParamList>();

export const BrowserStack: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="BrowserHome" component={BrowserHomeScreen} />
      <Stack.Screen name="BrowserSpeedDialDetail" component={BrowserSpeedDialDetailScreen} />
      <Stack.Screen name="BrowserWebView" component={BrowserWebViewScreen} />
      <Stack.Screen name="BrowserUrlEditor" component={BrowserUrlEditorScreen} />
      <Stack.Screen name="BrowserContextMenu" component={BrowserContextMenuScreen} />
      <Stack.Screen name="BrowserExtras" component={BrowserExtrasScreen} />
      <Stack.Screen name="BrowserCategory" component={BrowserCategoryScreen} />
      <Stack.Screen name="BrowserNewsFeed" component={BrowserNewsFeedScreen} />
      <Stack.Screen name="BrowserNewsArticle" component={BrowserNewsArticleScreen} />
      <Stack.Screen name="BrowserHistorySnippet" component={BrowserHistorySnippetScreen} />
      <Stack.Screen name="BrowserSearchSuggestions" component={BrowserSearchSuggestionsScreen} />
    </Stack.Navigator>
  );
};
