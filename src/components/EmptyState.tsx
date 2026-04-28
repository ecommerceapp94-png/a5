import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { PrimaryButton } from '@/components/PrimaryButton';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'sparkles',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: theme.colors.primarySoft,
            borderRadius: theme.radius.pill,
          },
        ]}
      >
        <Ionicons name={icon} size={32} color={theme.colors.primary} />
      </View>
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.h3, fontWeight: '800' }}>
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.bodySm,
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 20,
          }}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: theme.spacing.lg, alignSelf: 'stretch' }}
          size="md"
          variant="brand"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
