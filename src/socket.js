import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // عنوان الخادم

let socket = null;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL);
    socket.on('connect', () => {
      console.log('✅ Socket connected');
      socket.emit('register', userId);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;