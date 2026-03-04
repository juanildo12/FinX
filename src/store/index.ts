import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Transaction,
  CreditCard,
  FinancialGoal,
  Debt,
  Alert,
  Budget,
  TaxCoupon,
  UserSettings,
  ThemeMode,
} from '../types';
import { mockTransactions, mockCards, mockGoals, mockDebts, mockAlerts, mockBudgets } from '../services/mockData';

interface AppState {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Credit Cards
  creditCards: CreditCard[];
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;

  // Goals
  goals: FinancialGoal[];
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  // Debts
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  payDebt: (id: string, amount: number) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  updateAlert: (id: string, alert: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  completeAlert: (id: string) => void;

  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Tax Coupons
  taxCoupons: TaxCoupon[];
  addTaxCoupon: (coupon: Omit<TaxCoupon, 'id' | 'createdAt'>) => void;
  updateTaxCoupon: (id: string, coupon: Partial<TaxCoupon>) => void;
  deleteTaxCoupon: (id: string) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Sync
  lastSync: string | null;
  setLastSync: (date: string) => void;

  // Reset
  resetToDefaults: () => void;
}

const initialSettings: UserSettings = {
  currency: 'USD',
  language: 'es',
  theme: 'light',
  notificationsEnabled: true,
  emailNotifications: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Transactions
      transactions: mockTransactions,
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            {
              ...transaction,
              id: `txn_${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        })),
      updateTransaction: (id, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...transaction, updatedAt: new Date().toISOString() }
              : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      // Credit Cards
      creditCards: mockCards,
      addCreditCard: (card) =>
        set((state) => ({
          creditCards: [
            {
              ...card,
              id: `card_${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.creditCards,
          ],
        })),
      updateCreditCard: (id, card) =>
        set((state) => ({
          creditCards: state.creditCards.map((c) =>
            c.id === id ? { ...c, ...card } : c
          ),
        })),
      deleteCreditCard: (id) =>
        set((state) => ({
          creditCards: state.creditCards.filter((c) => c.id !== id),
        })),

      // Goals
      goals: mockGoals,
      addGoal: (goal) =>
        set((state) => ({
          goals: [
            {
              ...goal,
              id: `goal_${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.goals,
          ],
        })),
      updateGoal: (id, goal) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...goal } : g
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
      contributeToGoal: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  currentAmount: Math.min(g.currentAmount + amount, g.targetAmount),
                  status:
                    g.currentAmount + amount >= g.targetAmount
                      ? 'completed'
                      : 'active',
                }
              : g
          ),
        })),

      // Debts
      debts: mockDebts,
      addDebt: (debt) =>
        set((state) => ({
          debts: [
            {
              ...debt,
              id: `debt_${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.debts,
          ],
        })),
      updateDebt: (id, debt) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, ...debt } : d
          ),
        })),
      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),
      payDebt: (id, amount) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id
              ? {
                  ...d,
                  remainingAmount: Math.max(d.remainingAmount - amount, 0),
                  status: d.remainingAmount - amount <= 0 ? 'paid' : 'active',
                }
              : d
          ),
        })),

      // Alerts
      alerts: mockAlerts,
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            {
              ...alert,
              id: `alert_${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.alerts,
          ],
        })),
      updateAlert: (id, alert) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, ...alert } : a
          ),
        })),
      deleteAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),
      completeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, isCompleted: true } : a
          ),
        })),

      // Budgets
      budgets: mockBudgets,
      addBudget: (budget) =>
        set((state) => ({
          budgets: [
            {
              ...budget,
              id: `budget_${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.budgets,
          ],
        })),
      updateBudget: (id, budget) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...budget } : b
          ),
        })),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),

      // Tax Coupons
      taxCoupons: [],
      addTaxCoupon: (coupon) =>
        set((state) => ({
          taxCoupons: [
            {
              ...coupon,
              id: `coupon_${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.taxCoupons,
          ],
        })),
      updateTaxCoupon: (id, coupon) =>
        set((state) => ({
          taxCoupons: state.taxCoupons.map((c) =>
            c.id === id ? { ...c, ...coupon } : c
          ),
        })),
      deleteTaxCoupon: (id) =>
        set((state) => ({
          taxCoupons: state.taxCoupons.filter((c) => c.id !== id),
        })),

      // Settings
      settings: initialSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Sync
      lastSync: null,
      setLastSync: (date) => set({ lastSync: date }),

      // Reset
      resetToDefaults: () =>
        set({
          transactions: mockTransactions,
          creditCards: mockCards,
          goals: mockGoals,
          debts: mockDebts,
          alerts: mockAlerts,
          budgets: mockBudgets,
          taxCoupons: [],
          settings: initialSettings,
          lastSync: null,
        }),
    }),
    {
      name: 'finx-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
