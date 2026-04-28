import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/theme/ThemeContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { marginBottom: theme.spacing.md }]}>
      <View style={styles.flex}>
        <View style={styles.titleRow}>
          {icon ? (
            <Ionicons
              name={icon}
              size={theme.typography.h2}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.h2,
              fontWeight: '800',
              letterSpacing: 0.2,
            }}
          >
            {title}
          </Text>
        </View>
        {subtitle ? (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.bodySm,
              marginTop: 4,
              maxWidth: '95%',
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel ? (
        <PressableScale onPress={onAction} haptic="selection">
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.primarySoft,
            }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: '700',
                fontSize: theme.typography.bodySm,
              }}
            >
              {actionLabel}
            </Text>
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  flex: { flex: 1, marginRight: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
});
