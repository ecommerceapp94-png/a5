import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeGradients } from '@/types';

interface AvatarBadgeProps {
  label: string;
  variant?: keyof ThemeGradients;
  size?: number;
  style?: ViewStyle;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  label,
  variant = 'brand',
  size = 44,
  style,
}) => {
  const { theme } = useTheme();
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={theme.gradients[variant] as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, styles.center]}
      >
        <Text
          style={{
            color: theme.colors.textInverse,
            fontWeight: '800',
            fontSize: size * 0.4,
          }}
        >
          {initials || label[0] || '?'}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
