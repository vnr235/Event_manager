import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket"; // WebSocket instance

function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [attendeeCounts, setAttendeeCounts] = useState({});
  const [userJoinedEvents, setUserJoinedEvents] = useState(new Set());
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("https://event-manager-figl.onrender.com/api/v1/event/get", {
          params: { category, sort: sortOrder },
        });

        setEvents(data);

        const counts = {};
        const joinedEvents = new Set();
        const userId = localStorage.getItem("user");

        data.forEach((event) => {
          counts[event._id] = event.attendees.length;
          if (event.attendees.includes(userId)) {
            joinedEvents.add(event._id);
          }
        });

        setAttendeeCounts(counts);
        setUserJoinedEvents(joinedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [category, sortOrder]);

  useEffect(() => {
    socket.on("attendeeCountUpdate", ({ eventId, attendeeCount }) => {
        console.log(`Updating attendee count for event ${eventId} -> ${attendeeCount}`);
        
        setAttendeeCounts((prevCounts) => ({
            ...prevCounts,
            [eventId]: attendeeCount,
        }));
    });

    return () => {
        socket.off("attendeeCountUpdate");
    };
}, []);


  const handleJoinEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user");

    if (!token || !userId) {
      alert("Please log in to join an event.");
      return;
    }

    try {
      await axios.put(`https://event-manager-figl.onrender.com/api/v1/user/join/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit("joinEvent", { eventId, userId });

      setUserJoinedEvents((prev) => new Set(prev).add(eventId));
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleLeaveEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user");

    if (!token || !userId) return;

    try {
      await axios.delete(`https://event-manager-figl.onrender.com/api/v1/user/leave/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit("leaveEvent", { eventId, userId });

      setUserJoinedEvents((prev) => {
        const updated = new Set(prev);
        updated.delete(eventId);
        return updated;
      });
    } catch (error) {
      console.error("Error leaving event:", error);
    }
  };

  return (
    <div className="mx-auto p-4">
      <h1 className="text-3xl font-bold">Events Dashboard</h1>
      <div className="flex space-x-4 my-4">
        <select className="p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Comedy Shows">Comedy Shows</option>
          <option value="Music Shows">Music Shows</option>
          <option value="Workshops">Workshops</option>
          <option value="Meetups">Meetups</option>
        </select>

        <select className="p-2 border rounded" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Sort by Date (Asc)</option>
          <option value="desc">Sort by Date (Desc)</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event._id} className="border p-4 rounded shadow">
            <img src={event.imageUrl} alt={event.name} className="w-full h-48 object-cover rounded" />
            <h2 className="text-xl font-semibold mt-2">{event.name}</h2>
            <p className="text-gray-600">{event.description}</p>
            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
            <p>Location: {event.location}</p>
            <p>Category: {event.category}</p>
            <p>Attendees: <strong>{attendeeCounts[event._id] || 0}</strong></p>

            {userJoinedEvents.has(event._id) ? (
              <button onClick={() => handleLeaveEvent(event._id)} className="bg-red-500 text-white p-2 rounded mt-2 w-full">
                Leave Event
              </button>
            ) : (
              <button onClick={() => handleJoinEvent(event._id)} className="bg-green-500 text-white p-2 rounded mt-2 w-full">
                Join Event
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
