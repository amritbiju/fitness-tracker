'use client';

import { useEffect } from 'react';
import { db } from '@/lib/db';

const INITIAL_EXERCISES = [
    // Push
    { name: 'Incline Press', muscleGroup: 'Push', isCustom: false },
    { name: 'Flat Bench Press', muscleGroup: 'Push', isCustom: false },
    { name: 'Overhead Press (OHP)', muscleGroup: 'Push', isCustom: false },
    { name: 'Lateral Raises', muscleGroup: 'Push', isCustom: false },
    { name: 'Zindabad (Tricep Ext)', muscleGroup: 'Push', isCustom: false },
    { name: 'Cable Flyes', muscleGroup: 'Push', isCustom: false },

    // Pull
    { name: 'Pull-Ups', muscleGroup: 'Pull', isCustom: false },
    { name: 'Lat Pulldown', muscleGroup: 'Pull', isCustom: false },
    { name: 'Seated Cable Rows', muscleGroup: 'Pull', isCustom: false },
    { name: 'Face Pulls', muscleGroup: 'Pull', isCustom: false },
    { name: 'Hammer Curls', muscleGroup: 'Pull', isCustom: false },
    { name: 'Bicep Curls', muscleGroup: 'Pull', isCustom: false },
    { name: 'Deadhang', muscleGroup: 'Pull', isCustom: false },

    // Legs
    { name: 'Barbell Squat', muscleGroup: 'Legs', isCustom: false },
    { name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', isCustom: false },
    { name: 'Leg Extension', muscleGroup: 'Legs', isCustom: false },
    { name: 'Leg Curls', muscleGroup: 'Legs', isCustom: false },
    { name: 'Calf Raises', muscleGroup: 'Legs', isCustom: false },

    // Core
    { name: 'Cable Crunch', muscleGroup: 'Core', isCustom: false },
    { name: 'Hanging Leg Raise', muscleGroup: 'Core', isCustom: false },
    { name: 'Cable Woodchoppers', muscleGroup: 'Core', isCustom: false },
    { name: 'Plank', muscleGroup: 'Core', isCustom: false },
];

export function DbInitializer() {
    useEffect(() => {
        const seed = async () => {
            const count = await db.exercises.count();
            if (count === 0) {
                await db.exercises.bulkAdd(INITIAL_EXERCISES);
                console.log('Database seeded with initial exercises');
            }
        };
        seed();
    }, []);

    return null;
}
