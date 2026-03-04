import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Input, Button, Divider } from '../../components/atoms';
import { useTheme, useTransactions, useCreditCards, useCurrency } from '../../hooks';
import { Transaction, TransactionType } from '../../types';
import { validateAmount, getCurrentDate } from '../../utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../constants';

interface TransactionFormScreenProps {
  navigation: any;
  route: {
    params?: {
      transaction?: Transaction;
    };
  };
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  transport: 'car-outline',
  housing: 'home-outline',
  utilities: 'flash-outline',
  entertainment: 'film-outline',
  health: 'heart-outline',
  education: 'book-outline',
  shopping: 'bag-outline',
  salary: 'cash-outline',
  investment: 'trending-up-outline',
  gift: 'gift-outline',
  other_income: 'wallet-outline',
  other_expense: 'document-text-outline',
};

const TransactionFormScreen: React.FC<TransactionFormScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { creditCards } = useCreditCards();
  const { currency, formatCurrency } = useCurrency();

  const existingTransaction = route.params?.transaction;
  const isEditing = !!existingTransaction;

  const [type, setType] = useState<TransactionType>(existingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(existingTransaction?.amount?.toString() || '');
  const [description, setDescription] = useState(existingTransaction?.description || '');
  const [category, setCategory] = useState(existingTransaction?.category || 'food');
  const [paymentMethod, setPaymentMethod] = useState(existingTransaction?.paymentMethod || 'cash');
  const [cardId, setCardId] = useState(existingTransaction?.cardId || '');
  const [date, setDate] = useState(existingTransaction?.date || getCurrentDate());

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!validateAmount(amount)) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      category,
      tags: [],
      date,
      paymentMethod: paymentMethod as 'cash' | 'card' | 'bank_transfer',
      cardId: paymentMethod === 'card' ? cardId : undefined,
    };

    if (isEditing) {
      updateTransaction(existingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existingTransaction) return;
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(existingTransaction.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.typeCard}>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              {
                backgroundColor: type === 'expense' ? theme.colors.expense : theme.colors.surface,
              },
            ]}
            onPress={() => {
              setType('expense');
              setCategory('food');
            }}
          >
            <Text variant="body" color={type === 'expense' ? '#FFFFFF' : theme.colors.textSecondary}>
              Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              {
                backgroundColor: type === 'income' ? theme.colors.income : theme.colors.surface,
              },
            ]}
            onPress={() => {
              setType('income');
              setCategory('salary');
            }}
          >
            <Text variant="body" color={type === 'income' ? '#FFFFFF' : theme.colors.textSecondary}>
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.amountCard}>
        <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Monto ({currency})</Text>
        <TextInput
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={[styles.amountInput, { color: theme.colors.textPrimary, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          placeholderTextColor={theme.colors.textMuted}
        />
        <Text variant="h2" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
          {formatCurrency(parseFloat(amount) || 0)}
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Categoría</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: category === cat.id ? cat.color + '20' : theme.colors.surface,
                  borderColor: category === cat.id ? cat.color : theme.colors.border,
                },
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Ionicons 
                name={iconMap[cat.id] || 'help-circle-outline'} 
                size={24} 
                color={category === cat.id ? cat.color : theme.colors.textSecondary} 
              />
              <Text variant="small" color={category === cat.id ? cat.color : theme.colors.textSecondary} style={{ marginTop: 4 }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Método de pago</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentButton,
                {
                  backgroundColor: paymentMethod === method.id ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text variant="body" color={paymentMethod === method.id ? '#FFFFFF' : theme.colors.textSecondary}>
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {paymentMethod === 'card' && creditCards.length > 0 && (
          <View style={styles.cardsRow}>
            {creditCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardButton,
                  {
                    backgroundColor: cardId === card.id ? card.color : theme.colors.surface,
                  },
                ]}
                onPress={() => setCardId(card.id)}
              >
                <Text variant="body" color={cardId === card.id ? '#FFFFFF' : theme.colors.textSecondary}>
                  {card.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Input
          label="Descripción (opcional)"
          placeholder="¿En qué gastaste?"
          value={description}
          onChangeText={setDescription}
        />
      </Card>

      <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.actionsFixed, { paddingBottom: insets.bottom + 16, paddingHorizontal: 16, paddingTop: 16, backgroundColor: theme.colors.background }]}>
        <Button
          title={isEditing ? 'Guardar cambios' : 'Agregar transacción'}
          onPress={handleSave}
          variant="primary"
          fullWidth
        />
        {isEditing && (
          <Button
            title="Eliminar transacción"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            style={{ marginTop: 12 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  typeCard: {
    margin: 16,
    marginBottom: 0,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  amountCard: {
    margin: 16,
    alignItems: 'center',
  },
  amountInput: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    height: 60,
    minWidth: 200,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    width: '31%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cardButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  actions: {
    paddingHorizontal: 16,
  },
  actionsFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
});

export default TransactionFormScreen;
