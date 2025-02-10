const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { Event } = require("../models/Schema");

let io; // Store socket instance

module.exports = {
    init: (server) => {
        io = socketIo(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type"],
                credentials: true
            }
        });

        io.on("connection", (socket) => {
            console.log("✅ A user connected:", socket.id);

            // Join Event Room
            socket.on("joinEvent", async ({ eventId, userId }) => {
                try {
                    // Validate ObjectId format
                    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
                        return socket.emit("error", { message: "Invalid eventId or userId format" });
                    }

                    const event = await Event.findById(eventId);
                    if (!event) {
                        return socket.emit("error", { message: "Event not found" });
                    }

                    // Join event room
                    socket.join(eventId);

                    if (!event.attendees.includes(userId)) {
                        event.attendees.push(userId);
                        await event.save();

                        // Emit the update only to users in the event room
                        io.to(eventId).emit("attendeeCountUpdate", {
                            eventId,
                            attendeeCount: event.attendees.length
                        });
                    }
                } catch (err) {
                    console.error("Join Event Error:", err);
                    socket.emit("error", { message: "Failed to join event", error: err.message });
                }
            });

            // Leave Event Room
            socket.on("leaveEvent", async ({ eventId, userId }) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
                        return socket.emit("error", { message: "Invalid eventId or userId format" });
                    }

                    const event = await Event.findById(eventId);
                    if (!event) {
                        return socket.emit("error", { message: "Event not found" });
                    }

                    event.attendees = event.attendees.filter((id) => id.toString() !== userId);
                    await event.save();

                    // Emit update only in event room
                    io.to(eventId).emit("attendeeCountUpdate", {
                        eventId,
                        attendeeCount: event.attendees.length
                    });

                    // Leave event room
                    socket.leave(eventId);
                } catch (err) {
                    console.error("Leave Event Error:", err);
                    socket.emit("error", { message: "Failed to leave event", error: err.message });
                }
            });

            socket.on("disconnect", () => {
                console.log("❌ A user disconnected:", socket.id);
            });
        });

        return io;
    },

    getIo: () => {
        if (!io) {
            throw new Error("Socket.IO has not been initialized!");
        }
        return io;
    }
};
