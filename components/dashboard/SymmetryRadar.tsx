'use client';

import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/db';

export function SymmetryRadar() {
    const [data, setData] = useState<{ subject: string; A: number; fullMark: number }[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const logs = await db.logs.toArray();
            const exercises = await db.exercises.toArray();
            const exerciseMap = new Map(exercises.map(e => [e.id!, e.muscleGroup]));

            const counts: Record<string, number> = {
                Push: 0,
                Pull: 0,
                Legs: 0,
                Core: 0,
                Cardio: 0
            };

            logs.forEach(log => {
                // Map 'Run' to Cardio, others to their muscle group
                if (log.workoutId.includes('run')) {
                    counts['Cardio'] += 1;
                } else {
                    const group = exerciseMap.get(log.exerciseId);
                    if (group && counts[group] !== undefined) {
                        counts[group] += 1;
                    }
                }
            });

            // Normalize data for the chart (scale of 0-100 relative to max)
            const maxVal = Math.max(...Object.values(counts)) || 1;

            const chartData = Object.keys(counts).map(key => ({
                subject: key,
                A: (counts[key] / maxVal) * 100,
                fullMark: 100
            }));

            setData(chartData);
        };
        loadData();
    }, []);

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl h-full flex flex-col">
            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                Symmetry
            </h3>
            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="var(--color-bg-tertiary)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
                        <Radar
                            name="Training Balance"
                            dataKey="A"
                            stroke="var(--color-accent)"
                            fill="var(--color-accent)"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
