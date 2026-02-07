'use client';

import React from 'react';
import { Trash2, CreditCard, ShoppingBag, Utensils, Car, Film, HeartPulse, MoreHorizontal } from 'lucide-react';
import { Expense, Category } from '@/types';
import { format } from 'date-fns';
import { useCurrency } from '@/context/CurrencyContext';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CategoryIcon: React.FC<{ category: Category }> = ({ category }) => {
  switch (category) {
    case 'Food': return <Utensils size={18} />;
    case 'Transport': return <Car size={18} />;
    case 'Entertainment': return <Film size={18} />;
    case 'Shopping': return <ShoppingBag size={18} />;
    case 'Utilities': return <CreditCard size={18} />;
    case 'Health': return <HeartPulse size={18} />;
    default: return <MoreHorizontal size={18} />;
  }
};

const CategoryColor: Record<Category, string> = {
  Food: 'bg-red-100 text-red-600',
  Transport: 'bg-orange-100 text-orange-600',
  Entertainment: 'bg-amber-100 text-amber-600',
  Shopping: 'bg-green-100 text-green-600',
  Utilities: 'bg-teal-100 text-teal-600',
  Health: 'bg-blue-100 text-blue-600',
  Other: 'bg-slate-100 text-slate-600',
};

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  const { formatCurrency } = useCurrency();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-500">No expenses found. Start by adding one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expense</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {expense.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={expense.image_url}
                            alt={expense.title}
                            className="h-10 w-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => window.open(expense.image_url, '_blank')}
                          />
                        </div>
                      )}
                      <div className="font-medium text-slate-900">{expense.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CategoryColor[expense.category]}`}>
                      <CategoryIcon category={expense.category} />
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2.5 rounded-full flex-shrink-0 ${CategoryColor[expense.category]}`}>
                <CategoryIcon category={expense.category} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">{expense.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{format(new Date(expense.date), 'MMM dd')}</span>
                  {expense.image_url && <span className="text-indigo-500 font-medium flex items-center gap-0.5"><Film size={10} className="inline" /> Img</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-slate-800">{formatCurrency(expense.amount)}</span>
              <button
                onClick={() => onDelete(expense.id)}
                className="text-slate-300 hover:text-red-500 p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
