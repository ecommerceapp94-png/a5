import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeGradients } from '@/types';

interface IconBadgeProps {
  name: keyof typeof Ionicons.glyphMap;
  variant?: keyof ThemeGradients;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  name,
  variant = 'brand',
  size = 44,
  iconSize,
  style,
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 3,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={theme.gradients[variant] as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, styles.center]}
      >
        <Ionicons name={name} size={iconSize ?? size * 0.5} color={theme.colors.textInverse} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
