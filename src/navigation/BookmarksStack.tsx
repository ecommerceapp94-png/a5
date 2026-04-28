import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { BookmarksStackParamList } from '@/navigation/types';
import { BookmarksHomeScreen } from '@/screens/bookmarks/BookmarksHomeScreen';
import { BookmarksFolderScreen } from '@/screens/bookmarks/BookmarksFolderScreen';
import { BookmarksItemScreen } from '@/screens/bookmarks/BookmarksItemScreen';
import { BookmarksOrganizeScreen } from '@/screens/bookmarks/BookmarksOrganizeScreen';
import { BookmarksItemEditScreen } from '@/screens/bookmarks/BookmarksItemEditScreen';
import { BookmarksFolderEditScreen } from '@/screens/bookmarks/BookmarksFolderEditScreen';
import { BookmarksSearchScreen } from '@/screens/bookmarks/BookmarksSearchScreen';
import { BookmarksImportScreen } from '@/screens/bookmarks/BookmarksImportScreen';
import { BookmarksExportScreen } from '@/screens/bookmarks/BookmarksExportScreen';

const Stack = createNativeStackNavigator<BookmarksStackParamList>();

export const BookmarksStack: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="BookmarksHome" component={BookmarksHomeScreen} />
      <Stack.Screen name="BookmarksFolder" component={BookmarksFolderScreen} />
      <Stack.Screen name="BookmarksItem" component={BookmarksItemScreen} />
      <Stack.Screen name="BookmarksOrganize" component={BookmarksOrganizeScreen} />
      <Stack.Screen name="BookmarksItemEdit" component={BookmarksItemEditScreen} />
      <Stack.Screen name="BookmarksFolderEdit" component={BookmarksFolderEditScreen} />
      <Stack.Screen name="BookmarksSearch" component={BookmarksSearchScreen} />
      <Stack.Screen name="BookmarksImport" component={BookmarksImportScreen} />
      <Stack.Screen name="BookmarksExport" component={BookmarksExportScreen} />
    </Stack.Navigator>
  );
};
