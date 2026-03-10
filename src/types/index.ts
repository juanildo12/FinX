// Tipos principales de la aplicación Vixo

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'other';
export type GoalStatus = 'active' | 'completed' | 'cancelled';
export type DebtStatus = 'active' | 'paid';
export type AlertType = 'payment' | 'budget' | 'goal' | 'debt';
export type ThemeMode = 'light' | 'dark';
export type AccountType = 'checking' | 'cash' | 'savings' | 'investment' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  date: string;
  paymentMethod: PaymentMethod;
  cardId?: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  limit: number;
  currentBalance: number;
  dueDate: string;
  closingDate: string;
  brand: CardBrand;
  color: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
  status: GoalStatus;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate: string;
  creditor: string;
  status: DebtStatus;
  createdAt: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  dueDate: string;
  isCompleted: boolean;
  notifyPush: boolean;
  notifyEmail: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
  createdAt: string;
}

export interface TaxCoupon {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  imageUri?: string;
  createdAt: string;
}

export interface UserSettings {
  currency: string;
  language: string;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  thousandSeparator: string;
  decimalSeparator: string;
  voiceAutoSave: boolean;
  voiceTimeout: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution?: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
}
