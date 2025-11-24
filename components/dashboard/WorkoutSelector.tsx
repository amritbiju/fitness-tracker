'use client';

import Link from 'next/link';

const PRIMARY_WORKOUTS = [
    { id: 'push', name: 'Push' },
    { id: 'pull', name: 'Pull' },
    { id: 'legs', name: 'Legs' },
];

const SECONDARY_WORKOUTS = [
    { id: 'core', name: 'Core' },
    { id: 'run', name: 'Run' },
];

export function WorkoutSelector() {
    return (
        <div className="space-y-3 mb-8">
            {/* Primary Workouts - Larger */}
            <div className="grid grid-cols-3 gap-3">
                {PRIMARY_WORKOUTS.map((workout) => (
                    <Link
                        key={workout.id}
                        href={`/workout/${workout.id}`}
                        className="bg-[var(--color-bg-secondary)] p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-[var(--color-bg-tertiary)] transition-all active:scale-95 cursor-pointer border border-transparent hover:border-[var(--color-bg-tertiary)]"
                    >
                        <span className="font-semibold text-base tracking-wide">{workout.name}</span>
                    </Link>
                ))}
            </div>

            {/* Secondary Workouts - Smaller */}
            <div className="grid grid-cols-2 gap-3">
                {SECONDARY_WORKOUTS.map((workout) => (
                    <Link
                        key={workout.id}
                        href={`/workout/${workout.id}`}
                        className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-[var(--color-bg-tertiary)] transition-all active:scale-95 cursor-pointer border border-transparent hover:border-[var(--color-bg-tertiary)]"
                    >
                        <span className="font-medium text-sm tracking-wide text-[var(--color-text-secondary)]">{workout.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
