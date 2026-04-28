import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface NeumorphicSurfaceProps extends ViewProps {
  inset?: boolean;
  radius?: number;
  contentStyle?: ViewStyle;
  intensity?: 'soft' | 'medium' | 'strong';
  padded?: boolean;
}

export const NeumorphicSurface: React.FC<NeumorphicSurfaceProps> = ({
  inset = false,
  radius,
  intensity = 'medium',
  padded = true,
  style,
  contentStyle,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const computedRadius = radius ?? theme.radius.lg;
  const offset = intensity === 'soft' ? 4 : intensity === 'strong' ? 14 : 9;
  const blur = intensity === 'soft' ? 8 : intensity === 'strong' ? 24 : 14;

  return (
    <View
      {...rest}
      style={[
        styles.outer,
        {
          borderRadius: computedRadius,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.neuDark,
          shadowOffset: { width: inset ? -offset : offset, height: inset ? -offset : offset },
          shadowRadius: blur,
          shadowOpacity: 0.45,
          elevation: 8,
        },
        style,
      ]}
    >
      <View
        style={[
          {
            borderRadius: computedRadius,
            backgroundColor: theme.colors.surface,
            padding: padded ? theme.spacing.lg : 0,
            shadowColor: theme.colors.neuLight,
            shadowOffset: { width: -offset / 2, height: -offset / 2 },
            shadowRadius: blur / 1.4,
            shadowOpacity: 0.25,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    overflow: 'visible',
  },
});
