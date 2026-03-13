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

  const currentMonth = getCurrentMonth();
  const effectivePlanId = currentPlanId || plan?.id;

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    initializeBudgets(effectivePlanId || undefined);
  }, []);

  const currentMonthBudgets = useMemo(() => {
    if (!effectivePlanId || categoryBudgets.length === 0) return categoryBudgets;
    return categoryBudgets.filter(
      (cb) => cb.month === currentMonth && cb.planId === effectivePlanId
    );
  }, [categoryBudgets, currentMonth, effectivePlanId]);

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
    const monthIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalAssigned = currentMonthBudgets.reduce(
      (sum, cb) => sum + cb.assignedThisMonth, 
      0
    );
    
    const totalOverspent = overspentCategories.reduce(
      (sum, cb) => sum + Math.abs(cb.available),
      0
    );
    
    return monthIncome - totalAssigned;
  }, [transactions, currentMonth, currentMonthBudgets, overspentCategories]);

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

  return {
    plans,
    currentPlanId,
    plan,
    currentMonth,
    categoryBudgets: currentMonthBudgets,
    readyToAssign,
    overspentCategories,
    pinnedCategories,
    categoriesByGroup,
    calculateReadyToAssign,
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
  };
};
