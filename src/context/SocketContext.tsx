import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const initializingRef = useRef(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Escuchar cambios en el localStorage (cuando el usuario hace login)
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También revisar periódicamente por si el cambio es en la misma pestaña
    const interval = setInterval(() => {
      const newToken = localStorage.getItem('token');
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    // Limpiar socket existente si el token cambió
    if (socketRef.current && !token) {
      console.log('🔌 Token removed, disconnecting WebSocket');
      socketRef.current.disconnect();
      socketRef.current = null;
      initializingRef.current = false;
      setConnected(false);
      return;
    }

    // Evitar múltiples inicializaciones
    if (initializingRef.current || socketRef.current) {
      return;
    }

    if (!token) {
      console.log('⚠️ No token found, skipping WebSocket connection');
      return;
    }

    initializingRef.current = true;
    console.log('🔌 Initializing WebSocket connection...');

    // Conectar a Socket.IO
    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      console.log('Socket ID:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('⏳ Waiting for backend...', error.message);
      setConnected(false);
    });

    socketRef.current = socket;

    // Cleanup: solo desconectar cuando el provider se desmonte realmente
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
