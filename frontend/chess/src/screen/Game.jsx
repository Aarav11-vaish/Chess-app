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
    const [moves, setMoves] = useState([]); // List of moves made
    const socket = usesocket();

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);

            switch (message.type) {
                case "init_game":
                    const newChess = new Chess();
                    setChess(newChess);
                    setBoard(newChess.board());
                    setPlayerColor(message.payload.color);
                    setStarted(true);
                    setMoves([]); // Reset moves
                    console.log("Game initialized, you are playing as:", message.payload.color);
                    break;
                            
                case "move":
                    const move = message.payload;
                    const result = chess.move(move);

                    if (result) {
                        // Update board and moves only if the move is valid
                        setBoard(chess.board());
                        setMoves((prevMoves) => [...prevMoves, result]); // Push the full move object
                        console.log("Move received:", result);
                    } else {
                        console.error("Invalid move received:", move);
                    }
                    break;

                case "game_over":
                    console.log("Game over:", message.payload);
                    break;

                default:
                    console.log("Unknown message type:", message.type);
                    break;
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
        <div className="flex flex-col items-center justify-center h-full">
            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-6 w-full">
                    <div className="col-span-4 w-full">
                        <ChessBoard 
                            chess={chess} 
                            setBoard={setBoard} 
                            socket={socket} 
                            board={board}
                            playerColor={playerColor} 
                        />
                    </div>
                    <div className="col-span-2 bg-slate-800 p-4 rounded-lg">
                        {!started && (
                            <Button onClick={handleInitGame}>
                                Start Game
                            </Button>
                        )}
                        {started && (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold mb-2 text-white">Player Color</h2>
                                    <p className="text-lg text-white">
                                        {playerColor === 'white' ? 'White' : 'Black'}
                                    </p>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-2 text-white">Moves</h2>
                                    <ul className="text-lg text-white">
                                        {moves.map((move, index) => (
                                            <li key={index}>
                                                {move.from} to {move.to} {/* Display move in algebraic notation */}
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
    );
}

export default Game;
