import { Transaction, Debt, CreditCard, FinancialGoal } from '../types';

export interface FinancialHealth {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtPayments: number;
  availableSavings: number;
  debtRatio: number;
  savingsRatio: number;
  cardUsageRatio: number;
  overallScore: 'excellent' | 'good' | 'fair' | 'poor';
  // Nuevas métricas
  debtToIncomeRatio: number;
  savingsRate: number;
  monthlyBalanceRate: number;
  creditUtilization: number;
  emergencyFundMonths: number;
  // Detalles adicionales
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  totalDebtRemaining: number;
  totalGoalsAmount: number;
  totalCreditUsed: number;
  totalCreditLimit: number;
}

export interface DecisionEvaluation {
  decision: string;
  isReady: boolean;
  confidence: number;
  recommendation: string;
  details: {
    canAfford: boolean;
    monthlyPayment: number;
    monthsToSave: number;
    risk: 'low' | 'medium' | 'high';
  };
}

const getTransactionsLast3Months = (transactions: Transaction[]): Transaction[] => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return transactions.filter(t => new Date(t.date) >= threeMonthsAgo);
};

const getTransactionsLastNMonths = (transactions: Transaction[], months: number): Transaction[] => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return transactions.filter(t => new Date(t.date) >= date);
};

const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateFinancialHealth = (
  transactions: Transaction[],
  debts: Debt[],
  cards: CreditCard[],
  goals: FinancialGoal[]
): FinancialHealth => {
  // Transacciones últimos 3 meses para promedios
  const last3MonthsTransactions = getTransactionsLast3Months(transactions);
  
  // Transacciones del mes actual
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  // === INGRESOS ===
  const currentMonthIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const last3MonthsIncome = last3MonthsTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Ingreso promedio mensual (usando 3 meses)
  const incomeMonths = getUniqueMonths(last3MonthsTransactions.filter(t => t.type === 'income'));
  const avgMonthlyIncome = incomeMonths.length > 0 ? last3MonthsIncome / incomeMonths.length : last3MonthsIncome / 3;
  
  // === GASTOS ===
  const currentMonthExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const last3MonthsExpenses = last3MonthsTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Gasto promedio mensual
  const expenseMonths = getUniqueMonths(last3MonthsTransactions.filter(t => t.type === 'expense'));
  const avgMonthlyExpenses = expenseMonths.length > 0 ? last3MonthsExpenses / expenseMonths.length : last3MonthsExpenses / 3;
  
  // === DEUDAS ===
  const activeDebts = debts.filter(d => d.status === 'active');
  const totalDebtRemaining = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
  
  // === TARJETAS ===
  const totalCardLimit = cards.reduce((sum, c) => sum + c.limit, 0);
  const totalCardBalance = cards.reduce((sum, c) => sum + c.currentBalance, 0);
  
  // === METAS ===
  const totalGoalsAmount = goals
    .filter(g => g.status === 'active')
    .reduce((sum, g) => sum + g.currentAmount, 0);
  
  // === CÁLCULOS PRINCIPALES ===
  
  // 1. Deuda/Ingreso: (deuda total / ingreso promedio) × 100
  const debtToIncomeRatio = avgMonthlyIncome > 0 ? (totalDebtRemaining / avgMonthlyIncome) * 100 : 0;
  
  // 2. Tasa de ahorro: (total metas / ingresos 3 meses) × 100
  const savingsRate = last3MonthsIncome > 0 ? (totalGoalsAmount / last3MonthsIncome) * 100 : 0;
  
  // 3. Balance mensual: ((ingreso - gasto) / ingreso promedio) × 100
  const monthlyBalance = avgMonthlyIncome - avgMonthlyExpenses;
  const monthlyBalanceRate = avgMonthlyIncome > 0 ? (monthlyBalance / avgMonthlyIncome) * 100 : 0;
  
  // 4. Uso de crédito: (crédito usado / límite total) × 100
  const creditUtilization = totalCardLimit > 0 ? (totalCardBalance / totalCardLimit) * 100 : 0;
  
  // 5. Fondo emergencia: total metas / gasto promedio mensual (meses cubiertos)
  const emergencyFundMonths = avgMonthlyExpenses > 0 ? totalGoalsAmount / avgMonthlyExpenses : 0;
  
  // === MÉTRICAS LEGACY ===
  const availableSavings = currentMonthIncome - currentMonthExpenses;
  const debtRatio = debtToIncomeRatio;
  const savingsRatio = avgMonthlyIncome > 0 ? (monthlyBalance / avgMonthlyIncome) * 100 : 0;
  const cardUsageRatio = creditUtilization;
  
  // === SCORE GENERAL ===
  let overallScore: FinancialHealth['overallScore'] = 'good';
  if (debtToIncomeRatio > 100 || monthlyBalanceRate < 0 || creditUtilization > 80) {
    overallScore = 'poor';
  } else if (debtToIncomeRatio > 50 || monthlyBalanceRate < 10 || creditUtilization > 50) {
    overallScore = 'fair';
  } else if (debtToIncomeRatio < 50 && monthlyBalanceRate > 20 && creditUtilization < 40 && emergencyFundMonths >= 3) {
    overallScore = 'excellent';
  }
  
  return {
    monthlyIncome: currentMonthIncome,
    monthlyExpenses: currentMonthExpenses,
    monthlyDebtPayments: totalDebtRemaining,
    availableSavings,
    debtRatio,
    savingsRatio,
    cardUsageRatio,
    overallScore,
    // Nuevas métricas
    debtToIncomeRatio,
    savingsRate,
    monthlyBalanceRate,
    creditUtilization,
    emergencyFundMonths,
    // Detalles adicionales
    avgMonthlyIncome,
    avgMonthlyExpenses,
    totalDebtRemaining,
    totalGoalsAmount,
    totalCreditUsed: totalCardBalance,
    totalCreditLimit: totalCardLimit,
  };
};

