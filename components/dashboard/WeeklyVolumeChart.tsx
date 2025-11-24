'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subWeeks, isSameWeek } from 'date-fns';
import { db } from '@/lib/db';

export function WeeklyVolumeChart() {
    const [data, setData] = useState<{ name: string; volume: number }[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const logs = await db.logs.toArray();

            // Generate last 4 weeks
            const weeks = Array.from({ length: 4 }, (_, i) => subWeeks(new Date(), 3 - i));

            const chartData = weeks.map(weekStart => {
                const weekVolume = logs
                    .filter(log => isSameWeek(new Date(log.timestamp), weekStart))
                    .reduce((acc, log) => acc + (log.weight * log.reps), 0);

                return {
                    name: format(weekStart, 'MMM d'),
                    volume: Math.round(weekVolume / 1000) // Convert to tons/kilos
                };
            });

            setData(chartData);
        };
        loadData();
    }, []);

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl h-64">
            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                Volume Trend
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis
                        dataKey="name"
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--bg-tertiary)' }}
                        contentStyle={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <Bar
                        dataKey="volume"
                        fill="var(--color-accent)"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
