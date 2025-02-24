import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import board from '../assets/board.webp';
import { useState } from 'react';

// import { useNavigate } from 'react-router-dom';
// import board from '../assets/board.webp';
function Dashboard() {

  const navigate = useNavigate();
const [username, setusername]= useState('')
useEffect(() => {
  fetch('http://localhost:5000/dashboard', {
credentials: 'include',
  })
.then((res)=>res.json())
.then((data) => {
  if (data.username) {
      setusername(data.username);
  }
  else {
    navigate('/login');
  }
}
)
.catch((error) => console.error("Error fetching username:", error));
}, []);
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.reload();
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleJoinGame = async () => {
    try {
      const response = await fetch('http://localhost:5000/game', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/game');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 shadow-lg py-3 px-5 flex justify-between items-center">
        <div className="text-3xl font-extrabold">Chess</div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/leaderboards')} className="hover:text-green-400 text-sm">Leaderboards</button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md shadow-md font-semibold">Logout</button>
        </div>
      </nav>


      <div className="flex items-center justify-center p-8">
  <div className="relative inline-block text-4xl font-bold text-white">
    <span 
      className="relative block overflow-hidden whitespace-nowrap border-r-4 border-white pr-2" 
      style={{ 
        animation: "typing 3s steps(30, end) forwards , blink 0.7s step-end infinite alternate", 
        width: `${username.length * 0.75}ch`
      }}
    >
     Gracias!! {username}
    </span>
  </div>

  <style>
    {`
      @keyframes typing {
        from { width: 0; }
        to { width: 100%; }
      }
      @keyframes blink {
        50% { border-color: transparent; }
      }
    `}
  </style>
</div>


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
                Play chess online with friends or against the computer.
              </p>
              <button onClick={handleJoinGame} className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105">
                Join Game
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;