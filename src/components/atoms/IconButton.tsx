import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../hooks';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 24,
  color,
  backgroundColor,
  style,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size + 16,
          height: size + 16,
          backgroundColor: backgroundColor || 'transparent',
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={{
          fontSize: size,
          color: color || theme.colors.textPrimary,
        }}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
