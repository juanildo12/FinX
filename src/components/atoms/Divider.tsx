import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';

interface DividerProps {
  style?: ViewStyle;
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  spacing = 16,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: theme.colors.border,
          marginVertical: spacing,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
