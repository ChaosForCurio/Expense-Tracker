import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from '@/components/ClientProviders';

export const metadata: Metadata = {
    title: "SpendWise | Personal Finance Tracker",
    description: "Track your expenses smartly with SpendWise.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}
