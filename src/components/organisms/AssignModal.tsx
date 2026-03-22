import React, { useState, useMemo } from 'react';
import {
  View,
  Text as RNText,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useCurrency, useBudgeting } from '../../hooks';
import { CategoryBudget } from '../../types';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import { SuccessAnimation } from '../molecules/SuccessAnimation';

interface AssignModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const { 
    categoryBudgets, 
    getCategoryInfo,
    assignToCategory,
    calculateReadyToAssign,
    monthlyIncome,
    savingsPercentage,
    savingsAmount,
    availableForExpenses,
  } = useBudgeting();

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const availableCategories = useMemo(() => {
    return categoryBudgets.filter(cb => cb.group !== 'Ingresos');
  }, [categoryBudgets]);

  const totalToAssign = useMemo(() => {
    return Object.values(assignments)
      .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [assignments]);

  const remaining = calculateReadyToAssign - totalToAssign;

  const handleAssignmentChange = (categoryId: string, value: string) => {
    setAssignments(prev => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleAssign = () => {
    Object.entries(assignments).forEach(([categoryId, amountStr]) => {
      const amount = parseFloat(amountStr);
      if (amount > 0) {
        assignToCategory(categoryId, amount);
      }
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAssignments({});
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setAssignments({});
    onClose();
  };

  const getCategoryIcon = (categoryId: string) => {
    const info = getCategoryInfo(categoryId);
    return info?.icon || 'help-circle';
  };

  const getCategoryColor = (categoryId: string) => {
    const info = getCategoryInfo(categoryId);
    return info?.color || theme.colors.textMuted;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text variant="h3">Asignar Dinero</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text variant="body" color={theme.colors.textSecondary}>
                Ingreso mensual:
              </Text>
              <Text variant="h3" color={theme.colors.primary}>
                {formatCurrency(monthlyIncome)}
              </Text>
            </View>
            {savingsPercentage > 0 && (
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text variant="body" color={theme.colors.textSecondary}>
                  Ahorro ({savingsPercentage}%):
                </Text>
                <Text variant="body" color={theme.colors.success}>
                  -{formatCurrency(savingsAmount)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text variant="body" color={theme.colors.textSecondary}>
                Disponible para asignar:
              </Text>
              <Text variant="h3" color={theme.colors.primary}>
                {formatCurrency(calculateReadyToAssign)}
              </Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
              <Text variant="body" color={theme.colors.textSecondary}>
                Por asignar:
              </Text>
              <Text 
                variant="h3" 
                color={remaining >= 0 ? theme.colors.success : theme.colors.error}
              >
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.content}>
            <Text variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
              Ingresa los montos a asignar a cada categoría:
            </Text>

            {availableCategories.map((cb) => {
              const info = getCategoryInfo(cb.categoryId);
              return (
                <View
                  key={cb.id}
                  style={[styles.categoryItem, { borderColor: theme.colors.border }]}
                >
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(cb.categoryId) }]}>
                      <Ionicons 
                        name={(getCategoryIcon(cb.categoryId) as keyof typeof Ionicons.glyphMap)} 
                        size={18} 
                        color="#FFF" 
                      />
                    </View>
                    <View>
                      <Text variant="body">{info?.name || cb.categoryId}</Text>
                      <Text variant="caption" color={theme.colors.textMuted}>
                        Asignado: {formatCurrency(cb.assignedThisMonth)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <RNText style={styles.currencyPrefix}>RD$</RNText>
                    <TextInput
                      style={[styles.amountInput, { color: theme.colors.textPrimary }]}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="decimal-pad"
                      value={assignments[cb.categoryId] || ''}
                      onChangeText={(value) => handleAssignmentChange(cb.categoryId, value)}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text variant="body" color={theme.colors.textSecondary}>
                Total a asignar:
              </Text>
              <Text variant="h3" color={theme.colors.primary}>
                {formatCurrency(totalToAssign)}
              </Text>
            </View>
            <Button
              title={`Asignar ${formatCurrency(totalToAssign)}`}
              onPress={handleAssign}
              variant="primary"
              fullWidth
              disabled={totalToAssign <= 0 || remaining < 0}
            />
          </View>
        </View>
      </View>
      <SuccessAnimation
        visible={showSuccess}
        message="¡Asignado!"
        onDismiss={() => setShowSuccess(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  currencyPrefix: {
    fontSize: 14,
    color: '#64748B',
  },
  amountInput: {
    width: 80,
    height: 40,
    fontSize: 16,
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
