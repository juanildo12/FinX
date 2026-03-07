import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Divider } from '../../components/atoms';
import { TransactionItem } from '../../components/molecules';
import { useTheme, useTransactions, useCreditCards } from '../../hooks';
import { Transaction } from '../../types';
import { getTransactionsByDate, formatDate, getCurrentMonth } from '../../utils';

interface TransactionsScreenProps {
  navigation: any;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { transactions, deleteTransaction } = useTransactions();
  const { creditCards } = useCreditCards();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const groupedTransactions = useMemo(() => {
    const grouped = getTransactionsByDate(filteredTransactions);
    const result: { date: string; data: Transaction[] }[] = [];
    grouped.forEach((data, date) => {
      result.push({ date, data });
    });
    return result;
  }, [filteredTransactions]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: { date: string; data: Transaction[] } }) => (
    <View>
      <Text variant="caption" color={theme.colors.textMuted} style={styles.dateHeader}>
        {formatDate(item.date)}
      </Text>
      <Card style={styles.card}>
        {item.data.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            {index > 0 && <Divider spacing={0} />}
            <Swipeable
              renderRightActions={() => (
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => handleDelete(transaction.id)}
                >
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              )}
              overshootRight={false}
            >
              <TransactionItem
                transaction={transaction}
                onPress={() => navigation.navigate('TransactionForm', { transaction })}
              />
            </Swipeable>
          </React.Fragment>
        ))}
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.filterContainer, { paddingTop: insets.top + 16 }]}>
        {(['all', 'income', 'expense'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === f ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              variant="body"
              color={filter === f ? '#FFFFFF' : theme.colors.textSecondary}
            >
              {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={groupedTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="h3" color={theme.colors.textMuted}>No hay transacciones</Text>
            <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
              Agrega tu primera transacción
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('TransactionForm', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: { position: 'absolute', right: 20 },
  container: {
    flex: 1,
    position: 'relative',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    zIndex: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  dateHeader: {
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    marginBottom: 8,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 1,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
    zIndex: 10,
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

export default TransactionsScreen;
