import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { testConnection } from './config/database';
import { setupSocketHandlers } from './sockets/connection.socket';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

setupSocketHandlers(io);

async function startServer() {
    try {
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('⚠️  Database connection failed. Server will start but may not function correctly.');
        }

        httpServer.listen(PORT, () => {
            console.log(' Live Polling System Backend');
            console.log(` Server running on http://localhost:${PORT}`);
            console.log(` Socket.io enabled`);
            console.log(`  Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
            console.log(` CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
        });
    } catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

startServer();

export { app, io };
