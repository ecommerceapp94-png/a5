import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceAlt,
        },
        style,
      ]}
    />
  );
};

export const SkeletonRow: React.FC<{ count?: number; gap?: number; height?: number }> = ({
  count = 6,
  gap = 12,
  height = 64,
}) => {
  const items = new Array(count).fill(0);
  return (
    <View style={styles.column}>
      {items.map((_, i) => (
        <Skeleton key={i} height={height} radius={14} style={{ marginBottom: i === count - 1 ? 0 : gap }} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: '100%',
  },
});
