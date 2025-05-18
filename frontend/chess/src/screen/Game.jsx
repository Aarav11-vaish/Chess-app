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
  const [lastSentMove, setLastSentMove] = useState(null); // ✅ new
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
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
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
          break;
        }

        case "waiting_for_opponent": {
          setUserState("Waiting for an opponent...");
          break;
        }

        case "move": {
          // ✅ Skip if same as your last sent move
          if (
            lastSentMove &&
            lastSentMove.from === message.payload.from &&
            lastSentMove.to === message.payload.to
          ) {
            console.log("Skipping own move replay");
            return;
          }

          try {
            setChess(prev => {
              const newChess = new Chess(prev.fen());
            //   const result = newChess.move(message.payload);
            const result = newChess.move({
                from: message.payload.from,
                to: message.payload.to,
                // promotion: 'q' // always promote to a queen for simplicity
              });
              if (!result) throw new Error("Invalid move from server");
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

        case "game_over": {
          console.log("Game Over:", message.payload);
          break;
        }

        case "error": {
          console.warn("Server Error:", message.payload.message);
          break;
        }

        default: {
          console.warn("Unknown message type:", message);
          break;
        }
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket disconnected.");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }, [socket, lastSentMove]);

  const handleInitGame = () => {
    setUserState("waiting for user");
    socket.send(JSON.stringify({ type: "init_game" }));
  };

  const handlePlayerMove = (from, to) => {
    const myTurn = playerColor === 'white' ? 'w' : 'b';
    if (turn !== myTurn) {
      setInvalid(true);
      return;
    }

    try {
      setChess(prev => {
        const newChess = new Chess(prev.fen());
        const result = newChess.move({ from, to });
        if (!result) throw new Error("Invalid local move");

        setBoard(newChess.board());
        setMoves(prev => [...prev, result]);
        setTurn(newChess.turn());
        setLastSentMove({ from, to }); // ✅ Track last move
       socket.send(JSON.stringify({ type: "move", payload: { from, to } }));

        return newChess;
      });
    } catch (err) {
      console.warn("Invalid move:", err.message);
      setInvalid(true);
    }
  };

  if (!socket) return <div className="text-white text-center mt-10">Connecting...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="text-2xl font-bold">♔ Chess</div>
        <button
          onClick={async () => {
            await fetch("http://localhost:5000/logout", {
              method: "POST",
              credentials: "include"
            });
            navigate("/");
            window.location.reload();
          }}
          className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </nav>

      <div className="text-center text-2xl py-4">
        Welcome, {username}
      </div>

      <div className="text-center text-lg mb-4">
        {started && (
          <>
            <span>Current Turn: </span>
            <span className="font-bold text-green-400">
              {turn === 'w' ? 'White' : 'Black'}
            </span>
            {turn === (playerColor === 'white' ? 'w' : 'b') ? (
              <span className="ml-3 text-green-400 animate-pulse">Your Move</span>
            ) : (
              <span className="ml-3 text-gray-400">Waiting...</span>
            )}
          </>
        )}
      </div>

      {isinvalid && (
        <div className="text-red-400 text-center mb-4 animate-pulse">
          Invalid move!
        </div>
      )}

      <div className="flex justify-center">
        <ChessBoard board={board} onMove={handlePlayerMove} />
      </div>

      {!started && userstate !== "waiting for user" && (
        <div className="text-center mt-6">
          <Button onClick={handleInitGame}>Start Game</Button>
        </div>
      )}

      {userstate === "waiting for user" && (
        <div className="text-center mt-6 text-lg">Waiting for opponent...</div>
      )}
    </div>
  );
}

export default Game;
