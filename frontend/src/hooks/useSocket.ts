import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

/**
 * Custom hook to manage Socket.io connection
 * Handles reconnection automatically
 */
export function useSocket() {
    const [connected, setConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Create socket connection
        const socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Socket connected');
            setConnected(true);
            setReconnecting(false);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setConnected(false);
        });

        socket.on('reconnect_attempt', () => {
            console.log('🔄 Reconnecting...');
            setReconnecting(true);
        });

        socket.on('reconnect', () => {
            console.log('✅ Reconnected');
            setConnected(true);
            setReconnecting(false);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return {
        socket: socketRef.current,
        connected,
        reconnecting,
    };
}
