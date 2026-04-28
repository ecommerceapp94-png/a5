import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { Divider } from '@/components/Divider';

interface InfoRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint?: string;
  divider?: boolean;
  style?: ViewStyle;
}

export const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, hint, divider = true, style }) => {
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
            {hint ? (
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.caption,
                  marginTop: 2,
                }}
              >
                {hint}
              </Text>
            ) : null}
          </View>
        </View>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontWeight: '600',
            fontSize: theme.typography.bodySm,
            marginLeft: 8,
            maxWidth: '50%',
            textAlign: 'right',
          }}
          numberOfLines={2}
        >
          {value}
        </Text>
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
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
