import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export function emit(event, payload) {
  return new Promise((resolve) => {
    socket.emit(event, payload, (response) => resolve(response));
  });
}
