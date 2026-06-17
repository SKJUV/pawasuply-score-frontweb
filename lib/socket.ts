import { io, Socket } from 'socket.io-client';

let socket: Socket | undefined;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000', {
      transports: ['websocket'],
      extraHeaders: {
        // Bypass ngrok browser warning page
        'ngrok-skip-browser-warning': 'true',
      },
    });
  }
  return socket;
}
