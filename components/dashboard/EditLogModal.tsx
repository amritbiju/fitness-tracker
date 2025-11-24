'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { db, WorkoutLog } from '@/lib/db';

interface EditLogModalProps {
    log: WorkoutLog | null;
    onClose: () => void;
    onSave: () => void;
}

export function EditLogModal({ log, onClose, onSave }: EditLogModalProps) {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');

    useEffect(() => {
        if (log) {
            setWeight(log.weight.toString());
            setReps(log.reps.toString());
        }
    }, [log]);

    if (!log) return null;

    const handleSave = async () => {
        if (!weight || !reps) return;

        await db.logs.update(log.id!, {
            weight: parseFloat(weight),
            reps: parseFloat(reps),
            synced: false // Mark for re-sync
        });

        onSave();
        onClose();
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this set?')) {
            await db.logs.delete(log.id!);
            onSave();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--color-bg-secondary)] w-full max-w-xs rounded-3xl p-6 shadow-2xl ring-1 ring-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Edit Set</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Weight (kg)</label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-4 text-center text-xl font-bold focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Reps</label>
                        <input
                            type="number"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-4 text-center text-xl font-bold focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleDelete}
                            className="flex-1 bg-[var(--color-error)]/10 text-[var(--color-error)] font-bold rounded-xl p-4 hover:bg-[var(--color-error)]/20 transition-colors flex justify-center"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-bold rounded-xl p-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
