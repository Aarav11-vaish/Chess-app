import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import board from '../assets/board.webp';

function Landing() {
    const navigate = useNavigate();



    return (
        <div className="h-screen flex flex-col ">
            {/* Navbar */}
            <nav className="bg-gray-830">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Brand Name */}
                        <div className="text-white text-3xl font-bold">Chess</div>

                        <div className="md:flex space-x-4">
                            <button
                                onClick={() => navigate("/leaderboards")}
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Leaderboards
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/signup")}
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Section */}
            <div className="flex-grow flex items-center justify-center bg-slate-830">
                <div className="max-w-5xl mx-auto p-8 bg-slate-830 shadow-md rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Image Section */}
                        <div className="flex justify-center">
                            <img
                                src={board}
                                alt="Chess board"
                                className="max-w-full rounded-md shadow-lg"
                            />
                        </div>

                        {/* Text Section */}
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Welcome to Chess
                            </h1>
                            <p className="text-lg text-gray-400 mb-6">
                                Challenge your friends and master the game of kings!
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch("http://localhost:5000/game", {
                                            credentials: "include" 
                                        });

                                        if (response.ok) {
                                            navigate("/game"); 
                                        } else {
                                            navigate("/login"); 
                                        }
                                    } catch (error) {
                                        console.error("Error checking auth:", error);
                                    }
                                }}
                                className="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
                            >
                                Join Game
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;
