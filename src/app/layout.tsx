import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { ClientProviders } from '@/components/ClientProviders';
import { PageTransition } from '@/components/PageTransition';
import { Navbar } from '@/components/Navbar';

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
            <body className="antialiased font-sans bg-slate-50/50">
                <Script
                    src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
                    defer
                />
                <Script id="onesignal-init">
                    {`
                      window.OneSignalDeferred = window.OneSignalDeferred || [];
                      OneSignalDeferred.push(async function(OneSignal) {
                        await OneSignal.init({
                          appId: "30756cd3-0f13-41cc-ad4c-6ff64f1c4d9c",
                        });
                      });
                    `}
                </Script>
                <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                    <ClientProviders>
                        <Navbar />
                        <PageTransition>
                            <main className="pt-20 min-h-screen">
                                {children}
                            </main>
                        </PageTransition>
                    </ClientProviders>
                </Suspense>
            </body>
        </html>
    );
}
