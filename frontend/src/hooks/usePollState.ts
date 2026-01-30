import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import type { PollWithOptions, PollResults } from '../types';

/**
 * CRITICAL: Poll state management hook
 * Handles refresh recovery via poll:sync  
 */
export function usePollState(studentId?: string) {
    const [poll, setPoll] = useState<PollWithOptions | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [serverTime, setServerTime] = useState<string>(new Date().toISOString());
    const [results, setResults] = useState<PollResults | null>(null);
    const { socket, connected } = useSocket();

    // Sync poll state from server
    const syncPollState = useCallback(() => {
        if (!socket || !connected) return;

        console.log('🔄 Syncing poll state...', { studentId });
        socket.emit('poll:sync', { studentId });
    }, [socket, connected, studentId]);

    useEffect(() => {
        if (!socket || !connected) return;

        // Sync on mount and reconnect
        syncPollState();

        // Listen for poll state
        socket.on('poll:state', (state) => {
            console.log('📥 Received poll state:', state);
            setPoll(state.poll);
            setServerTime(state.serverTime);
            setHasVoted(state.hasVoted);
            setResults(state.results);
        });

        // Listen for poll started
        socket.on('poll:started', (data) => {
            console.log('📥 Poll started:', data);
            setPoll(data.poll);
            setServerTime(data.serverTime);
            setHasVoted(false);
            setResults(null);
        });

        // Listen for poll ended
        socket.on('poll:ended', () => {
            console.log('📥 Poll ended');
            setPoll(null);
            setResults(null);
        });

        // Listen for vote updates
        socket.on('poll:vote-update', (updatedResults) => {
            console.log('📥 Vote update:', updatedResults);
            setResults(updatedResults);
        });

        return () => {
            socket.off('poll:state');
            socket.off('poll:started');
            socket.off('poll:ended');
            socket.off('poll:vote-update');
        };
    }, [socket, connected, syncPollState]);

    return {
        poll,
        hasVoted,
        serverTime,
        results,
        connected,
        syncPollState, // Expose for manual refresh if needed
    };
}
