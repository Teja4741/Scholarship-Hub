import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import scholarshipRoutes from './routes/scholarships';
import applicationRoutes from './routes/applications';
import authRoutes from './routes/auth';
import searchRoutes from './routes/search';
import notificationRoutes from './routes/notifications';
import documentRoutes from './routes/documents';
import analyticsRoutes from './routes/analytics';
import { SchedulerService } from './services/schedulerService';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gradious Scholar Hub Backend is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId: number) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Handle real-time notifications
  socket.on('send_notification', (data) => {
    // Broadcast to specific user room
    io.to(`user_${data.userId}`).emit('notification', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start scheduled tasks
SchedulerService.startScheduledTasks();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
