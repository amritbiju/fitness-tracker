'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface NutritionGraphProps {
    data: { date: string; calories: number; protein: number }[];
    calorieTarget: number;
    proteinTarget: number;
    type: 'calories' | 'protein';
}

export function NutritionGraph({ data, calorieTarget, proteinTarget, type }: NutritionGraphProps) {
    const color = type === 'calories' ? '#FA114F' : '#A0FF03';
    const target = type === 'calories' ? calorieTarget : proteinTarget;
    const dataKey = type;

    return (
        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-4">
                {type === 'calories' ? 'Calories' : 'Protein'} Over Time
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), 'MMM d')}
                        stroke="var(--color-text-muted)"
                        fontSize={10}
                    />
                    <YAxis
                        stroke="var(--color-text-muted)"
                        fontSize={10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-tertiary)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'var(--color-text-primary)'
                        }}
                        labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                    />
                    <ReferenceLine
                        y={target}
                        stroke="rgba(255,255,255,0.3)"
                        strokeDasharray="5 5"
                        label={{ value: 'Target', fill: 'var(--color-text-muted)', fontSize: 10 }}
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ fill: color, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
