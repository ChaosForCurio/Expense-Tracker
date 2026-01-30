'use client';

import { CurrencyProvider } from '@/context/CurrencyContext';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackTheme } from "@/stack-theme";
import { stackClientApp } from "@/stack-client";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <StackProvider app={stackClientApp}>
            <StackTheme theme={stackTheme}>
                <CurrencyProvider>
                    {children}
                </CurrencyProvider>
            </StackTheme>
        </StackProvider>
    );
}

