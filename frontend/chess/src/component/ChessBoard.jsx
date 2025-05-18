import React, { useState } from 'react';

function ChessBoard({ board, onMove }) {
  const [from, setFrom] = useState(null);

  const handleClick = (square) => {
    if (!from) {
      setFrom(square);
    } else {
      if (onMove && typeof onMove === 'function') {
        onMove(from, square);
      }
      setFrom(null);
    }
  };

  return (
    <div className="text-white rounded-lg overflow-hidden shadow-2xl border-3 border-slate-400">
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((piece, j) => {
            const square = String.fromCharCode(97 + j) + (8 - i);
            return (
              <div
                onClick={() => handleClick(square)}
                key={j}
                className={`w-16 h-16 flex justify-center items-center cursor-pointer transition-colors duration-200 
                  ${(i + j) % 2 === 0 ? "bg-emerald-400 hover:bg-emerald-600" : "bg-slate-800 hover:bg-slate-900"}
                  ${from === square ? "bg-yellow-400" : ""}
                  hover:opacity-90`}
              >
                {piece && (
                  <img
                    className="w-10 h-10 transform hover:scale-105 transition-transform duration-300"
                    src={`/${piece.color === "b" ? piece.type.toUpperCase() : piece.type + " copy"}.png`}
                    alt={`${piece.color === "b" ? "Black" : "White"} ${piece.type}`}
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
