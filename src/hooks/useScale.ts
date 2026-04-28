import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

export function useScalePress(min: number = 0.95) {
  const scale = useSharedValue(1);
  const onPressIn = useCallback(() => {
    scale.value = withSpring(min, { damping: 18, stiffness: 380 });
  }, [min, scale]);
  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 240 });
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { onPressIn, onPressOut, animatedStyle };
}

export function useFadeIn(duration = 280, initial = 0) {
  const opacity = useSharedValue(initial);
  const trigger = useCallback(() => {
    opacity.value = withTiming(1, { duration });
  }, [duration, opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return { animatedStyle, trigger };
}
