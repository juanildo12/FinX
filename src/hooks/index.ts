import { useMemo } from 'react';
import { useAppStore } from '../store';
import { getTheme, Theme } from '../theme';
import { formatCurrency as formatCurrencyUtil } from '../utils';

export const useTheme = (): Theme => {
  const theme = useAppStore((state) => state.theme);
  return useMemo(() => getTheme(theme), [theme]);
};

export const useCurrency = () => {
  const settings = useAppStore((state) => state.settings);
  const currency = settings.currency || 'USD';
  const thousandSeparator = settings.thousandSeparator || '.';
  const decimalSeparator = settings.decimalSeparator || ',';
  
  const formatCurrency = (amount: number): string => {
    return formatCurrencyUtil(amount, currency, thousandSeparator, decimalSeparator);
  };

  return {
    currency,
    thousandSeparator,
    decimalSeparator,
    formatCurrency,
  };
};

export const useTransactions = () => {
  const transactions = useAppStore((state) => state.transactions);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const updateTransaction = useAppStore((state) => state.updateTransaction);
  const deleteTransaction = useAppStore((state) => state.deleteTransaction);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};

export const useCreditCards = () => {
  const creditCards = useAppStore((state) => state.creditCards);
  const addCreditCard = useAppStore((state) => state.addCreditCard);
  const updateCreditCard = useAppStore((state) => state.updateCreditCard);
  const deleteCreditCard = useAppStore((state) => state.deleteCreditCard);

  return {
    creditCards,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
  };
};

export const useGoals = () => {
  const goals = useAppStore((state) => state.goals);
  const addGoal = useAppStore((state) => state.addGoal);
  const updateGoal = useAppStore((state) => state.updateGoal);
  const deleteGoal = useAppStore((state) => state.deleteGoal);
  const contributeToGoal = useAppStore((state) => state.contributeToGoal);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
  };
};

export const useDebts = () => {
  const debts = useAppStore((state) => state.debts);
  const addDebt = useAppStore((state) => state.addDebt);
  const updateDebt = useAppStore((state) => state.updateDebt);
  const deleteDebt = useAppStore((state) => state.deleteDebt);
  const payDebt = useAppStore((state) => state.payDebt);

  return {
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    payDebt,
  };
};

export const useAlerts = () => {
  const alerts = useAppStore((state) => state.alerts);
  const addAlert = useAppStore((state) => state.addAlert);
  const updateAlert = useAppStore((state) => state.updateAlert);
  const deleteAlert = useAppStore((state) => state.deleteAlert);
  const completeAlert = useAppStore((state) => state.completeAlert);

  return {
    alerts,
    addAlert,
    updateAlert,
    deleteAlert,
    completeAlert,
  };
};

export const useBudgets = () => {
  const budgets = useAppStore((state) => state.budgets);
  const addBudget = useAppStore((state) => state.addBudget);
  const updateBudget = useAppStore((state) => state.updateBudget);
  const deleteBudget = useAppStore((state) => state.deleteBudget);

  return {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
  };
};

export const useTaxCoupons = () => {
  const taxCoupons = useAppStore((state) => state.taxCoupons);
  const addTaxCoupon = useAppStore((state) => state.addTaxCoupon);
  const updateTaxCoupon = useAppStore((state) => state.updateTaxCoupon);
  const deleteTaxCoupon = useAppStore((state) => state.deleteTaxCoupon);

  return {
    taxCoupons,
    addTaxCoupon,
    updateTaxCoupon,
    deleteTaxCoupon,
  };
};

export const useSettings = () => {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  return {
    settings,
    updateSettings,
    theme,
    setTheme,
  };
};

export const useSync = () => {
  const lastSync = useAppStore((state) => state.lastSync);
  const setLastSync = useAppStore((state) => state.setLastSync);

  const syncNow = () => {
    setLastSync(new Date().toISOString());
  };

  return {
    lastSync,
    syncNow,
  };
};

export const useCategories = () => {
  const categories = useAppStore((state) => state.categories);
  const addCategory = useAppStore((state) => state.addCategory);
  const updateCategory = useAppStore((state) => state.updateCategory);
  const deleteCategory = useAppStore((state) => state.deleteCategory);

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return {
    categories,
    incomeCategories,
    expenseCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};

export const useAccounts = () => {
  const accounts = useAppStore((state) => state.accounts);
  const addAccount = useAppStore((state) => state.addAccount);
  const updateAccount = useAppStore((state) => state.updateAccount);
  const deleteAccount = useAppStore((state) => state.deleteAccount);
  const updateAccountBalance = useAppStore((state) => state.updateAccountBalance);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return {
    accounts,
    totalBalance,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountBalance,
  };
};

export { useVoiceRecognition } from './useVoiceRecognition';
