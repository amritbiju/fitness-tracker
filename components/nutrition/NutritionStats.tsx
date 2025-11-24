'use client';

import { TrendingUp, Dumbbell, Flame } from 'lucide-react';

interface NutritionStatsProps {
    avgCalories: number;
    avgProtein: number;
    weeklyDeficit: number;
    calorieTarget: number;
    proteinTarget: number;
}

export function NutritionStats({ avgCalories, avgProtein, weeklyDeficit, calorieTarget, proteinTarget }: NutritionStatsProps) {
    const isCaloriesOnTrack = avgCalories <= calorieTarget;
    const isProteinOnTrack = avgProtein >= proteinTarget * 0.9; // Within 90% is good
    const isDeficitGood = weeklyDeficit < 0; // Negative = deficit

    return (
        <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Daily Average Calories */}
            <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-[#6366F1]" />
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Avg Cals</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                    {Math.round(avgCalories)}
                </p>
                <p className={`text-[10px] mt-1 ${isCaloriesOnTrack ? 'text-[#A0FF03]' : 'text-[#FA114F]'}`}>
                    Target: {calorieTarget}
                </p>
            </div>

            {/* Protein Average */}
            <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-3 h-3 text-[#A0FF03]" />
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Avg Protein</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                    {Math.round(avgProtein)}<span className="text-sm font-normal text-[var(--color-text-muted)]">g</span>
                </p>
                <p className={`text-[10px] mt-1 ${isProteinOnTrack ? 'text-[#A0FF03]' : 'text-[#FA114F]'}`}>
                    Target: {proteinTarget}g
                </p>
            </div>

            {/* Weekly Deficit */}
            <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-3 h-3 text-[#FA114F]" />
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Deficit</span>
                </div>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {weeklyDeficit > 0 ? '+' : ''}{Math.round(weeklyDeficit)}
                </p>
                <p className={`text-[10px] mt-1 ${isDeficitGood ? 'text-[#A0FF03]' : 'text-[#FA114F]'}`}>
                    {isDeficitGood ? 'On track' : 'Overshooting'}
                </p>
            </div>
        </div>
    );
}
