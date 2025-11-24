import Dexie, { Table } from 'dexie';

export interface Exercise {
    id?: number;
    name: string;
    muscleGroup: string; // 'Push', 'Pull', 'Legs', 'Core', 'Run'
    isCustom: boolean;
}

export interface WorkoutLog {
    id?: number;
    workoutId: string; // UUID for the session
    exerciseId: number;
    setNumber: number;
    weight: number;
    reps: number;
    notes?: string;
    timestamp: number;
    synced?: boolean;
}

export interface NutritionLog {
    id?: number;
    date: string; // YYYY-MM-DD
    itemName: string;
    calories: number;
    protein: number;
    quantity: string;
    synced?: boolean;
}

export interface SupplementLog {
    id?: number;
    date: string; // YYYY-MM-DD
    itemName: string;
    isTaken: boolean;
    timeGroup: string; // 'empty_stomach', 'breakfast', etc.
    synced?: boolean;
}

export interface StapleFood {
    id?: number;
    name: string;
    calories: number; // per 100g/1 unit
    protein: number; // per 100g/1 unit
    unit: 'g' | 'oz' | 'unit' | 'scoop';
}

export interface BodyMetric {
    id?: number;
    date: string; // YYYY-MM-DD
    weight: number;
    synced?: boolean;
}

class FitnessDatabase extends Dexie {
    exercises!: Table<Exercise>;
    logs!: Table<WorkoutLog>;
    nutrition!: Table<NutritionLog>;
    supplements!: Table<SupplementLog>;
    staples!: Table<StapleFood>;
    body_metrics!: Table<BodyMetric>;

    constructor() {
        super('fitness-tracker-db');
        this.version(4).stores({
            exercises: '++id, name, muscleGroup',
            logs: '++id, workoutId, exerciseId, timestamp, [synced+timestamp]',
            nutrition: '++id, date, [synced+date]',
            supplements: '++id, date, [date+timeGroup], [synced+date]',
            staples: '++id, name',
            body_metrics: '++id, date, [synced+date]'
        });
    }
}

export const db = new FitnessDatabase();
