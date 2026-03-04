import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '../../hooks';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {icon && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text
        variant="h3"
        style={{ textAlign: 'center', marginTop: theme.spacing.md }}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant="body"
          style={{ textAlign: 'center', marginTop: theme.spacing.sm }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={{ marginTop: theme.spacing.lg }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
  },
});
