import React from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';

interface SearchBarProps {
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  onSubmit,
  onClear,
  autoFocus,
  style,
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.md,
        },
        style,
      ]}
    >
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: theme.colors.text }]}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <PressableScale
          haptic="selection"
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          style={styles.iconRight}
        >
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        </PressableScale>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  iconRight: { marginLeft: 8 },
});
