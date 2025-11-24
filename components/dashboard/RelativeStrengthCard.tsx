'use client';

import { useState, useEffect } from 'react';
import { BicepsFlexed, Crown } from 'lucide-react';
import { db } from '@/lib/db';

export function RelativeStrengthCard() {
    const [level, setLevel] = useState('Novice');
    const [totalLifted, setTotalLifted] = useState(0);

    useEffect(() => {
        const loadStrength = async () => {
            const logs = await db.logs.toArray();
            // Simple logic: Sum of max weight for all exercises
            // In reality, this should be specific to Big 3 (Squat, Bench, Deadlift)
            // For now, let's just take the max weight ever lifted across any exercise as a proxy for "Power"

            let maxWeight = 0;
            logs.forEach(log => {
                if (log.weight > maxWeight) maxWeight = log.weight;
            });

            setTotalLifted(maxWeight);

            if (maxWeight > 140) setLevel('Elite');
            else if (maxWeight > 100) setLevel('Advanced');
            else if (maxWeight > 60) setLevel('Intermediate');
            else setLevel('Novice');
        };
        loadStrength();
    }, []);

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Crown className="w-24 h-24" />
            </div>

            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <BicepsFlexed className="w-4 h-4 text-[var(--color-accent)]" />
                Strength Level
            </h3>

            <div className="mt-4">
                <div className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                    {level}
                </div>
                <div className="text-[var(--color-text-muted)] text-xs mt-1">
                    Max Lift: <span className="text-[var(--color-text-primary)] font-medium">{totalLifted}kg</span>
                </div>

                {/* Progress Bar to next level */}
                <div className="w-full bg-[var(--color-bg-tertiary)] h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-[var(--color-accent)] h-full rounded-full w-3/4" />
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">
                    Next: Elite
                </div>
            </div>
        </div>
    );
}
