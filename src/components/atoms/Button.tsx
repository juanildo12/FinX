import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  icon,
  style,
  ...props
}) => {
  const theme = useTheme();

  const getBackgroundColor = (): string => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'danger':
        return theme.colors.error;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.textPrimary;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = (): string => {
    if (variant === 'outline') {
      return disabled ? theme.colors.border : theme.colors.primary;
    }
    return 'transparent';
  };

  const getPadding = (): number => {
    switch (size) {
      case 'small':
        return theme.spacing.sm;
      case 'medium':
        return theme.spacing.md;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };

  const getHeight = (): number => {
    switch (size) {
      case 'small':
        return 36;
      case 'medium':
        return 48;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: variant === 'outline' ? 1 : 0,
    paddingHorizontal: getPadding(),
    height: getHeight(),
    width: fullWidth ? '100%' : undefined,
    opacity: disabled || loading ? 0.7 : 1,
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            variant={size === 'small' ? 'caption' : 'body'}
            color={getTextColor()}
            style={icon ? { marginLeft: theme.spacing.sm } : undefined}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});
