'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function useSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check auth status
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Sync Logic
    useEffect(() => {
        if (!user) return;

        const sync = async () => {
            setIsSyncing(true);
            try {
                // 1. PUSH: Find unsynced local logs
                const unsyncedLogs = await db.logs.where('synced').equals(0).toArray(); // Dexie treats boolean false as 0 in indices sometimes, but let's check
                // Actually, undefined or false. 
                // Let's just filter manually for safety or use filter()
                const pendingLogs = await db.logs.filter(l => !l.synced).toArray();

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

                // 2. PULL: Get recent logs from Supabase (Simplified for now)
                // In a real app, we'd track 'last_pulled_at'
                const { data: remoteLogs, error: pullError } = await supabase
                    .from('workout_logs')
                    .select('*')
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
