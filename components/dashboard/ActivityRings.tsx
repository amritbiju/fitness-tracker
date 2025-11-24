'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useUser } from '@/components/auth/UserContext';

function Ring({ radius, stroke, progress, color }: { radius: number, stroke: number, progress: number, color: string }) {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="rotate-[-90deg]"
            >
                {/* Background Ring */}
                <circle
                    stroke={color}
                    strokeOpacity="0.2"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress Ring */}
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
        </div>
    );
}

export function ActivityRings() {
    const { user } = useUser();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch User Settings (Goals)
    const settings = useLiveQuery(async () => {
        if (!user) return null;
        return await db.settings.where('userId').equals(user.id).first();
    }, [user]);

    const TARGET_CALS = settings?.calorieTarget || 1800;
    const TARGET_PROTEIN = settings?.proteinTarget || 100;

    const logs = useLiveQuery(async () => {
        if (!user) return [];
        return await db.nutrition
            .where('date').equals(today)
            .filter(l => l.userId === user.id)
            .toArray();
    }, [user, today]) || [];

    const totals = logs.reduce((acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein
    }), { calories: 0, protein: 0 });

    const calProgress = Math.min((totals.calories / TARGET_CALS) * 100, 100);
    const proteinProgress = Math.min((totals.protein / TARGET_PROTEIN) * 100, 100);

    const calRemaining = Math.max(TARGET_CALS - totals.calories, 0);
    const proteinRemaining = Math.max(TARGET_PROTEIN - totals.protein, 0);

    return (
        <Link href="/nutrition" className="block">
            <div className="bg-[var(--color-bg-secondary)] p-5 rounded-3xl hover:bg-[var(--color-bg-tertiary)] transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Outer Ring: Calories (Neon Red) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Ring radius={64} stroke={12} progress={calProgress} color="#FA114F" />
                        </div>
                        {/* Inner Ring: Protein (Neon Green) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Ring radius={42} stroke={12} progress={proteinProgress} color="#A0FF03" />
                        </div>
                    </div>

                    <div className="flex-1 ml-6 space-y-4">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#FA114F]">Calories</span>
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{totals.calories} <span className="text-[var(--color-text-muted)]">/ {TARGET_CALS}</span></span>
                            </div>
                            <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                <div className="h-full bg-[#FA114F] rounded-full" style={{ width: `${calProgress}%` }} />
                            </div>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                {calProgress >= 100 ? '🎯 Target hit!' : `${calRemaining} cals to go`}
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#A0FF03]">Protein</span>
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{totals.protein}g <span className="text-[var(--color-text-muted)]">/ {TARGET_PROTEIN}g</span></span>
                            </div>
                            <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                <div className="h-full bg-[#A0FF03] rounded-full" style={{ width: `${proteinProgress}%` }} />
                            </div>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                {proteinProgress >= 100 ? '🎯 Target hit!' : `${proteinRemaining}g to go`}
                            </p>
                        </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                </div>
            </div>
        </Link>
    );
}
