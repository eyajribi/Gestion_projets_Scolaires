import { io } from 'socket.io-client';

// Remplacez l'URL par celle de votre backend si besoin
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};

export default getSocket;
