import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const Divider: React.FC<{ inset?: number; opacity?: number; vertical?: boolean }> = ({
  inset = 0,
  opacity = 1,
  vertical = false,
}) => {
  const { theme } = useTheme();
  if (vertical) {
    return (
      <View
        style={{
          width: 1,
          alignSelf: 'stretch',
          backgroundColor: theme.colors.divider,
          opacity,
          marginVertical: inset,
        }}
      />
    );
  }
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.divider,
        marginHorizontal: inset,
        opacity,
      }}
    />
  );
};
