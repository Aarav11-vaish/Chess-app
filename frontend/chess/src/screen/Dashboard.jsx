import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import board from '../assets/board.webp';

function Dashboard() {
  const navigate = useNavigate();
  const [username, setusername] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/dashboard', { 
      credentials: 'include',   
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.username) {
        setusername(data.username);
      } else {
        navigate('/login');
      }
    })
    .catch((error) => console.error("Error fetching username:", error));
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleJoinGame = () => {
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">♔</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Chess Master</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/leaderboards')} 
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
              >
                Leaderboards
              </button>
              <button 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome back, 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 ml-2">
                {username || 'Player'}
              </span>
            </h2>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
          <p className="text-slate-400 text-lg mt-4 max-w-2xl mx-auto">
            Ready to challenge your mind? Join a game and showcase your strategic skills.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 lg:p-12 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                <img 
                  src={board} 
                  alt="Chess board" 
                  className="relative w-full max-w-md rounded-xl shadow-2xl border border-slate-600"
                />
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Ready to Play?
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Experience the thrill of chess with our advanced gameplay system. 
                  Challenge opponents, improve your skills, and climb the leaderboards.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-blue-400">∞</div>
                    <div className="text-sm text-slate-300">Unlimited Games</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-purple-400">⚡</div>
                    <div className="text-sm text-slate-300">Real-time Play</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleJoinGame} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Start Playing</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-slate-300">Available Anytime</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">Global</div>
            <div className="text-slate-300">Worldwide Players</div>
          </div>
       
        </div>
      </main>
    </div>
  );
}

export default Dashboard;