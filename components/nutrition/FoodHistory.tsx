'use client';

import { Trash2, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { db, NutritionLog } from '@/lib/db';

interface FoodHistoryProps {
    logs: NutritionLog[];
    onDelete: () => void;
}

export function FoodHistory({ logs, onDelete }: FoodHistoryProps) {
    // Group by date
    const groupedLogs: Record<string, NutritionLog[]> = {};
    logs.forEach(log => {
        if (!groupedLogs[log.date]) groupedLogs[log.date] = [];
        groupedLogs[log.date].push(log);
    });

    const handleDelete = async (id: number) => {
        if (confirm('Delete this food log?')) {
            await db.nutrition.delete(id);
            onDelete();
        }
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No food logs yet</p>
                <p className="text-xs mt-1">Start tracking your nutrition</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedLogs)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, dayLogs]) => {
                    const dayTotals = dayLogs.reduce((acc, log) => ({
                        calories: acc.calories + log.calories,
                        protein: acc.protein + log.protein
                    }), { calories: 0, protein: 0 });

                    return (
                        <div key={date}>
                            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-3">
                                {format(new Date(date), 'EEEE, MMM d')}
                            </h3>
                            <div className="space-y-2">
                                {dayLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="bg-[var(--color-bg-secondary)] p-4 rounded-xl flex justify-between items-center group"
                                    >
                                        <div className="flex-1">
                                            <div className="text-[var(--color-text-primary)] font-medium capitalize">
                                                {log.itemName}
                                            </div>
                                            <div className="text-[var(--color-text-muted)] text-xs mt-0.5">
                                                {log.quantity} • {log.calories} kcal • {log.protein}g protein
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(log.id!)}
                                            className="p-2 text-[var(--color-text-muted)] hover:text-[#FA114F] transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* Daily Total */}
                                <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-xl border-l-4 border-[#6366F1]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                            Daily Total
                                        </span>
                                        <span className="text-sm font-bold text-[var(--color-text-primary)]">
                                            {dayTotals.calories} kcal • {dayTotals.protein}g protein
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
