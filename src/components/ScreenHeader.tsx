import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';
import { ThemeGradients } from '@/types';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  variant?: keyof ThemeGradients;
  badge?: string;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  onRightPress,
  variant = 'cosmic',
  badge,
  style,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingVertical: theme.spacing.md }, style]}>
      <View style={styles.row}>
        <View style={styles.row}>
          {showBack ? (
            <PressableScale
              haptic="selection"
              onPress={() => {
                if (onBack) onBack();
                else if (navigation.canGoBack()) navigation.goBack();
              }}
              style={[
                styles.iconButton,
                { backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill },
              ]}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </PressableScale>
          ) : null}
          <View style={{ marginLeft: showBack ? theme.spacing.md : 0 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: '800',
                fontSize: theme.typography.h2,
                letterSpacing: 0.2,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.caption,
                  marginTop: 2,
                  maxWidth: 240,
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.row}>
          {badge ? (
            <View
              style={{
                marginRight: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: theme.radius.pill,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={theme.gradients[variant] as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={{ color: theme.colors.textInverse, fontWeight: '700', fontSize: 12 }}>
                {badge}
              </Text>
            </View>
          ) : null}
          {rightIcon ? (
            <PressableScale
              haptic="selection"
              onPress={onRightPress}
              style={[
                styles.iconButton,
                { backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill },
              ]}
            >
              <Ionicons name={rightIcon} size={20} color={theme.colors.text} />
            </PressableScale>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
