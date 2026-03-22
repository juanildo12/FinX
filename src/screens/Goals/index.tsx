import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ProgressBar } from '../../components/atoms';
import { GoalItem } from '../../components/molecules';
import { useTheme, useGoals, useDebts, useCurrency } from '../../hooks';
import { getProgressPercentage } from '../../utils';
import { Debt } from '../../types';
import { PayDebtModal } from './PayDebtModal';
import { Swipeable } from 'react-native-gesture-handler';

interface GoalsScreenProps {
  navigation: any;
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { goals } = useGoals();
  const { debts, deleteDebt } = useDebts();
  const { formatCurrency } = useCurrency();
  const [tab, setTab] = useState<'goals' | 'debts'>('goals');

  const [showMenu, setShowMenu] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const activeGoals = goals.filter((g) => g.status === 'active');
  const activeDebts = debts.filter((d) => d.status === 'active');

  const totalGoalProgress = activeGoals.length > 0
    ? activeGoals.reduce((sum, g) => sum + getProgressPercentage(g.currentAmount, g.targetAmount), 0) / activeGoals.length
    : 0;

  const totalDebtRemaining = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

  const handleMenuPress = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowMenu(true);
  };

  const handlePay = () => {
    setShowMenu(false);
    setShowPayModal(true);
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (selectedDebt) {
      navigation.navigate('DebtForm', { debt: selectedDebt });
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Eliminar deuda',
      `¿Estás seguro de eliminar "${selectedDebt?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            if (selectedDebt) {
              deleteDebt(selectedDebt.id);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: tab === 'goals' ? theme.colors.primary : theme.colors.surface },
            ]}
            onPress={() => setTab('goals')}
          >
            <Text variant="body" color={tab === 'goals' ? '#FFFFFF' : theme.colors.textSecondary}>
              Metas ({activeGoals.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: tab === 'debts' ? theme.colors.primary : theme.colors.surface },
            ]}
            onPress={() => setTab('debts')}
          >
            <Text variant="body" color={tab === 'debts' ? '#FFFFFF' : theme.colors.textSecondary}>
              Deudas ({activeDebts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'goals' ? (
          <>
            {activeGoals.length > 0 && (
              <Card style={styles.summaryCard}>
                <Text variant="caption" color={theme.colors.textMuted}>Progreso total</Text>
                <Text variant="h2" color={theme.colors.primary}>{Math.round(totalGoalProgress)}%</Text>
                <ProgressBar progress={totalGoalProgress} style={{ marginTop: 8 }} />
              </Card>
            )}
            {activeGoals.length > 0 ? (
              activeGoals.map((goal) => (
                <GoalItem key={goal.id} goal={goal} onPress={() => {}} />
              ))
            ) : (
              <View style={styles.empty}>
                <Text variant="h3" color={theme.colors.textMuted}>No hay metas</Text>
                <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
                  Establece metas financieras para lograr tus sueños
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {activeDebts.length > 0 && (
              <Card style={[styles.summaryCard, styles.summaryCardDebt, { backgroundColor: theme.colors.expense + '15' }]}>
                <Text variant="caption" color={theme.colors.textSecondary}>Total deudas pendientes</Text>
                <Text variant="h2" color={theme.colors.expense}>{formatCurrency(totalDebtRemaining)}</Text>
              </Card>
            )}
            {activeDebts.length > 0 ? (
              activeDebts.map((item) => {
                const progress = getProgressPercentage(item.totalAmount - item.remainingAmount, item.totalAmount);
                const renderRightActions = () => (
                  <TouchableOpacity
                    style={[styles.deleteAction, { backgroundColor: theme.colors.expense }]}
                    onPress={() => {
                      Alert.alert(
                        'Eliminar deuda',
                        `¿Estás seguro de eliminar "${item.name}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Eliminar', 
                            style: 'destructive',
                            onPress: () => deleteDebt(item.id)
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                    <Text variant="body" color="#FFFFFF" style={{ marginTop: 4 }}>Eliminar</Text>
                  </TouchableOpacity>
                );
                return (
                  <Swipeable key={item.id} renderRightActions={renderRightActions} overshootRight={false}>
                    <Card style={{ marginBottom: 12 }}>
                      <View style={styles.debtHeader}>
                        <View style={{ flex: 1 }}>
                          <Text variant="body" style={{ fontWeight: '600' }}>{item.name}</Text>
                          <Text variant="caption">{item.creditor}</Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]} 
                            onPress={() => {
                              setSelectedDebt(item);
                              setShowPayModal(true);
                            }}
                          >
                            <Ionicons name="wallet-outline" size={18} color={theme.colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: theme.colors.secondary + '15' }]} 
                            onPress={() => navigation.navigate('DebtForm', { debt: item })}
                          >
                            <Ionicons name="create-outline" size={18} color={theme.colors.secondary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.debtAmounts}>
                        <View>
                          <Text variant="small" color={theme.colors.textMuted}>Restante</Text>
                          <Text variant="body" color={theme.colors.expense} style={{ fontWeight: '600' }}>
                            {formatCurrency(item.remainingAmount)}
                          </Text>
                        </View>
                        <View>
                          <Text variant="small" color={theme.colors.textMuted}>Total</Text>
                          <Text variant="body">{formatCurrency(item.totalAmount)}</Text>
                        </View>
                        <View>
                          <Text variant="small" color={theme.colors.textMuted}>Cuota</Text>
                          <Text variant="body">{formatCurrency(item.monthlyPayment)}/mes</Text>
                        </View>
                      </View>
                      <View style={{ marginTop: 12 }}>
                        <ProgressBar 
                          progress={progress} 
                          color={theme.colors.primary}
                          backgroundColor={theme.colors.border}
                        />
                        <Text variant="small" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                          {progress}% pagado
                        </Text>
                      </View>
                    </Card>
                  </Swipeable>
                );
              })
            ) : (
              <View style={styles.empty}>
                <Text variant="h3" color={theme.colors.textMuted}>No hay deudas</Text>
                <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>
                  ¡Felicitaciones! No tienes deudas pendientes
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.fabContainer, { bottom: insets.bottom + 80 }]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate(tab === 'goals' ? 'GoalForm' : 'DebtForm')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Debt Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <Pressable style={[styles.menuContainer, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePay}>
              <Ionicons name="wallet-outline" size={22} color={theme.colors.primary} />
              <Text variant="body" style={{ marginLeft: 12 }}>Hacer pago</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
              <Text variant="body" style={{ marginLeft: 12 }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={theme.colors.expense} />
              <Text variant="body" color={theme.colors.expense} style={{ marginLeft: 12 }}>Eliminar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Pay Debt Modal */}
      {selectedDebt && (
        <PayDebtModal
          visible={showPayModal}
          debt={selectedDebt}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 0 },
  tabs: { flexDirection: 'row', gap: 12 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  summaryCard: { marginBottom: 16 },
  summaryCardDebt: { marginTop: 16 },
  list: { paddingTop: 0 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deleteAction: { width: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderTopRightRadius: 16, borderBottomRightRadius: 16 },
  debtStatus: {},
  paidBadge: { fontSize: 14 },
  debtAmounts: { flexDirection: 'row', justifyContent: 'space-between' },
  fabContainer: { position: 'absolute', right: 20 },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabIcon: { fontSize: 32, color: '#FFFFFF', lineHeight: 34 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  menuContainer: { borderRadius: 16, padding: 8, width: '100%', maxWidth: 280 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10 },
});

export default GoalsScreen;
