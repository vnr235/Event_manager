const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const EventRouter = require("./src/routes/EventRoutes");
const UserRouter = require("./src/routes/UserRoutes");
const initSocket = require("./src/sockets/socket");

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app); // Create HTTP server

app.use(cors()); // Enable CORS
app.use(express.json()); // JSON parsing middleware

connectDB(); // Connect to database

// Initialize WebSocket
initSocket.init(server);

// API Routes
app.use("/api/v1/event", EventRouter);
app.use("/api/v1/user", UserRouter);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
