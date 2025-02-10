import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">Welcome to Event Platform</h1>
      <p className="text-lg mb-8">Discover and book amazing events around you!</p>
      <div className="space-x-4">
        <Link to="/login" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition">Login</Link>
        <Link to="/signup" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition">Signup</Link>
      </div>
    </div>
  );
}

export default HomePage;