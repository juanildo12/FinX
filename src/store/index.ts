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
  Category,
  Account,
  Plan,
  CategoryBudget,
  ReadyToAssign,
} from '../types';
import { mockTransactions, mockCards, mockGoals, mockDebts, mockAlerts, mockBudgets } from '../services/mockData';
import { ALL_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

const storage = createJSONStorage(() => AsyncStorage);

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

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Accounts
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>, id?: string) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateAccountBalance: (id: string, amount: number) => void;
  setDefaultAccount: (id: string) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Plan / Budgeting (YNAB-style)
  plans: Plan[];
  currentPlanId: string | null;
  plan: Plan | null;
  setPlan: (plan: Plan) => void;
  addPlan: (plan: Plan, selectedCategoryIds?: string[]) => void;
  deletePlan: (planId: string) => void;
  setCurrentPlan: (planId: string) => void;
  initializeBudgets: (planId?: string) => void;
  updatePlanIncome: (planId: string, monthlyIncome: number) => void;
  updatePlanSavings: (planId: string, savingsPercentage: number) => void;
  
  // Category Budgets
  categoryBudgets: CategoryBudget[];
  addCategoryBudget: (budget: Omit<CategoryBudget, 'id'>) => void;
  updateCategoryBudget: (id: string, budget: Partial<CategoryBudget>) => void;
  removeCategoryBudget: (categoryId: string) => void;
  assignToCategory: (categoryId: string, amount: number, month: string) => void;
  togglePinned: (categoryId: string) => void;
  coverOverspending: (overspentCategoryId: string, sourceCategoryId: string, amount: number) => void;
  
  // Ready to Assign
  readyToAssign: ReadyToAssign | null;
  setReadyToAssign: (amount: number) => void;
  calculateReadyToAssign: () => number;

  // Sync
  lastSync: string | null;
  setLastSync: (date: string | null) => void;

  // Reset
  resetToDefaults: () => void;
}

