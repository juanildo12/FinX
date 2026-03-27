import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Card, Button, ProgressBar } from '../../components/atoms';
import { useTheme, useTransactions, useDebts, useCreditCards, useGoals, useCurrency } from '../../hooks';
import { calculateFinancialHealth, evaluateDecision } from '../../utils/financialHealth';

interface FinancialHealthScreenProps {
  navigation: any;
}

const decisions = [
  { id: 'vehicle', name: 'Comprar vehículo', icon: 'car-outline', costRange: [15000, 50000] },
  { id: 'home', name: 'Comprar vivienda', icon: 'home-outline', costRange: [100000, 500000] },
  { id: 'trip', name: 'Planificar viaje', icon: 'airplane-outline', costRange: [2000, 8000] },
  { id: 'experience', name: 'Experiencia/Resort', icon: 'happy-outline', costRange: [1000, 5000] },
];

const getStatusColor = (status: 'pass' | 'partial' | 'fail'): string => {
  if (status === 'pass') return '#22C55E';
  if (status === 'partial') return '#F59E0B';
  return '#EF4444';
};

const getStatusIcon = (status: 'pass' | 'partial' | 'fail'): string => {
  if (status === 'pass') return '✓';
  if (status === 'partial') return '⚠';
  return '✗';
};

const getDebtStatus = (ratio: number): 'pass' | 'partial' | 'fail' => {
  if (ratio < 50) return 'pass';
  if (ratio < 75) return 'partial';
  return 'fail';
};

const getSavingsStatus = (rate: number): 'pass' | 'partial' | 'fail' => {
  if (rate > 20) return 'pass';
  if (rate > 10) return 'partial';
  return 'fail';
};

const getCreditStatus = (utilization: number): 'pass' | 'partial' | 'fail' => {
  if (utilization < 50) return 'pass';
  if (utilization < 75) return 'partial';
  return 'fail';
};

const getEmergencyStatus = (months: number): 'pass' | 'partial' | 'fail' => {
  if (months >= 3) return 'pass';
  if (months >= 1) return 'partial';
  return 'fail';
};

const calculateNumericScore = (health: any): number => {
  let score = 0;
  
  if (health.debtToIncomeRatio < 50) score += 20;
  else if (health.debtToIncomeRatio < 75) score += 12;
  else if (health.debtToIncomeRatio < 100) score += 6;
  
  if (health.monthlyBalanceRate > 20) score += 20;
  else if (health.monthlyBalanceRate > 10) score += 15;
  else if (health.monthlyBalanceRate > 5) score += 10;
  else if (health.monthlyBalanceRate > 0) score += 5;
  
  if (health.creditUtilization < 50) score += 20;
  else if (health.creditUtilization < 75) score += 12;
  
  if (health.emergencyFundMonths >= 6) score += 20;
  else if (health.emergencyFundMonths >= 3) score += 15;
  else if (health.emergencyFundMonths >= 1) score += 10;
  
  if (health.savingsRate > 20) score += 20;
  else if (health.savingsRate > 10) score += 15;
  else if (health.savingsRate > 5) score += 10;
  else if (health.savingsRate > 0) score += 5;
  
  return Math.min(100, Math.max(0, score));
};

const getScoreColor = (score: number): string => {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#F59E0B';
  if (score >= 55) return '#F97316';
  return '#EF4444';
};

const getScoreLabel = (score: number): string => {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Saludable';
  if (score >= 55) return 'Advertencia';
  return 'Crítico';
};

