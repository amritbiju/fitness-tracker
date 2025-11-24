'use client';

import { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryWarning } from 'lucide-react';
import { db } from '@/lib/db';
import { subHours } from 'date-fns';

export function RecoveryBattery() {
    const [percentage, setPercentage] = useState(100);

    useEffect(() => {
        const calculateRecovery = async () => {
            const logs = await db.logs.toArray();
            const last24h = Date.now() - (24 * 60 * 60 * 1000);

            // Calculate volume in last 24h
            const recentVolume = logs
                .filter(l => l.timestamp > last24h)
                .reduce((acc, l) => acc + (l.weight * l.reps), 0);

            // Simple algorithm: 
            // 0 volume = 100%
            // 10,000kg volume = 0% (exhausted)
            const maxVolume = 10000;
            const drain = Math.min((recentVolume / maxVolume) * 100, 100);

            setPercentage(Math.round(100 - drain));
        };
        calculateRecovery();
    }, []);

    let Icon = Battery;
    let color = 'text-[var(--color-success)]';

    if (percentage < 30) {
        Icon = BatteryWarning;
        color = 'text-[var(--color-error)]';
    } else if (percentage < 70) {
        Icon = BatteryCharging;
        color = 'text-[var(--color-warning)]';
    }

    return (
        <div className="bg-[var(--color-bg-secondary)] p-6 rounded-3xl h-full flex flex-col justify-between">
            <h3 className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-2">
                Recovery
            </h3>

            <div className="flex items-center gap-4">
                <Icon className={`w-10 h-10 ${color}`} />
                <div>
                    <div className={`text-3xl font-bold ${color}`}>
                        {percentage}%
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-medium">
                        Readiness Score
                    </div>
                </div>
            </div>
        </div>
    );
}
