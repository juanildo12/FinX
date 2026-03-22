import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Input, Button } from '../../components/atoms';
import { VoiceInputButton } from '../../components/molecules';
import { useTheme, useTransactions, useCurrency, useCategories, useCreditCards, useAccounts, useBudgeting } from '../../hooks';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { validateAmount, getCurrentDate, parseVoiceTransaction } from '../../utils';

interface TransactionFormScreenProps {
  navigation: any;
  route: {
    params?: {
      transaction?: Transaction;
      voiceData?: {
        amount: number | null;
        description: string;
        category: string;
        type: TransactionType;
      };
    };
  }
}

const TransactionFormScreen: React.FC<TransactionFormScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { currency, formatCurrency } = useCurrency();
  const { incomeCategories, expenseCategories } = useCategories();
  const { creditCards } = useCreditCards();
  const { accounts, defaultAccount } = useAccounts();
  const { spendFromCategory, categoryBudgets } = useBudgeting();

  const existingTransaction = route.params?.transaction;
  const voiceData = route.params?.voiceData;
  const isEditing = !!existingTransaction;

  const [type, setType] = useState<TransactionType>(existingTransaction?.type || voiceData?.type || 'expense');
  const [amount, setAmount] = useState(existingTransaction?.amount?.toString() || voiceData?.amount?.toString() || '');
  const [description, setDescription] = useState(existingTransaction?.description || voiceData?.description || '');
  const [category, setCategory] = useState(existingTransaction?.category || voiceData?.category || 'food');
  const [date, setDate] = useState(existingTransaction?.date || getCurrentDate());
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(existingTransaction?.paymentMethod || 'cash');
  const [cardId, setCardId] = useState(existingTransaction?.cardId || '');
  const [accountId, setAccountId] = useState(existingTransaction?.accountId || defaultAccount?.id);
  const [notes, setNotes] = useState(existingTransaction?.tags?.[0] || '');

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const selectedCategory = categories.find(c => c.id === category) || categories[0];

  const handleVoiceTranscript = (text: string) => {
    const parsed = parseVoiceTransaction(text);

    if (parsed.amount) {
      setAmount(parsed.amount.toString());
    }

    if (parsed.description) {
      setDescription(parsed.description);
    }

    if (parsed.category) {
      setCategory(parsed.category);
    }

    if (parsed.type) {
      setType(parsed.type);
    }

    Alert.alert(
      'Transacción por voz',
      `Monto: ${parsed.amount || 'No detectado'}\nCategoría: ${parsed.category}\nDescripción: ${parsed.description}`,
      [{ text: 'OK' }]
    );
  };

  const handleSave = () => {
    if (!validateAmount(amount)) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (!accountId) {
      Alert.alert('Error', 'Por favor selecciona una cuenta');
      return;
    }

    const transactionAmount = parseFloat(amount);
    
    const transactionData = {
      type,
      amount: transactionAmount,
      description: description || '',
      category,
      tags: notes ? [notes] : [],
      date,
      paymentMethod,
      cardId: paymentMethod === 'card' ? cardId : undefined,
      accountId,
    };

    if (isEditing) {
      updateTransaction(existingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
      
      if (type === 'expense') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const categoryBudget = categoryBudgets.find(
          cb => cb.categoryId === category && cb.month === currentMonth
        );
        
        if (categoryBudget) {
          spendFromCategory(category, transactionAmount);
        }
      }
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
        
        <Card style={styles.section}>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: type === 'expense' ? theme.colors.expense : theme.colors.surface,
                  borderColor: type === 'expense' ? theme.colors.expense : theme.colors.border,
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
                  backgroundColor: type === 'income' ? theme.colors.income : theme.colors.surface,
                  borderColor: type === 'income' ? theme.colors.income : theme.colors.border,
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
        </Card>

        <Card style={styles.section}>
          <View style={styles.amountHeader}>
            <Text variant="body" style={{ fontWeight: '600', textAlign: 'center' }}>
              {formatCurrency(parseFloat(amount) || 0)}
            </Text>
            <VoiceInputButton 
              onTranscript={handleVoiceTranscript} 
              size="small" 
              variant="secondary"
            />
          </View>
          <Input 
            label="Monto" 
            placeholder="0.00" 
            value={amount} 
            onChangeText={setAmount} 
            keyboardType="decimal-pad" 
          />
        </Card>

        <Card style={styles.section}>
          <Input label="Descripción" placeholder="Descripción opcional" value={description} onChangeText={setDescription} />
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
                    borderColor: category === cat.id ? cat.color : theme.colors.border 
                  }
                ]} 
                onPress={() => setCategory(cat.id)}
              >
                <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={18} color={category === cat.id ? cat.color : theme.colors.textSecondary} />
                <Text variant="caption" color={category === cat.id ? cat.color : theme.colors.textSecondary} style={{ marginLeft: 6 }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Input label="Fecha" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Método de pago</Text>
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                { 
                  borderColor: paymentMethod === 'cash' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: paymentMethod === 'cash' ? theme.colors.primary + '15' : 'transparent'
                }
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Ionicons name="cash-outline" size={18} color={paymentMethod === 'cash' ? theme.colors.primary : theme.colors.textMuted} />
              <Text variant="caption" color={paymentMethod === 'cash' ? theme.colors.primary : theme.colors.textMuted} style={{ marginLeft: 6 }}>Efectivo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                { 
                  borderColor: paymentMethod === 'card' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: paymentMethod === 'card' ? theme.colors.primary + '15' : 'transparent'
                }
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons name="card-outline" size={18} color={paymentMethod === 'card' ? theme.colors.primary : theme.colors.textMuted} />
              <Text variant="caption" color={paymentMethod === 'card' ? theme.colors.primary : theme.colors.textMuted} style={{ marginLeft: 6 }}>Tarjeta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                { 
                  borderColor: paymentMethod === 'bank_transfer' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: paymentMethod === 'bank_transfer' ? theme.colors.primary + '15' : 'transparent'
                }
              ]}
              onPress={() => setPaymentMethod('bank_transfer')}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={paymentMethod === 'bank_transfer' ? theme.colors.primary : theme.colors.textMuted} />
              <Text variant="caption" color={paymentMethod === 'bank_transfer' ? theme.colors.primary : theme.colors.textMuted} style={{ marginLeft: 6 }}>Transferencia</Text>
            </TouchableOpacity>
          </View>

          {paymentMethod === 'card' && creditCards.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {creditCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.accountChip,
                    { 
                      borderColor: cardId === card.id ? theme.colors.primary : theme.colors.border,
                      backgroundColor: cardId === card.id ? theme.colors.primary + '15' : theme.colors.surface
                    }
                  ]}
                  onPress={() => setCardId(card.id)}
                >
                  <View style={[styles.cardChipDot, { backgroundColor: card.color }]} />
                  <Text variant="caption">•••• {card.lastFourDigits}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Cuenta</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.accountChip,
                  { 
                    borderColor: accountId === acc.id ? theme.colors.primary : theme.colors.border,
                    backgroundColor: accountId === acc.id ? theme.colors.primary + '15' : theme.colors.surface
                  }
                ]}
                onPress={() => setAccountId(acc.id)}
              >
                <View style={[styles.cardChipDot, { backgroundColor: acc.color }]} />
                <Text variant="caption">{acc.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        <Card style={styles.section}>
          <Input label="Notas / Tags" placeholder="Agregar notas o tags" value={notes} onChangeText={setNotes} multiline />
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.actionsFixed, { paddingBottom: insets.bottom + 16, paddingHorizontal: 16, paddingTop: 16, backgroundColor: 'transparent' }]}>
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
  container: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { margin: 16, marginBottom: 0 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  paymentRow: { flexDirection: 'row', gap: 8 },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
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
  cardChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  actionsFixed: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});

export default TransactionFormScreen;
