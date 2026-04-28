import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { Divider } from '@/components/Divider';
import { PressableScale } from '@/components/PressableScale';

interface MenuRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  description?: string;
  trailing?: string;
  onPress?: () => void;
  divider?: boolean;
  style?: ViewStyle;
  destructive?: boolean;
}

export const MenuRow: React.FC<MenuRowProps> = ({
  icon,
  iconColor,
  label,
  description,
  trailing,
  onPress,
  divider = true,
  style,
  destructive,
}) => {
  const { theme } = useTheme();
  const labelColor = destructive ? theme.colors.danger : theme.colors.text;
  const fg = iconColor ?? (destructive ? theme.colors.danger : theme.colors.primary);
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      style={[styles.outer, style]}
    >
      <View style={[styles.row, { paddingVertical: theme.spacing.md }]}>
        <View style={styles.left}>
          {icon ? (
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderRadius: theme.radius.sm,
                },
              ]}
            >
              <Ionicons name={icon} size={16} color={fg} />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ color: labelColor, fontWeight: '700', fontSize: theme.typography.body }}>
              {label}
            </Text>
            {description ? (
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.caption,
                  marginTop: 2,
                  lineHeight: 16,
                }}
              >
                {description}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.right}>
          {trailing ? (
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.typography.bodySm,
                marginRight: 8,
                fontWeight: '600',
              }}
            >
              {trailing}
            </Text>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </View>
      </View>
      {divider ? <Divider /> : null}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  outer: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
