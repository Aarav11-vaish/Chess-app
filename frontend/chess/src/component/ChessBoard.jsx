import React, { useState } from 'react';

function ChessBoard({ chess, board, socket, setBoard }) {
  const [from, setFrom] = useState(null);

  const handleMove = (squareRepresentation) => {
    if (!from) {
      setFrom(squareRepresentation);
    } else {
      const move={from , to: squareRepresentation};
      chess.move(move);
      setBoard(chess.board());
      socket.send(JSON.stringify({
        type: "move",
        payload: {move}
      }));
      setFrom(null);
    }
  };

  return (
    <div className="text-white-200 rounded-lg overflow-hidden shadow-2xl border-3 border-slate-400">
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => {
            const squareRepresentation = String.fromCharCode(97 + j) + (8 - i);
            return (
              <div
              onClick={() => handleMove(squareRepresentation)}
                key={j}
                className={`w-16 h-16 flex justify-center items-center cursor-pointer  transition-colors duration-200 
                  ${(i + j) % 2 === 0 ? "bg-emerald-400 hover:bg-emerald-600" : "bg-slate-800 hover:bg-slate-900"}
                  ${from === squareRepresentation ? "bg-yellow-400" : ""}
                  hover:opacity-90`}  >
               {square && (
  <img className="w-10 h-10  transform hover:scale-105
                    transition-transform duration-300"
    src={`/${square.color === "b" ? square.type.toUpperCase() : square.type + " copy"}.png`}
    alt={`${square.color === "b" ? "Black" : "White"} ${square.type}`}
  />
)} 
  </div>
    );
          })}
        </div>
      ))}
    </div>
  );
}

export default ChessBoard;
