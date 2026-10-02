export type TransactionType = "income" | "expense";

export interface UserSession {
  id: number;
  email: string;
  name: string;
}

export interface TransactionItem {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string | Date;
  userId: number;
  createdAt: string | Date;
}

export interface FinancialStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export type FilterType = "all" | "income" | "expense";
export type ThemeMode = "light" | "dark";
export type BudgetStatus = "SAFE" | "WARNING" | "EXCEEDED";

export interface BudgetSummaryResponse {
  budget: number;
  totalExpense: number;
  remainingBudget: number;
  percentage: number;
  status: BudgetStatus;
  month: number;
  year: number;
  hasBudget: boolean;
}