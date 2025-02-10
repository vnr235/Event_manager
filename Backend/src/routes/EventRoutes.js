const express = require("express");
const zod = require("zod");
const {Event} = require("../models/Schema");
const authMiddleware = require('../middleware/authmiddleware')
const upload = require('../middleware/upload');
const router = express.Router();


const eventSchema = zod.object({
    name: zod.string(),
    description: zod.string(),
    date: zod.string(), 
    location:zod.string(),
    category: zod.string(),
    location: zod.string(),
});


router.post("/add", authMiddleware, upload.single("image"), async (req, res) => {
    try {

      const { name, description, date, location, category } = req.body;
      

      const validation = eventSchema.safeParse({ name, description, date, location, category });
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid event data" });
      }
  

      const event = await Event.create({
        name,
        description,
        date,
        location,
        category,
        createdBy: req.id,
        imageUrl: req.file ? req.file.path : null,
      });
  
      res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


  router.get("/get", async (req, res) => {
    try {
        const { category, date, sort } = req.query;
        let query = {};

        if (category) query.category = category;
        if (date) query.date = new Date(date).toISOString();

        // Fetch from DB with sorting at the query level (MongoDB sorting)
        let events = await Event.find(query).sort({ date: sort === "desc" ? -1 : 1 });

        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/:id", async (req, res) => {
    try {

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        // Allow deletion if the user is the creator or if the user has admin privileges
        if (!event || (event.createdBy.toString() !== req.id && req.user.role !== 'admin')) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
