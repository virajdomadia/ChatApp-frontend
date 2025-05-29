// src/utils/socket.js
import { io } from "socket.io-client";

const ENDPOINT = "https://chatapp-backend-ezbn.onrender.com";

const socket = io(ENDPOINT, {
  transports: ["websocket"],
  autoConnect: false,
  withCredentials: true,
});

export default socket;
