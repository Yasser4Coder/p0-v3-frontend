import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Connects when `VITE_SOCKET_URL` is set; otherwise returns null. */
export function getScoreboardSocket(): Socket | null {
  const url = import.meta.env.VITE_SOCKET_URL;
  if (!url) return null;
  if (!socket) {
    socket = io(url, { transports: ["websocket", "polling"] });
  }
  return socket;
}
