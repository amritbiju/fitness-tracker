'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
    date: number;
    weight: number;
}

export function ProgressChart({ data }: { data: DataPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] rounded-2xl">
                No data yet. Start lifting!
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(d => ({
        date: format(d.date, 'MMM d'),
        weight: d.weight
    }));

    return (
        <div className="h-64 w-full bg-[var(--color-bg-secondary)] rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--color-accent)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--bg-primary)', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'var(--color-accent)' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
