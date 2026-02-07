'use client';

import React, { useState } from 'react';
import { PlusCircle, X, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
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
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-sm"
        aria-label="Add Expense"
      >
        <PlusCircle size={20} />
        <span className="hidden sm:inline">Add Expense</span>
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

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ease-in-out
                  ${isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }
                `}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isSubmitting}
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <div className={`p-3 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Upload size={24} />
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-slate-400">PNG, JPG, GIF (max. 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <ImageIcon size={12} />
                  Image selected
                </div>
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
