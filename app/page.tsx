'use client';

import { format } from 'date-fns';
import { SupplementsChecklist } from '@/components/dashboard/SupplementsChecklist';
import { WorkoutSelector } from '@/components/dashboard/WorkoutSelector';
import { NutritionBar } from '@/components/dashboard/NutritionBar';
import { HistoryList } from '@/components/dashboard/HistoryList';
import { ActivityRings } from '@/components/dashboard/ActivityRings';
import { WeightLogger } from '@/components/dashboard/WeightLogger';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const today = new Date();

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <header className="mb-8 mt-2 flex justify-between items-center">
        <h1 className="text-2xl tracking-tight">
          <span className="font-bold text-[var(--color-text-primary)]">{format(today, 'EEEE')}</span>
          <span className="font-normal text-[var(--color-text-secondary)]">, {format(today, 'MMMM d')}</span>
        </h1>
        <Link href="/settings" className="p-2 -mr-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      <div className="space-y-6">
        {/* Activity Rings */}
        <ActivityRings />

        {/* Supplements (Full Width) */}
        <SupplementsChecklist />

        <div className="pt-2">
          <WorkoutSelector />
        </div>

        <div className="space-y-2">
          <h2 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest ml-1">Nutrition</h2>
          <NutritionBar />
        </div>

        {/* Weight Logger - Moved here */}
        <WeightLogger />

        {/* Recent Activity - No redundant header */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[var(--color-text-primary)] text-xl font-semibold">Recent Activity</h2>
            <Link href="/dashboard" className="text-[var(--color-text-secondary)] text-sm hover:text-[var(--color-accent)] transition-colors">
              View All -&gt;
            </Link>
          </div>
          <HistoryList />
        </div>
      </div>
    </main>
  );
}
