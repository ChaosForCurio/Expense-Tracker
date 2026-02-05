export type Category =
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: Category;
  note?: string;
  image_url?: string;
}

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Health',
  'Other'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f87171',
  Transport: '#fb923c',
  Entertainment: '#fbbf24',
  Shopping: '#4ade80',
  Utilities: '#2dd4bf',
  Health: '#60a5fa',
  Other: '#94a3b8'
};
