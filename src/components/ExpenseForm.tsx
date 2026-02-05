'use client';

import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Category, CATEGORIES, Expense } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd }) => {
  const { currency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const currentTitle = title;
    const currentAmount = amount;
    const currentCategory = category;
    const currentDate = date;
    const currentImage = image;
    const currentImagePreview = imagePreview;

    try {
      setIsSubmitting(true);

      // Close modal and clear form immediately for "instant" UI feel
      setIsOpen(false);
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setImage(null);
      setImagePreview(null);

      // 1. Upload image if exists
      let finalImageUrl = currentImagePreview || '';
      if (currentImage) {
        const formData = new FormData();
        formData.append('file', currentImage);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          finalImageUrl = uploadData.url;
        }
      }

      // 2. Call parent to add expense (parent handles optimistic update)
      await onAdd({
        title: currentTitle,
        amount: parseFloat(currentAmount),
        category: currentCategory,
        date: currentDate,
        image_url: finalImageUrl,
      });

    } catch (error) {
      console.error("Form submission error", error);
      // Note: In a real app, you might want to restore form values or show a toast on error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
      >
        <PlusCircle size={20} />
        Add Expense
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">New Expense</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Grocery Shopping"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                disabled={isSubmitting}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              disabled={isSubmitting}
            />
            {imagePreview && (
              <div className="mt-2 relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 shadow-md flex justify-center items-center"
          >
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};
