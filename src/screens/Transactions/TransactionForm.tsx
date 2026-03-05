import React, { useState } from 'react';
import { Modal } from 'react-native';
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
import { useTheme, useTransactions, useCurrency, useCategories } from '../../hooks';
import { Transaction, TransactionType, Category } from '../../types';
import { validateAmount, getCurrentDate } from '../../utils';

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
  const { currency, formatCurrency } = useCurrency();
  const { incomeCategories, expenseCategories } = useCategories();

  const existingTransaction = route.params?.transaction;
  const isEditing = !!existingTransaction;

  const [type, setType] = useState<TransactionType>(existingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(existingTransaction?.amount?.toString() || '');
  const [description, setDescription] = useState(existingTransaction?.description || '');
  const [category, setCategory] = useState(existingTransaction?.category || 'food');
  const [date, setDate] = useState(existingTransaction?.date || getCurrentDate());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const selectedCategory = categories.find(c => c.id === category) || categories[0];

  const handleSave = () => {
    if (!validateAmount(amount)) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description: description || '',
      category,
      tags: [],
      date,
      paymentMethod: 'cash' as const,
      cardId: undefined,
      accountId: 'acc_default',
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
        
        <View style={styles.typeCard}>
          <View style={[styles.typeRow, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: type === 'expense' ? theme.colors.expense : 'transparent',
                },
              ]}
              onPress={() => {
                setType('expense');
                setCategory('food');
              }}
            >
              <Ionicons 
                name="arrow-down-circle" 
                size={20} 
                color={type === 'expense' ? '#FFFFFF' : theme.colors.textMuted} 
              />
              <Text variant="body" color={type === 'expense' ? '#FFFFFF' : theme.colors.textSecondary} style={{ marginLeft: 8 }}>
                Gasto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: type === 'income' ? theme.colors.income : 'transparent',
                },
              ]}
              onPress={() => {
                setType('income');
                setCategory('salary');
              }}
            >
              <Ionicons 
                name="arrow-up-circle" 
                size={20} 
                color={type === 'income' ? '#FFFFFF' : theme.colors.textMuted} 
              />
              <Text variant="body" color={type === 'income' ? '#FFFFFF' : theme.colors.textSecondary} style={{ marginLeft: 8 }}>
                Ingreso
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.amountCard}>
          <Text variant="small" color={theme.colors.textMuted} style={{ marginBottom: 8 }}>MONTO ({currency})</Text>
          <View style={styles.amountContainer}>
            <Text variant="h1" color={type === 'expense' ? theme.colors.expense : theme.colors.income}>
              {type === 'expense' ? '-' : '+'}
            </Text>
            <TextInput
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={[styles.amountInput, { color: theme.colors.textPrimary }]}
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
          <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
            {formatCurrency(parseFloat(amount) || 0)}
          </Text>
        </Card>

        <Card style={styles.section}>
          <View style={styles.fieldHeader}>
            <Text variant="caption" color={theme.colors.textMuted}>CATEGORÍA</Text>
          </View>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: selectedCategory.color }]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <View style={[styles.selectorIcon, { backgroundColor: selectedCategory.color + '20' }]}>
              <Ionicons
                name={selectedCategory.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={selectedCategory.color}
              />
            </View>
            <Text variant="body" style={{ flex: 1, color: theme.colors.textPrimary }}>{selectedCategory.name}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>

      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
              <Text variant="body" color={theme.colors.primary}>Cancelar</Text>
            </TouchableOpacity>
            <Text variant="body" style={{ fontWeight: '600' }}>Seleccionar Categoría</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryModalItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                  setCategory(cat.id);
                  setCategoryModalVisible(false);
                }}
              >
                <View style={[styles.categoryModalIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons
                    name={cat.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={cat.color}
                  />
                </View>
                <Text variant="body" style={{ flex: 1 }}>{cat.name}</Text>
                {category === cat.id && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <View style={{ height: 16 }} />
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
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  amountCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    fontSize: 42,
    fontWeight: 'bold',
    minWidth: 150,
    textAlign: 'center',
  },
  fieldHeader: {
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  selectorIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  categorySelectorIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalContent: { flex: 1 },
  categoryModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  categoryModalIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
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
  accountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
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
