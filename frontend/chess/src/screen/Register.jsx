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
        <div id='root1' className="items-center justify-center bg-gray-100">
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-black">Register</h2>
                <form onSubmit={handlesubmit}>
                    <label htmlFor="email" className="block text-gray-800">Email</label>
                    <input type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-600">password</label>
                        <input type="password" name="password"

                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <button type="submit" className="w-full hover:border-2-indigo-950">
                            Register
                        </button>
                    </div>

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
                <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-500 hover:underline">
                        Login
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Register;