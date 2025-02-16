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

    const socket = usesocket();

    // Reset invalid move state after a timeout
    useEffect(() => {
        let timeoutId;
        if (isinvalid) {
            timeoutId = setTimeout(() => setInvalid(false), 1000);
        }
        return () => clearTimeout(timeoutId);
    }, [isinvalid]);

    // Socket event handling
    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);

            switch (message.type) {
                case "init_game": {
                    const newChess = new Chess();
                    setChess(newChess);
                    setBoard(newChess.board());
                    setPlayerColor(message.payload.color);
                    setStarted(true);
                    setMoves([]);
                    console.log("Game initialized, you are playing as:", message.payload.color);
                    break;
                }

                case "move": {
                    const move = message.payload;
                    try {
                        const result = chess.move(move);
                        if (result) {
                            setBoard(chess.board());
                            setMoves((prevMoves) => [...prevMoves, result]);
                            console.log("Move received:", result);
                        } else {
                            throw new Error("Invalid move");
                        }
                    } catch (error) {
                        console.error("Invalid move received:", move);
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
        socket.send(JSON.stringify({
            type: "init_game",
        }));
    };

    if (!socket) return <div>Connecting...</div>;

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
  onClick={async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "GET",
        credentials: "include", 
      });

      if (response.ok) {
        navigate("/login"); // Redirect to login after logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }}
  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
>
  Logout
</button>




                        
                    </div>
                </div>
            </div>
        </nav>
        <div className="flex flex-col items-center justify-center h-full">
          
            {isinvalid && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
                    <p>Invalid move! Try again...</p>
                </div>
            )}

            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-6 w-full">
                    {/* Chess Board Section */}
                    <div className="col-span-4 w-full">
                        <ChessBoard
                            chess={chess}
                            setBoard={setBoard}
                            socket={socket}
                            board={board}
                            playerColor={playerColor}
                        />
                    </div>

                    {/* Info and Controls Section */}
                    <div className="col-span-2 bg-slate-800 p-4 rounded-lg">
                        {!started && (
                            <Button onClick={handleInitGame}>
                                Start Game
                            </Button>
                        )}

                        {started && (
                            <div className="space-y-4">
                                {/* Player Color Display */}
                                <div>
                                    <h2 className="text-xl font-bold mb-2 text-white">Player Color</h2>
                                    <p className="text-lg text-white">
                                        {playerColor === 'white' ? 'White' : 'Black'}
                                    </p>
                                </div>

                                {/* Moves List */}
                                <div>
                                    <h2 className="text-xl font-bold mb-2 text-white">Moves</h2>
                                    <ul className="text-lg text-white">
                                        {moves.map((move, index) => (
                                            <li key={index}>
                                                {move.from} to {move.to}
                                            </li>
                                        ))}
                                    </ul>
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
