'use client';

import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { useUser } from '@/components/auth/UserContext';

export function RunLogger({ workoutId }: { workoutId: string }) {
    const { user } = useUser();
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [pace, setPace] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!distance || !duration || !user) return;

        // Create a special exercise for "Run" if it doesn't exist? 
        // Or assume workoutId implies a "Run" workout which has a "Run" exercise.
        // For now, let's find or create a "Run" exercise.
        let runExercise = await db.exercises.where('name').equals('Run').first();
        if (!runExercise) {
            const id = await db.exercises.add({ name: 'Run', muscleGroup: 'Legs', isCustom: false });
            runExercise = { id: id as number, name: 'Run', muscleGroup: 'Legs', isCustom: false };
        }

        await db.logs.add({
            workoutId,
            exerciseId: runExercise.id!,
            setNumber: 1, // Runs are usually 1 "set"
            weight: 0, // No weight
            reps: 0, // No reps
            distance: parseFloat(distance),
            duration: parseFloat(duration),
            notes: `Pace: ${pace}`,
            timestamp: Date.now(),
            userId: user.id,
            synced: false
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        // Clear form
        setDistance('');
        setDuration('');
        setPace('');
    };

    return (
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6">
            <h3 className="text-[var(--color-text-primary)] font-semibold text-lg mb-6">Run Details</h3>

            <div className="space-y-4">
                <div>
                    <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Distance (km)</label>
                    <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-4 font-medium focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                    />
                </div>

                <div>
                    <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Duration (min)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-4 font-medium focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                    />
                </div>

                <div>
                    <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Avg Pace (min/km)</label>
                    <input
                        type="text"
                        value={pace}
                        onChange={(e) => setPace(e.target.value)}
                        placeholder="e.g. 5:30"
                        className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-4 font-medium focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                    />
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-[var(--color-accent)] text-[var(--color-bg-primary)] p-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 hover:bg-[var(--color-accent-dim)] transition-colors"
                >
                    <Save className="w-5 h-5" />
                    <span>Save Run</span>
                </button>
            </div>
        </div>
    );
}
