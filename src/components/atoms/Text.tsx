import React from 'react';
import { Text as RNText, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks';

type TextVariant = 'h1' | 'h2' | 'h3' | 'bodyLarge' | 'body' | 'caption' | 'small';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
}) => {
  const theme = useTheme();

  const getVariantStyle = (): TextStyle => {
    return theme.typography[variant] as TextStyle;
  };

  const getColor = (): string => {
    if (color) return color;
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3':
        return theme.colors.textPrimary;
      case 'bodyLarge':
        return theme.colors.textPrimary;
      case 'body':
        return theme.colors.textSecondary;
      case 'caption':
      case 'small':
        return theme.colors.textMuted;
      default:
        return theme.colors.textPrimary;
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        { color: getColor() },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
};