const getScoreColorDark = (score: number): string => {
  if (score >= 85) return '#16A34A';
  if (score >= 70) return '#D97706';
  if (score >= 55) return '#EA580C';
  return '#DC2626';
};

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
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  const health = useMemo(() => 
    calculateFinancialHealth(transactions, debts, creditCards, goals), 
    [transactions, debts, creditCards, goals]
  );

  const handleDecisionPress = (decisionId: string) => {
    setSelectedDecision(decisionId);
    setShowDecisionModal(true);
  };

  const selectedDecisionData = decisions.find(d => d.id === selectedDecision);
  const avgCost = selectedDecisionData ? (selectedDecisionData.costRange[0] + selectedDecisionData.costRange[1]) / 2 : 0;
  const evaluation = selectedDecision ? evaluateDecision(health, selectedDecision as any, avgCost) : null;

  const criteria = [
    {
      name: 'Deuda/Ingreso',
      value: health.debtToIncomeRatio,
      max: 100,
      status: getDebtStatus(health.debtToIncomeRatio),
      message: health.debtToIncomeRatio < 50 ? 'Nivel de deuda aceptable' : health.debtToIncomeRatio < 75 ? 'Deuda moderada' : 'Deuda elevada',
    },
    {
      name: 'Tasa de ahorro',
      value: health.savingsRate,
      max: 50,
      status: getSavingsStatus(health.savingsRate),
      message: health.savingsRate > 20 ? 'Tienes buen ahorro' : health.savingsRate > 10 ? 'Ahorro moderado' : 'Ahorro bajo',
    },
    {
      name: 'Uso de crédito',
      value: health.creditUtilization,
      max: 100,
      status: getCreditStatus(health.creditUtilization),
      message: health.creditUtilization < 50 ? 'Uso de crédito saludable' : health.creditUtilization < 75 ? 'Crédito moderado' : 'Crédito elevado',
    },
    {
      name: 'Fondo emergencia',
      value: health.emergencyFundMonths,
      max: 6,
      status: getEmergencyStatus(health.emergencyFundMonths),
      message: health.emergencyFundMonths >= 3 ? 'Fondo cubierto' : `Necesitas ${(3 - health.emergencyFundMonths).toFixed(1)} meses más`,
    },
  ];

  const passCount = criteria.filter(c => c.status === 'pass').length;
  const getOverallStatus = () => {
    if (passCount === 4) return { label: 'LISTO', color: '#22C55E' };
    if (passCount >= 2) return { label: 'CASI LISTO', color: '#F59E0B' };
    return { label: 'NO RECOMENDADO', color: '#EF4444' };
  };
  const overallStatus = getOverallStatus();

  const getSteps = () => {
    const steps: string[] = [];
    
    criteria.forEach(c => {
      if (c.status === 'fail' || c.status === 'partial') {
        if (c.name === 'Tasa de ahorro') {
          steps.push('Aumenta tu tasa de ahorro al menos al 15% durante 6-12 meses');
        }
        if (c.name === 'Deuda/Ingreso') {
          steps.push('Reduce tu nivel de deuda actual antes de asumir un nuevo crédito');
        }
        if (c.name === 'Fondo emergencia') {
          steps.push('Construye un fondo de emergencia de al menos 6 meses de gastos');
        }
        if (c.name === 'Uso de crédito') {
          steps.push('Reduce el uso de tus tarjetas de crédito');
        }
      }
    });
    
    if (steps.length === 0) {
      steps.push('Mantén tu situación financiera actual');
      steps.push('Continúa con tu plan de ahorro');
    }
    
    return steps;
  };
  const steps = getSteps();

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

  const numericScore = calculateNumericScore(health);
  const scoreColor = getScoreColor(numericScore);
  const scoreColorDark = getScoreColorDark(numericScore);
  const scoreLabel = getScoreLabel(numericScore);

  const pieData = [
    { name: 'Score', population: numericScore, color: '#FFFFFF' },
    { name: 'Rest', population: Math.max(100 - numericScore, 0), color: '#FFFFFF30' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ height: insets.top }} />
      
      <Card style={styles.disclaimerCard}>
        <Ionicons name="information-circle-outline" size={20} color={theme.colors.secondary} />
        <Text variant="caption" style={{ flex: 1, marginLeft: 8 }}>
          Esta evaluacion es orientativa. No constituye asesoria financiera profesional.
        </Text>
      </Card>

      <LinearGradient
        colors={[scoreColor, scoreColorDark]}
        style={styles.scoreCard}
      >
        <View style={styles.scoreHeader}>
          <Text variant="body" style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Salud financiera actual</Text>
          <View style={[styles.scoreBadge, { backgroundColor: '#FFFFFF30' }]}>
            <Text variant="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
              {scoreLabel}
            </Text>
          </View>
        </View>
        
        <View style={styles.scoreContent}>
          <View style={styles.scoreLeft}>
            <Text variant="h1" style={{ color: '#FFFFFF', marginVertical: 8 }}>
              {health.availableSavings >= 0 ? '+' : ''}{formatCurrency(health.availableSavings)}
            </Text>
            <Text variant="caption" style={{ color: '#FFFFFF80' }}>
              Disponible este mes
            </Text>
          </View>
          
          <View style={styles.scoreRight}>
            <View style={styles.pieWrapper}>
              <View style={[styles.progressCircle, { borderColor: '#FFFFFF30' }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      borderColor: '#FFFFFF',
                      transform: [{ rotate: `${(numericScore / 100) * 360 - 45}deg` }]
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressFill2,
                    { 
                      borderColor: '#FFFFFF',
                      transform: [{ rotate: `${Math.max((numericScore / 100) * 360 - 135, 0)}deg` }]
                    }
                  ]} 
                />
              </View>
              <View style={styles.scoreNumberOverlay}>
                <Text variant="h3" style={{ color: '#FFFFFF' }}>{numericScore}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Text variant="h3" style={styles.sectionTitle}>Indicadores clave (últimos 3 meses)</Text>

      <Card style={styles.indicatorCard}>
        <View style={styles.indicatorRow}>
          <View style={styles.indicatorInfo}>
            <Ionicons name="trending-down-outline" size={24} color={getStatusColor(getDebtStatus(health.debtToIncomeRatio))} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Deuda-Ingreso</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Deuda total / Ingreso promedio</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getStatusColor(getDebtStatus(health.debtToIncomeRatio)) }}>
              {health.debtToIncomeRatio.toFixed(0)}%
            </Text>
            <Text variant="small" color={getStatusColor(getDebtStatus(health.debtToIncomeRatio))}>
              {getStatusIcon(getDebtStatus(health.debtToIncomeRatio))}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.debtToIncomeRatio, 100)} 
          color={getStatusColor(getDebtStatus(health.debtToIncomeRatio))}
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
            <Ionicons name="wallet-outline" size={24} color={getStatusColor(getSavingsStatus(health.savingsRate))} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Tasa de Ahorro</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Metas / Ingresos 3 meses</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getStatusColor(getSavingsStatus(health.savingsRate)) }}>
              {health.savingsRate.toFixed(0)}%
            </Text>
            <Text variant="small" color={getStatusColor(getSavingsStatus(health.savingsRate))}>
              {getStatusIcon(getSavingsStatus(health.savingsRate))}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.savingsRate, 100)} 
          color={getStatusColor(getSavingsStatus(health.savingsRate))}
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
            <Ionicons name="swap-horizontal-outline" size={24} color={getStatusColor(getCreditStatus(health.creditUtilization))} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Uso de Crédito</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Saldo usado / Límite total</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getStatusColor(getCreditStatus(health.creditUtilization)) }}>
              {health.creditUtilization.toFixed(0)}%
            </Text>
            <Text variant="small" color={getStatusColor(getCreditStatus(health.creditUtilization))}>
              {getStatusIcon(getCreditStatus(health.creditUtilization))}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.creditUtilization, 100)} 
          color={getStatusColor(getCreditStatus(health.creditUtilization))}
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
            <Ionicons name="shield-checkmark-outline" size={24} color={getStatusColor(getEmergencyStatus(health.emergencyFundMonths))} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Fondo de Emergencia</Text>
              <Text variant="caption" color={theme.colors.textMuted}>Meses de gastos cubiertos</Text>
            </View>
          </View>
          <View style={styles.indicatorValue}>
            <Text variant="h3" style={{ color: getStatusColor(getEmergencyStatus(health.emergencyFundMonths)) }}>
              {health.emergencyFundMonths.toFixed(1)}
            </Text>
            <Text variant="small" color={getStatusColor(getEmergencyStatus(health.emergencyFundMonths))}>
              {getStatusIcon(getEmergencyStatus(health.emergencyFundMonths))}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={Math.min(health.emergencyFundMonths / 6 * 100, 100)} 
          color={getStatusColor(getEmergencyStatus(health.emergencyFundMonths))}
          style={{ marginTop: 12 }}
        />
        <View style={styles.indicatorDetail}>
          <Text variant="caption" color={theme.colors.textMuted}>
            {health.emergencyFundMonths >= 3 ? 'Cubierto ✓' : `Necesitas ${(3 - health.emergencyFundMonths).toFixed(1)} meses más`}
          </Text>
        </View>
      </Card>

      <Text variant="h3" style={styles.sectionTitle}>¿Puedes permitirte?</Text>
      <Text variant="caption" color={theme.colors.textMuted} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        Evalúa si estás listo para grandes decisiones
      </Text>

      <View style={styles.decisionGrid}>
        {decisions.map((decision) => (
          <TouchableOpacity
            key={decision.id}
            style={styles.decisionGridItem}
            onPress={() => handleDecisionPress(decision.id)}
          >
            <Card style={styles.decisionCardInner}>
              <View style={[styles.decisionIconLarge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name={decision.icon as any} size={32} color={theme.colors.primary} />
              </View>
              <Text variant="body" style={{ fontWeight: '600', marginTop: 8, textAlign: 'center' }}>{decision.name}</Text>
              <Text variant="caption" color={theme.colors.textMuted} style={{ textAlign: 'center' }}>
                {formatCurrency(decision.costRange[0])}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.metricsPanel}>
        <Text variant="h3" style={{ marginBottom: 12 }}>Tu situación actual</Text>
        <View style={styles.metricsRow}>
          <Card style={styles.metricCardSmall}>
            <Text variant="caption" color={theme.colors.textMuted}>Ingresos</Text>
            <Text variant="body" style={{ fontWeight: '600', color: '#22C55E' }}>
              {formatCurrency(health.avgMonthlyIncome)}
            </Text>
          </Card>
          <Card style={styles.metricCardSmall}>
            <Text variant="caption" color={theme.colors.textMuted}>Gastos</Text>
            <Text variant="body" style={{ fontWeight: '600', color: '#EF4444' }}>
              {formatCurrency(health.avgMonthlyExpenses)}
            </Text>
          </Card>
          <Card style={styles.metricCardSmall}>
            <Text variant="caption" color={theme.colors.textMuted}>Balance</Text>
            <Text variant="body" style={{ fontWeight: '600', color: health.avgMonthlyIncome - health.avgMonthlyExpenses >= 0 ? '#22C55E' : '#EF4444' }}>
              {formatCurrency(health.avgMonthlyIncome - health.avgMonthlyExpenses)}
            </Text>
          </Card>
        </View>
        <Card style={styles.debtMetricCard}>
          <View style={styles.debtMetricHeader}>
            <Text variant="body" style={{ fontWeight: '600' }}>Deuda total</Text>
            <Text variant="body" color={theme.colors.textMuted}>
              {formatCurrency(health.totalDebtRemaining)} ({health.debtToIncomeRatio.toFixed(0)}%)
            </Text>
          </View>
          <ProgressBar 
            progress={Math.min(health.debtToIncomeRatio, 100)} 
            color={getStatusColor(getDebtStatus(health.debtToIncomeRatio))}
            style={{ marginTop: 8 }}
          />
        </Card>
      </View>

      <Modal
        visible={showDecisionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDecisionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDecisionModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text variant="h3" style={{ flex: 1, textAlign: 'center' }}>{selectedDecisionData?.name}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Card style={styles.modalInfoCard}>
                <Text variant="caption" color={theme.colors.textMuted}>
                  💰 Rango: {formatCurrency(selectedDecisionData?.costRange[0] || 0)} - {formatCurrency(selectedDecisionData?.costRange[1] || 0)}
                </Text>
                <Text variant="caption" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                  📊 Estimado mensual: {formatCurrency(avgCost / 60)} (a 60 meses)
                </Text>
              </Card>

              <Text variant="h3" style={{ marginVertical: 16 }}>Tu situación actual vs. esta decisión</Text>

              {criteria.map((criterion, index) => (
                <Card key={index} style={styles.criterionCard}>
                  <View style={styles.criterionRow}>
                    <Text style={{ fontSize: 18, color: getStatusColor(criterion.status), width: 30 }}>
                      {getStatusIcon(criterion.status)}
                    </Text>
                    <View style={styles.criterionContent}>
                      <View style={styles.criterionHeader}>
                        <Text variant="body" style={{ fontWeight: '600' }}>{criterion.name}</Text>
                        <Text variant="body" style={{ color: getStatusColor(criterion.status) }}>
                          {criterion.value.toFixed(0)}% {criterion.name === 'Fondo emergencia' ? 'meses' : ''}
                        </Text>
                      </View>
                      <View style={styles.criterionBarBg}>
                        <View 
                          style={[
                            styles.criterionBarFill, 
                            { 
                              width: `${Math.min((criterion.value / criterion.max) * 100, 100)}%`,
                              backgroundColor: getStatusColor(criterion.status)
                            }
                          ]} 
                        />
                      </View>
                      <Text variant="caption" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                        {criterion.message}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}

              <Card style={[styles.verdictCard, { backgroundColor: overallStatus.color + '15' }]}>
                <Text variant="h2" style={{ color: overallStatus.color, textAlign: 'center' }}>
                  {overallStatus.label}
                </Text>
                <Text variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
                  {evaluation?.recommendation}
                </Text>
              </Card>

              <Text variant="h3" style={{ marginTop: 16, marginBottom: 8 }}>Pasos a seguir</Text>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <Text variant="body" style={{ fontWeight: '600', width: 24 }}>{index + 1}.</Text>
                  <Text variant="body" style={{ flex: 1 }}>{step}</Text>
                </View>
              ))}

              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16 }]}>
              <Button 
                title="Entendido" 
                variant="primary" 
                fullWidth
                onPress={() => setShowDecisionModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

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
    padding: 16,
    borderRadius: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  scoreLeft: {
    flex: 1,
  },
  scoreRight: {
    marginLeft: 16,
  },
  pieWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressFill2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
  },
  scoreNumberOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
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
  decisionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  decisionGridItem: {
    width: '48%',
    marginBottom: 12,
  },
  decisionCardInner: {
    padding: 16,
    alignItems: 'center',
  },
  decisionIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsPanel: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCardSmall: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  debtMetricCard: {
    marginTop: 12,
    padding: 16,
  },
  debtMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalContent: {
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalInfoCard: {
    padding: 12,
    marginBottom: 8,
  },
  criterionCard: {
    padding: 12,
    marginBottom: 8,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  criterionContent: {
    flex: 1,
    marginLeft: 12,
  },
  criterionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criterionBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  criterionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  verdictCard: {
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
});

export default FinancialHealthScreen;
