'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles, Minus, Maximize2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useExpenses } from '@/context/ExpenseContext';
import { useCurrency } from '@/context/CurrencyContext';

interface Message {
    role: 'user' | 'model';
    parts: string;
}

export const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', parts: 'Hi! I\'m SpendWise AI. How can I help you with your finances today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { expenses } = useExpenses();
    const { currency } = useCurrency();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', parts: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    context: {
                        expenses: expenses.map(e => ({
                            title: e.title,
                            amount: e.amount,
                            category: e.category,
                            date: e.date
                        })),
                        currency: currency.code
                    }
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'model', parts: data.text }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', parts: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center group border border-white/10"
                >
                    <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
                    <Bot size={28} className="group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? '80px' : '600px',
                            width: '400px'
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm tracking-tight">SpendWise AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages Area */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
                                >
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={idx}
                                            className={cn(
                                                "flex gap-3 max-w-[85%]",
                                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
                                                msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-slate-900 text-white"
                                            )}>
                                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                            </div>
                                            <div className={cn(
                                                "p-4 rounded-[1.5rem]",
                                                msg.role === 'user'
                                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                                    : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none font-medium"
                                            )}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.parts}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3 mr-auto max-w-[85%]">
                                            <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 mt-1">
                                                <Bot size={14} />
                                            </div>
                                            <div className="bg-white p-4 rounded-[1.5rem] rounded-tl-none shadow-sm border border-slate-100 flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Ask anything about your expenses..."
                                            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={18} className="rotate-[-20deg]" />
                                        </button>
                                    </div>
                                    <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <Sparkles size={10} />
                                        Powered by Gemini 1.5 Flash
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
