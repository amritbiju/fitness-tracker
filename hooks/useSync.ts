'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { useUser } from '@/components/auth/UserContext';

export function useSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const { user } = useUser();

    // Migration Logic: Claim anonymous data
    useEffect(() => {
        if (!user) return;

        const migrateData = async () => {
            try {
                // Find all logs without a userId
                // Note: Dexie might not index 'undefined' well for userId if we just added it, 
                // so we might need to iterate or check for records where userId is missing.
                // Since we just added the field, ALL existing records have undefined userId.

                // We'll do this table by table
                await db.transaction('rw', db.logs, db.nutrition, db.supplements, db.body_metrics, async () => {
                    // Logs
                    await db.logs.filter(l => !l.userId).modify({ userId: user.id });
                    // Nutrition
                    await db.nutrition.filter(n => !n.userId).modify({ userId: user.id });
                    // Supplements
                    await db.supplements.filter(s => !s.userId).modify({ userId: user.id });
                    // Body Metrics
                    await db.body_metrics.filter(b => !b.userId).modify({ userId: user.id });
                });

            } catch (err) {
                console.error('Migration failed:', err);
            }
        };

        migrateData();
    }, [user]);

    // Sync Logic
    useEffect(() => {
        if (!user) return;

        const sync = async () => {
            setIsSyncing(true);
            try {
                // 1. PUSH: Find unsynced local logs for THIS user
                const pendingLogs = await db.logs
                    .where('userId').equals(user.id)
                    .filter(l => !l.synced)
                    .toArray();

                if (pendingLogs.length > 0) {
                    const { error } = await supabase.from('workout_logs').insert(
                        pendingLogs.map(l => ({
                            workout_id: l.workoutId,
                            exercise_id: l.exerciseId,
                            set_number: l.setNumber,
                            weight: l.weight,
                            reps: l.reps,
                            notes: l.notes,
                            timestamp: l.timestamp,
                            user_id: user.id
                        }))
                    );

                    if (!error) {
                        // Mark as synced locally
                        await db.logs.bulkUpdate(
                            pendingLogs.map(l => ({ key: l.id!, changes: { synced: true } }))
                        );
                    } else {
                        console.error('Sync Push Error:', error);
                    }
                }

                // 2. PULL: Get recent logs from Supabase
                // In a real app, we'd track 'last_pulled_at'
                const { data: remoteLogs, error: pullError } = await supabase
                    .from('workout_logs')
                    .select('*')
                    .eq('user_id', user.id) // IMPORTANT: Filter by user
                    .order('timestamp', { ascending: false })
                    .limit(50);

                if (remoteLogs && !pullError) {
                    // Upsert into local DB
                    // We need a way to map UUIDs back to local IDs or just rely on content
                    // For now, let's just log it. Full bidirectional sync is complex.
                    // We will assume "Local First" is the source of truth for THIS device for now.
                    // To make it truly multi-device, we'd need to check if these logs exist locally.
                }

            } catch (err) {
                console.error('Sync failed:', err);
            } finally {
                setIsSyncing(false);
            }
        };

        // Run sync on mount and every minute
        sync();
        const interval = setInterval(sync, 60000);
        return () => clearInterval(interval);
    }, [user]);

    return { isSyncing, user };
}
