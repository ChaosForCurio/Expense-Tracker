'use client';

import { CurrencyProvider } from '@/context/CurrencyContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackTheme } from "@/stack-theme";
import { stackClientApp } from "@/stack-client";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <StackProvider app={stackClientApp}>
            <StackTheme theme={stackTheme}>
                <ExpenseProvider>
                    <CurrencyProvider>
                        {children}
                    </CurrencyProvider>
                </ExpenseProvider>
            </StackTheme>
        </StackProvider>
    );
}

