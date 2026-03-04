import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from './Text';

interface LoadingProps {
  size?: 'small' | 'large';
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  message,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && (
        <Text variant="body" style={{ marginTop: theme.spacing.md }}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
