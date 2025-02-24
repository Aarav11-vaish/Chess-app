import React from 'react';
import { useNavigate } from 'react-router-dom';
import board from '../assets/board.webp';
import Footer from './footer';

function Landing() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleJoinGame = async () => {
    try {
      const response = await fetch("http://localhost:5000/game", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/signup");
      } else {
        navigate("/signup");
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 shadow-lg py-2">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="text-4xl font-extrabold tracking-wide">Chess</div>
          <div className="flex space-x-4">
            <button onClick={() => handleNavigation('/leaderboards')} className="hover:text-green-400 transition-colors text-sm">
              Leaderboards
            </button>
            <button onClick={() => handleNavigation('/login')} className="hover:text-green-400 transition-colors text-sm">
              Login
            </button>
            <button onClick={() => handleNavigation('/signup')} className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md shadow-md font-semibold transition">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="container max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image Section */}
            <div className="flex justify-center">
              <img src={board} alt="Chess board" className="w-full max-w-sm rounded-lg shadow-lg border-4 border-gray-700" />
            </div>
            {/* Text Section */}
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold mb-6 text-green-400">Welcome to Chess</h1>
              <p className="text-lg text-gray-300 mb-6">
                Challenge your friends and master the game of kings!
              </p>
              <button onClick={handleJoinGame} className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105">
                Join Game
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Landing;
