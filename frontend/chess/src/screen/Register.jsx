import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Register() {
    // useState
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const handlesubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include", // ✅ Important for sessions
                body: JSON.stringify({ username: email, password })
            });
            const data = await response.json();
    
            if (response.ok) {
                navigate('/login'); 
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        }
    };
    // return
        
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google'; // ✅ Redirects to Google OAuth
    };

    return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-12">
  <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 p-8 relative">
    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-tight">
      📝 Register for Chess
    </h2>

    <form onSubmit={handlesubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition duration-300"
      >
        Register
      </button>
    </form>

    <div className="my-6 flex items-center justify-center">
      <span className="text-gray-400 text-sm">— or —</span>
    </div>

    <div className="flex justify-center">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg shadow hover:bg-gray-50 transition duration-300"
      >
        <img
          src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_16dp.png"
          alt="Google logo"
          className="w-5 h-5"
        />
        Sign up with Google
      </button>
    </div>

    <p className="text-center text-sm text-gray-600 mt-6">
      Already have an account?{' '}
      <a href="/login" className="text-blue-600 font-medium hover:underline">
        Login
      </a>
    </p>
  </div>
</div>

    );
}

export default Register;