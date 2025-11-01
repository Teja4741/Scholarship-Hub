import { io, Socket } from 'socket.io-client';
import { Notification } from '../types/notification';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from notification server:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.attemptReconnect(token);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.attemptReconnect(token);
    });

    this.socket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    });
  }

  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(token), 2000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Join user-specific room for notifications
  joinUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join', { userId });
    }
  }

  // Leave user-specific room
  leaveUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('leave', { userId });
    }
  }
}

const socketService = new SocketService();
export default socketService;
