import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Card } from '../../components/atoms';
import { useTheme, useTransactions, useCurrency } from '../../hooks';
import { getCashFlowData, calculateMonthlySummary, getCurrentMonth } from '../../utils';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface CashFlowScreenProps {
  navigation: any;
}

const CashFlowScreen: React.FC<CashFlowScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { formatCurrency } = useCurrency();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const cashFlowData = getCashFlowData(transactions, selectedYear);
  const currentMonthSummary = calculateMonthlySummary(transactions, getCurrentMonth());

  const totalIncome = cashFlowData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = cashFlowData.reduce((sum, m) => sum + m.expenses, 0);
  const netCashFlow = totalIncome - totalExpenses;

  const chartData = {
    labels: cashFlowData.map((d) => d.month),
    datasets: [
      { data: cashFlowData.map((d) => d.income || 0), color: () => theme.colors.income, strokeWidth: 2 },
      { data: cashFlowData.map((d) => d.expenses || 0), color: () => theme.colors.expense, strokeWidth: 2 },
    ],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.summaryCard}>
        <Text variant="caption" color={theme.colors.textMuted}>Balance del año {selectedYear}</Text>
        <Text variant="h2" color={netCashFlow >= 0 ? theme.colors.income : theme.colors.expense} style={{ marginVertical: 8 }}>
          {formatCurrency(netCashFlow)}
        </Text>
        <View style={styles.row}>
          <View><Text variant="small" color={theme.colors.textMuted}>Ingresos</Text><Text variant="body" color={theme.colors.income}>{formatCurrency(totalIncome)}</Text></View>
          <View><Text variant="small" color={theme.colors.textMuted}>Gastos</Text><Text variant="body" color={theme.colors.expense}>{formatCurrency(totalExpenses)}</Text></View>
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Flujo de caja mensual</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
          bezier
          style={{ marginLeft: -16 }}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.income }]} /><Text variant="caption">Ingresos</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.expense }]} /><Text variant="caption">Gastos</Text></View>
        </View>
      </Card>

      <Card style={styles.currentMonthCard}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Este mes</Text>
        <View style={styles.monthRow}>
          <View style={styles.monthItem}>
            <Text variant="caption" color={theme.colors.textMuted}>Ingresos</Text>
            <Text variant="h3" color={theme.colors.income}>{formatCurrency(currentMonthSummary.income)}</Text>
          </View>
          <View style={styles.monthItem}>
            <Text variant="caption" color={theme.colors.textMuted}>Gastos</Text>
            <Text variant="h3" color={theme.colors.expense}>{formatCurrency(currentMonthSummary.expenses)}</Text>
          </View>
          <View style={styles.monthItem}>
            <Text variant="caption" color={theme.colors.textMuted}>Ahorro</Text>
            <Text variant="h3" color={currentMonthSummary.savings >= 0 ? theme.colors.income : theme.colors.expense}>
              {formatCurrency(currentMonthSummary.savings)}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: { margin: 16, marginBottom: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  chartCard: { margin: 16 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  currentMonthCard: { margin: 16, marginTop: 0 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between' },
  monthItem: { alignItems: 'center' },
});

export default CashFlowScreen;