const getUniqueMonths = (transactions: Transaction[]): string[] => {
  const months = new Set<string>();
  transactions.forEach(t => {
    months.add(t.date.slice(0, 7));
  });
  return Array.from(months);
};

export const evaluateDecision = (
  health: FinancialHealth,
  decisionType: 'vehicle' | 'home' | 'trip' | 'experience',
  estimatedCost: number
): DecisionEvaluation => {
  const monthlyPayment = estimatedCost / 60;
  const monthsToSave = health.monthlyBalanceRate > 0 ? Math.ceil(estimatedCost / (health.avgMonthlyIncome * health.monthlyBalanceRate / 100)) : 999;
  
  const canAffordMonthly = health.monthlyBalanceRate > 0 && (health.avgMonthlyIncome * health.monthlyBalanceRate / 100) > monthlyPayment;
  const hasLowDebt = health.debtToIncomeRatio < 75;
  const hasGoodSavings = health.savingsRate > 15 || health.emergencyFundMonths >= 3;
  const hasLowCardUsage = health.creditUtilization < 50;
  
  const canAfford = canAffordMonthly && hasLowDebt;
  const isReady = canAfford && hasGoodSavings && hasLowCardUsage;
  
  let confidence = 0;
  if (hasLowDebt) confidence += 30;
  if (hasGoodSavings) confidence += 30;
  if (hasLowCardUsage) confidence += 20;
  if (health.emergencyFundMonths >= 6) confidence += 20;
  
  let recommendation = '';
  let risk: DecisionEvaluation['details']['risk'] = 'low';
  
  if (isReady) {
    recommendation = '¡Tu situación financiera te permite asumir este compromiso! Continúa con tu plan.';
  } else if (canAffordMonthly && !hasGoodSavings) {
    recommendation = 'Puedes asumir el pago mensual, pero te recomendamos ahorrar antes para tener un colchón financiero.';
    risk = 'medium';
  } else if (!canAffordMonthly && monthsToSave <= 12) {
    recommendation = `Te sugerimos esperar ${monthsToSave} meses para ahorrar y mejorar tu capacidad de pago.`;
    risk = 'medium';
  } else if (health.debtToIncomeRatio > 100) {
    recommendation = 'Tu nivel de endeudamiento es elevado. Te recomendamos reducir tus deudas antes de asumir nuevos compromisos.';
    risk = 'high';
  } else {
    recommendation = 'Actualmente no es el mejor momento. Te sugerimos mejorar tu salud financiera antes de tomar esta decisión.';
    risk = 'high';
  }
  
  return {
    decision: decisionType,
    isReady,
    confidence: Math.min(confidence, 100),
    recommendation,
    details: {
      canAfford,
      monthlyPayment,
      monthsToSave: Math.min(monthsToSave, 999),
      risk,
    },
  };
};

export const getHealthColor = (ratio: number, type: 'debt' | 'savings' | 'cards'): string => {
  if (type === 'debt') {
    if (ratio < 30) return '#22C55E';
    if (ratio < 50) return '#F59E0B';
    return '#EF4444';
  }
  if (type === 'savings') {
    if (ratio > 20) return '#22C55E';
    if (ratio > 10) return '#F59E0B';
    return '#EF4444';
  }
  if (type === 'cards') {
    if (ratio < 50) return '#22C55E';
    if (ratio < 80) return '#F59E0B';
    return '#EF4444';
  }
  return '#64748B';
};

export const getHealthLabel = (ratio: number, type: 'debt' | 'savings' | 'cards'): string => {
  if (type === 'debt') {
    if (ratio < 30) return 'Saludable';
    if (ratio < 50) return 'Moderado';
    return 'Elevado';
  }
  if (type === 'savings') {
    if (ratio > 20) return 'Excelente';
    if (ratio > 10) return 'Aceptable';
    return 'Bajo';
  }
  if (type === 'cards') {
    if (ratio < 50) return 'Bueno';
    if (ratio < 80) return 'Moderado';
    return 'Excesivo';
  }
  return 'N/A';
};

export interface AgeOfMoneyResult {
  days: number;
  level: 'excelent' | 'good' | 'fair' | 'poor' | 'verypoor';
  description: string;
}

