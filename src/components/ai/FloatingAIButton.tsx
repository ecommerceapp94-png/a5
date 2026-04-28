import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useAIAssistant } from '@/components/ai/AIAssistantContext';
import { triggerHaptic } from '@/utils/haptics';
import { PressableScale } from '@/components/PressableScale';

export const FloatingAIButton: React.FC<{ bottom?: number }> = ({ bottom = 96 }) => {
  const { theme } = useTheme();
  const { show } = useAIAssistant();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 - pulse.value * 0.45,
    transform: [{ scale: 1 + pulse.value * 0.45 }],
  }));

  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom, right: 16 }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulseRing,
          ringStyle,
          { borderColor: theme.colors.primary, borderRadius: 64 },
        ]}
      />
      <PressableScale
        haptic="medium"
        onPress={() => {
          triggerHaptic('medium');
          show();
        }}
        style={[
          styles.button,
          {
            shadowColor: theme.colors.shadow,
            borderRadius: 32,
          },
        ]}
      >
        <LinearGradient
          colors={theme.gradients.cosmic as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.center, { borderRadius: 32 }]}
        >
          <Ionicons name="sparkles" size={26} color={theme.colors.textInverse} />
        </LinearGradient>
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 64,
    height: 64,
    overflow: 'hidden',
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderWidth: 2,
  },
});
