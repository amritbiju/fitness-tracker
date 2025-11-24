'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, Trash2, User as UserIcon, Target } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { useUser } from '@/components/auth/UserContext';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    // Goals State
    const [calTarget, setCalTarget] = useState('1800');
    const [proteinTarget, setProteinTarget] = useState('100');
    const [goalsSaved, setGoalsSaved] = useState(false);

    // Fetch existing settings
    const userSettings = useLiveQuery(async () => {
        if (!user) return null;
        return await db.settings.where('userId').equals(user.id).first();
    }, [user]);

    useEffect(() => {
        if (userSettings) {
            setCalTarget(userSettings.calorieTarget.toString());
            setProteinTarget(userSettings.proteinTarget.toString());
        }
    }, [userSettings]);

    const handleSaveGoals = async () => {
        if (!user) return;

        const cals = parseInt(calTarget) || 1800;
        const protein = parseInt(proteinTarget) || 100;

        if (userSettings) {
            await db.settings.update(userSettings.id!, { calorieTarget: cals, proteinTarget: protein, synced: false });
        } else {
            await db.settings.add({ userId: user.id, calorieTarget: cals, proteinTarget: protein, synced: false });
        }

        setGoalsSaved(true);
        setTimeout(() => setGoalsSaved(false), 2000);
    };

    const handleSignOut = async () => {
        if (!confirm('Are you sure you want to sign out? Unsynced data might be lost.')) return;

        setLoading(true);
        try {
            // 1. Clear local database to ensure privacy
            await db.delete();
            await db.open(); // Re-open to reset for next user (or let reload handle it)

            // 2. Sign out from Supabase
            await supabase.auth.signOut();

            // 3. Redirect
            router.push('/');
            window.location.reload(); // Force reload to clear any in-memory state
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        if (!confirm('WARNING: This will delete ALL data on this device. This cannot be undone. Are you sure?')) return;

        try {
            await db.delete();
            await db.open();
            alert('Local data cleared successfully.');
            window.location.reload();
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Failed to clear data.');
        }
    };

    return (
        <main className="min-h-screen bg-[var(--color-bg-primary)] p-6 max-w-md mx-auto">
            <header className="flex items-center gap-4 mb-8 mt-2">
                <Link href="/" className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    Settings
                </h1>
            </header>

            <div className="space-y-6">
                {/* Profile Section */}
                <section className="bg-[var(--color-bg-secondary)] rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-[var(--color-text-primary)]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[var(--color-text-primary)]">Account</h2>
                            <p className="text-sm text-[var(--color-text-secondary)]">{user?.email}</p>
                        </div>
                    </div>
                </section>

                {/* Goals Section */}
                <section className="bg-[var(--color-bg-secondary)] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-[var(--color-accent)]" />
                        <h2 className="font-bold text-[var(--color-text-primary)]">Daily Goals</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Calories</label>
                            <input
                                type="number"
                                value={calTarget}
                                onChange={(e) => setCalTarget(e.target.value)}
                                className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-3 mt-1 outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                            />
                        </div>
                        <div>
                            <label className="text-[var(--color-text-muted)] text-xs uppercase font-bold ml-1">Protein (g)</label>
                            <input
                                type="number"
                                value={proteinTarget}
                                onChange={(e) => setProteinTarget(e.target.value)}
                                className="w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl p-3 mt-1 outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                            />
                        </div>
                        <button
                            onClick={handleSaveGoals}
                            className={`w-full p-3 rounded-xl font-medium transition-all ${goalsSaved ? 'bg-[var(--color-success)] text-black' : 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]'}`}
                        >
                            {goalsSaved ? 'Saved!' : 'Update Goals'}
                        </button>
                    </div>
                </section>

                {/* Actions */}
                <section className="space-y-3">
                    <button
                        onClick={handleSignOut}
                        disabled={loading}
                        className="w-full flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>

                    <div className="pt-8">
                        <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-3 ml-1">
                            Danger Zone
                        </h3>
                        <button
                            onClick={handleClearData}
                            className="w-full flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="font-medium">Clear Local Data</span>
                        </button>
                        <p className="mt-2 text-xs text-[var(--color-text-muted)] px-1">
                            Clearing local data removes all workouts and logs from this device.
                            Data already synced to the cloud will be preserved.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
