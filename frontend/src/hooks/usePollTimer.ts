import { useEffect, useState } from 'react';

/**
 * CRITICAL: Timer synchronization hook
 * Calculates remaining time from server timestamps
 * Handles late joins correctly
 */
export function usePollTimer(
    startedAt: string | null,
    durationSeconds: number | null,
    serverTime: string
) {
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

    useEffect(() => {
        if (!startedAt || !durationSeconds) {
            setRemainingSeconds(null);
            return;
        }

        // Calculate time offset between client and server
        const serverTimestamp = new Date(serverTime).getTime();
        const clientTimestamp = Date.now();
        const timeOffset = serverTimestamp - clientTimestamp;

        // Function to calculate remaining time using offset-adjusted client time
        const calculateRemaining = () => {
            const adjustedNow = Date.now() + timeOffset;
            const startTime = new Date(startedAt).getTime();
            const endTime = startTime + durationSeconds * 1000;
            const remainingMs = Math.max(0, endTime - adjustedNow);
            const remaining = Math.floor(remainingMs / 1000);
            return remaining;
        };

        // Set initial remaining time
        const initial = calculateRemaining();
        setRemainingSeconds(initial);

        if (initial === 0) return;

        // Update timer every second
        const interval = setInterval(() => {
            const remaining = calculateRemaining();
            setRemainingSeconds(remaining);

            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startedAt, durationSeconds, serverTime]);

    return remainingSeconds;
}
