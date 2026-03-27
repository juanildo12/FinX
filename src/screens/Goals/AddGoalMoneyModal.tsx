import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme, useCurrency } from '../../hooks';
import { FinancialGoal } from '../../types';
import { Text } from '../../components/atoms/Text';
import { Button } from '../../components/atoms/Button';
import { validateAmount } from '../../utils';

interface AddGoalMoneyModalProps {
  visible: boolean;
  goal: FinancialGoal;
  onClose: () => void;
  onAdd: (amount: number) => void;
}

export const AddGoalMoneyModal: React.FC<AddGoalMoneyModalProps> = ({
  visible,
  goal,
  onClose,
  onAdd,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const [amount, setAmount] = useState('');

  const parsedAmount = parseFloat(amount) || 0;

  const handleAdd = () => {
    if (!validateAmount(amount)) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido');
      return;
    }
    
    if (parsedAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0');
      return;
    }
    
    const remaining = goal.targetAmount - goal.currentAmount;
    if (parsedAmount > remaining) {
      Alert.alert(
        'Monto excede la meta',
        `La meta es ${formatCurrency(goal.targetAmount)}. Solo necesitas ${formatCurrency(remaining)} para completarla. ¿Deseas agregar ${formatCurrency(remaining)}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Agregar ' + formatCurrency(remaining), 
            onPress: () => {
              onAdd(remaining);
              setAmount('');
              onClose();
            }
          },
        ]
      );
      return;
    }
    
    onAdd(parsedAmount);
    setAmount('');
    onClose();
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text variant="h3">Agregar a {goal.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text variant="h3" color={theme.colors.textMuted}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text variant="caption" color={theme.colors.textMuted}>Meta</Text>
                <Text variant="body" style={{ fontWeight: '600' }}>{formatCurrency(goal.targetAmount)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text variant="caption" color={theme.colors.textMuted}>Actual</Text>
                <Text variant="body" color={theme.colors.success} style={{ fontWeight: '600' }}>{formatCurrency(goal.currentAmount)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text variant="caption" color={theme.colors.textMuted}>Falta</Text>
                <Text variant="body" color={theme.colors.expense} style={{ fontWeight: '600' }}>
                  {formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0))}
                </Text>
              </View>
            </View>

            <Text variant="body" style={{ marginBottom: 8, marginTop: 16 }}>Monto a agregar</Text>
            <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
              <Text variant="h3" color={theme.colors.textMuted}>$</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.quickAmounts}>
              {[100, 500, 1000, 2000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickButton, { borderColor: theme.colors.border }]}
                  onPress={() => handleQuickAmount(val)}
                >
                  <Text variant="caption">{formatCurrency(val)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Button title="Cancelar" variant="ghost" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
            <Button title="Agregar" variant="primary" onPress={handleAdd} style={{ flex: 1, marginLeft: 8 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
  },
});
