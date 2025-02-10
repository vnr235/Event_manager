import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    timeout: 5000
});

socket.on("connect", () => {
    console.log("✅ Connected to WebSocket:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("❌ WebSocket Connection Failed:", err.message);
});

export default socket;

