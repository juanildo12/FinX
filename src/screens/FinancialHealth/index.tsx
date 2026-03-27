import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button, ProgressBar } from '../../components/atoms';
import { useTheme, useTransactions, useDebts, useCreditCards, useGoals, useCurrency } from '../../hooks';
import { calculateFinancialHealth, evaluateDecision, getHealthColor, getHealthLabel, 
  getDebtToIncomeColor, getDebtToIncomeLabel,
  getSavingsRateColor, getSavingsRateLabel,
  getBalanceRateColor, getBalanceRateLabel,
  getCreditUtilizationColor, getCreditUtilizationLabel,
  getEmergencyFundColor, getEmergencyFundLabel } from '../../utils/financialHealth';

interface FinancialHealthScreenProps {
  navigation: any;
}

const decisions = [
  { id: 'vehicle', name: 'Comprar vehículo', icon: 'car-outline', costRange: [15000, 50000] },
  { id: 'home', name: 'Comprar vivienda', icon: 'home-outline', costRange: [100000, 500000] },
  { id: 'trip', name: 'Planificar viaje', icon: 'airplane-outline', costRange: [2000, 8000] },
  { id: 'experience', name: 'Experiencia/Resort', icon: 'happy-outline', costRange: [1000, 5000] },
];

const FinancialHealthScreen: React.FC<FinancialHealthScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactions();
  const { debts } = useDebts();
  const { creditCards } = useCreditCards();
  const { goals } = useGoals();
  const { formatCurrency } = useCurrency();
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const health = useMemo(() => 
    calculateFinancialHealth(transactions, debts, creditCards, goals), 
    [transactions, debts, creditCards, goals]
  );

  const scoreColors: Record<string, string> = {
    excellent: '#22C55E',
    good: '#10B981',
    fair: '#F59E0B',
    poor: '#EF4444',
  };

  const handleEvaluate = (decisionId: string, cost?: number) => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return;
    
    const avgCost = (decision.costRange[0] + decision.costRange[1]) / 2;
    const evaluation = evaluateDecision(health, decisionId as any, cost || avgCost);
    
    Alert.alert(
      evaluation.isReady ? 'Listo para hacerlo' : 'Espera un momento',
      evaluation.recommendation,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ height: insets.top }} />
      
      <Card style={styles.disclaimerCard}>
        <Ionicons name="information-circle-outline" size={20} color={theme.colors.secondary} />
        <Text variant="caption" style={{ flex: 1, marginLeft: 8 }}>
          Esta evaluacion es orientativa. No constituye asesoria financiera profesional.
        </Text>
      </Card>

      <Card style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text variant="caption" color={theme.colors.textMuted}>Tu salud financiera</Text>
          <View style={[styles.scoreBadge, { backgroundColor: scoreColors[health.overallScore] + '20' }]}>
            <Text variant="body" style={{ color: scoreColors[health.overallScore], fontWeight: '600', textTransform: 'capitalize' }}>
              {health.overallScore}
            </Text>
          </View>
        </View>
        
        <Text variant="h1" style={{ marginVertical: 12 }}>
          {health.availableSavings >= 0 ? '+' : ''}{formatCurrency(health.availableSavings)}
        </Text>
        <Text variant="caption" color={theme.colors.textMuted}>
          Disponible este mes
        </Text>
      </Card>

      <Text variant="h3" style={styles.sectionTitle}>Indicadores clave (últimos 3 meses)</Text>

      <Card style={styles.indicatorCard}>
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorInfo}>
            <Ionicons name="trending-down-outline" size={24} color={getDebtToIncomeColor(health.debtToIncomeRatio)} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Deuda-Ingreso</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Deuda total / Ingreso promedio</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getDebtToIncomeColor(health.debtToIncomeRatio) }}>
              {health.debtToIncomeRatio.toFixed(0)}%
            </Text>
            <Text variant="small" color={getDebtToIncomeColor(health.debtToIncomeRatio)}>
              {getDebtToIncomeLabel(health.debtToIncomeRatio)}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.debtToIncomeRatio, 100)} 
          color={getDebtToIncomeColor(health.debtToIncomeRatio)}
          style={{ marginTop: 12 }}
        />
        <View style={styles.indicatorDetail}>
          <Text variant="caption" color={theme.colors.textMuted}>
            Deuda total: {formatCurrency(health.totalDebtRemaining)} / Ingreso promedio: {formatCurrency(health.avgMonthlyIncome)}
          </Text>
        </View>
      </Card>

      <Card style={styles.indicatorCard}>
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorInfo}>
            <Ionicons name="wallet-outline" size={24} color={getSavingsRateColor(health.savingsRate)} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Tasa de Ahorro</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Metas / Ingresos 3 meses</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getSavingsRateColor(health.savingsRate) }}>
              {health.savingsRate.toFixed(0)}%
            </Text>
            <Text variant="small" color={getSavingsRateColor(health.savingsRate)}>
              {getSavingsRateLabel(health.savingsRate)}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.savingsRate, 100)} 
          color={getSavingsRateColor(health.savingsRate)}
          style={{ marginTop: 12 }}
        />
        <View style={styles.indicatorDetail}>
          <Text variant="caption" color={theme.colors.textMuted}>
            Metas acumuladas: {formatCurrency(health.totalGoalsAmount)}
          </Text>
        </View>
      </Card>

      <Card style={styles.indicatorCard}>
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorInfo}>
            <Ionicons name="swap-horizontal-outline" size={24} color={getBalanceRateColor(health.monthlyBalanceRate)} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Balance Mensual</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Ingreso - Gastos / Ingreso</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getBalanceRateColor(health.monthlyBalanceRate) }}>
              {health.monthlyBalanceRate.toFixed(0)}%
            </Text>
            <Text variant="small" color={getBalanceRateColor(health.monthlyBalanceRate)}>
              {getBalanceRateLabel(health.monthlyBalanceRate)}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(Math.abs(health.monthlyBalanceRate), 100)} 
          color={getBalanceRateColor(health.monthlyBalanceRate)}
          style={{ marginTop: 12 }}
        />
        <View style={styles.indicatorDetail}>
          <Text variant="caption" color={theme.colors.textMuted}>
            Te sobra: {formatCurrency(health.avgMonthlyIncome * health.monthlyBalanceRate / 100)} de promedio por mes
          </Text>
        </View>
      </Card>

      <Card style={styles.indicatorCard}>
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorInfo}>
            <Ionicons name="card-outline" size={24} color={getCreditUtilizationColor(health.creditUtilization)} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Uso de Crédito</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Saldo usado / Límite total</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getCreditUtilizationColor(health.creditUtilization) }}>
              {health.creditUtilization.toFixed(0)}%
            </Text>
            <Text variant="small" color={getCreditUtilizationColor(health.creditUtilization)}>
              {getCreditUtilizationLabel(health.creditUtilization)}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.creditUtilization, 100)} 
          color={getCreditUtilizationColor(health.creditUtilization)}
          style={{ marginTop: 12 }}
        />
        <View style={styles.indicatorDetail}>
          <Text variant="caption" color={theme.colors.textMuted}>
            Usado: {formatCurrency(health.totalCreditUsed)} / Límite: {formatCurrency(health.totalCreditLimit)}
          </Text>
        </View>
      </Card>

      <Card style={styles.indicatorCard}>
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorInfo}>
            <Ionicons name="shield-checkmark-outline" size={24} color={getEmergencyFundColor(health.emergencyFundMonths)} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Fondo de Emergencia</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Meses de gastos cubiertos</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getEmergencyFundColor(health.emergencyFundMonths) }}>
              {health.emergencyFundMonths.toFixed(1)}
            </Text>
            <Text variant="small" color={getEmergencyFundColor(health.emergencyFundMonths)}>
              {getEmergencyFundLabel(health.emergencyFundMonths)}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.emergencyFundMonths / 6 * 100, 100)} 
          color={getEmergencyFundColor(health.emergencyFundMonths)}
          style={{ marginTop: 12 }}
        />
        <View style={styles.indicatorDetail}>
          <Text variant="caption" color={theme.colors.textMuted}>
            {health.emergencyFundMonths >= 3 ? 'Cubierto ✓' : `Necesitas ${(3 - health.emergencyFundMonths).toFixed(1)} meses más`}
          </Text>
        </View>
      </Card>

      <Text variant="h3" style={styles.sectionTitle}>¿Puedes permitirte?</Text>

      {decisions.map((decision) => (
        <Card key={decision.id} style={styles.decisionCard}>
          <TouchableOpacity 
            style={styles.decisionRow}
            onPress={() => handleEvaluate(decision.id)}
          >
            <View style={styles.decisionInfo}>
              <View style={[styles.decisionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name={decision.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600' }}>{decision.name}</Text>
                <Text variant="caption" color={theme.colors.textMuted}>
                  {formatCurrency(decision.costRange[0])} - {formatCurrency(decision.costRange[1])}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.decisionActions}>
            <Button 
              title="Evaluar" 
              variant="primary" 
              size="small"
              onPress={() => handleEvaluate(decision.id)}
            />
          </View>
        </Card>
      ))}

      <View style={{ height: insets.bottom + 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#EFF6FF',
  },
  scoreCard: {
    margin: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  indicatorCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorValue: {
    alignItems: 'flex-end',
  },
  indicatorDetail: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  decisionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  decisionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  decisionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default FinancialHealthScreen;
