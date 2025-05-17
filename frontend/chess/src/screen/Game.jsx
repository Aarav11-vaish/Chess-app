import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../component/Button';
import ChessBoard from '../component/ChessBoard';
import usesocket from '../hooks/usesocket';
import { Chess } from 'chess.js';

function Game() {
    const navigate = useNavigate();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [playerColor, setPlayerColor] = useState(null);
    const [started, setStarted] = useState(false);
    const [moves, setMoves] = useState([]);
    const [isinvalid, setInvalid] = useState(false);
    const [userstate, setUserState] = useState('');
    const [username, setUsername] = useState('');
    const [turn, setTurn] = useState('w');
    const socket = usesocket();

    useEffect(() => {
        let timeoutId;
        if (isinvalid) {
            timeoutId = setTimeout(() => setInvalid(false), 1000);
        }
        return () => clearTimeout(timeoutId);
    }, [isinvalid]);

    useEffect(() => {
        fetch('http://localhost:5000/dashboard', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    setUsername(data.username);
                } else {
                    navigate('/login');
                }
            })
            .catch(error => console.error("Error fetching username:", error));
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);

            switch (message.type) {
                case "init_game": {
                    const newChess = new Chess();
                    setChess(newChess);
                    setPlayerColor(message.payload.color);
                    setStarted(true);
                    setMoves([]);
                    // setUserState("waiting for user");
                    console.log("Game initialized, you are playing as:", message.payload.color);
                    setUserState("");
                    break;
                }
                case "waiting_for_opponent": {
                    setUserState("Waiting for an opponent..."); // ✅ Show loader
                    break;
                }
               case "move": {
  try {
    const newChess = new Chess(chess.fen());
    const result = newChess.move(message.payload);
    if (result) {
      setChess(newChess);
      setBoard(newChess.board());
      setMoves(prev => [...prev, result]);
      setTurn(newChess.turn());
    } else {
      throw new Error("Invalid move");
    }
  } catch (error) {
    console.error("Invalid move received:", message.payload);
    setInvalid(true);
  }
  break;
}

                case "game_over": {
                    console.log("Game over:", message.payload);
                    break;
                }
                default: {
                    console.log("Unknown message type:", message.type);
                    break;
                }
            }
        };
    }, [socket, chess]);

    const handleInitGame = () => {
        setUserState("waiting for user");
        socket.send(JSON.stringify({ type: "init_game" }));
    };

    if (!socket) return <div className="text-center text-white text-2xl mt-10">Connecting...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <nav className="bg-gray-900/90 backdrop-blur-sm shadow-xl border-b border-gray-800 px-5 py-4">
                <div className="flex justify-between items-center">
                    <div className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">♔ Chess</div>
                    <div className="flex space-x-4">
                        <button onClick={() => navigate("/leaderboards")} className="text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm font-medium">Leaderboards</button>
                        <button
                            onClick={async () => {
                                try {
                                    const response = await fetch("http://localhost:5000/logout", {
                                        method: "POST",
                                        credentials: "include",
                                    });
                                    if (response.ok) {
                                        window.location.reload();
                                        navigate("/");
                                    } else {
                                        console.error("Logout failed");
                                        navigate("/");
                                    }
                                } catch (error) {
                                    console.error("Error during logout:", error);
                                }
                            }}
                            className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-lg shadow-lg 
                                     hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex items-center justify-center p-8">
                <div className="relative inline-block text-4xl font-bold text-white">
                    <span className="relative block overflow-hidden whitespace-nowrap border-r-4 border-white pr-2"
                        style={{ animation: "typing 3s steps(30, end) forwards , blink 0.7s step-end infinite alternate", width: `${username.length * 0.75}ch` }}>
                        Press play {username}
                    </span>
                </div>

                <style>
                    {`
                        @keyframes typing { from { width: 0; } to { width: 100%; } }
                        @keyframes blink { 50% { border-color: transparent; } }
                    `}
                </style>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow px-6 py-12">
                {isinvalid && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
                            <p className="font-medium">Invalid move! Try again...</p>
                        </div>
                    </div>
                )}

                <div className="container max-w-5xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="flex justify-center">
                            <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} playerColor={playerColor} />
                        </div>
                        <div className="text-center md:text-left">
                            {!started && userstate !== "waiting for user" && (
                                <Button onClick={handleInitGame}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold 
                                             py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105
                                             hover:from-green-600 hover:to-green-700">
                                    Start Game
                                </Button>
                            )}

                            {userstate === "waiting for user" && (
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
                                    <p className="text-white mt-3 text-lg">Waiting for opponent...</p>
                                </div>
                            )}

                            {started && (

                                <div className="space-y-6">
                                     <div className="text-center text-xl font-semibold mt-4">
    <span className="text-gray-300">Current Turn: </span>
    <span className={`font-bold ${turn === 'w' ? 'text-white' : 'text-black bg-gray-200 px-2 rounded'}`}>
      {turn === 'w' ? 'White' : 'Black'}
    </span>
    {((turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black')) ? (
      <span className="ml-2 text-green-400 animate-pulse">Your Move</span>
    ) : (
      <span className="ml-2 text-gray-400">Waiting...</span>
    )}
  </div>
                                    {/* <div className="text-center text-xl font-semibold mt-4">
    <span className="text-gray-300">Turn: </span>
    <span className={turn === 'w' ? "text-white" : "text-black bg-gray-200 px-2 rounded"}>
        {turn === 'w' ? "White" : "Black"}
        <span className="ml-2 animate-pulse">...</span> 
    </span>
</div> */}
                                    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                                        <h2 className="text-xl font-bold mb-3 text-green-400">Player Color</h2>
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-4 h-4 rounded-full ${playerColor === 'white' ? 'bg-white' : 'bg-gray-900'}`}></div>
                                            <p className="text-lg font-medium">
                                                {playerColor === 'white' ? 'White' : 'Black'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {started && (
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-green-500/70 shadow-lg">
                                    <h2 className="text-xl font-bold mb-3 text-green-400">Moves</h2>
                                    <div className="max-h-64 overflow-y-auto">
                                        {moves.length === 0 ? (
                                            <p className="text-gray-400 italic">No moves yet</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {moves.map((move, index) => (
                                                    <li key={index} className="flex items-center space-x-2 bg-gray-800/60 p-2 rounded-md hover:bg-gray-700/60">
                                                        <span className="text-green-400 font-mono">{index + 1}.</span>
                                                        <span className="font-medium bg-gray-700/50 px-2 py-1 rounded text-white">{move.from}</span>
                                                        <span className="text-green-400">→</span>
                                                        <span className="font-medium bg-green-800/30 px-2 py-1 rounded text-white">{move.to}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;
