import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Upload, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { Category, CATEGORIES, Expense } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => Promise<void>;
  initialData?: Expense | null;
  onEdit?: (id: string, expense: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  onClose?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, initialData, onEdit, onClose }) => {
  const { currency } = useCurrency();
  const [isOpen, setIsOpen] = useState(!!initialData);
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<Category>(initialData?.category || ('Food' as Category));
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setIsOpen(true);
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setImagePreview(initialData.image_url || null);
    }
  }, [initialData]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
    // Reset form if not editing
    if (!initialData) {
      setTitle('');
      setAmount('');
      setCategory('Food' as Category);
      setDate(new Date().toISOString().split('T')[0]);
      setImage(null);
      setImagePreview(null);
      setError(null);
    }
  };

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError(null);
  }, [title, amount, category, date]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a description.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const currentTitle = title;
    const currentAmount = amount;
    const currentCategory = category;
    const currentDate = date;
    const currentImage = image;
    const currentImagePreview = imagePreview;

    try {
      setIsSubmitting(true);

      // Close modal and clear form immediately for "instant" UI feel (if adding)
      if (!initialData) {
        setIsOpen(false);
        setTitle('');
        setAmount('');
        setCategory('Food' as Category);
        setDate(new Date().toISOString().split('T')[0]);
        setImage(null);
        setImagePreview(null);
        setError(null);
      } else {
        handleClose();
      }

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

      // 2. Call parent to add or edit expense
      if (initialData && onEdit) {
        await onEdit(initialData.id, {
          title: currentTitle,
          amount: parseFloat(currentAmount),
          category: currentCategory,
          date: currentDate,
          image_url: finalImageUrl,
        });
      } else {
        await onAdd({
          title: currentTitle,
          amount: parseFloat(currentAmount),
          category: currentCategory,
          date: currentDate,
          image_url: finalImageUrl,
        });
      }

    } catch (error) {
      console.error("Form submission error", error);
      setError(initialData ? 'Failed to update expense.' : 'Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 border border-white/10"
        aria-label="Add Expense"
      >
        <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-bold text-sm hidden sm:inline-block">Add Expense</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && handleClose()}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{initialData ? 'Edit Expense' : 'New Expense'}</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{initialData ? 'Update transaction details' : 'Enter transaction details'}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-xs font-semibold border border-red-100"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold"
                    placeholder="What did you spend on?"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency.symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                        placeholder="0.00"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold appearance-none"
                      disabled={isSubmitting}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Receipt Image (Optional)</label>

                  {!imagePreview ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processFile(file);
                      }}
                      className={cn(
                        "relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300",
                        isDragging
                          ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/50"
                      )}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmitting}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "p-3 rounded-2xl transition-colors",
                          isDragging ? "bg-indigo-100 text-indigo-600" : "bg-white text-slate-400 shadow-sm"
                        )}>
                          <Upload size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-600">
                          {isDragging ? "Drop it here!" : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, GIF (max. 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-100 group aspect-video bg-slate-50">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => { setImage(null); setImagePreview(null); }}
                          className="bg-red-500 text-white rounded-xl p-2.5 shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                        <Check size={10} className="text-green-600" />
                        Image Attached
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl transition-all mt-4 shadow-lg shadow-indigo-200 active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  {isSubmitting ? 'Processing...' : (initialData ? 'Save Changes' : 'Add Transaction')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
