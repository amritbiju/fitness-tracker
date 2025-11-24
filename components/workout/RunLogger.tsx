'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export function RunLogger({ workoutId }: { workoutId: string }) {
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [pace, setPace] = useState('');

    const handleSave = () => {
        console.log('Saving run:', { distance, duration, pace, workoutId });
        // TODO: Save to DB
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
