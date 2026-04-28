import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';

interface TagChipProps {
  label: string;
  active?: boolean;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  onPress?: () => void;
  style?: ViewStyle;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  active = false,
  tone = 'default',
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const toneColor = (() => {
    switch (tone) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'danger':
        return theme.colors.danger;
      case 'info':
        return theme.colors.info;
      case 'accent':
        return theme.colors.accent;
      default:
        return theme.colors.primary;
    }
  })();
  const bg = active ? toneColor : theme.colors.surface;
  const fg = active ? theme.colors.textInverse : toneColor;
  const border = active ? toneColor : theme.colors.border;

  const Wrapper = onPress ? PressableScale : (Text.bind(null) as unknown as typeof PressableScale);
  return (
    <PressableScale
      haptic={onPress ? 'selection' : false}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: theme.typography.caption }}>
        #{label}
      </Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});
