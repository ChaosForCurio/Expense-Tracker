'use client';

import React from 'react';

interface SocialButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    description: string;
}

export function SocialButton({ onClick, icon, label, description }: SocialButtonProps) {
    return (
        <button
            onClick={onClick}
            className="group relative flex items-center gap-4 w-full p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800/60 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 text-left overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300">
                <div className="text-slate-400 group-hover:text-white transition-colors">
                    {icon}
                </div>
            </div>

            <div className="relative flex-1">
                <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors tracking-tight">
                    Continue with {label}
                </h3>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                    {description}
                </p>
            </div>

            <div className="relative opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </div>
        </button>
    );
}
