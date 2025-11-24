'use client';

import { useState, useEffect } from 'react';
import { subDays, isSameDay } from 'date-fns';
import { db } from '@/lib/db';

export function ConsistencyHeatmap() {
    const [activityDates, setActivityDates] = useState<number[]>([]);

    useEffect(() => {
        const loadActivity = async () => {
            const logs = await db.logs.toArray();
            const dates = logs.map(l => l.timestamp);
            setActivityDates(dates);
        };
        loadActivity();
    }, []);

    // Generate last 28 days (4 weeks)
    const days = Array.from({ length: 28 }, (_, i) => {
        const date = subDays(new Date(), 27 - i);
        return date;
    });

    const hasActivity = (date: Date) => {
        return activityDates.some(d => isSameDay(new Date(d), date));
    };

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl">
            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-4">
                Consistency
            </h3>
            <div className="flex justify-between items-end gap-1">
                {days.map((date, i) => {
                    const active = hasActivity(date);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <div
                                className={`w-1.5 h-8 rounded-full transition-all duration-500 ${active
                                    ? 'bg-[var(--color-accent)] shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                    : 'bg-[var(--color-bg-tertiary)]'
                                    } ${isToday ? 'ring-1 ring-[var(--color-text-muted)] ring-offset-2 ring-offset-[var(--color-bg-secondary)]' : ''}`}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)] text-[10px] uppercase font-medium mt-3">
                <span>4 Weeks Ago</span>
                <span>Today</span>
            </div>
        </div>
    );
}
