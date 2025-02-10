import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    category: '',
    image: null,
  });
  const [editingEvent, setEditingEvent] = useState(null); // Holds the event being updated
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch events posted by the admin
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/v1/event/get', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle Add Event form submission
  const handleAddEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newEvent.name);
    formData.append('description', newEvent.description);
    formData.append('date', newEvent.date);
    formData.append('location', newEvent.location);
    formData.append('category', newEvent.category);
    if (newEvent.image instanceof File) {
      formData.append('image', newEvent.image);
    }
    try {
      setLoading(true);
      // Axios will handle Content-Type automatically for FormData.
      await axios.post('http://localhost:3000/api/v1/event/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Reset form and hide it on success
      setNewEvent({ name: '', description: '', date: '', location: '', category: '', image: null });
      setShowAddForm(false);
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Event form submission (for editing an event)
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    
    // Create a simple JSON object for update (exclude image if not needed)
    const updateData = {
      name: editingEvent.name,
      description: editingEvent.description,
      date: editingEvent.date,
      location: editingEvent.location,
      category: editingEvent.category,
    };
  
    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/api/v1/event/${editingEvent._id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Event updated successfully!");
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };
  

  // Handle Delete Event
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/api/v1/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Event deleted successfully!");
      fetchEvents(); // Refresh event list
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle LogOut
  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-[20px] transition cursor-pointer"
          >
            {showAddForm ? 'Cancel' : 'Add Event'}
          </button>
          <button
            onClick={handleLogOut}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-[20px] transition cursor-pointer"
          >
            LogOut
          </button>
        </div>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddEvent}
          className="mb-8 bg-white p-6 rounded shadow-md"
          encType="multipart/form-data"
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newEvent.name}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-gray-700 mb-2">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 mb-2">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 mb-2">Event Image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={(e) => setNewEvent({ ...newEvent, image: e.target.files[0] })}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-[20px] transition"
          >
            {loading ? "Submitting..." : "Submit Event"}
          </button>
        </form>
      )}

      {/* Update Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
            <form onSubmit={handleUpdateEvent}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Event Name</label>
                <input
                  type="text"
                  value={editingEvent.name}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, name: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, location: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={editingEvent.category}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, category: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Event Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, image: e.target.files[0] })
                  }
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-[20px] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-[20px] transition"
                >
                  {loading ? "Updating..." : "Update Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <p className="text-lg text-gray-700">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-lg text-gray-700">No events found.</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {events.map((event) => (
            <div
              key={event._id}
              className="border border-gray-300 p-4 rounded shadow bg-white w-72 h-96 flex flex-col"
            >
              {event.imageUrl && (
                <div className="mt-2 w-full h-40 overflow-hidden flex justify-center items-center">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800 text-center">{event.name}</h3>
              <p className="text-gray-700 text-sm flex-grow text-center">{event.description}</p>
              <p className="text-xs text-gray-600 text-center">Date: {new Date(event.date).toLocaleDateString()}</p>
              <p className="text-xs text-gray-600 text-center">Location: {event.location}</p>
              <p className="text-xs text-gray-600 text-center">Category: {event.category}</p>
              <div className="mt-2 flex justify-around">
                <button
                  onClick={() => setEditingEvent(event)}
                  className="bg-amber-400 w-20 border-0 rounded-[20px] p-1.5 font-medium text-white cursor-pointer hover:bg-amber-200 hover:text-black hover:shadow-xl"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-700 w-20 border-0 rounded-[20px] p-1.5 font-medium text-white cursor-pointer hover:bg-red-400 hover:text-black hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
