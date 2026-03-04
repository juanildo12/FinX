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
