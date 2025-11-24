'use client';

import { useState, useEffect } from 'react';
import { Ghost, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { db } from '@/lib/db';
import { startOfWeek, subWeeks, isSameWeek } from 'date-fns';

export function GhostMetric() {
    const [comparison, setComparison] = useState({ current: 0, last: 0, diff: 0 });

    useEffect(() => {
        const loadGhost = async () => {
            const logs = await db.logs.toArray();
            const now = new Date();
            const lastWeek = subWeeks(now, 1);

            const currentVolume = logs
                .filter(l => isSameWeek(new Date(l.timestamp), now))
                .reduce((acc, l) => acc + (l.weight * l.reps), 0);

            const lastVolume = logs
                .filter(l => isSameWeek(new Date(l.timestamp), lastWeek))
                .reduce((acc, l) => acc + (l.weight * l.reps), 0);

            const diff = currentVolume - lastVolume;

            setComparison({
                current: Math.round(currentVolume / 1000), // Tons
                last: Math.round(lastVolume / 1000),
                diff: Math.round(diff / 1000)
            });
        };
        loadGhost();
    }, []);

    const isPositive = comparison.diff >= 0;

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Ghost className="w-24 h-24" />
            </div>

            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                Ghost Metric
            </h3>

            <div className="flex items-end gap-3">
                <div className="text-4xl font-bold text-[var(--color-text-primary)]">
                    {comparison.current}t
                </div>
                <div className={`flex items-center text-sm font-bold mb-1.5 ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(comparison.diff)}t
                </div>
            </div>
            <div className="text-[var(--color-text-muted)] text-xs mt-2">
                vs. Last Week ({comparison.last}t)
            </div>
        </div>
    );
}
