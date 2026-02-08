'use client';

import { useUser, useStackApp } from "@stackframe/stack";
import { LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
    const user = useUser();
    const stackApp = useStackApp();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Custom profile state
    const [customName, setCustomName] = useState<string | null>(null);
    const [customImage, setCustomImage] = useState<string | null>(null);

    useEffect(() => {
        const savedName = localStorage.getItem('user_name');
        const savedImage = localStorage.getItem('user_profile_image');
        if (savedName) setCustomName(savedName);
        if (savedImage) setCustomImage(savedImage);

        // Listen for storage changes (in case settings page updates it)
        const handleStorageChange = () => {
            setCustomName(localStorage.getItem('user_name'));
            setCustomImage(localStorage.getItem('user_profile_image'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const displayName = customName || user.displayName || user.primaryEmail || "User";
    const displayImage = customImage || user.profileImageUrl;
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 overflow-hidden shadow-sm"
                title={displayName}
            >
                {displayImage ? (
                    <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-bold">{initials}</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user.primaryEmail}
                        </p>
                    </div>
                    <div className="p-1">
                        <button
                            onClick={() => window.location.href = stackApp.urls.signOut}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                            <LogOut size={16} className="text-red-400 group-hover:text-red-600" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
