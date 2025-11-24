'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { db, WorkoutLog, Exercise } from '@/lib/db';
import { EditLogModal } from '@/components/dashboard/EditLogModal';
import { Pencil, ChevronDown } from 'lucide-react';
import { useUser } from '@/components/auth/UserContext';

export function HistoryList() {
    const { user } = useUser();
    const [logs, setLogs] = useState<(WorkoutLog & { exerciseName?: string })[]>([]);
    const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
    const [showAll, setShowAll] = useState(false);

    const loadHistory = async () => {
        if (!user) return;

        // Fetch last 20 logs for current user
        const recentLogs = await db.logs
            .where('userId').equals(user.id)
            .reverse()
            .sortBy('timestamp');

        // Limit manually
        const limitedLogs = recentLogs.slice(0, 20);

        // Fetch exercise names
        const exerciseIds = new Set(limitedLogs.map(l => l.exerciseId));
        const exercises = await db.exercises.where('id').anyOf([...exerciseIds]).toArray();
        const exerciseMap = new Map(exercises.map(e => [e.id!, e.name]));

        const enrichedLogs = limitedLogs.map(log => ({
            ...log,
            exerciseName: exerciseMap.get(log.exerciseId) || 'Unknown Exercise'
        }));

        setLogs(enrichedLogs);
    };

    useEffect(() => {
        loadHistory();
    }, [user]);

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">
                No history yet. Start your journey.
            </div>
        );
    }

    // Show only first 3 logs unless expanded
    const displayLogs = showAll ? logs : logs.slice(0, 3);

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {displayLogs.map((log) => (
                    <div
                        key={log.id}
                        onClick={() => setEditingLog(log)}
                        className="flex justify-between items-center py-3 border-b border-[var(--color-bg-tertiary)] last:border-0 cursor-pointer hover:bg-[var(--color-bg-secondary)]/50 transition-colors px-2 -mx-2 rounded-lg group"
                    >
                        <div>
                            <div className="text-[var(--color-text-primary)] font-medium">
                                {log.exerciseName}
                            </div>
                            <div className="text-[var(--color-text-muted)] text-xs mt-0.5">
                                {format(log.timestamp, 'MMM d')} • Set {log.setNumber}
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                            <div>
                                <span className="text-[var(--color-text-primary)] font-semibold">{log.weight}</span>
                                <span className="text-[var(--color-text-muted)] text-xs ml-1">kg</span>
                                <span className="mx-2 text-[var(--color-text-muted)]">×</span>
                                <span className="text-[var(--color-text-primary)] font-semibold">{log.reps}</span>
                            </div>
                            <Pencil className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>

            {logs.length > 3 && !showAll && (
                <button
                    onClick={() => setShowAll(true)}
                    className="w-full py-3 text-[var(--color-text-secondary)] text-sm font-medium hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center gap-2"
                >
                    Show More
                    <ChevronDown className="w-4 h-4" />
                </button>
            )}

            <EditLogModal
                log={editingLog}
                onClose={() => setEditingLog(null)}
                onSave={loadHistory}
            />
        </div>
    );
}
