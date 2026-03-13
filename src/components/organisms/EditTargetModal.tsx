import React, { useState, useEffect } from 'react';
import {
  View,
  Text as RNText,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useCurrency, useBudgeting } from '../../hooks';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { CategoryBudget } from '../../types';

interface EditTargetModalProps {
  visible: boolean;
  category: CategoryBudget | null;
  onClose: () => void;
}

export const EditTargetModal: React.FC<EditTargetModalProps> = ({
  visible,
  category,
  onClose,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const { 
    getCategoryInfo, 
    updateCategoryBudget, 
    calculateReadyToAssign, 
    setReadyToAssign 
  } = useBudgeting();

  const [targetAmount, setTargetAmount] = useState('');
  const [targetDay, setTargetDay] = useState(31);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatAmount, setRepeatAmount] = useState('');
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showRepeatInput, setShowRepeatInput] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState<'target' | 'repeat'>('target');
  const [showSuccess, setShowSuccess] = useState(false);

  const categoryInfo = category ? getCategoryInfo(category.categoryId) : null;

  useEffect(() => {
    if (category) {
      const displayTarget = category.target ?? category.assignedThisMonth;
      setTargetAmount(displayTarget > 0 ? displayTarget.toString() : '');
      setTargetDay(category.targetDay ?? 31);
      setRepeatEnabled(category.repeatEnabled ?? false);
      setRepeatAmount(category.repeatAmount?.toString() ?? '');
    }
  }, [category, visible]);

  const handleNumpadPress = (key: string) => {
    const currentValue = numpadTarget === 'target' ? targetAmount : repeatAmount;
    let newValue = currentValue;

    if (key === 'backspace') {
      newValue = currentValue.slice(0, -1);
    } else if (key === 'done') {
      setShowNumpad(false);
      return;
    } else if (key === '+/-') {
      if (currentValue.startsWith('-')) {
        newValue = currentValue.slice(1);
      } else {
        newValue = '-' + currentValue;
      }
    } else {
      if (currentValue === '0' && key !== '.') {
        newValue = key;
      } else {
        newValue = currentValue + key;
      }
    }

    if (numpadTarget === 'target') {
      setTargetAmount(newValue);
    } else {
      setRepeatAmount(newValue);
    }
  };

  const handleSave = () => {
    if (!category) return;

    const newAssigned = parseFloat(targetAmount) || 0;
    const oldAssigned = category.assignedThisMonth || 0;
    const difference = newAssigned - oldAssigned;

    const updates: Partial<CategoryBudget> = {
      target: newAssigned,
      targetDay: targetDay,
      assignedThisMonth: newAssigned,
      available: newAssigned - (category.spent || 0),
      repeatEnabled: repeatEnabled,
      repeatAmount: repeatEnabled ? (parseFloat(repeatAmount) || 0) : 0,
    };

    updateCategoryBudget(category.id, updates);

    if (difference !== 0) {
      const newReadyToAssign = calculateReadyToAssign - difference;
      setReadyToAssign(newReadyToAssign);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setTargetAmount('');
    setTargetDay(31);
    setRepeatEnabled(false);
    setRepeatAmount('');
    setShowNumpad(false);
    setShowDayPicker(false);
    setShowRepeatInput(false);
    onClose();
  };

  const handleOpenNumpad = (target: 'target' | 'repeat') => {
    setNumpadTarget(target);
    setShowNumpad(true);
  };

  const getDisplayAmount = (amount: string, fallback: number) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return `RD$${fallback.toFixed(2)}`;
    return formatCurrency(num);
  };

  const formatDay = (day: number) => {
    if (day === 31 || day === 28 || day === 30) {
      return `Last Day of the Month`;
    }
    return `Day ${day}`;
  };

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['+/-', '0', 'backspace'],
  ];

  if (!category) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <Text variant="body" style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                {categoryInfo && (
                  <View style={[styles.categoryIconSmall, { backgroundColor: categoryInfo.color }]}>
                    <Ionicons 
                      name={(categoryInfo.icon as keyof typeof Ionicons.glyphMap) || 'help-circle'} 
                      size={14} 
                      color="#FFF" 
                    />
                  </View>
                )}
                <Text variant="h3" style={styles.headerTitle}>
                  {categoryInfo?.name || 'Category'}
                </Text>
              </View>
              <View style={{ width: 60 }} />
            </View>

            {/* Monthly Label */}
            <View style={styles.monthlyLabelContainer}>
              <Text variant="body" style={styles.monthlyLabel}>Monthly</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              {/* "I need" Row */}
              <TouchableOpacity 
                style={styles.inputRow}
                onPress={() => handleOpenNumpad('target')}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="eye" size={18} color="#FFF" />
                  </View>
                  <Text variant="body" style={styles.rowLabel}>I need</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text variant="h3" style={styles.amountText}>
                    {getDisplayAmount(targetAmount, category.assignedThisMonth || 0)}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>

              {/* Separator */}
              <View style={styles.separator} />

              {/* "By" Row */}
              <TouchableOpacity 
                style={styles.inputRow}
                onPress={() => setShowDayPicker(!showDayPicker)}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="calendar" size={18} color="#FFF" />
                  </View>
                  <Text variant="body" style={styles.rowLabel}>By</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text variant="body" style={styles.selectorText}>
                    {formatDay(targetDay)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>

              {/* Day Picker Dropdown */}
              {showDayPicker && (
                <View style={styles.dayPickerContainer}>
                  {[1, 5, 10, 15, 20, 25, 28, 30, 31].map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayOption,
                        targetDay === day && styles.dayOptionSelected
                      ]}
                      onPress={() => {
                        setTargetDay(day);
                        setShowDayPicker(false);
                      }}
                    >
                      <Text variant="body" style={
                        targetDay === day ? styles.dayOptionTextSelected : styles.dayOptionText
                      }>
                        {day === 31 ? 'Last Day of Month' : `Day ${day}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.separator} />

              {/* "Set aside another" Row */}
              <View style={styles.inputRow}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#8B5CF6' }]}>
                    <Ionicons name="repeat" size={18} color="#FFF" />
                  </View>
                  <Text variant="body" style={styles.rowLabel}>Next month I want to</Text>
                </View>
                <TouchableOpacity 
                  style={styles.rowRight}
                  onPress={() => setRepeatEnabled(!repeatEnabled)}
                >
                  <View style={styles.toggleContainer}>
                    <View style={[
                      styles.toggle,
                      repeatEnabled && styles.toggleEnabled
                    ]}>
                      <View style={[
                        styles.toggleKnob,
                        repeatEnabled && styles.toggleKnobEnabled
                      ]} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Repeat Amount Input */}
              {repeatEnabled && (
                <TouchableOpacity 
                  style={[styles.inputRow, styles.repeatInputRow]}
                  onPress={() => handleOpenNumpad('repeat')}
                >
                  <View style={styles.rowLeft}>
                    <Text variant="body" style={styles.repeatLabel}>Set aside another</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text variant="body" style={styles.repeatAmountText}>
                      {getDisplayAmount(repeatAmount, 0)}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Save Button */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text variant="body" style={styles.saveButtonText}>Save Target</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Numpad */}
            {showNumpad && (
              <View style={styles.numpadContainer}>
                <View style={styles.numpadDisplay}>
                  <Text variant="h2" style={styles.numpadDisplayText}>
                    {numpadTarget === 'target' 
                      ? getDisplayAmount(targetAmount, category.assignedThisMonth || 0)
                      : getDisplayAmount(repeatAmount, 0)
                    }
                  </Text>
                </View>
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
                            <Text variant="h2" style={
                              key === 'done' ? styles.numpadKeyTextDone : styles.numpadKeyText
                            }>
                              {key}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
      
      {/* Success Animation Overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            <Text variant="h3" style={styles.successText}>Target saved!</Text>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  monthlyLabelContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  monthlyLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#1E293B',
    marginHorizontal: 8,
  },
  dayPickerContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dayOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  dayOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  dayOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  dayOptionTextSelected: {
    fontWeight: '600',
  },
  toggleContainer: {
    marginLeft: 8,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    padding: 2,
  },
  toggleEnabled: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobEnabled: {
    transform: [{ translateX: 20 }],
  },
  repeatInputRow: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  repeatLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  repeatAmountText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  footer: {
    padding: 16,
    paddingTop: 24,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  numpadContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  numpadDisplay: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  numpadDisplayText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
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
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
  },
});
