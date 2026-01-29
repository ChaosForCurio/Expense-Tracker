'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';

interface Currency {
    code: CurrencyCode;
    symbol: string;
    locale: string;
}

const CURRENCIES: Record<CurrencyCode, Currency> = {
    USD: { code: 'USD', symbol: '$', locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
    INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
    JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
    CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
    AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
};

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (code: CurrencyCode) => void;
    formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');

    useEffect(() => {
        const saved = localStorage.getItem('spendwise_currency');
        if (saved && (saved in CURRENCIES)) {
            setCurrencyCode(saved as CurrencyCode);
        }
    }, []);

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyCode(code);
        localStorage.setItem('spendwise_currency', code);
    };

    const currency = CURRENCIES[currencyCode];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}

export const AVAILABLE_CURRENCIES = Object.values(CURRENCIES);
