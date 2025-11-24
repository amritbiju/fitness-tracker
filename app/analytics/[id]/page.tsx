'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, Calendar, Dumbbell, Award } from 'lucide-react';
import Link from 'next/link';
import { db, Exercise, WorkoutLog } from '@/lib/db';
import { ProgressChart } from '@/components/analytics/ProgressChart';
import { format, differenceInDays } from 'date-fns';

export default function AnalyticsPage() {
    const params = useParams();
    const exerciseId = parseInt(params.id as string);
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [history, setHistory] = useState<WorkoutLog[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (isNaN(exerciseId)) return;

            const ex = await db.exercises.get(exerciseId);
            setExercise(ex || null);

            const logs = await db.logs
                .where('exerciseId')
                .equals(exerciseId)
                .reverse()
                .sortBy('timestamp');

            setHistory(logs);
        };
        loadData();
    }, [exerciseId]);

    if (!exercise) return <div className="p-6 text-[var(--color-text-muted)]">Loading...</div>;

    // Calculate Stats
    const pr = history.length > 0 ? Math.max(...history.map(l => l.weight)) : 0;
    const totalSets = history.length;
    const totalVolume = history.reduce((sum, log) => sum + (log.weight * log.reps), 0);

    // Frequency (days since first log)
    const firstLog = history.length > 0 ? history[history.length - 1].timestamp : Date.now();
    const daysSinceFirst = differenceInDays(Date.now(), firstLog);
    const frequency = daysSinceFirst > 0 ? (totalSets / daysSinceFirst).toFixed(1) : '0';

    // Average weight and reps
    const avgWeight = totalSets > 0 ? (history.reduce((sum, l) => sum + l.weight, 0) / totalSets).toFixed(1) : '0';
    const avgReps = totalSets > 0 ? (history.reduce((sum, l) => sum + l.reps, 0) / totalSets).toFixed(1) : '0';

    // Prepare chart data (Max weight per day)
    const chartDataMap = new Map<string, { date: number, weight: number }>();

    [...history].reverse().forEach(log => {
        const dateStr = format(log.timestamp, 'yyyy-MM-dd');
        const currentMax = chartDataMap.get(dateStr)?.weight || 0;
        if (log.weight > currentMax) {
            chartDataMap.set(dateStr, { date: log.timestamp, weight: log.weight });
        }
    });

    const chartData = Array.from(chartDataMap.values());

    return (
        <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 pb-24 max-w-md mx-auto">
            <header className="flex items-center gap-4 mb-8 mt-2">
                <Link href="/dashboard" className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {exercise.name}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-sm">{exercise.muscleGroup}</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-[#FA114F]" />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase font-bold">PR</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{pr}<span className="text-sm font-normal text-[var(--color-text-muted)]">kg</span></p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="w-4 h-4 text-[#A0FF03]" />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase font-bold">Volume</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{(totalVolume / 1000).toFixed(1)}<span className="text-sm font-normal text-[var(--color-text-muted)]">t</span></p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-[#6366F1]" />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase font-bold">Avg</span>
                    </div>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">{avgWeight}kg × {avgReps}</p>
                </div>

                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase font-bold">Frequency</span>
                    </div>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">{frequency}<span className="text-sm font-normal text-[var(--color-text-muted)]">/day</span></p>
                </div>
            </div>

            <section className="mb-8">
                <h2 className="text-[var(--color-text-secondary)] text-sm font-medium mb-3 uppercase tracking-wider">
                    Performance Curve
                </h2>
                <ProgressChart data={chartData} />
            </section>

            <section>
                <h2 className="text-[var(--color-text-secondary)] text-sm font-medium mb-3 uppercase tracking-wider">
                    History ({totalSets} sets)
                </h2>
                <div className="space-y-2">
                    {history.map((log) => (
                        <div key={log.id} className="bg-[var(--color-bg-secondary)] p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <div className="text-[var(--color-text-primary)] font-medium">
                                    {format(log.timestamp, 'MMM d, yyyy')}
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
                    ))}
                    {history.length === 0 && (
                        <div className="text-[var(--color-text-muted)] text-center py-12">
                            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No history yet</p>
                            <p className="text-xs mt-1">Start logging to see your progress</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
