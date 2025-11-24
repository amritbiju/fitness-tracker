'use client';

import { useState, useEffect } from 'react';
import { Scale, Check, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUser } from '@/components/auth/UserContext';

export function WeightLogger() {
    const { user } = useUser();
    const today = format(new Date(), 'yyyy-MM-dd');
    const [weight, setWeight] = useState('');
    const [saved, setSaved] = useState(false);

    const existingEntry = useLiveQuery(async () => {
        if (!user) return null;
        return await db.body_metrics
            .where('date').equals(today)
            .filter(b => b.userId === user.id)
            .first();
    }, [user, today]);

    useEffect(() => {
        if (existingEntry) {
            setWeight(existingEntry.weight.toString());
            setSaved(true);
        }
    }, [existingEntry]);

    const handleSave = async () => {
        if (!weight || !user) return;

        const val = parseFloat(weight);
        if (existingEntry) {
            await db.body_metrics.update(existingEntry.id!, { weight: val, synced: false });
        } else {
            await db.body_metrics.add({
                date: today,
                weight: val,
                synced: false,
                userId: user.id
            });
        }
        setSaved(true);

        // Reset saved state after 2s for feedback
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-[var(--color-bg-tertiary)] p-2.5 rounded-2xl">
                    <Scale className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </div>

                <div>
                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-0.5">
                        Weigh In
                    </div>
                    <div className="flex items-end gap-1">
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0.0"
                            className="bg-transparent text-xl font-bold text-[var(--color-text-primary)] w-16 outline-none placeholder:text-[var(--color-text-muted)] p-0 m-0"
                        />
                        <span className="text-sm text-[var(--color-text-muted)] mb-1">kg</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className={`p-3 rounded-xl transition-all ${saved ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-accent)] text-white hover:opacity-90'}`}
            >
                {saved ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
        </div>
    );
}
