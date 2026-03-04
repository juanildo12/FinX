import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../hooks';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  backgroundColor,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: backgroundColor || theme.colors.primary + '20',
        },
      ]}
    >
      <Text
        variant="small"
        color={color || theme.colors.primary}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});
