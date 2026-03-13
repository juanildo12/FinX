import React from 'react';
import {
  View,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../atoms/Text';

interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
  onDone: () => void;
  onClose?: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({
  value,
  onChange,
  onDone,
  onClose,
}) => {
  const handleNumpadPress = (key: string) => {
    let newValue = value;

    if (key === 'backspace') {
      newValue = value.slice(0, -1);
    } else if (key === 'done') {
      onDone();
      return;
    } else if (key === '+/-') {
      if (value.startsWith('-')) {
        newValue = value.slice(1);
      } else if (value && value !== '0') {
        newValue = '-' + value;
      }
    } else {
      if (value === '0' && key !== '.') {
        newValue = key;
      } else {
        newValue = value + key;
      }
    }

    onChange(newValue);
  };

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['+/-', '0', 'backspace'],
  ];

  return (
    <View style={styles.container}>
      <View style={styles.numpad}>
        {numpadKeys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numpadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.numpadButton,
                  key === 'backspace' && styles.numpadButtonSpecial,
                  key === 'done' && styles.numpadButtonDone,
                ]}
                onPress={() => handleNumpadPress(key)}
              >
                {key === 'backspace' ? (
                  <Ionicons name="backspace-outline" size={24} color="#FFF" />
                ) : (
                  <Text
                    variant="h2"
                    style={
                      key === 'done'
                        ? styles.numpadKeyTextDone
                        : styles.numpadKeyText
                    }
                  >
                    {key}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  numpad: {
    paddingHorizontal: 16,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  numpadButton: {
    width: 80,
    height: 56,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadButtonSpecial: {
    backgroundColor: '#4B5563',
  },
  numpadButtonDone: {
    backgroundColor: '#3B82F6',
  },
  numpadKeyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500',
  },
  numpadKeyTextDone: {
    fontSize: 18,
    fontWeight: '600',
  },
});
