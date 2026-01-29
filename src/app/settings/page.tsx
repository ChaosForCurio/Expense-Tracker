'use client';

import { ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';
import { useCurrency, AVAILABLE_CURRENCIES, CurrencyCode } from '@/context/CurrencyContext';

export default function SettingsPage() {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Coins size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Preferences</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Display Currency</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {AVAILABLE_CURRENCIES.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => setCurrency(c.code as CurrencyCode)}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${currency.code === c.code
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-xl font-bold mb-1">{c.symbol}</span>
                                        <span className="text-xs font-medium">{c.code}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                This will update the currency symbol displayed across the application.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
