'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ChefHat, X } from 'lucide-react';
import Link from 'next/link';
import { useSmartNutrition } from '@/hooks/useSmartNutrition';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { seedKitchen } from '@/lib/seedKitchen';

export default function KitchenPage() {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCals, setNewCals] = useState('');
    const [newProtein, setNewProtein] = useState('');
    const [newUnit, setNewUnit] = useState<'g' | 'unit' | 'scoop'>('g');
    const [isSeeding, setIsSeeding] = useState(false);

    const staples = useLiveQuery(() => db.staples.toArray()) || [];
    const { createStaple } = useSmartNutrition();

    // Auto-seed kitchen on first load
    useEffect(() => {
        const initKitchen = async () => {
            if (staples.length === 0 && !isSeeding) {
                setIsSeeding(true);
                await seedKitchen();
                setIsSeeding(false);
            }
        };
        initKitchen();
    }, [staples.length, isSeeding]);

    const handleAdd = async () => {
        if (!newName || !newCals || !newProtein) return;

        await createStaple(newName, parseFloat(newCals), parseFloat(newProtein), newUnit);
        setIsAdding(false);
        setNewName('');
        setNewCals('');
        setNewProtein('');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this food?')) {
            await db.staples.delete(id);
        }
    };

    const handleReset = async () => {
        setIsSeeding(true);
        await db.staples.clear();
        await seedKitchen();
        setIsSeeding(false);
    };

    if (isSeeding) {
        return (
            <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 flex items-center justify-center">
                <div className="text-center">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 text-[#6366F1] animate-pulse" />
                    <p className="text-[var(--color-text-primary)] font-medium">Setting up your kitchen...</p>
                    <p className="text-[var(--color-text-muted)] text-sm mt-2">Adding common foods</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 pb-24 max-w-md mx-auto relative">
            <header className="flex items-center gap-4 mb-8 mt-2">
                <Link href="/" className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        My Kitchen
                    </h1>
                    <p className="text-xs text-[var(--color-text-muted)]">{staples.length} foods</p>
                </div>
                <button
                    onClick={handleReset}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                >
                    Reset
                </button>
            </header>

            {/* Staples List */}
            <div className="space-y-3">
                {staples.length === 0 && !isAdding && (
                    <div className="text-center py-20 text-[var(--color-text-muted)]">
                        <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No saved foods yet</p>
                        <p className="text-sm mt-2">Add your favorites for quick logging</p>
                    </div>
                )}

                {staples.map(food => (
                    <div key={food.id} className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl flex justify-between items-center group">
                        <div>
                            <div className="text-[var(--color-text-primary)] font-medium capitalize">{food.name}</div>
                            <div className="text-[var(--color-text-muted)] text-xs">
                                {food.calories}kcal • {food.protein}g protein <span className="opacity-50">/ {food.unit === 'g' ? '100g' : food.unit}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(food.id!)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* FAB - Floating Action Button */}
            {!isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="fixed bottom-8 right-8 bg-[var(--color-accent)] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 z-50"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}

            {/* Add Food Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-0 animate-in fade-in duration-200">
                    <div className="bg-[var(--color-bg-secondary)] w-full max-w-md rounded-t-3xl p-6 shadow-2xl ring-1 ring-white/10 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">New Food</h3>
                            <button onClick={() => setIsAdding(false)} className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                placeholder="Name (e.g. Oats)"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full bg-[var(--color-bg-tertiary)] p-4 rounded-xl text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="Calories"
                                    value={newCals}
                                    onChange={e => setNewCals(e.target.value)}
                                    className="bg-[var(--color-bg-tertiary)] p-4 rounded-xl text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                                <input
                                    type="number"
                                    placeholder="Protein (g)"
                                    value={newProtein}
                                    onChange={e => setNewProtein(e.target.value)}
                                    className="bg-[var(--color-bg-tertiary)] p-4 rounded-xl text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['g', 'unit', 'scoop'] as const).map(u => (
                                    <button
                                        key={u}
                                        onClick={() => setNewUnit(u)}
                                        className={`p-3 rounded-xl text-sm font-medium transition-all ${newUnit === u ? 'bg-[var(--color-accent)] text-white scale-105' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'}`}
                                    >
                                        {u === 'g' ? 'Per 100g' : `Per ${u}`}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleAdd} className="w-full bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold rounded-xl p-4 mt-2 hover:opacity-90 transition-opacity">
                                Add Food
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
