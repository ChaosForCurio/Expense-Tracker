'use client';

import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    Coins,
    User as UserIcon,
    Download,
    Trash2,
    Info,
    ChevronRight,
    Shield,
    Bell,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Edit2,
    Check,
    Image as ImageIcon,
    Link as LinkIcon,
    Upload,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from "@stackframe/stack";
import { useCurrency, AVAILABLE_CURRENCIES, CurrencyCode } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { exportExpensesToCSV, exportExpensesToJSON } from '@/utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

const TOAST_DURATION = 3000;

export default function SettingsPage() {
    const user = useUser();
    const { currency, setCurrency } = useCurrency();
    const { expenses, clearExpenses } = useExpenses();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI State
    const [isClearing, setIsClearing] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Personalized State
    const [userName, setUserName] = useState('John Doe');
    const [tempUserName, setTempUserName] = useState('John Doe');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [securityEnabled, setSecurityEnabled] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);
    const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

    // Persistence
    useEffect(() => {
        const savedName = localStorage.getItem('user_name');
        const savedImage = localStorage.getItem('user_profile_image');
        const savedNotif = localStorage.getItem('notifications_enabled');
        const savedSecurity = localStorage.getItem('security_enabled');

        if (savedName) {
            setUserName(savedName);
            setTempUserName(savedName);
        } else if (user?.displayName) {
            setUserName(user.displayName);
            setTempUserName(user.displayName);
        }

        if (savedImage) {
            setProfileImage(savedImage);
            setTempProfileImage(savedImage);
        }

        if (savedNotif !== null) setNotificationsEnabled(savedNotif === 'true');
        if (savedSecurity !== null) setSecurityEnabled(savedSecurity === 'true');
    }, [user]);

    useEffect(() => {
        localStorage.setItem('user_name', userName);
    }, [userName]);

    useEffect(() => {
        if (profileImage) {
            localStorage.setItem('user_profile_image', profileImage);
        } else {
            localStorage.removeItem('user_profile_image');
        }
    }, [profileImage]);

    useEffect(() => {
        localStorage.setItem('notifications_enabled', String(notificationsEnabled));
    }, [notificationsEnabled]);

    useEffect(() => {
        localStorage.setItem('security_enabled', String(securityEnabled));
    }, [securityEnabled]);

    const handleExport = async () => {
        setExporting(true);
        await new Promise(r => setTimeout(r, 800));
        if (exportFormat === 'csv') {
            exportExpensesToCSV(expenses);
        } else {
            exportExpensesToJSON(expenses);
        }
        setExporting(false);
        triggerSuccess('Data exported successfully!');
    };

    const triggerSuccess = (message: string) => {
        setShowSuccess(message);
        setTimeout(() => setShowSuccess(null), TOAST_DURATION);
    };

    const handleClearAll = async () => {
        setIsClearing(true);
        try {
            await clearExpenses();
            setShowClearConfirm(false);
        } catch (error) {
            alert('Failed to clear data');
        } finally {
            setIsClearing(false);
        }
    };

    const handleUpdateProfile = () => {
        if (tempUserName.trim()) {
            setUserName(tempUserName.trim());
            setProfileImage(tempProfileImage);
            setShowProfileModal(false);
            triggerSuccess('Profile updated successfully!');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for base64
                alert('Image is too large. Please use a smaller image (max 1MB).');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const displayImage = profileImage || user?.profileImageUrl;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 pb-20">
            <div className="max-w-xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500">Manage your profile and preferences</p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Profile Section */}
                    <motion.section
                        variants={itemVariants}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group cursor-pointer active:scale-[0.99] transition-transform"
                        onClick={() => {
                            setTempUserName(userName);
                            setTempProfileImage(profileImage);
                            setShowProfileModal(true);
                        }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm overflow-hidden">
                                {displayImage ? (
                                    <img src={displayImage ?? undefined} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={32} />
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-slate-900 truncate pr-4">{userName}</h2>
                                <p className="text-sm text-slate-500">Tap to edit profile</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Edit2 size={18} />
                            </div>
                        </div>
                    </motion.section>

                    {/* Preferences Area */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Preferences</h3>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                            {/* Currency Setting */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                        <Coins size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-800">Display Currency</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {AVAILABLE_CURRENCIES.map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => setCurrency(c.code as CurrencyCode)}
                                            className={cn(
                                                "p-3 rounded-2xl border flex flex-col items-center justify-center transition-all group scale-100 active:scale-95",
                                                currency.code === c.code
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/10'
                                                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                                            )}
                                        >
                                            <span className="text-xl font-bold mb-0.5">{c.symbol}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{c.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notifications Toggle */}
                            <div
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Bell size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                        {notificationsEnabled ? 'Enabled • Smart Alerts' : 'Disabled'}
                                    </p>
                                </div>
                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                                    notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                                )}>
                                    <motion.div
                                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: notificationsEnabled ? 24 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </div>
                            </div>

                            {/* Security Toggle */}
                            <div
                                onClick={() => setSecurityEnabled(!securityEnabled)}
                                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                                    <Shield size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">Biometric Security</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                        {securityEnabled ? 'High • PIN & Biometrics' : 'None • Quick Access'}
                                    </p>
                                </div>
                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                                    securityEnabled ? 'bg-green-600' : 'bg-slate-200'
                                )}>
                                    <motion.div
                                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: securityEnabled ? 24 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Data Management Section */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Data & Privacy</h3>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="p-2 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        {exporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800">Export Transactions</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Local download • Selected format</p>
                                    </div>
                                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                                        {(['csv', 'json'] as const).map((format) => (
                                            <button
                                                key={format}
                                                onClick={() => setExportFormat(format)}
                                                className={cn(
                                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                                    exportFormat === format
                                                        ? "bg-white text-indigo-600 shadow-sm"
                                                        : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                {format.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleExport}
                                    disabled={exporting || expenses.length === 0}
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {exporting ? 'Generating...' : `Download ${exportFormat.toUpperCase()}`}
                                </button>
                            </div>

                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="w-full text-left p-4 flex items-center gap-4 hover:bg-red-50 transition-colors group"
                            >
                                <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
                                    <Trash2 size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-600">Delete Account Data</p>
                                    <p className="text-[10px] text-red-400 uppercase font-bold tracking-tight">Permanent • Cannot be undone</p>
                                </div>
                                <ChevronRight size={18} className="text-red-200 group-hover:text-red-600 transition-colors" />
                            </button>
                        </div>
                    </motion.div>

                    {/* About Section */}
                    <motion.div variants={itemVariants} className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-1000" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-violet-600/20 transition-colors duration-1000" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                        <Wallet className="text-indigo-400" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">SpendWise</h4>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Premium Expense Tracking</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">v2.1.0</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                Take control of your financial destiny with SpentWise. Precision tracking meets effortless design to give you a clearer vision of your wealth.
                            </p>

                            <div className="flex items-center gap-6">
                                <button className="text-xs font-bold text-white/50 hover:text-white transition-colors flex items-center gap-2 group/btn">
                                    Rate Us <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <button className="text-xs font-bold text-white/50 hover:text-white transition-colors flex items-center gap-2 group/btn">
                                    Feedback <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Profile Edit Modal */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProfileModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full relative z-10 shadow-huge border border-slate-100 space-y-6 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Image Management */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group">
                                        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 border-2 border-slate-50 overflow-hidden shadow-sm">
                                            {tempProfileImage || user?.profileImageUrl ? (
                                                <img src={(tempProfileImage || user?.profileImageUrl) ?? undefined} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={40} />
                                            )}
                                        </div>
                                        {tempProfileImage && (
                                            <button
                                                onClick={() => setTempProfileImage(null)}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full border-2 border-white shadow-sm hover:bg-red-200 transition-colors"
                                                title="Remove Custom Image"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Upload size={14} />
                                            Upload
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                                            <UserIcon size={12} />
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={tempUserName}
                                            onChange={(e) => setTempUserName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                                            <LinkIcon size={12} />
                                            Image URL
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={typeof tempProfileImage === 'string' && !tempProfileImage.startsWith('data:') ? tempProfileImage : ''}
                                                onChange={(e) => setTempProfileImage(e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full p-4 pr-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold text-sm"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                <ImageIcon size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Clear Data Confirmation Modal */}
            <AnimatePresence>
                {showClearConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isClearing && setShowClearConfirm(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-huge border border-slate-100 text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={36} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-slate-900">Are you absolutely sure?</h2>
                                <p className="text-sm text-slate-500">
                                    This will permanently delete all your transaction history. This action cannot be reversed.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    disabled={isClearing}
                                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    disabled={isClearing}
                                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isClearing ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Delete All'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
                    >
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Check size={14} />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{showSuccess}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
