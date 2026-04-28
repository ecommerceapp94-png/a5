import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/GradientBackground';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeGradients } from '@/types';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  variant?: keyof ThemeGradients;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  paddingHorizontal?: number;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  variant = 'midnight',
  contentStyle,
  edges = ['top', 'left', 'right'],
  paddingHorizontal,
}) => {
  const { theme } = useTheme();
  const horizontal = paddingHorizontal ?? theme.spacing.lg;
  const inner = (
    <View style={[styles.flex, { paddingHorizontal: horizontal }]}>{children}</View>
  );

  return (
    <GradientBackground variant={variant} style={styles.flex}>
      <SafeAreaView edges={edges} style={styles.flex}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: horizontal },
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing ?? false}
                  onRefresh={onRefresh}
                  tintColor={theme.colors.primary}
                  colors={[theme.colors.primary]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          inner
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingBottom: 96,
    paddingTop: 8,
  },
});
