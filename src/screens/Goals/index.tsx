import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ProgressBar } from '../../components/atoms';
import { GoalItem } from '../../components/molecules';
import { useTheme, useGoals, useDebts, useCurrency } from '../../hooks';
import { getProgressPercentage } from '../../utils';

interface GoalsScreenProps {
  navigation: any;
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { goals } = useGoals();
  const { debts } = useDebts();
  const { formatCurrency } = useCurrency();
  const [tab, setTab] = useState<'goals' | 'debts'>('goals');

  const activeGoals = goals.filter((g) => g.status === 'active');
  const activeDebts = debts.filter((d) => d.status === 'active');

  const totalGoalProgress = activeGoals.length > 0
    ? activeGoals.reduce((sum, g) => sum + getProgressPercentage(g.currentAmount, g.targetAmount), 0) / activeGoals.length
    : 0;

  const totalDebtRemaining = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

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
              <Card style={styles.summaryCard}>
                <Text variant="caption" color={theme.colors.textMuted}>Total deudas pendientes</Text>
                <Text variant="h2" color={theme.colors.expense}>{formatCurrency(totalDebtRemaining)}</Text>
              </Card>
            )}
            {activeDebts.length > 0 ? (
              activeDebts.map((item) => {
                const progress = getProgressPercentage(item.totalAmount - item.remainingAmount, item.totalAmount);
                return (
                  <Card key={item.id} style={{ marginBottom: 12 }}>
                    <View style={styles.debtHeader}>
                      <View>
                        <Text variant="body" style={{ fontWeight: '600' }}>{item.name}</Text>
                        <Text variant="caption">{item.creditor}</Text>
                      </View>
                      <View style={styles.debtStatus}>
                        {item.status === 'paid' && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                            <Text variant="small" color={theme.colors.success}>Pagado</Text>
                          </View>
                        )}
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
  list: { paddingTop: 0 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  debtHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  debtStatus: {},
  paidBadge: { fontSize: 14 },
  debtAmounts: { flexDirection: 'row', justifyContent: 'space-between' },
  fabContainer: { position: 'absolute', right: 20 },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabIcon: { fontSize: 32, color: '#FFFFFF', lineHeight: 34 },
});

export default GoalsScreen;
