import React from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/ThemeContext';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  radius?: number;
  border?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  intensity = 60,
  radius,
  border = true,
  padded = true,
  style,
  contentStyle,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const computedRadius = radius ?? theme.radius.lg;

  return (
    <View
      {...rest}
      style={[
        styles.container,
        {
          borderRadius: computedRadius,
          borderWidth: border ? 1 : 0,
          borderColor: theme.colors.glassBorder,
          backgroundColor: theme.colors.glass,
          shadowColor: theme.colors.shadow,
        },
        style,
      ]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          tint={theme.mode === 'dark' ? 'dark' : 'light'}
          intensity={intensity}
          style={[StyleSheet.absoluteFillObject, { borderRadius: computedRadius }]}
        />
      ) : null}
      <View
        style={[
          padded ? { padding: theme.spacing.lg } : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
});
