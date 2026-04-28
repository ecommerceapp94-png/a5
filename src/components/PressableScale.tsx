import React, { forwardRef } from 'react';
import { Pressable, PressableProps, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScalePress } from '@/hooks/useScale';
import { triggerHaptic, HapticKind } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'onPressIn' | 'onPressOut' | 'style'> {
  scaleTo?: number;
  haptic?: HapticKind | false;
  style?: ViewStyle | ViewStyle[];
}

export const PressableScale = forwardRef<View, PressableScaleProps>(
  ({ children, scaleTo = 0.95, haptic = 'light', style, onPress, ...rest }, ref) => {
    const { onPressIn, onPressOut, animatedStyle } = useScalePress(scaleTo);
    return (
      <AnimatedPressable
        ref={ref as never}
        {...rest}
        onPress={(e) => {
          if (haptic !== false) triggerHaptic(haptic);
          onPress?.(e);
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[animatedStyle, style as ViewStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  },
);

PressableScale.displayName = 'PressableScale';
