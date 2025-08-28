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
  const [gameStatus, setGameStatus] = useState(''); // For game over states
  const socket = usesocket();

  // Clear invalid move message after 3 seconds
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
              
              // Use the complete move object from server
              const result = newChess.move({
                from: message.payload.from,
                to: message.payload.to,
                promotion: message.payload.promotion // Handle promotion
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

    // Cleanup function
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
    // Check if it's player's turn
    const myTurn = playerColor === 'white' ? 'w' : 'b';
    if (turn !== myTurn) {
      setInvalid(true);
      return;
    }

    // Check if game is over
    if (gameStatus) {
      return;
    }

    try {
      // Create a copy to test the move first
      const testChess = new Chess(chess.fen());
      const testResult = testChess.move({ from, to, promotion });
      
      if (!testResult) {
        throw new Error("Invalid move");
      }

      // If valid, apply to actual game state
      setChess(prev => {
        const newChess = new Chess(prev.fen());
        const result = newChess.move({ from, to, promotion });

        setBoard(newChess.board());
        setMoves(prev => [...prev, result]);
        setTurn(newChess.turn());

        return newChess;
      });

      // Send move to server
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

  if (!socket) return <div className="text-white text-center mt-10">Connecting...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="text-2xl font-bold">♔ Chess</div>
        <div className="flex gap-4">
          {gameStatus && (
            <button
              onClick={resetGame}
              className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
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
            className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="text-center text-2xl py-4">
        Welcome, {username}
      </div>

      {started && playerColor && (
        <div className="text-center text-lg mb-2">
          You are playing as: 
          <span className={`font-bold ml-2 ${playerColor === 'white' ? 'text-white' : 'text-gray-300'}`}>
            {playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}
          </span>
        </div>
      )}

      <div className="text-center text-lg mb-4">
        {started && !gameStatus && (
          <>
            <span>Current Turn: </span>
            <span className="font-bold text-green-400">
              {turn === 'w' ? 'White' : 'Black'}
            </span>
            {turn === (playerColor === 'white' ? 'w' : 'b') ? (
              <span className="ml-3 text-green-400 animate-pulse">Your Move</span>
            ) : (
              <span className="ml-3 text-gray-400">Waiting for opponent...</span>
            )}
          </>
        )}
        {gameStatus && (
          <div className="text-red-400 font-bold text-xl">{gameStatus}</div>
        )}
      </div>

      {isinvalid && (
        <div className="text-red-400 text-center mb-4 animate-pulse">
          Invalid move! Please try again.
        </div>
      )}

      {userstate && !started && (
        <div className="text-center mb-4 text-yellow-400">
          {userstate}
        </div>
      )}

      <div className="flex justify-center">
        <ChessBoard 
          board={board} 
          onMove={handlePlayerMove}
          playerColor={playerColor}
          disabled={gameStatus !== ''}
        />
      </div>

      {!started && !userstate && (
        <div className="text-center mt-6">
          <Button onClick={handleInitGame}>Start Game</Button>
        </div>
      )}

      <div className="text-center mt-4 text-sm text-gray-400">
        Moves: {moves.length}
      </div>
    </div>
  );
}

export default Game;