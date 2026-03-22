import { useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { CategoryBudget } from '../types';
import { getCurrentMonth } from '../utils';

export const useBudgeting = () => {
  const isInitialized = useRef(false);
  
  const plans = useAppStore((state) => state.plans);
  const currentPlanId = useAppStore((state) => state.currentPlanId);
  const plan = useAppStore((state) => state.plan);
  const categoryBudgets = useAppStore((state) => state.categoryBudgets);
  const readyToAssign = useAppStore((state) => state.readyToAssign);
  const transactions = useAppStore((state) => state.transactions);
  const categories = useAppStore((state) => state.categories);
  
  const addPlanFromStore = useAppStore((state) => state.addPlan);
  const setPlan = useAppStore((state) => state.setPlan);
  const setCurrentPlan = useAppStore((state) => state.setCurrentPlan);
  
  const addPlan = (plan: any, selectedCategoryIds?: string[]) => {
    addPlanFromStore(plan, selectedCategoryIds);
  };
  const deletePlan = useAppStore((state) => state.deletePlan);
  const initializeBudgets = useAppStore((state) => state.initializeBudgets);
  const assignToCategory = useAppStore((state) => state.assignToCategory);
  const togglePinned = useAppStore((state) => state.togglePinned);
  const removeCategoryBudget = useAppStore((state) => state.removeCategoryBudget);
  const coverOverspending = useAppStore((state) => state.coverOverspending);
  const setReadyToAssign = useAppStore((state) => state.setReadyToAssign);
  const updateCategoryBudget = useAppStore((state) => state.updateCategoryBudget);
  const addCategoryBudget = useAppStore((state) => state.addCategoryBudget);

  const currentMonth = getCurrentMonth();
  const effectivePlanId = currentPlanId || plan?.id;

  const categoryGroups: Record<string, string[]> = {
    Bills: ['housing', 'utilities'],
    Needs: ['food', 'transport', 'health'],
    Wants: ['entertainment', 'shopping', 'education', 'other_expense'],
    Ingresos: ['salary', 'investment', 'gift', 'other_income'],
  };

  const addCategoryToPlan = (categoryId: string) => {
    if (!effectivePlanId) return;
    
    const existingBudget = currentMonthBudgets.find(
      (cb) => cb.categoryId === categoryId && cb.planId === effectivePlanId
    );
    if (existingBudget) return;

    let group = 'Wants';
    for (const [g, cats] of Object.entries(categoryGroups)) {
      if (cats.includes(categoryId)) {
        group = g;
        break;
      }
    }

    addCategoryBudget({
      categoryId,
      planId: effectivePlanId,
      month: currentMonth,
      group,
      assignedThisMonth: 0,
      available: 0,
      spent: 0,
      pinned: true,
    });
  };

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    initializeBudgets(effectivePlanId || undefined);
  }, []);

  useEffect(() => {
    if (!effectivePlanId) return;
    
    const planBudgets = categoryBudgets.filter(
      cb => cb.planId === effectivePlanId && cb.month === currentMonth
    );
    
    if (planBudgets.length === 0 && plans.some(p => p.id === effectivePlanId)) {
      initializeBudgets(effectivePlanId);
    }
  }, [effectivePlanId, currentMonth, plans]);

  const deduplicatedCategoryBudgets = useMemo(() => {
    const seen = new Map<string, CategoryBudget>();
    categoryBudgets.forEach(budget => {
      const key = `${budget.categoryId}_${budget.planId}_${budget.month}`;
      if (!seen.has(key)) {
        seen.set(key, budget);
      }
    });
    return Array.from(seen.values());
  }, [categoryBudgets]);

  const currentMonthBudgets = useMemo(() => {
    if (!effectivePlanId || deduplicatedCategoryBudgets.length === 0) return deduplicatedCategoryBudgets;
    return deduplicatedCategoryBudgets.filter(
      (cb) => cb.month === currentMonth && cb.planId === effectivePlanId
    );
  }, [deduplicatedCategoryBudgets, currentMonth, effectivePlanId]);

  const overspentCategories = useMemo(() => {
    return currentMonthBudgets.filter((cb) => cb.available < 0);
  }, [currentMonthBudgets]);

  const pinnedCategories = useMemo(() => {
    return currentMonthBudgets.filter((cb) => cb.pinned);
  }, [currentMonthBudgets]);

  const categoriesByGroup = useMemo(() => {
    const groups: Record<string, CategoryBudget[]> = {
      Bills: [],
      Needs: [],
      Wants: [],
      Ingresos: [],
    };
    
    currentMonthBudgets.forEach((cb) => {
      if (groups[cb.group]) {
        groups[cb.group].push(cb);
      } else {
        groups.Wants.push(cb);
      }
    });
    
    return groups;
  }, [currentMonthBudgets]);

  const calculateReadyToAssign = useMemo(() => {
    const monthlyIncome = plan?.monthlyIncome || 0;
    const savingsPercentage = plan?.savingsPercentage || 0;
    const savingsAmount = monthlyIncome * (savingsPercentage / 100);
    const availableForExpenses = monthlyIncome - savingsAmount;
    
    const totalAssigned = currentMonthBudgets.reduce(
      (sum, cb) => sum + cb.assignedThisMonth, 
      0
    );
    
    const totalOverspent = overspentCategories.reduce(
      (sum, cb) => sum + Math.abs(cb.available),
      0
    );
    
    return availableForExpenses - totalAssigned;
  }, [plan, currentMonthBudgets, overspentCategories]);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const handleAssignToCategory = (categoryId: string, amount: number) => {
    assignToCategory(categoryId, amount, currentMonth);
    const newReadyToAssign = calculateReadyToAssign - amount;
    setReadyToAssign(newReadyToAssign);
  };

  const handleCoverOverspending = (
    overspentCategoryId: string,
    sourceCategoryId: string,
    amount: number
  ) => {
    coverOverspending(overspentCategoryId, sourceCategoryId, amount);
  };

  const handleTogglePinned = (categoryId: string) => {
    togglePinned(categoryId);
  };

  const handleSpend = (categoryId: string, amount: number) => {
    const budget = currentMonthBudgets.find((cb) => cb.categoryId === categoryId);
    if (budget) {
      updateCategoryBudget(budget.id, {
        spent: budget.spent + amount,
        available: budget.available - amount,
      });
    }
  };

  const categoryBudgetsWithUniqueKeys = useMemo(() => {
    const seen = new Map<string, number>();
    return currentMonthBudgets.map((cb, index) => {
      const key = `${cb.categoryId}_${cb.planId}_${cb.month}`;
      const count = seen.get(key) || 0;
      seen.set(key, count + 1);
      if (count > 0) {
        return { ...cb, id: `${cb.id}_dup_${count}` };
      }
      return cb;
    });
  }, [currentMonthBudgets]);

  const monthlyIncome = plan?.monthlyIncome || 0;
  const savingsPercentage = plan?.savingsPercentage || 0;
  const savingsAmount = monthlyIncome * (savingsPercentage / 100);
  const availableForExpenses = monthlyIncome - savingsAmount;

  const updatePlanIncome = useAppStore((state) => state.updatePlanIncome);
  const updatePlanSavings = useAppStore((state) => state.updatePlanSavings);

  return {
    plans,
    currentPlanId,
    plan,
    currentMonth,
    categoryBudgets: categoryBudgetsWithUniqueKeys,
    allCategoryBudgets: deduplicatedCategoryBudgets,
    readyToAssign,
    overspentCategories,
    pinnedCategories,
    categoriesByGroup,
    calculateReadyToAssign,
    monthlyIncome,
    savingsPercentage,
    savingsAmount,
    availableForExpenses,
    getCategoryInfo,
    assignToCategory: handleAssignToCategory,
    coverOverspending: handleCoverOverspending,
    togglePinned: handleTogglePinned,
    removeCategoryBudget,
    spendFromCategory: handleSpend,
    initializeBudgets,
    addPlan,
    setPlan,
    setCurrentPlan,
    updateCategoryBudget,
    setReadyToAssign,
    deletePlan,
    addCategoryToPlan,
    updatePlanIncome,
    updatePlanSavings,
  };
};
