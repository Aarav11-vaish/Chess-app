import board from '../assets/board.webp';
import { useNavigate } from 'react-router-dom';
function Landing() {
    const navigate=useNavigate();

    return (
        <div className="h-screen flex items-center justify-center bg-slate-930">
            <div className="max-w-5xl mx-auto p-8 bg-slate-920 shadow-md rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Image Section */}
                    <div className="flex justify-center">
                        <img src={board} alt="Chess board" className="max-w-full rounded-md shadow-lg" />
                    </div>
                    {/* Text Section */}
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-white-800 mb-4">Welcome to Chess</h1>
                        <p className="text-lg text-gray-400 mb-6">Challenge your friends and master the game of kings!</p>
                        <button onClick={()=>{navigate("/game")}} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition">
                            Join Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;
