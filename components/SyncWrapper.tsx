'use client';

import { useSync } from '@/hooks/useSync';

export function SyncWrapper({ children }: { children: React.ReactNode }) {
    useSync();
    return <>{children}</>;
}
