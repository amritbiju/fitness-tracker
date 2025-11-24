'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { db, Exercise } from '@/lib/db';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { RunLogger } from '@/components/workout/RunLogger';
import Link from 'next/link';

export default function WorkoutPage() {
    const params = useParams();
    const router = useRouter();
    const workoutType = params.id as string;
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workoutId] = useState(() => crypto.randomUUID()); // Generate ID for this session

    useEffect(() => {
        const loadExercises = async () => {
            if (workoutType === 'run') return;

            // Case-insensitive match for muscle group (Push, Pull, Legs, Core)
            // Capitalize first letter to match DB
            const type = workoutType.charAt(0).toUpperCase() + workoutType.slice(1);

            const data = await db.exercises
                .where('muscleGroup')
                .equals(type)
                .toArray();

            setExercises(data);
        };
        loadExercises();
    }, [workoutType]);

    const isRun = workoutType === 'run';
    const title = workoutType.charAt(0).toUpperCase() + workoutType.slice(1);

    return (
        <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 pb-24 max-w-md mx-auto">
            <header className="flex items-center gap-4 mb-8 mt-2">
                <Link href="/" className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {title} Session
                </h1>
            </header>

            {isRun ? (
                <RunLogger workoutId={workoutId} />
            ) : (
                <div className="space-y-4">
                    {exercises.map((ex) => (
                        <ExerciseCard key={ex.id} exercise={ex} workoutId={workoutId} />
                    ))}

                    {/* Add Exercise Button (Placeholder for now) */}
                    <button className="w-full py-4 border-2 border-dashed border-[var(--color-bg-tertiary)] rounded-2xl text-[var(--color-text-muted)] font-medium flex items-center justify-center gap-2 hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all">
                        <Plus className="w-5 h-5" />
                        <span>Add Exercise</span>
                    </button>
                </div>
            )}
        </main>
    );
}
