import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Badge } from '../atoms';
import { useTheme } from '../../hooks';
import { Alert } from '../../types';
import { formatDate, getDaysUntil } from '../../utils';

interface AlertItemProps {
  alert: Alert;
  onPress?: () => void;
  onComplete?: () => void;
}

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  payment: 'card-outline',
  budget: 'bar-chart-outline',
  goal: 'flag-outline',
  debt: 'cash-outline',
};

const typeColors: Record<string, string> = {
  payment: '#3B82F6',
  budget: '#F59E0B',
  goal: '#10B981',
  debt: '#EF4444',
};

export const AlertItem: React.FC<AlertItemProps> = ({
  alert,
  onPress,
  onComplete,
}) => {
  const theme = useTheme();
  const daysLeft = getDaysUntil(alert.dueDate);
  const typeColor = typeColors[alert.type] || theme.colors.primary;
  const iconName = typeIcons[alert.type] || 'notifications-outline';
  const isOverdue = daysLeft < 0 && !alert.isCompleted;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card style={alert.isCompleted ? styles.completedCard : undefined}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
            <Ionicons name={iconName} size={20} color={typeColor} />
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text
                variant="body"
                style={{ fontWeight: '600', flex: 1 }}
                numberOfLines={1}
              >
                {alert.title}
              </Text>
              {alert.isCompleted && (
                <Badge label="Completada" backgroundColor={theme.colors.success + '20'} color={theme.colors.success} />
              )}
            </View>

            <Text variant="caption" numberOfLines={2} style={{ marginTop: 4 }}>
              {alert.description}
            </Text>

            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Text
                  variant="small"
                  color={isOverdue ? theme.colors.error : theme.colors.textMuted}
                >
                  {isOverdue
                    ? `Vencida hace ${Math.abs(daysLeft)} dias`
                    : daysLeft === 0
                    ? 'Hoy'
                    : `En ${daysLeft} dias`}
                </Text>
              </View>

              <View style={styles.notifications}>
                {alert.notifyPush && <Ionicons name="notifications-outline" size={16} color={theme.colors.textMuted} />}
                {alert.notifyEmail && <Ionicons name="mail-outline" size={16} color={theme.colors.textMuted} />}
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completedCard: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {},
  notifications: {
    flexDirection: 'row',
    gap: 8,
  },
});
