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
  const [gameStatus, setGameStatus] = useState('');
  const socket = usesocket();

  // Clear invalid move message after 3 seconds

  useEffect(()=>{
const data ={
  fen:chess.fen(),
  moves, 
  playerColor, 
  started,
  turn , gameStatus
};
sessionStorage.setItem('chessstate', JSON.stringify(data));
}, [chess , moves, playerColor, started, turn, gameStatus]);


  useEffect(() => {
    if (isinvalid) {
      const timer = setTimeout(() => setInvalid(false), 3000);
      return () => clearTimeout(timer);
    }
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
      .catch(console.error);
  }, [navigate]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WS:", message);

      switch (message.type) {
        case "init_game": {
          const newChess = new Chess();
          setChess(newChess);
          setBoard(newChess.board());
          setPlayerColor(message.payload.color);
          setStarted(true);
          setMoves([]);
          setTurn('w');
          setUserState('');
          setGameStatus('');
          break;
        }

        case "waiting_for_opponent": {
          setUserState("Waiting for an opponent...");
          break;
        }

        case "move": {
          try {
            setChess(prev => {
              const newChess = new Chess(prev.fen());
              
              const result = newChess.move({
                from: message.payload.from,
                to: message.payload.to,
                promotion: message.payload.promotion
              });
              
              if (!result) {
                throw new Error("Invalid move from server");
              }
              
              setBoard(newChess.board());
              setMoves(prev => [...prev, result]);
              setTurn(newChess.turn());
              return newChess;
            });
          } catch (err) {
            console.error("Error applying opponent move:", err.message);
            setInvalid(true);
          }
          break;
        }

        case "check": {
          alert(`${message.payload.checkedColor} is in check!`);
          break;
        }

        case "checkmate": {
          const winMessage = `Game Over! ${message.payload.winner} wins by checkmate!`;
          setGameStatus(winMessage);
          alert(winMessage);
          break;
        }

        case "draw": {
          const drawMessage = "Game Over! It's a draw.";
          setGameStatus(drawMessage);
          alert(drawMessage);
          break;
        }

        case "game_over": {
          const gameOverMessage = "Game Over: " + message.payload.message;
          setGameStatus(gameOverMessage);
          alert(gameOverMessage);
          break;
        }

        case "error": {
          console.warn("Server Error:", message.payload.message);
          setInvalid(true);
          break;
        }

        default: {
          console.warn("Unknown message type:", message);
          break;
        }
      }
    };

    socket.onmessage = handleMessage;

    socket.onclose = () => {
      console.warn("WebSocket disconnected.");
      setUserState("Disconnected from server");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setUserState("Connection error");
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  const handleInitGame = () => {
    setUserState("Waiting for opponent...");
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "init_game" }));
    }
  };

  const handlePlayerMove = (from, to, promotion = 'q') => {
    const myTurn = playerColor === 'white' ? 'w' : 'b';
    if (turn !== myTurn) {
      setInvalid(true);
      return;
    }

    if (gameStatus) {
      return;
    }

    try {
      const testChess = new Chess(chess.fen());
      const testResult = testChess.move({ from, to, promotion });
      
      if (!testResult) {
        throw new Error("Invalid move");
      }

      setChess(prev => {
        const newChess = new Chess(prev.fen());
        const result = newChess.move({ from, to, promotion });

        setBoard(newChess.board());
        setMoves(prev => [...prev, result]);
        setTurn(newChess.turn());

        return newChess;
      });

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: "move", 
          payload: { from, to, promotion } 
        }));
      }

    } catch (err) {
      console.warn("Invalid move:", err.message);
      setInvalid(true);
    }
  };

  const resetGame = () => {
    setChess(new Chess());
    setBoard(new Chess().board());
    setPlayerColor(null);
    setStarted(false);
    setMoves([]);
    setTurn('w');
    setUserState('');
    setGameStatus('');
    setInvalid(false);
  };

  if (!socket) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-white text-lg">Connecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Top Navigation */}
      <nav className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-white">Chess.com</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">{username}</span>
            {gameStatus && (
              <button
                onClick={resetGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                New Game
              </button>
            )}
            <button
              onClick={async () => {
                try {
                  await fetch("http://localhost:5000/logout", {
                    method: "POST",
                    credentials: "include"
                  });
                  navigate("/");
                  window.location.reload();
                } catch (err) {
                  console.error("Logout error:", err);
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar - Game Info */}
          <div className="lg:w-80 space-y-4">
            
            {/* Players Panel */}
            <div className="bg-gray-900 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">Players</h3>
              </div>
              <div className="p-4 space-y-3">
                {/* Opponent */}
                <div className="flex items-center justify-between p-2 rounded bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded ${
                      playerColor === 'white' ? 'bg-gray-900' : 'bg-white'
                    }`}></div>
                    <span className="text-gray-300 text-sm">Opponent</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {started ? 'Connected' : 'Waiting...'}
                  </div>
                </div>
                
                {/* Current Player */}
                <div className="flex items-center justify-between p-2 rounded bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded ${
                      playerColor === 'white' ? 'bg-white' : 'bg-gray-900'
                    }`}></div>
                    <span className="text-white text-sm font-medium">{username}</span>
                  </div>
                  <div className="text-green-400 text-xs">You</div>
                </div>
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-gray-900 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">Game Status</h3>
              </div>
              <div className="p-4 space-y-3">
                {started && !gameStatus && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Turn:</span>
                      <span className={`text-sm font-medium ${
                        turn === 'w' ? 'text-white' : 'text-gray-300'
                      }`}>
                        {turn === 'w' ? 'White' : 'Black'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Moves:</span>
                      <span className="text-white text-sm">{moves.length}</span>
                    </div>
                    {turn === (playerColor === 'white' ? 'w' : 'b') ? (
                      <div className="text-green-400 text-sm text-center font-medium">
                        Your turn
                      </div>
                    ) : (
                      <div className="text-yellow-400 text-sm text-center">
                        Opponent's turn
                      </div>
                    )}
                  </div>
                )}
                
                {gameStatus && (
                  <div className="text-center">
                    <div className="text-red-400 text-sm font-medium mb-2">
                      Game Over
                    </div>
                    <div className="text-gray-300 text-xs">
                      {gameStatus.replace('Game Over! ', '')}
                    </div>
                  </div>
                )}

                {!started && (
                  <div className="text-center text-gray-400 text-sm">
                    {userstate || 'Ready to play'}
                  </div>
                )}
              </div>
            </div>

            {/* Move List */}
            {moves.length > 0 && (
              <div className="bg-gray-900 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-white font-semibold">Moves</h3>
                </div>
                <div className="p-4">
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {moves.map((move, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-400">{Math.floor(index / 2) + 1}.</span>
                        <span className="text-gray-300">{move.san}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Game Area */}
          <div className="flex-1">
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              
              {/* Error Messages */}
              {isinvalid && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-300 text-sm text-center">
                  Invalid move! Try again.
                </div>
              )}

              {/* Chess Board Container */}
              <div className="flex justify-center">
                <div className="relative">
                  <ChessBoard 
                    board={board} 
                    onMove={handlePlayerMove}
                    playerColor={playerColor}
                    disabled={gameStatus !== ''}
                  />
                </div>
              </div>

              {/* Start Game Button */}
              {!started && !userstate && (
                <div className="text-center mt-6">
                  <Button 
                    onClick={handleInitGame}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    Start Game
                  </Button>
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