const initialSettings: UserSettings = {
  currency: 'USD',
  language: 'es',
  theme: 'light',
  notificationsEnabled: true,
  emailNotifications: true,
  thousandSeparator: '.',
  decimalSeparator: ',',
  voiceAutoSave: false,
  voiceTimeout: 0,
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
        set((state) => {
          const newTransaction = {
            ...transaction,
            id: `txn_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          let updatedAccounts = state.accounts;
          if (transaction.accountId && transaction.type) {
            const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            updatedAccounts = state.accounts.map((a) =>
              a.id === transaction.accountId
                ? { ...a, currentBalance: a.currentBalance + amount }
                : a
            );
          }
          
          return {
            transactions: [newTransaction, ...state.transactions],
            accounts: updatedAccounts,
          };
        }),
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

      // Categories
      categories: ALL_CATEGORIES,
      addCategory: (category) =>
        set((state) => ({
          categories: [
            {
              ...category,
              id: `cat_${Date.now()}`,
            },
            ...state.categories,
          ],
        })),
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      // Accounts
      accounts: [],
      addAccount: (account, id?: string) =>
        set((state) => ({
          accounts: [
            {
              ...account,
              id: id || `acc_${Date.now()}`,
              currentBalance: account.initialBalance,
              createdAt: new Date().toISOString(),
            },
            ...state.accounts,
          ],
        })),
      updateAccount: (id, account) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...account } : a
          ),
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),
      updateAccountBalance: (id, amount) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, currentBalance: a.currentBalance + amount } : a
          ),
        })),
      setDefaultAccount: (id: string) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }
          ),
        })),

      // Settings
      settings: initialSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Plan / Budgeting (YNAB-style) - Multiple plans support
      plans: [],
      currentPlanId: null,
      plan: null,
      setPlan: (plan) => set({ plan }),
      addPlan: (plan, selectedCategoryIds?: string[]) =>
        set((state) => {
          console.log('addPlan called with plan:', plan.id, plan.name);
          console.log('Current categoryBudgets count:', state.categoryBudgets.length);
          
          const currentMonth = new Date().toISOString().slice(0, 7);
          
          const categoryGroups: Record<string, string[]> = {
            Bills: ['housing', 'utilities'],
            Needs: ['food', 'transport', 'health'],
            Wants: ['entertainment', 'shopping', 'education', 'other_expense'],
            Ingresos: ['salary', 'investment', 'gift', 'other_income'],
          };
          
          let categoriesToUse = EXPENSE_CATEGORIES;
          if (selectedCategoryIds && selectedCategoryIds.length > 0) {
            categoriesToUse = EXPENSE_CATEGORIES.filter(cat => selectedCategoryIds.includes(cat.id));
          }
          
          const budgets: CategoryBudget[] = categoriesToUse.map((cat, index) => {
            let group = 'Wants';
            for (const [g, cats] of Object.entries(categoryGroups)) {
              if (cats.includes(cat.id)) {
                group = g;
                break;
              }
            }
            
            return {
              id: `budget_${cat.id}_${currentMonth}_${plan.id}`,
              categoryId: cat.id,
              planId: plan.id,
              month: currentMonth,
              group,
              assignedThisMonth: 0,
              available: 0,
              spent: 0,
              pinned: true,
            };
          });
          
          const savingsAmount = plan.monthlyIncome * (plan.savingsPercentage / 100);
          const availableAmount = plan.monthlyIncome - savingsAmount;
          
          const readyToAssign: ReadyToAssign = {
            id: `rta_${plan.id}`,
            planId: plan.id,
            month: currentMonth,
            amount: availableAmount,
          };
          
          return {
            plans: [...state.plans, plan],
            currentPlanId: plan.id,
            plan: plan,
            categoryBudgets: [...state.categoryBudgets, ...budgets],
            readyToAssign,
          };
        }),
      deletePlan: (planId) =>
        set((state) => {
          const newPlans = state.plans.filter(p => p.id !== planId);
          const newCurrentPlanId = state.currentPlanId === planId 
            ? (newPlans[0]?.id || null) 
            : state.currentPlanId;
          return {
            plans: newPlans,
            currentPlanId: newCurrentPlanId,
            plan: newCurrentPlanId ? newPlans.find(p => p.id === newCurrentPlanId) || null : null,
          };
        }),
      setCurrentPlan: (planId) =>
        set((state) => {
          const selectedPlan = state.plans.find(p => p.id === planId);
          return {
            currentPlanId: planId,
            plan: selectedPlan || null,
          };
        }),
      updatePlanIncome: (planId, monthlyIncome) =>
        set((state) => {
          const updatedPlans = state.plans.map(p =>
            p.id === planId ? { ...p, monthlyIncome } : p
          );
          const currentPlan = state.plan?.id === planId
            ? { ...state.plan, monthlyIncome }
            : state.plan;
          return {
            plans: updatedPlans,
            plan: currentPlan,
          };
        }),
      updatePlanSavings: (planId, savingsPercentage) =>
        set((state) => {
          const updatedPlans = state.plans.map(p =>
            p.id === planId ? { ...p, savingsPercentage } : p
          );
          const currentPlan = state.plan?.id === planId
            ? { ...state.plan, savingsPercentage }
            : state.plan;
          return {
            plans: updatedPlans,
            plan: currentPlan,
          };
        }),
      initializeBudgets: (planId) =>
        set((state) => {
          const seenBudgets = new Map<string, CategoryBudget>();
          state.categoryBudgets.forEach(budget => {
            const key = `${budget.categoryId}_${budget.planId}_${budget.month}`;
            if (!seenBudgets.has(key)) {
              seenBudgets.set(key, budget);
            }
          });
          
          const deduplicatedBudgets = Array.from(seenBudgets.values());
          
          if (deduplicatedBudgets.length !== state.categoryBudgets.length) {
            console.log('Deduplicated categoryBudgets:', state.categoryBudgets.length, '->', deduplicatedBudgets.length);
            return { ...state, categoryBudgets: deduplicatedBudgets };
          }
          
          if (state.categoryBudgets.length > 0 && state.plan) {
            return state;
          }

          let targetPlanId = planId || state.currentPlanId;
          
          if (!targetPlanId && state.plans.length > 0) {
            targetPlanId = state.plans[0].id;
          }
          
          const existingPlan = targetPlanId 
            ? state.plans.find(p => p.id === targetPlanId)
            : null;
          
          const currentMonth = new Date().toISOString().slice(0, 7);
          
          let planToUse = existingPlan;
          if (!planToUse) {
            // No crear plan automáticamente - el usuario debe crearlo manualmente
            return {
              ...state,
              categoryBudgets: deduplicatedBudgets,
            };
          }
          
          const newPlans = state.plans.some(p => p.id === planToUse!.id)
            ? state.plans
            : [...state.plans, planToUse];
          
          const categoryGroups: Record<string, string[]> = {
            Bills: ['housing', 'utilities'],
            Needs: ['food', 'transport', 'health'],
            Wants: ['entertainment', 'shopping', 'education', 'other_expense'],
            Ingresos: ['salary', 'investment', 'gift', 'other_income'],
          };
          
          const categoriesToUse = state.categories.length > 0 ? state.categories.filter(c => c.type === 'expense') : EXPENSE_CATEGORIES;
          
          const budgets: CategoryBudget[] = categoriesToUse.map((cat) => {
            let group = 'Wants';
            for (const [g, cats] of Object.entries(categoryGroups)) {
              if (cats.includes(cat.id)) {
                group = g;
                break;
              }
            }
            
            return {
              id: `budget_${cat.id}_${currentMonth}_${planToUse!.id}`,
              categoryId: cat.id,
              planId: planToUse!.id,
              month: currentMonth,
              group,
              assignedThisMonth: 0,
              available: 0,
              spent: 0,
              pinned: false,
            };
          });
          
          const readyToAssign: ReadyToAssign = {
            id: `rta_${planToUse.id}`,
            planId: planToUse.id,
            month: currentMonth,
            amount: 0,
          };
          
          return {
            plans: newPlans,
            currentPlanId: planToUse.id,
            plan: planToUse,
            categoryBudgets: budgets,
            readyToAssign,
          };
        }),

      // Category Budgets
      categoryBudgets: [],
      addCategoryBudget: (budget) =>
        set((state) => ({
          categoryBudgets: [
            {
              ...budget,
              id: `cbudget_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            },
            ...state.categoryBudgets,
          ],
        })),
      updateCategoryBudget: (id, budget) =>
        set((state) => ({
          categoryBudgets: state.categoryBudgets.map((b) =>
            b.id === id ? { ...b, ...budget } : b
          ),
        })),
      assignToCategory: (categoryId, amount, month) =>
        set((state) => {
          const currentMonth = month || new Date().toISOString().slice(0, 7);
          const existingBudget = state.categoryBudgets.find(
            (b) => b.categoryId === categoryId && b.month === currentMonth
          );
          
          if (existingBudget) {
            return {
              categoryBudgets: state.categoryBudgets.map((b) =>
                b.id === existingBudget.id
                  ? {
                      ...b,
                      assignedThisMonth: b.assignedThisMonth + amount,
                      available: b.available + amount,
                    }
                  : b
              ),
              readyToAssign: state.readyToAssign
                ? {
                    ...state.readyToAssign,
                    amount: Math.max(state.readyToAssign.amount - amount, 0),
                  }
                : null,
            };
          }
          
          return state;
        }),
      togglePinned: (categoryId) =>
        set((state) => {
          const updated = state.categoryBudgets.map((b) => {
            if (b.categoryId === categoryId) {
              return { ...b, pinned: !b.pinned };
            }
            return b;
          });
          return { categoryBudgets: updated };
        }),
      removeCategoryBudget: (categoryId) =>
        set((state) => ({
          categoryBudgets: state.categoryBudgets.filter(b => b.categoryId !== categoryId),
        })),
      coverOverspending: (overspentCategoryId, sourceCategoryId, amount) =>
        set((state) => {
          const currentMonth = new Date().toISOString().slice(0, 7);
          
          const newReadyToAssign = sourceCategoryId === 'ready_to_assign'
            ? Math.max((state.readyToAssign?.amount || 0) - amount, 0)
            : state.readyToAssign?.amount || 0;
          
          return {
            categoryBudgets: state.categoryBudgets.map((b) => {
              if (b.categoryId === overspentCategoryId && b.month === currentMonth) {
                return {
                  ...b,
                  available: b.available + amount,
                };
              }
              if (b.categoryId === sourceCategoryId && b.month === currentMonth && sourceCategoryId !== 'ready_to_assign') {
                return {
                  ...b,
                  available: b.available - amount,
                };
              }
              return b;
            }),
            readyToAssign: state.readyToAssign
              ? { ...state.readyToAssign, amount: newReadyToAssign }
              : null,
          };
        }),

      // Ready to Assign
      readyToAssign: null,
      setReadyToAssign: (amount) =>
        set((state) => ({
          readyToAssign: state.readyToAssign
            ? { ...state.readyToAssign, amount }
            : {
                id: 'rta_default',
                planId: state.plan?.id || 'plan_default',
                month: new Date().toISOString().slice(0, 7),
                amount,
              },
        })),
      calculateReadyToAssign: () => 0,

      // Sync
      lastSync: null,
      setLastSync: (date) => set({ lastSync: date }),

      // Reset - App completamente limpia
      resetToDefaults: () =>
        set({
          transactions: [],
          creditCards: [],
          goals: [],
          debts: [],
          alerts: [],
          budgets: [],
          taxCoupons: [],
          categories: ALL_CATEGORIES,
          accounts: [
            {
              id: 'acc_default',
              name: 'Billetera',
              type: 'cash' as const,
              institution: undefined,
              initialBalance: 0,
              currentBalance: 0,
              color: '#10B981',
              icon: 'wallet',
              createdAt: new Date().toISOString(),
              isDefault: true,
            },
          ],
          settings: initialSettings,
          lastSync: null,
          plans: [],
          plan: null,
          currentPlanId: null,
          categoryBudgets: [],
          readyToAssign: null,
        }),
    }),
    {
      name: 'vixo-storage',
      storage: storage,
      partialize: (state) => ({
        transactions: state.transactions,
        creditCards: state.creditCards,
        goals: state.goals,
        debts: state.debts,
        alerts: state.alerts,
        budgets: state.budgets,
        taxCoupons: state.taxCoupons,
        categories: state.categories,
        accounts: state.accounts,
        settings: state.settings,
        lastSync: state.lastSync,
        theme: state.theme,
        plan: state.plan,
        plans: state.plans,
        currentPlanId: state.currentPlanId,
        categoryBudgets: state.categoryBudgets,
        readyToAssign: state.readyToAssign,
      }),
    }
  )
);
