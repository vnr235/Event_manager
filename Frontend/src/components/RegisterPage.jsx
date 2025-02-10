import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignupPage() {
  const [name,setName] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/user/register', {
        name,
        email,
        password,
        role,
      });
      console.log('Signup successful:', response.data);
      navigate('/login');
    } catch (err) {
      console.error('Signup failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigate('/events');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl text-white font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignup}>
          <input 
            type="text" 
            placeholder="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button 
            type="submit" 
            className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        
        <button 
          onClick={handleGuestLogin} 
          className="w-full p-3 mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition">
          Sign in as Guest
        </button>

        <p className="text-gray-400 text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
