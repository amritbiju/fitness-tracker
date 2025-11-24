'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Dumbbell, Calendar } from 'lucide-react';
import Link from 'next/link';
import { db, WorkoutLog } from '@/lib/db';
import { ConsistencyHeatmap } from '@/components/dashboard/ConsistencyHeatmap';
import { SymmetryRadar } from '@/components/dashboard/SymmetryRadar';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type MuscleGroup = 'All' | 'Push' | 'Pull' | 'Legs' | 'Core' | 'Run';

export default function DashboardPage() {
    const [logs, setLogs] = useState<(WorkoutLog & { exerciseName?: string; muscleGroup?: string })[]>([]);
    const [filter, setFilter] = useState<MuscleGroup>('All');
    const [monthStats, setMonthStats] = useState({ workouts: 0, sets: 0, volume: 0 });

    useEffect(() => {
        const loadData = async () => {
            // Get all logs
            const allLogs = await db.logs.orderBy('timestamp').reverse().limit(100).toArray();

            // Enrich with exercise data
            const exerciseIds = new Set(allLogs.map(l => l.exerciseId));
            const exercises = await db.exercises.where('id').anyOf([...exerciseIds]).toArray();
            const exerciseMap = new Map(exercises.map(e => [e.id!, { name: e.name, muscleGroup: e.muscleGroup }]));

            const enriched = allLogs.map(log => ({
                ...log,
                exerciseName: exerciseMap.get(log.exerciseId)?.name || 'Unknown',
                muscleGroup: exerciseMap.get(log.exerciseId)?.muscleGroup || 'Unknown'
            }));

            setLogs(enriched);

            // Calculate month stats
            const now = new Date();
            const monthStart = startOfMonth(now).getTime();
            const monthEnd = endOfMonth(now).getTime();
            const monthLogs = enriched.filter(l => l.timestamp >= monthStart && l.timestamp <= monthEnd);

            const uniqueWorkouts = new Set(monthLogs.map(l => l.workoutId)).size;
            const totalSets = monthLogs.length;
            const totalVolume = monthLogs.reduce((sum, l) => sum + (l.weight * l.reps), 0);

            setMonthStats({
                workouts: uniqueWorkouts,
                sets: totalSets,
                volume: totalVolume
            });
        };

        loadData();
    }, []);

    // Filter logs
    const filteredLogs = filter === 'All'
        ? logs
        : logs.filter(l => l.muscleGroup === filter);

    // Group by date
    const groupedLogs: Record<string, typeof filteredLogs> = {};
    filteredLogs.forEach(log => {
        const dateKey = format(log.timestamp, 'EEEE, MMM d');
        if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
        groupedLogs[dateKey].push(log);
    });

    const filters: MuscleGroup[] = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Run'];

    return (
        <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 pb-24 max-w-md mx-auto">
            <header className="flex items-center gap-4 mb-8 mt-2">
                <Link href="/" className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    Analytics
                </h1>
            </header>

            {/* Month Stats Bar */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3 h-3 text-[#6366F1]" />
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Workouts</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{monthStats.workouts}</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="w-3 h-3 text-[#A0FF03]" />
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Sets</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{monthStats.sets}</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-[#FA114F]" />
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Volume</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">{(monthStats.volume / 1000).toFixed(1)}<span className="text-sm font-normal text-[var(--color-text-muted)]">t</span></p>
                </div>
            </div>

            {/* Big Picture Insights */}
            <div className="space-y-4 mb-8">
                {/* Consistency Heatmap */}
                <div>
                    <h2 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-3">Consistency</h2>
                    <ConsistencyHeatmap />
                </div>

                {/* Muscle Group Balance */}
                <div>
                    <h2 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-3">Balance</h2>
                    <div className="h-64">
                        <SymmetryRadar />
                    </div>
                </div>
            </div>

            {/* Logbook with Filters */}
            <section>
                <h2 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-3">Logbook</h2>

                {/* Filter Pills */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-6 px-6">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === f
                                    ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]'
                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Grouped Logs */}
                <div className="space-y-6">
                    {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                        <div key={date}>
                            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-3">
                                {date}
                            </h3>
                            <div className="space-y-2">
                                {dayLogs.map((log) => (
                                    <Link
                                        key={log.id}
                                        href={`/analytics/${log.exerciseId}`}
                                        className="block bg-[var(--color-bg-secondary)] p-4 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-[var(--color-text-primary)] font-medium">
                                                    {log.exerciseName}
                                                </div>
                                                <div className="text-[var(--color-text-muted)] text-xs">
                                                    Set {log.setNumber}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[var(--color-text-primary)] font-bold text-lg">
                                                    {log.weight}<span className="text-sm font-normal text-[var(--color-text-muted)]">kg</span>
                                                </div>
                                                <div className="text-[var(--color-text-secondary)] text-sm">
                                                    × {log.reps} reps
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredLogs.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No logs found</p>
                            <p className="text-xs mt-1">Start training to see your progress</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
