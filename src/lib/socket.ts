import { io } from "socket.io-client";

// In development, the socket server is the same as the host
// In production, it's also the same host
const socket = io();

export default socket;
