import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import board from '../assets/board.webp';
import Footer from './footer';

function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Authenticated") {
          navigate("/dashboard");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              ♔
            </div>
          </div>
          <div className="text-2xl font-semibold text-white mb-4">
            Connecting to Chess Arena...
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-slate-400 text-sm">Initializing game environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                onClick={() => navigate('/login')} 
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Master the 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Game of Kings
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Challenge your friends, compete globally, and elevate your strategic thinking 
              in the ultimate game of chess mastery.
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 lg:p-16 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-2xl"></div>
                  <img 
                    src={board} 
                    alt="Chess board" 
                    className="relative w-full max-w-lg rounded-2xl shadow-2xl border border-slate-600"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-4 shadow-xl">
                    <span className="text-white text-2xl">♛</span>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8 lg:p-16 flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="text-4xl font-bold text-white mb-6">
                    Welcome to Chess
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-8">
                    Challenge your friends and master the game of kings! Join thousands of 
                    players worldwide in strategic battles that will test your mind and sharpen your skills.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    
                    <div className="text-center p-6 bg-slate-700/30 rounded-xl border border-slate-600">
                      <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
                      <div className="text-sm text-slate-300">Live Matches</div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate("/signup")} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>Join Game</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
       
      </main>

      <Footer />
    </div>
  );
}

export default Landing;