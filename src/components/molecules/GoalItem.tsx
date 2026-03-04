import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '../atoms';
import { useTheme, useCurrency } from '../../hooks';
import { FinancialGoal } from '../../types';
import { getProgressPercentage, getDaysUntil } from '../../utils';

interface GoalItemProps {
  goal: FinancialGoal;
  onPress?: () => void;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  travel: 'airplane-outline',
  emergency: 'medkit-outline',
  technology: 'laptop-outline',
  education: 'school-outline',
  car: 'car-outline',
  home: 'home-outline',
  other: 'flag-outline',
};

export const GoalItem: React.FC<GoalItemProps> = ({
  goal,
  onPress,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
  const daysLeft = getDaysUntil(goal.deadline);
  const iconName = categoryIcons[goal.category] || 'flag-outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name={iconName} size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.headerContent}>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {goal.name}
            </Text>
            <Text variant="caption">
              {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            {goal.status === 'completed' && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            )}
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.amountRow}>
            <Text variant="body" color={theme.colors.primary} style={{ fontWeight: '600' }}>
              {formatCurrency(goal.currentAmount)}
            </Text>
            <Text variant="caption">
              de {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.colors.border },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: progress >= 100 ? theme.colors.success : theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text variant="small" color={theme.colors.textMuted}>
              {progress}%
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  statusContainer: {
    marginLeft: 8,
  },
  progressSection: {
    marginTop: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
