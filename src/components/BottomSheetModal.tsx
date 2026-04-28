import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme/ThemeContext';

interface BottomSheetModalProps {
  open: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const AppBottomSheet: React.FC<BottomSheetModalProps> = ({
  open,
  onClose,
  snapPoints,
  title,
  description,
  children,
}) => {
  const { theme } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const points = useMemo(() => snapPoints ?? ['45%', '85%'], [snapPoints]);

  useEffect(() => {
    if (open) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [open]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={open ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      snapPoints={points}
      backgroundStyle={{ backgroundColor: theme.colors.backgroundElevated }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textMuted }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.55}
        />
      )}
    >
      <BottomSheetView style={styles.content}>
        {title ? (
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.h2,
              fontWeight: '800',
              marginBottom: 4,
            }}
          >
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.bodySm,
              marginBottom: 12,
            }}
          >
            {description}
          </Text>
        ) : null}
        <View style={{ flex: 1 }}>{children}</View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flex: 1,
  },
});
