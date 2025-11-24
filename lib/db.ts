import Dexie, { Table } from 'dexie';

export interface Exercise {
    id?: number;
    name: string;
    muscleGroup: string; // 'Push', 'Pull', 'Legs', 'Core', 'Run'
    isCustom: boolean;
    userId?: string; // Optional for default exercises, required for custom
}

export interface WorkoutLog {
    id?: number;
    workoutId: string; // UUID for the session
    exerciseId: number;
    setNumber: number;
    weight: number;
    reps: number;
    distance?: number; // For runs (km)
    duration?: number; // For runs (min)
    notes?: string;
    timestamp: number;
    synced?: boolean;
    userId: string;
}

export interface NutritionLog {
    id?: number;
    date: string; // YYYY-MM-DD
    itemName: string;
    calories: number;
    protein: number;
    quantity: string;
    synced?: boolean;
    userId: string;
}

export interface SupplementLog {
    id?: number;
    date: string; // YYYY-MM-DD
    itemName: string;
    isTaken: boolean;
    timeGroup: string; // 'empty_stomach', 'breakfast', etc.
    synced?: boolean;
    userId: string;
}

export interface StapleFood {
    id?: number;
    name: string;
    calories: number; // per 100g/1 unit
    protein: number; // per 100g/1 unit
    unit: 'g' | 'oz' | 'unit' | 'scoop';
    userId?: string; // Optional for global staples
}

export interface BodyMetric {
    id?: number;
    date: string; // YYYY-MM-DD
    weight: number;
    synced?: boolean;
    userId: string;
}

export interface UserSettings {
    id?: number;
    userId: string;
    calorieTarget: number;
    proteinTarget: number;
    synced?: boolean;
}

class FitnessDatabase extends Dexie {
    exercises!: Table<Exercise>;
    logs!: Table<WorkoutLog>;
    nutrition!: Table<NutritionLog>;
    supplements!: Table<SupplementLog>;
    staples!: Table<StapleFood>;
    body_metrics!: Table<BodyMetric>;
    settings!: Table<UserSettings>;

    constructor() {
        super('fitness-tracker-db');
        this.version(6).stores({
            exercises: '++id, name, muscleGroup, userId',
            logs: '++id, workoutId, exerciseId, timestamp, userId, [synced+timestamp]',
            nutrition: '++id, date, userId, [synced+date]',
            supplements: '++id, date, userId, [date+timeGroup], [synced+date]',
            staples: '++id, name, userId',
            body_metrics: '++id, date, userId, [synced+date]',
            settings: '++id, userId, [synced+userId]'
        });
    }
}

export const db = new FitnessDatabase();
