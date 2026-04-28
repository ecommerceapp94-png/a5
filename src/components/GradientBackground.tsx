import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeGradients } from '@/types';

interface GradientBackgroundProps {
  variant?: keyof ThemeGradients;
  style?: ViewStyle;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  intensity?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  variant = 'midnight',
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  intensity = 1,
}) => {
  const { theme } = useTheme();
  const colors = theme.gradients[variant];
  return (
    <View style={[styles.flex, style]}>
      <LinearGradient
        colors={colors as unknown as string[]}
        start={start}
        end={end}
        style={[StyleSheet.absoluteFillObject, { opacity: intensity }]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
