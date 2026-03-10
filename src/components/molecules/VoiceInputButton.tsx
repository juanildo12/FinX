import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../atoms/Text';
import { useTheme, useSettings } from '../../hooks';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  size = 'medium',
  variant = 'primary',
}) => {
  const theme = useTheme();
  const { settings } = useSettings();
  const { isListening, transcript, error, startListening, stopListening, reset } = useVoiceRecognition();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      reset();
    }
  }, [transcript, isListening, onTranscript, reset]);

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(settings.voiceTimeout);
    }
  };

  const sizeConfig = {
    small: { button: 40, icon: 18 },
    medium: { button: 56, icon: 24 },
    large: { button: 72, icon: 32 },
  };

  const config = sizeConfig[size];
  const backgroundColor = variant === 'primary' ? theme.colors.primary : theme.colors.secondary;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: config.button + 16,
            height: config.button + 16,
            borderRadius: (config.button + 16) / 2,
            backgroundColor: isListening ? theme.colors.error + '30' : 'transparent',
            transform: [{ scale: isListening ? pulseAnim : 1 }],
          },
        ]}
      >
        {isListening && (
          <View
            style={[
              styles.innerRing,
              {
                width: config.button + 8,
                height: config.button + 8,
                borderRadius: (config.button + 8) / 2,
                backgroundColor: theme.colors.error + '50',
              },
            ]}
          />
        )}
      </Animated.View>
      
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: config.button,
            height: config.button,
            borderRadius: config.button / 2,
            backgroundColor: isListening ? theme.colors.error : backgroundColor,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isListening ? 'stop' : 'mic'}
          size={config.icon}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {isListening && (
        <Text variant="caption" style={styles.listeningText}>
          Escuchando...
        </Text>
      )}

      {error && (
        <Text variant="caption" style={styles.errorText as TextStyle}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  listeningText: {
    position: 'absolute',
    bottom: -56,
    color: '#666',
  },
  errorText: {
    position: 'absolute',
    bottom: -56,
    color: '#EF4444',
  },
});
