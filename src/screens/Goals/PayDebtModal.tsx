import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Input, Button } from '../../components/atoms';
import { useTheme, useDebts, useCurrency } from '../../hooks';
import { Debt } from '../../types';
import { validateAmount } from '../../utils';

interface PayDebtModalProps {
  visible: boolean;
  debt: Debt;
  onClose: () => void;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({ visible, debt, onClose }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { payDebt } = useDebts();
  const { formatCurrency } = useCurrency();
  const [amount, setAmount] = useState('');

  const paymentAmount = parseFloat(amount) || 0;
  const remainingAfter = Math.max(0, debt.remainingAmount - paymentAmount);
  const isFullPayment = paymentAmount >= debt.remainingAmount;

  const handlePay = () => {
    if (!validateAmount(amount)) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    if (paymentAmount > debt.remainingAmount) {
      Alert.alert('Error', 'El pago no puede ser mayor al monto restante');
      return;
    }

    payDebt(debt.id, paymentAmount);
    setAmount('');
    onClose();

    if (isFullPayment) {
      Alert.alert('¡Felicidades!', 'Has pagado completamente esta deuda');
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text variant="h3">Hacer pago</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Card style={styles.debtInfo}>
            <Text variant="body" style={{ fontWeight: '600' }}>{debt.name}</Text>
            <View style={styles.amountsRow}>
              <View style={styles.amountItem}>
                <Text variant="small" color={theme.colors.textMuted}>Total</Text>
                <Text variant="body">{formatCurrency(debt.totalAmount)}</Text>
              </View>
              <View style={styles.amountItem}>
                <Text variant="small" color={theme.colors.textMuted}>Restante</Text>
                <Text variant="body" color={theme.colors.expense} style={{ fontWeight: '600' }}>
                  {formatCurrency(debt.remainingAmount)}
                </Text>
              </View>
            </View>
          </Card>

          <Input
            label="Monto del pago"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <View style={styles.quickAmounts}>
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleQuickAmount(debt.monthlyPayment)}
            >
              <Text variant="small" color={theme.colors.primary}>Cuota</Text>
              <Text variant="caption" color={theme.colors.textMuted}>{formatCurrency(debt.monthlyPayment)}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleQuickAmount(debt.remainingAmount)}
            >
              <Text variant="small" color={theme.colors.primary}>Completo</Text>
              <Text variant="caption" color={theme.colors.textMuted}>{formatCurrency(debt.remainingAmount)}</Text>
            </TouchableOpacity>
          </View>

          {paymentAmount > 0 && (
            <Card style={[styles.preview, { backgroundColor: isFullPayment ? theme.colors.success + '15' : theme.colors.surface }]}>
              <Text variant="small" color={theme.colors.textMuted}>
                {isFullPayment ? '¡Deuda saldada!' : 'Después del pago'}
              </Text>
              <Text variant="h3" color={isFullPayment ? theme.colors.success : theme.colors.textPrimary}>
                {formatCurrency(remainingAfter)}
              </Text>
            </Card>
          )}

          <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
            <Button title="Cancelar" onPress={onClose} variant="outline" style={{ flex: 1, marginRight: 8 }} />
            <Button 
              title="Confirmar pago" 
              onPress={handlePay} 
              variant="primary" 
              style={{ flex: 1, marginLeft: 8 }}
              disabled={!amount || paymentAmount <= 0}
            />
          </View>
        </Pressable>
      </Pressable>
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
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  debtInfo: {
    marginBottom: 16,
  },
  amountsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 24,
  },
  amountItem: {},
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  quickButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  preview: {
    marginBottom: 16,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
