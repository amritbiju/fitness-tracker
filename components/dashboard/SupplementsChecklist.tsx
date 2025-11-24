'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';

// Define the schedule with time groups
const SCHEDULE = {
    morning: {
        label: 'Morning',
        items: ['Taurine 750 mg', 'NAC 600 mg', 'B-complex', 'Pre-workout', 'Omega-3 (2 softgels)', 'Probiotic', 'Collagen (8 g)', 'Glutathione']
    },
    afternoon: {
        label: 'Afternoon',
        items: ['Berberine blend (2 capsules)', 'Psyllium husk']
    },
    night: {
        label: 'Night',
        items: ['Magnesium bisglycinate', 'Lutein + zeaxanthin']
    }
};

export function SupplementsChecklist() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch today's logs from DB
    const logs = useLiveQuery(() =>
        db.supplements.where('date').equals(today).toArray()
    ) || [];

    // Create a Set of taken items for easy lookup
    const takenItems = new Set(logs.filter(l => l.isTaken).map(l => l.itemName));

    // Flatten all items to get the daily total
    const allItems = Object.values(SCHEDULE).flatMap(group => group.items);
    const totalCount = allItems.length;
    const completedCount = takenItems.size;

    const toggleCheck = async (item: string, timeGroup: string) => {
        const isTaken = takenItems.has(item);

        if (isTaken) {
            // Untake: Find the log and delete it
            const log = logs.find(l => l.itemName === item);
            if (log) {
                await db.supplements.delete(log.id!);
            }
        } else {
            // Take: Add new log
            await db.supplements.add({
                date: today,
                itemName: item,
                isTaken: true,
                timeGroup,
                synced: false
            });
        }
    };

    const toggleGroup = (groupKey: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupKey)) {
            newExpanded.delete(groupKey);
        } else {
            newExpanded.add(groupKey);
        }
        setExpandedGroups(newExpanded);
    };

    return (
        <div className="mb-0">
            {/* Pill Header - Always shows count */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-[var(--color-bg-secondary)] rounded-2xl p-4 flex items-center justify-between hover:bg-[var(--color-bg-tertiary)] transition-all active:scale-98"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${completedCount === totalCount ? 'bg-[#A0FF03] text-black' : 'bg-[#6366F1] text-white'}`}>
                        {completedCount}/{totalCount}
                    </div>
                    <span className="text-[var(--color-text-primary)] font-medium text-sm uppercase tracking-wide">
                        Supplements
                    </span>
                </div>
                <div className={`text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>

            {/* Expanded List - Grouped by Time */}
            {isExpanded && (
                <div className="mt-2 bg-[var(--color-bg-secondary)] rounded-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 ring-1 ring-white/5">
                    {Object.entries(SCHEDULE).map(([groupKey, group]) => {
                        const groupItems = group.items;
                        const groupCompleted = groupItems.filter(item => takenItems.has(item)).length;
                        const isGroupExpanded = expandedGroups.has(groupKey);

                        return (
                            <div key={groupKey} className="border-b border-[var(--color-bg-tertiary)] last:border-0">
                                {/* Group Header */}
                                <button
                                    onClick={() => toggleGroup(groupKey)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-[var(--color-text-primary)]">{group.label}</span>
                                        <span className="text-xs text-[var(--color-text-muted)]">{groupCompleted}/{groupItems.length}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Group Items */}
                                {isGroupExpanded && (
                                    <div className="bg-[var(--color-bg-primary)]/30">
                                        {groupItems.map((item, index) => {
                                            const isChecked = takenItems.has(item);
                                            return (
                                                <div
                                                    key={item}
                                                    onClick={() => toggleCheck(item, groupKey)}
                                                    className={`flex items-center justify-between p-3 px-5 cursor-pointer transition-all ${index !== groupItems.length - 1 ? 'border-b border-[var(--color-bg-tertiary)]' : ''
                                                        } ${isChecked ? 'bg-[var(--color-bg-primary)]/50' : 'hover:bg-[var(--color-bg-tertiary)]'}`}
                                                >
                                                    <span className={`text-sm ${isChecked ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                                                        {item}
                                                    </span>
                                                    {isChecked ? (
                                                        <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-[var(--color-text-muted)]" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