export const calculateAgeOfMoney = (transactions: Transaction[]): AgeOfMoneyResult => {
  if (transactions.length === 0) {
    return { days: 0, level: 'verypoor', description: 'Sin transacciones' };
  }

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const incomeEvents: { date: Date; amount: number; remaining: number }[] = [];
  const spendingDays: number[] = [];

  for (const txn of sortedTransactions) {
    const txnDate = new Date(txn.date);

    if (txn.type === 'income') {
      incomeEvents.push({
        date: txnDate,
        amount: txn.amount,
        remaining: txn.amount,
      });
    } else if (txn.type === 'expense') {
      let remainingExpense = txn.amount;

      for (let i = incomeEvents.length - 1; i >= 0 && remainingExpense > 0; i--) {
        const income = incomeEvents[i];
        if (income.remaining > 0) {
          const covered = Math.min(income.remaining, remainingExpense);
          const daysSinceIncome = Math.floor(
            (txnDate.getTime() - income.date.getTime()) / (1000 * 60 * 60 * 24)
          );
          spendingDays.push(daysSinceIncome);
          income.remaining -= covered;
          remainingExpense -= covered;
        }
      }
    }
  }

  if (spendingDays.length === 0) {
    const hasIncome = transactions.some((t) => t.type === 'income');
    if (hasIncome) {
      return { days: 0, level: 'excelent', description: 'Sin gastos registrados' };
    }
    return { days: 0, level: 'verypoor', description: 'Sin ingresos registrados' };
  }

  const avgDays = Math.round(spendingDays.reduce((a, b) => a + b, 0) / spendingDays.length);

  let level: AgeOfMoneyResult['level'];
  let description: string;

  if (avgDays >= 30) {
    level = 'excelent';
    description = 'Excelente - Tienes tiempo para decidir';
  } else if (avgDays >= 14) {
    level = 'good';
    description = 'Bueno - Buena capacidad de decisión';
  } else if (avgDays >= 7) {
    level = 'fair';
    description = 'Regular - Considera incrementar ingresos';
  } else if (avgDays >= 1) {
    level = 'poor';
    description = 'Bajo - money gastada rápidamente';
  } else {
    level = 'verypoor';
    description = 'Muy bajo - dinero apenas entra y sale';
  }

  return { days: avgDays, level, description };
};

export const getAgeOfMoneyColor = (days: number): string => {
  if (days >= 30) return '#22C55E';
  if (days >= 14) return '#10B981';
  if (days >= 7) return '#F59E0B';
  if (days >= 1) return '#F97316';
  return '#EF4444';
};

export const getAgeOfMoneyLabel = (level: AgeOfMoneyResult['level']): string => {
  switch (level) {
    case 'excelent':
      return 'Excelente';
    case 'good':
      return 'Bueno';
    case 'fair':
      return 'Regular';
    case 'poor':
      return 'Bajo';
    case 'verypoor':
      return 'Muy bajo';
    default:
      return 'N/A';
  }
};

// Nuevas funciones para métricas de 3 meses

export const getDebtToIncomeColor = (ratio: number): string => {
  if (ratio < 50) return '#22C55E';
  if (ratio < 100) return '#F59E0B';
  return '#EF4444';
};

export const getDebtToIncomeLabel = (ratio: number): string => {
  if (ratio < 50) return 'Saludable';
  if (ratio < 100) return 'Moderado';
  return 'Elevado';
};

export const getSavingsRateColor = (rate: number): string => {
  if (rate > 20) return '#22C55E';
  if (rate > 10) return '#F59E0B';
  return '#EF4444';
};

export const getSavingsRateLabel = (rate: number): string => {
  if (rate > 20) return 'Excelente';
  if (rate > 10) return 'Aceptable';
  return 'Bajo';
};

export const getBalanceRateColor = (rate: number): string => {
  if (rate > 20) return '#22C55E';
  if (rate > 10) return '#F59E0B';
  if (rate > 0) return '#F59E0B';
  return '#EF4444';
};

export const getBalanceRateLabel = (rate: number): string => {
  if (rate > 20) return 'Sobresaliente';
  if (rate > 10) return 'Bueno';
  if (rate > 0) return 'Aceptable';
  return 'Negativo';
};

export const getCreditUtilizationColor = (ratio: number): string => {
  if (ratio < 50) return '#22C55E';
  if (ratio < 80) return '#F59E0B';
  return '#EF4444';
};

export const getCreditUtilizationLabel = (ratio: number): string => {
  if (ratio < 50) return 'Bueno';
  if (ratio < 80) return 'Moderado';
  return 'Excesivo';
};

export const getEmergencyFundColor = (months: number): string => {
  if (months >= 6) return '#22C55E';
  if (months >= 3) return '#F59E0B';
  return '#EF4444';
};

export const getEmergencyFundLabel = (months: number): string => {
  if (months >= 6) return 'Sólido';
  if (months >= 3) return 'Mínimo';
  return 'Insuficiente';
};
