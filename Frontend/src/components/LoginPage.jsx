import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const API_URL = "http://localhost:3000/api/v1/user/signin";
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); 
    try {
      const res = await axios.post(API_URL, {role:role, email:email, password:password});
      console.log(res);

      if (res.status === 200) {
        console.log("✅ Login successful", res.data);
        localStorage.setItem("token", res.data.token); // Save token
        localStorage.setItem("user", JSON.stringify(res.data.userId)); 
        if (role === "admin") {
          navigate("/admin"); // Redirect to admin page if role is admin
        } else {
          navigate("/dashboard"); // Redirect to dashboard for standard users
        }
      }
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data?.msg || err.message);
      setError(err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl text-white font-bold mb-6 text-center">Login</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>} {/* ✅ Fixed: Display error message */}
        
        <form onSubmit={handleLogin}>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-red-500" 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-red-500" 
            required
          />
          <button type="submit" className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition">
            Login
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4">
          Don't have an account? <Link to="/signup" className="text-red-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
