import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/_core/hooks/useAuth';

interface SearchProgress {
  userId: number;
  total: number;
  processed: number;
  found: number;
  multiple: number;
  notFound: number;
  errors: number;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<SearchProgress | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.IO server
    const socketInstance = io({
      path: '/socket.io',
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
      // Join user-specific room
      socketInstance.emit('join-user-room', user.id);
    });

    socketInstance.on('search-progress', (data: SearchProgress) => {
      console.log('Progress update:', data);
      setProgress(data);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return { socket, progress };
}
