import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (onEvent: (event: string, data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join_admin');
    });

    const events = [
        'live_gps_update',
        'provider_status_changed',
        'job_status_updated',
        'new_job_broadcast',
        'sos_alert'
    ];

    events.forEach(event => {
        socket.on(event, (data) => onEvent(event, data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
};
