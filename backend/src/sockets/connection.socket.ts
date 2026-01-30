import { Server, Socket } from 'socket.io';
import { setupPollSocketHandlers } from './poll.socket';

export function setupSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`✅ Client connected: ${socket.id}`);

        setupPollSocketHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });
    });

    setInterval(() => {
        io.emit('server:time', { serverTime: new Date().toISOString() });
    }, 30000);
}
