import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';

interface StatPillProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  style?: ViewStyle;
}

export const StatPill: React.FC<StatPillProps> = ({ label, value, icon, tone = 'primary', style }) => {
  const { theme } = useTheme();
  const colorMap = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info,
    accent: theme.colors.accent,
  };
  const color = colorMap[tone];

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={color} style={{ marginRight: 6 }} />
      ) : null}
      <Text
        style={{
          color,
          fontWeight: '700',
          fontSize: theme.typography.bodySm,
          marginRight: 6,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.caption }}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
});
