'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { db, NutritionLog } from '@/lib/db';
import { NutritionStats } from '@/components/nutrition/NutritionStats';
import { NutritionGraph } from '@/components/nutrition/NutritionGraph';
import { FoodHistory } from '@/components/nutrition/FoodHistory';
import { format, subDays, startOfDay } from 'date-fns';

type TimeRange = 'week' | 'month' | 'all';

export default function NutritionPage() {
    const [logs, setLogs] = useState<NutritionLog[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [refresh, setRefresh] = useState(0);

    const CALORIE_TARGET = 1800;
    const PROTEIN_TARGET = 100;

    useEffect(() => {
        const loadData = async () => {
            const allLogs = await db.nutrition.orderBy('date').reverse().toArray();
            setLogs(allLogs);
        };
        loadData();
    }, [refresh]);

    // Filter logs based on time range
    const now = new Date();
    const cutoffDate = timeRange === 'week'
        ? subDays(now, 7)
        : timeRange === 'month'
            ? subDays(now, 30)
            : new Date(0);

    const filteredLogs = logs.filter(log => new Date(log.date) >= cutoffDate);

    // Calculate stats
    const uniqueDates = new Set(filteredLogs.map(l => l.date));
    const numDays = uniqueDates.size || 1;

    const totalCalories = filteredLogs.reduce((sum, l) => sum + l.calories, 0);
    const totalProtein = filteredLogs.reduce((sum, l) => sum + l.protein, 0);

    const avgCalories = totalCalories / numDays;
    const avgProtein = totalProtein / numDays;

    const weeklyTarget = CALORIE_TARGET * 7;
    const last7Days = logs.filter(l => new Date(l.date) >= subDays(now, 7));
    const weeklyActual = last7Days.reduce((sum, l) => sum + l.calories, 0);
    const weeklyDeficit = weeklyTarget - weeklyActual;

    // Prepare graph data
    const dailyData: Record<string, { calories: number; protein: number }> = {};
    filteredLogs.forEach(log => {
        if (!dailyData[log.date]) {
            dailyData[log.date] = { calories: 0, protein: 0 };
        }
        dailyData[log.date].calories += log.calories;
        dailyData[log.date].protein += log.protein;
    });

    const graphData = Object.entries(dailyData)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 pb-24 max-w-md mx-auto">
            <header className="flex items-center gap-4 mb-8 mt-2">
                <Link href="/" className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    Nutrition
                </h1>
            </header>

            {/* Time Range Selector */}
            <div className="flex gap-2 mb-6">
                {(['week', 'month', 'all'] as TimeRange[]).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all ${timeRange === range
                                ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
                            }`}
                    >
                        {range === 'all' ? 'All Time' : `This ${range}`}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <NutritionStats
                avgCalories={avgCalories}
                avgProtein={avgProtein}
                weeklyDeficit={weeklyDeficit}
                calorieTarget={CALORIE_TARGET}
                proteinTarget={PROTEIN_TARGET}
            />

            {/* Graphs */}
            <div className="space-y-4 mb-8">
                <NutritionGraph
                    data={graphData}
                    calorieTarget={CALORIE_TARGET}
                    proteinTarget={PROTEIN_TARGET}
                    type="calories"
                />
                <NutritionGraph
                    data={graphData}
                    calorieTarget={CALORIE_TARGET}
                    proteinTarget={PROTEIN_TARGET}
                    type="protein"
                />
            </div>

            {/* Food History */}
            <section>
                <h2 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                    Food History
                </h2>
                <FoodHistory logs={filteredLogs} onDelete={() => setRefresh(r => r + 1)} />
            </section>

            {/* Quick Log Button */}
            <Link
                href="/"
                className="fixed bottom-8 right-8 bg-[#6366F1] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 z-50"
            >
                <Plus className="w-6 h-6" />
            </Link>
        </main>
    );
}
