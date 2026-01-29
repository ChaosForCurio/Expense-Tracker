'use client';

import { CurrencyProvider } from '@/context/CurrencyContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <CurrencyProvider>
            {children}
        </CurrencyProvider>
    );
}
