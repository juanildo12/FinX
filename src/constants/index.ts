import { Category, TransactionType } from '../types';

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salario', icon: 'briefcase', color: '#22C55E', type: 'income' },
  { id: 'investment', name: 'Inversión', icon: 'trending-up', color: '#10B981', type: 'income' },
  { id: 'gift', name: 'Regalo', icon: 'gift', color: '#3B82F6', type: 'income' },
  { id: 'other_income', name: 'Otros', icon: 'add-circle', color: '#8B5CF6', type: 'income' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentación', icon: 'restaurant', color: '#F59E0B', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: 'car', color: '#EF4444', type: 'expense' },
  { id: 'housing', name: 'Vivienda', icon: 'home', color: '#8B5CF6', type: 'expense' },
  { id: 'utilities', name: 'Servicios', icon: 'flash', color: '#3B82F6', type: 'expense' },
  { id: 'entertainment', name: 'Entretenimiento', icon: 'film', color: '#EC4899', type: 'expense' },
  { id: 'health', name: 'Salud', icon: 'heart', color: '#10B981', type: 'expense' },
  { id: 'education', name: 'Educación', icon: 'book', color: '#6366F1', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: 'bag', color: '#F97316', type: 'expense' },
  { id: 'other_expense', name: 'Otros', icon: 'ellipsis-horizontal', color: '#64748B', type: 'expense' },
];

export const ALL_CATEGORIES: Category[] = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LANGUAGE = 'es';

export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Efectivo', icon: 'dollar-sign' },
  { id: 'card', name: 'Tarjeta', icon: 'credit-card' },
  { id: 'bank_transfer', name: 'Transferencia', icon: 'repeat' },
] as const;

export const CARD_BRANDS = [
  { id: 'visa', name: 'Visa', icon: 'credit-card' },
  { id: 'mastercard', name: 'Mastercard', icon: 'credit-card' },
  { id: 'amex', name: 'American Express', icon: 'credit-card' },
  { id: 'other', name: 'Otra', icon: 'credit-card' },
] as const;

export const CARD_COLORS = [
  '#1E3A5F',
  '#2E7D32',
  '#7B1FA2',
  '#C62828',
  '#F57C00',
  '#00838F',
  '#4527A0',
  '#283593',
];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const SHORT_MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];
