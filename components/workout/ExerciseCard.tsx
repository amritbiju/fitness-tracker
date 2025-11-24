'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, History } from 'lucide-react';
import { db, Exercise, WorkoutLog } from '@/lib/db';
import Link from 'next/link';

interface ExerciseCardProps {
    exercise: Exercise;
    workoutId: string;
}

export function ExerciseCard({ exercise, workoutId }: ExerciseCardProps) {
    const [sets, setSets] = useState<WorkoutLog[]>([]);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [lastLog, setLastLog] = useState<WorkoutLog | null>(null);

    // Load previous stats
    useEffect(() => {
        const loadHistory = async () => {
            const history = await db.logs
                .where('exerciseId')
                .equals(exercise.id!)
                .reverse()
                .sortBy('timestamp');

            if (history.length > 0) {
                setLastLog(history[0]);
                // Smart Default: Pre-fill weight
                setWeight(history[0].weight.toString());
            }
        };
        loadHistory();
    }, [exercise.id]);

    const addSet = async () => {
        if (!weight || !reps) return;

        const newSet: WorkoutLog = {
            workoutId,
            exerciseId: exercise.id!,
            setNumber: sets.length + 1,
            weight: parseFloat(weight),
            reps: parseFloat(reps),
            timestamp: Date.now(),
        };

        const id = await db.logs.add(newSet);
        setSets([...sets, { ...newSet, id: id as number }]);
        // Keep weight, clear reps? Or keep both? User said "Smart Defaults".
        // Usually reps change, weight stays same for a few sets.
        // But actually, if I just did 10 reps, I'm likely to do 10 again.
        // Let's keep both for speed.
    };

    return (
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Link href={`/analytics/${exercise.id}`} className="hover:underline decoration-[var(--color-text-muted)] underline-offset-4">
                        <h3 className="text-[var(--color-text-primary)] font-semibold text-lg">{exercise.name}</h3>
                    </Link>
                    {lastLog && (
                        <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs mt-1">
                            <History className="w-3 h-3" />
                            <span>Last: {lastLog.weight}kg × {lastLog.reps}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sets List */}
            <div className="space-y-2 mb-4">
                {sets.map((set, idx) => (
                    <div key={set.id || idx} className="flex items-center justify-between text-sm p-2 bg-[var(--color-bg-primary)] rounded-lg">
                        <span className="text-[var(--color-text-secondary)] w-8">#{set.setNumber}</span>
                        <span className="text-[var(--color-text-primary)] font-medium">{set.weight} <span className="text-[var(--color-text-muted)] text-xs">kg</span></span>
                        <span className="text-[var(--color-text-primary)] font-medium">{set.reps} <span className="text-[var(--color-text-muted)] text-xs">reps</span></span>
                        <Check className="w-4 h-4 text-[var(--color-success)]" />
                    </div>
                ))}
            </div>

            {/* Input Row */}
            <div className="flex gap-3 items-end">
                <div className="flex-1">
                    <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Weight</label>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-3 text-center font-medium focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Reps</label>
                    <input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-3 text-center font-medium focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                    />
                </div>
                <button
                    onClick={addSet}
                    className="bg-[var(--color-accent)] text-[var(--color-bg-primary)] p-3 rounded-xl hover:bg-[var(--color-accent-dim)] transition-colors"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
