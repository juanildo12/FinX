import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '../atoms';
import { useTheme, useCurrency } from '../../hooks';
import { CreditCard } from '../../types';
import { getProgressPercentage } from '../../utils';

interface CardItemProps {
  card: CreditCard;
  onPress?: () => void;
}

const brandIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  visa: 'card-outline',
  mastercard: 'card-outline',
  amex: 'card-outline',
  other: 'card-outline',
};

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onPress,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const usagePercentage = getProgressPercentage(card.currentBalance, card.limit);
  const availableAmount = card.limit - card.currentBalance;
  const brandIcon = brandIcons[card.brand] || 'card-outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card style={{ backgroundColor: card.color, padding: 20, marginBottom: 16 }}>
        <View style={styles.header}>
          <Text variant="bodyLarge" color="#FFFFFF" style={{ fontWeight: '600' }}>
            {card.name}
          </Text>
          <Ionicons name={brandIcon} size={24} color="#FFFFFF" />
        </View>

        <View style={styles.numberContainer}>
          <Text variant="body" color="#FFFFFF" style={{ letterSpacing: 2 }}>
            .... .... .... {card.lastFourDigits}
          </Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text variant="small" color="#FFFFFF" style={{ opacity: 0.8 }}>
              Limite
            </Text>
            <Text variant="body" color="#FFFFFF" style={{ fontWeight: '600' }}>
              {formatCurrency(card.limit)}
            </Text>
          </View>
          <View>
            <Text variant="small" color="#FFFFFF" style={{ opacity: 0.8 }}>
              Disponible
            </Text>
            <Text variant="body" color="#FFFFFF" style={{ fontWeight: '600' }}>
              {formatCurrency(availableAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(usagePercentage, 100)}%`,
                  backgroundColor: usagePercentage > 80 ? '#EF4444' : usagePercentage > 50 ? '#F59E0B' : '#FFFFFF',
                },
              ]}
            />
          </View>
          <Text variant="small" color="#FFFFFF" style={{ opacity: 0.8 }}>
            {usagePercentage}% usado
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  numberContainer: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
