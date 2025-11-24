'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { UserProvider, useUser } from './UserContext';

function AuthContent({ children }: { children: React.ReactNode }) {
    const { user, loading: userLoading } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (view === 'sign_up') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`
                    }
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-6">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                            {view === 'sign_in' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="mt-2 text-[var(--color-text-secondary)]">
                            Sign in to sync your workouts
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-xl p-4 focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-xl p-4 focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold rounded-xl p-4 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (view === 'sign_in' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => setView(view === 'sign_in' ? 'sign_up' : 'sign_in')}
                            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        >
                            {view === 'sign_in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export function AuthCheck({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AuthContent>{children}</AuthContent>
        </UserProvider>
    );
}
