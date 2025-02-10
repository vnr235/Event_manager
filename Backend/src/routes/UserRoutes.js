const express = require("express");
const zod = require("zod");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const { User, Event } = require("../models/Schema");
const authMiddleware = require("../middleware/authmiddleware");
const { getIo } = require("../sockets/socket");

const router = express.Router();
const saltRounds = 10; 
const registerSchema = zod.object({
    name:zod.string(),
    email: zod.string(),
    password: zod.string(),
    role: zod.optional(zod.string()),
});

const signinSchema = zod.object({
    email: zod.string().email(),
    password: zod.string(),
});


router.post("/register", async (req, res) => {
    const response = registerSchema.safeParse(req.body);
    if (!response.success) {
        return res.status(400).json({ msg: "Invalid inputs" });
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email, role: req.body.role });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const newUser = await User.create({
            name:req.body.name,
            email: req.body.email,
            password: hashedPassword, 
            role: req.body.role || "user",
        });

        return res.status(201).json({ msg: "User registered successfully", user: newUser });
    } catch (e) {
        console.error("Register Error:", e);
        return res.status(500).json({ msg: "Internal server error" });
    }
});


router.post("/signin", async (req, res) => {
    const response = signinSchema.safeParse(req.body);
    if (!response.success) {
        return res.status(400).json({ msg: "Invalid inputs" });
    }

    try {
        const user = await User.findOne({ email: req.body.email, role: req.body.role });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password); 
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ role: user.role, id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d",
        });

        return res.status(200).json({ token, userId:user._id });
    } catch (e) {
        console.error("Sign-in Error:", e);
        return res.status(500).json({ msg: "Internal server error" });
    }
});


router.put("/join/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ msg: "Event not found" });

        if (!event.attendees.includes(req.id)) {
            event.attendees.push(req.id);
            await event.save();

            // Emit to all clients
            const io = getIo();
            io.emit("attendeeCountUpdate", { eventId: event._id, attendeeCount: event.attendees.length });
        }

        res.status(200).json({ msg: "Joined successfully", event });
    } catch (error) {
        console.error("Join Event Error:", error);
        res.status(500).json({ msg: "Something went wrong" });
    }
});

router.delete("/leave/:eventId", authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ msg: "Event not found" });

        event.attendees = event.attendees.filter((id) => id.toString() !== req.id);
        await event.save();

        // Emit to all clients
        const io = getIo();
        io.emit("attendeeCountUpdate", { eventId: event._id, attendeeCount: event.attendees.length });

        res.status(200).json({ msg: "Left successfully", event });
    } catch (error) {
        console.error("Leave Event Error:", error);
        res.status(500).json({ msg: "Something went wrong" });
    }
});


module.exports = router;
