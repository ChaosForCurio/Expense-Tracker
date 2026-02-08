import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClientProviders } from '@/components/ClientProviders';
import { PageTransition } from '@/components/PageTransition';

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
                <ClientProviders>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </ClientProviders>
            </body>
        </html>
    );
}
