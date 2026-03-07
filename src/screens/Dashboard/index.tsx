import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Divider } from '../../components/atoms';
import { TransactionItem, AlertItem } from '../../components/molecules';
import { useTheme, useTransactions, useAlerts, useCurrency } from '../../hooks';
import { calculateMonthlySummary, getCurrentMonth, getExpensesByCategory } from '../../utils';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactions();
  const { alerts } = useAlerts();
  const { formatCurrency } = useCurrency();
  const [refreshing, setRefreshing] = React.useState(false);

  const currentMonth = getCurrentMonth();
  const summary = calculateMonthlySummary(transactions, currentMonth);
  const recentTransactions = transactions.slice(0, 5);
  const pendingAlerts = alerts.filter((a) => !a.isCompleted).slice(0, 3);
  const expensesByCategory = getExpensesByCategory(transactions, currentMonth);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const pieData = expensesByCategory.slice(0, 5).map((item) => ({
    name: item.category,
    amount: item.amount,
    color: item.color,
    legendFontColor: theme.colors.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.headerFixed, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="h1">FinX</Text>
            <Text variant="body" color={theme.colors.textSecondary}>
              Tus finanzas en orden
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('TransactionForm', {})}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        <Card style={styles.summaryCard}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Balance del mes
          </Text>
          <Text
            variant="h1"
            color={summary.savings >= 0 ? theme.colors.income : theme.colors.expense}
            style={{ marginVertical: 8 }}
          >
            {formatCurrency(summary.savings)}
          </Text>
          
          <View style={styles.row}>
            <View style={styles.col}>
              <Text variant="small" color={theme.colors.textMuted}>Ingresos</Text>
              <Text variant="body" color={theme.colors.income} style={{ fontWeight: '600' }}>
                {formatCurrency(summary.income)}
              </Text>
            </View>
            <View style={styles.col}>
              <Text variant="small" color={theme.colors.textMuted}>Gastos</Text>
              <Text variant="body" color={theme.colors.expense} style={{ fontWeight: '600' }}>
                {formatCurrency(summary.expenses)}
              </Text>
            </View>
          </View>
        </Card>

        {pieData.length > 0 && (
          <Card style={styles.chartCard}>
            <Text variant="h3" style={{ marginBottom: 16 }}>Gastos por categoría</Text>
            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Text variant="h3">Últimas transacciones</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
            <Text variant="body" color={theme.colors.primary}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <Card>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                {index > 0 && <Divider spacing={0} />}
                <TransactionItem
                  transaction={transaction}
                  onPress={() => navigation.navigate('TransactionsTab', { 
                    screen: 'TransactionForm', 
                    params: { transaction } 
                  })}
                />
              </React.Fragment>
            ))
          ) : (
            <Text variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', padding: 20 }}>
              No hay transacciones aún
            </Text>
          )}
        </Card>

        {pendingAlerts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Alertas pendientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Settings', { screen: 'Alerts' })}>
                <Text variant="body" color={theme.colors.primary}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            <Card>
              {pendingAlerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  {index > 0 && <Divider spacing={0} />}
                  <AlertItem alert={alert} />
                </React.Fragment>
              ))}
            </Card>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('TransactionForm', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerFixed: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginTop: 16,
  },
  col: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 34,
  },
});

export default DashboardScreen;
