import { Transaction, CashFlowData, MonthlySummary, Category } from '../types';
import { SHORT_MONTHS, ALL_CATEGORIES } from '../constants';

export const formatCurrency = (amount: number, currency: string = 'USD', thousandSeparator: string = '.', decimalSeparator: string = ','): string => {
  const fixed = amount.toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');
  
  let formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  formatted = formatted + decimalSeparator + decimalPart;
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    ARS: '$',
    MXN: '$',
    CLP: '$',
    BRL: 'R$',
    COP: '$',
    PEN: 'S/',
    UYU: '$',
    PYG: '₲',
    BOB: 'Bs',
    VES: 'Bs',
    DOP: 'RD$',
    CAD: '$',
    AUD: '$',
    CHF: 'Fr',
    KRW: '₩',
    INR: '₹',
    RUB: '₽',
    ZAR: 'R',
    SGD: '$',
    HKD: '$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    NZD: '$',
    AED: 'د.إ',
    SAR: '﷼',
    TRY: '₺',
    PLN: 'zł',
    THB: '฿',
    PHP: '₱',
    IDR: 'Rp',
    MYR: 'RM',
    VND: '₫',
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${formatted}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

export const getMonthYear = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMonthName = (monthIndex: number): string => {
  return SHORT_MONTHS[monthIndex];
};

export const calculateMonthlySummary = (
  transactions: Transaction[],
  month: string
): MonthlySummary => {
  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(month));

  const income = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    month,
    income,
    expenses,
    savings: income - expenses,
  };
};

export const getCashFlowData = (
  transactions: Transaction[],
  year: number
): CashFlowData[] => {
  const data: CashFlowData[] = [];

  for (let month = 0; month < 12; month++) {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const summary = calculateMonthlySummary(transactions, monthStr);
    data.push({
      month: SHORT_MONTHS[month],
      income: summary.income,
      expenses: summary.expenses,
    });
  }

  return data;
};

export const getExpensesByCategory = (
  transactions: Transaction[],
  month: string
): { category: string; amount: number; color: string }[] => {
  const expenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(month)
  );

  const categoryMap = new Map<string, number>();

  expenses.forEach((t) => {
    const current = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, current + t.amount);
  });

  const categoryColors: Record<string, string> = {
    food: '#F59E0B',
    transport: '#EF4444',
    housing: '#8B5CF6',
    utilities: '#3B82F6',
    entertainment: '#EC4899',
    health: '#10B981',
    education: '#6366F1',
    shopping: '#F97316',
    other_expense: '#64748B',
  };

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] || '#64748B',
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getTransactionsByDate = (
  transactions: Transaction[]
): Map<string, Transaction[]> => {
  const grouped = new Map<string, Transaction[]>();

  transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach((t) => {
      const date = t.date;
      const existing = grouped.get(date) || [];
      grouped.set(date, [...existing, t]);
    });

  return grouped;
};

export const validateAmount = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const getProgressPercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

export const getDaysUntil = (dateString: string): number => {
  const target = new Date(dateString);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCategoryInfo = (categoryId: string): Category | undefined => {
  return ALL_CATEGORIES.find((c) => c.id === categoryId);
};

export { parseVoiceTransaction } from './voiceParser';
