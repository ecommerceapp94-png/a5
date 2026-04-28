import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeGradients } from '@/types';

interface ProgressBarProps {
  progress: number;
  variant?: keyof ThemeGradients;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'brand',
  height = 8,
}) => {
  const { theme } = useTheme();
  const value = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: height / 2,
        },
      ]}
    >
      <LinearGradient
        colors={theme.gradients[variant] as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            width: `${value * 100}%`,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
