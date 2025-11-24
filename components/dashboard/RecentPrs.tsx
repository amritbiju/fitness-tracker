'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { db } from '@/lib/db';
import { format } from 'date-fns';

interface PR {
    exerciseName: string;
    weight: number;
    date: number;
}

export function RecentPrs() {
    const [prs, setPrs] = useState<PR[]>([]);

    useEffect(() => {
        const loadPrs = async () => {
            // Simple logic: Find max weight for each exercise in history
            // Then check if that max occurred in the last 30 days
            const logs = await db.logs.toArray();
            const exercises = await db.exercises.toArray();
            const exerciseMap = new Map(exercises.map(e => [e.id!, e.name]));

            const maxes = new Map<number, { weight: number, date: number }>();

            // Find global maxes
            logs.forEach(log => {
                const current = maxes.get(log.exerciseId);
                if (!current || log.weight > current.weight) {
                    maxes.set(log.exerciseId, { weight: log.weight, date: log.timestamp });
                }
            });

            // Filter for recent ones (last 30 days)
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const recentPrs: PR[] = [];

            maxes.forEach((value, exerciseId) => {
                if (value.date > thirtyDaysAgo) {
                    recentPrs.push({
                        exerciseName: exerciseMap.get(exerciseId) || 'Unknown',
                        weight: value.weight,
                        date: value.date
                    });
                }
            });

            // Sort by date descending
            setPrs(recentPrs.sort((a, b) => b.date - a.date).slice(0, 3)); // Top 3
        };
        loadPrs();
    }, []);

    if (prs.length === 0) {
        return (
            <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl h-full flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="w-24 h-24" />
                </div>
                <div>
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-1">Recent PRs</h3>
                    <p className="text-[var(--color-text-muted)] text-sm">No new records this month.</p>
                </div>
                <div className="mt-4">
                    <p className="text-[var(--color-text-primary)] font-medium">Keep pushing.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Trophy className="w-32 h-32" />
            </div>

            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
                Recent Records
            </h3>

            <div className="space-y-4 z-10">
                {prs.map((pr, idx) => (
                    <div key={idx} className="flex justify-between items-end border-b border-[var(--color-bg-tertiary)] pb-2 last:border-0">
                        <div>
                            <div className="text-[var(--color-text-primary)] font-semibold text-lg leading-tight">
                                {pr.exerciseName}
                            </div>
                            <div className="text-[var(--color-text-muted)] text-xs">
                                {format(pr.date, 'MMM d')}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-[var(--color-accent)]">
                            {pr.weight}<span className="text-sm text-[var(--color-text-muted)] font-medium ml-0.5">kg</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
