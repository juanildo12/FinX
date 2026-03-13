import React, { useEffect, useRef } from 'react';
import { View, Text as RNText, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../hooks';

interface SuccessAnimationProps {
  visible: boolean;
  message?: string;
  onDismiss?: () => void;
  duration?: number;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible,
  message = '¡Gran éxito!',
  onDismiss,
  duration = 2000,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      opacityAnim.setValue(1);
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.elastic(1)),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(duration - 600),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 15, 0],
  });

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.emoji,
            { transform: [{ translateY: bounce }] },
          ]}
        >
          👏
        </Animated.Text>
        <RNText
          style={[
            styles.message,
            { color: theme.colors.success },
          ]}
        >
          {message}
        </RNText>
        <RNText
          style={[
            styles.subMessage,
            { color: theme.colors.textSecondary },
          ]}
        >
          ¡Sigue así!
        </RNText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 15,
    textAlign: 'center',
  },
});
