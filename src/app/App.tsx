import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { AIAssistantProvider } from '@/components/ai/AIAssistantContext';
import { AIAssistantSheet } from '@/components/ai/AIAssistantSheet';
import { FloatingAIButton } from '@/components/ai/FloatingAIButton';
import { RootNavigator } from '@/navigation/RootNavigator';

const ThemedShell: React.FC = () => {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
      <FloatingAIButton bottom={92} />
      <AIAssistantSheet />
      <Toast position="top" topOffset={48} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AIAssistantProvider>
            <BottomSheetModalProvider>
              <ThemedShell />
            </BottomSheetModalProvider>
          </AIAssistantProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
