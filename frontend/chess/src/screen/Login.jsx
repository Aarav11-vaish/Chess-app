import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include", // ✅ Important for sessions to persist
                body: JSON.stringify({ username: email, password })
            });
            const data = await response.json();
    
            if (response.ok) {
                navigate('/game'); // Redirect to the game screen
            } else {
                console.log(data, "user already exists");
                
                // setError();
            }
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        }
    };
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google'; // ✅ Redirects to Google OAuth
    };
   
        return (
            <div id='root1' className="items-center justify-center">
              <div className="relative z-10 p-8 bg-gray-50 rounded-lg shadow-lg max-w-md w-full border border-gray-300">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">Chess Login</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-white-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-white-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
                  >
                    Login
                  </button>
                </form>
                <div className="my-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">or</span>
                </div>
                <div 
                 onClick={handleGoogleLogin}
                 className="flex justify-center">
                  <button type='submit'
                  className="flex items-center px-4 py-2 bg-white text-gray-700 font-semibold border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition duration-300">
                    <img
                       src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_16dp.png"
                       alt="Google logo"
                       className="w-5 h-5 mr-2"
                    />
                    Sign Up with Google
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600 mt-4">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-gray-800 hover:underline">
                    Sign up
                  </a>
                </div>
              </div>
            </div>
          );
        };

export default Login;

