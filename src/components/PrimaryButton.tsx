import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';
import { ThemeGradients } from '@/types';
import { HapticKind } from '@/utils/haptics';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: keyof ThemeGradients;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  haptic?: HapticKind | false;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = 'brand',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  size = 'md',
  fullWidth = false,
  haptic = 'medium',
  style,
}) => {
  const { theme } = useTheme();
  const heights = { sm: 38, md: 48, lg: 58 };
  const paddings = { sm: 14, md: 18, lg: 22 };
  const fontSize = size === 'sm' ? theme.typography.bodySm : size === 'lg' ? theme.typography.h4 : theme.typography.body;
  const colors = theme.gradients[variant] as unknown as string[];

  return (
    <PressableScale
      onPress={disabled ? undefined : onPress}
      haptic={disabled ? false : haptic}
      style={[
        styles.wrapper,
        {
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            height: heights[size],
            paddingHorizontal: paddings[size],
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <View style={styles.row}>
          {loading ? (
            <ActivityIndicator color={theme.colors.textInverse} />
          ) : (
            <>
              {icon ? (
                <Ionicons
                  name={icon}
                  size={fontSize + 4}
                  color={theme.colors.textInverse}
                  style={{ marginRight: 8 }}
                />
              ) : null}
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.textInverse, fontSize, fontWeight: '700' },
                ]}
              >
                {label}
              </Text>
              {iconRight ? (
                <Ionicons
                  name={iconRight}
                  size={fontSize + 4}
                  color={theme.colors.textInverse}
                  style={{ marginLeft: 8 }}
                />
              ) : null}
            </>
          )}
        </View>
      </LinearGradient>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    letterSpacing: 0.4,
  },
});
