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

export const calculateFinancialHealth = (
  transactions: Transaction[],
  debts: Debt[],
  cards: CreditCard[],
  goals: FinancialGoal[]
): FinancialHealth => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyDebtPayments = debts
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + d.monthlyPayment, 0);
  
  const totalCardLimit = cards.reduce((sum, c) => sum + c.limit, 0);
  const totalCardBalance = cards.reduce((sum, c) => sum + c.currentBalance, 0);
  
  const availableSavings = monthlyIncome - monthlyExpenses - monthlyDebtPayments;
  
  const debtRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
  const savingsRatio = monthlyIncome > 0 ? (availableSavings / monthlyIncome) * 100 : 0;
  const cardUsageRatio = totalCardLimit > 0 ? (totalCardBalance / totalCardLimit) * 100 : 0;
  
  let overallScore: FinancialHealth['overallScore'] = 'good';
  if (debtRatio > 50 || savingsRatio < 5 || cardUsageRatio > 80) {
    overallScore = 'poor';
  } else if (debtRatio > 30 || savingsRatio < 15 || cardUsageRatio > 50) {
    overallScore = 'fair';
  } else if (debtRatio < 20 && savingsRatio > 20 && cardUsageRatio < 40) {
    overallScore = 'excellent';
  }
  
  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyDebtPayments,
    availableSavings,
    debtRatio,
    savingsRatio,
    cardUsageRatio,
    overallScore,
  };
};

export const evaluateDecision = (
  health: FinancialHealth,
  decisionType: 'vehicle' | 'home' | 'trip' | 'experience',
  estimatedCost: number
): DecisionEvaluation => {
  const monthlyPayment = estimatedCost / 60;
  const monthsToSave = health.availableSavings > 0 ? Math.ceil(estimatedCost / health.availableSavings) : 999;
  
  const canAffordMonthly = health.availableSavings > monthlyPayment;
  const hasLowDebt = health.debtRatio < 40;
  const hasGoodSavings = health.savingsRatio > 15;
  const hasLowCardUsage = health.cardUsageRatio < 50;
  
  const canAfford = canAffordMonthly && hasLowDebt;
  const isReady = canAfford && hasGoodSavings && hasLowCardUsage;
  
  let confidence = 0;
  if (hasLowDebt) confidence += 30;
  if (hasGoodSavings) confidence += 30;
  if (hasLowCardUsage) confidence += 20;
  if (health.availableSavings > estimatedCost * 0.2) confidence += 20;
  
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
  } else if (health.debtRatio > 50) {
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
