import React from 'react';
import { StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { Divider } from '@/components/Divider';
import { triggerHaptic } from '@/utils/haptics';

interface SwitchRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  description?: string;
  divider?: boolean;
  style?: ViewStyle;
}

export const SwitchRow: React.FC<SwitchRowProps> = ({
  icon,
  label,
  value,
  onValueChange,
  description,
  divider = true,
  style,
}) => {
  const { theme } = useTheme();
  return (
    <View style={style}>
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
              <Ionicons name={icon} size={16} color={theme.colors.primary} />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.body }}>
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
        <Switch
          value={value}
          onValueChange={(v) => {
            triggerHaptic('selection');
            onValueChange(v);
          }}
          trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
          thumbColor={theme.colors.textInverse}
        />
      </View>
      {divider ? <Divider /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
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
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
