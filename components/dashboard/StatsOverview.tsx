'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Flame } from 'lucide-react';
import { db } from '@/lib/db';

export function StatsOverview() {
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        totalVolume: 0,
        bestStreak: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            const logs = await db.logs.toArray();

            const uniqueWorkouts = new Set(logs.map(l => l.workoutId)).size;
            const volume = logs.reduce((acc, log) => acc + (log.weight * log.reps), 0);

            setStats({
                totalWorkouts: uniqueWorkouts,
                totalVolume: volume,
                bestStreak: 0
            });
        };
        loadStats();
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-bg-secondary)] p-5 rounded-3xl flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-3 opacity-5">
                    <Dumbbell className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Workouts</span>
                </div>
                <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {stats.totalWorkouts}
                </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] p-5 rounded-3xl flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-3 opacity-5">
                    <Flame className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Volume</span>
                </div>
                <div>
                    <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {(stats.totalVolume / 1000).toFixed(1)}k
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-medium">kg lifted</div>
                </div>
            </div>
        </div>
    );
}
