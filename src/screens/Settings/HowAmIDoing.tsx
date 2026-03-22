import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card } from '../../components/atoms';
import { useTheme, useTransactions, useAgeOfMoney, useCurrency } from '../../hooks';
import { getLast6MonthsCashFlow, getAgeOfMoneyColor, getAgeOfMoneyLabel, calculateMonthlySummary, getCurrentMonth } from '../../utils';

interface HowAmIDoingScreenProps {
  navigation: any;
}

const HowAmIDoingScreen: React.FC<HowAmIDoingScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactions();
  const ageOfMoney = useAgeOfMoney();
  const { formatCurrency } = useCurrency();
  
  const currentMonth = getCurrentMonth();
  const summary = calculateMonthlySummary(transactions, currentMonth);
  const cashFlowData = getLast6MonthsCashFlow(transactions);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View style={styles.header}>
        <Text variant="h2">¿Cómo estoy?</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Resumen de tu salud financiera
        </Text>
      </View>

      <Card style={styles.card}>
        <Text variant="caption" color={theme.colors.textSecondary}>
          Antigüedad del dinero
        </Text>
        <Text variant="h1" style={{ marginTop: 4 }}>
          {ageOfMoney.days} {ageOfMoney.days === 1 ? 'día' : 'días'}
        </Text>
        <View style={[styles.badge, { backgroundColor: getAgeOfMoneyColor(ageOfMoney.days) + '20' }]}>
          <Text variant="small" style={{ color: getAgeOfMoneyColor(ageOfMoney.days), fontWeight: '600' }}>
            {getAgeOfMoneyLabel(ageOfMoney.level)}
          </Text>
        </View>
        <Text variant="small" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
          {ageOfMoney.description}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Balance del mes</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text variant="small" color={theme.colors.textMuted}>Ingresos</Text>
            <Text variant="h3" color={theme.colors.income}>
              {formatCurrency(summary.income)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text variant="small" color={theme.colors.textMuted}>Gastos</Text>
            <Text variant="h3" color={theme.colors.expense}>
              {formatCurrency(summary.expenses)}
            </Text>
          </View>
        </View>
        <View style={[styles.savingsContainer, { backgroundColor: summary.savings >= 0 ? theme.colors.income + '15' : theme.colors.expense + '15' }]}>
          <Text variant="small" color={theme.colors.textMuted}>Ahorro</Text>
          <Text variant="h3" color={summary.savings >= 0 ? theme.colors.income : theme.colors.expense}>
            {formatCurrency(summary.savings)}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.chartHeader}>
          <Text variant="h3">Ingresos vs Gastos</Text>
          <Text variant="caption" color={theme.colors.textMuted}>Últimos 6 meses</Text>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.barsContainer}>
            {cashFlowData.map((item, index) => {
              const maxValue = Math.max(...cashFlowData.map(d => Math.max(d.income, d.expenses)), 1);
              const incomeHeight = (item.income / maxValue) * 100;
              const expenseHeight = (item.expenses / maxValue) * 100;
              
              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barWrapper}>
                    {item.income > 0 && (
                      <Text variant="caption" style={[styles.barValue, { color: theme.colors.income }]}>
                        {item.income >= 1000 ? `${(item.income/1000).toFixed(0)}k` : formatCurrency(item.income)}
                      </Text>
                    )}
                    <View 
                      style={[
                        styles.bar, 
                        styles.incomeBar, 
                        { 
                          height: `${Math.max(incomeHeight, 4)}%`,
                          backgroundColor: theme.colors.income 
                        }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.bar, 
                        styles.expenseBar, 
                        { 
                          height: `${Math.max(expenseHeight, 4)}%`,
                          backgroundColor: theme.colors.expense 
                        }
                      ]} 
                    />
                  </View>
                  <Text variant="caption" color={theme.colors.textMuted} style={styles.barLabel}>
                    {item.month.substring(0, 3)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.income }]} />
            <Text variant="small" color={theme.colors.textMuted}>Ingresos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.expense }]} />
            <Text variant="small" color={theme.colors.textMuted}>Gastos</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text variant="h3" style={{ marginBottom: 8 }}>¿Qué es la Antigüedad del Dinero?</Text>
        <Text variant="small" color={theme.colors.textMuted}>
          La Antigüedad del Dinero (Age of Money) mide cuántos días, en promedio, el dinero permanece en tus cuentas entre que lo recibes y lo gastas. 
        </Text>
        <Text variant="small" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
          • 30+ días: Excelente - Tienes tiempo para decidir{'\n'}
          • 14-29 días: Bueno{'\n'}
          • 7-13 días: Regular{'\n'}
          • 1-6 días: Bajo{'\n'}
          • 0 días: Muy bajo
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  balanceItem: {
    flex: 1,
  },
  savingsContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chartHeader: {
    marginBottom: 8,
  },
  barValue: {
    fontSize: 10,
    textAlign: 'center',
  },
  chartContainer: {
    height: 180,
    marginTop: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 8,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 3,
  },
  bar: {
    width: 12,
    borderRadius: 4,
    minHeight: 4,
  },
  incomeBar: {
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  expenseBar: {
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
});

export default HowAmIDoingScreen;
