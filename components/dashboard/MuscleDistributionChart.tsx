'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { db } from '@/lib/db';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7']; // Blue, Green, Yellow, Red, Purple

export function MuscleDistributionChart() {
    const [data, setData] = useState<{ name: string; value: number }[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const logs = await db.logs.toArray();
            const exercises = await db.exercises.toArray();
            const exerciseMap = new Map(exercises.map(e => [e.id!, e.muscleGroup]));

            const counts: Record<string, number> = {};

            logs.forEach(log => {
                const muscle = exerciseMap.get(log.exerciseId) || 'Unknown';
                counts[muscle] = (counts[muscle] || 0) + 1;
            });

            const chartData = Object.entries(counts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            setData(chartData);
        };
        loadData();
    }, []);

    if (data.length === 0) return null;

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-2xl h-80">
            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                Training Split
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--bg-secondary)" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--text-primary)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
