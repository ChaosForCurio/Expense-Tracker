'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { SignIn } from "@stackframe/stack";
import { Wallet } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full z-10">
                {/* Logo & Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 mb-8 transform hover:scale-105 transition-transform duration-300">
                        <Wallet size={40} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">SpendWise</h1>
                    <p className="text-slate-400 text-lg mb-2">Elevate your financial clarity</p>
                    <p className="text-sm text-slate-500">Sign in to access your dashboard</p>
                </div>

                {/* Stack Auth SignIn Component with Custom Styling */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <div className="stack-auth-container bg-slate-900/50 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-black/50 border border-slate-800 p-8">
                        <SignIn
                            afterSignInUrl="/"
                            afterSignUpUrl="/"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center animate-in fade-in duration-1000 delay-300">
                    <p className="text-slate-500 text-sm">
                        Secure authentication powered by Stack Auth
                    </p>
                </div>
            </div>

            <style jsx global>{`
                /* Stack Auth Custom Styling */
                .stack-auth-container {
                    --stack-primary: #4f46e5;
                    --stack-primary-hover: #6366f1;
                }

                .stack-auth-container button {
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
                    border: none !important;
                    color: white !important;
                    padding: 12px 24px !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3) !important;
                }

                .stack-auth-container button:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4) !important;
                }

                .stack-auth-container input {
                    background: rgba(30, 41, 59, 0.5) !important;
                    border: 1px solid rgba(148, 163, 184, 0.2) !important;
                    color: white !important;
                    padding: 12px 16px !important;
                    border-radius: 10px !important;
                    font-size: 14px !important;
                }

                .stack-auth-container input:focus {
                    outline: none !important;
                    border-color: #4f46e5 !important;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
                }

                .stack-auth-container input::placeholder {
                    color: rgba(148, 163, 184, 0.5) !important;
                }

                .stack-auth-container label {
                    color: #e2e8f0 !important;
                    font-weight: 500 !important;
                    font-size: 14px !important;
                    margin-bottom: 8px !important;
                }

                .stack-auth-container p,
                .stack-auth-container span,
                .stack-auth-container a {
                    color: #94a3b8 !important;
                }

                .stack-auth-container a:hover {
                    color: #cbd5e1 !important;
                }

                .stack-auth-container h1,
                .stack-auth-container h2,
                .stack-auth-container h3 {
                    color: white !important;
                }

                .stack-auth-container .error {
                    color: #f87171 !important;
                    background: rgba(248, 113, 113, 0.1) !important;
                    border: 1px solid rgba(248, 113, 113, 0.3) !important;
                    padding: 8px 12px !important;
                    border-radius: 8px !important;
                    font-size: 13px !important;
                }

                /* OAuth Button Styling */
                .stack-auth-container [class*="oauth"],
                .stack-auth-container [class*="social"] {
                    background: rgba(30, 41, 59, 0.6) !important;
                    border: 1px solid rgba(148, 163, 184, 0.2) !important;
                    color: white !important;
                    transition: all 0.2s ease !important;
                }

                .stack-auth-container [class*="oauth"]:hover,
                .stack-auth-container [class*="social"]:hover {
                    background: rgba(30, 41, 59, 0.8) !important;
                    border-color: rgba(79, 70, 229, 0.5) !important;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2) !important;
                }

                /* Divider Styling */
                .stack-auth-container hr {
                    border-color: rgba(148, 163, 184, 0.2) !important;
                }
            `}</style>
        </div>
    );
}
