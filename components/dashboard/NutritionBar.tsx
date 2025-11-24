'use client';

import { Search, Plus, ChefHat } from 'lucide-react';
import { useSmartNutrition } from '@/hooks/useSmartNutrition';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function NutritionBar() {
    const { input, setInput, addLog, suggestions } = useSmartNutrition();
    const [toast, setToast] = useState<{ cals: number; protein: number } | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const result = await addLog();
        if (result) {
            setToast({ cals: result.calories, protein: result.protein });
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="relative z-50">
            <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 flex items-center gap-3 shadow-lg ring-1 ring-white/5">
                <Link href="/kitchen" className="p-1 -ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">
                    <ChefHat className="w-5 h-5" />
                </Link>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What did you eat? (e.g. 200g chicken)"
                    className="bg-transparent border-none outline-none text-[var(--color-text-primary)] w-full placeholder:text-[var(--color-text-muted)]"
                />
                <button
                    onClick={handleSubmit}
                    className="bg-[var(--color-accent)] p-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Auto-complete Suggestions */}
            {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-secondary)] rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10">
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            className="p-3 hover:bg-[var(--color-bg-tertiary)] cursor-pointer flex justify-between items-center"
                            onClick={() => {
                                setInput(s.name);
                            }}
                        >
                            <span className="text-sm text-[var(--color-text-primary)] capitalize">{s.name}</span>
                            <span className="text-xs text-[var(--color-text-muted)]">{s.calories}kcal / {s.unit}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Toast Feedback */}
            {toast && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-success)] text-black rounded-xl p-3 shadow-xl animate-in slide-in-from-top-2 fade-in duration-200">
                    <p className="text-sm font-medium">
                        Logged: {toast.cals} cals, {toast.protein}g protein ✓
                    </p>
                </div>
            )}
        </div>
    );
}
