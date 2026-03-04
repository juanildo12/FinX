import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../atoms';
import { useTheme, useCurrency } from '../../hooks';
import { Transaction } from '../../types';
import { formatDateShort, getCategoryInfo } from '../../utils';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  showDate?: boolean;
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

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  showDate = true,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const isExpense = transaction.type === 'expense';
  const iconName = iconMap[transaction.category] || 'help-circle-outline';
  const categoryInfo = getCategoryInfo(transaction.category);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.container}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: (categoryInfo?.color || theme.colors.primary) + '20' },
        ]}
      >
        <Ionicons 
          name={iconName} 
          size={22} 
          color={categoryInfo?.color || theme.colors.primary} 
        />
      </View>
      <View style={styles.content}>
        <Text variant="body" numberOfLines={1}>
          {transaction.description || categoryInfo?.name || transaction.category}
        </Text>
        <Text variant="caption">
          {categoryInfo?.name || transaction.category}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text
          variant="body"
          color={isExpense ? theme.colors.expense : theme.colors.income}
          style={{ fontWeight: '600' }}
        >
          {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
        </Text>
        {showDate && (
          <Text variant="small">{formatDateShort(transaction.date)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
});
