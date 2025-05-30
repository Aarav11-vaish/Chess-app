import React, { useState } from 'react';

function ChessBoard({ board, onMove }) {
  const [from, setFrom] = useState(null);

  const handleClick = (square) => {

    
    if (!from) {
      setFrom(square);
    } else {
      if (from === square) {
        setFrom(null);
        return;
      }
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
            const isSelected = from === square;
            const isLightSquare = (i + j) % 2 === 0;
            const baseColor = isLightSquare ? 'bg-emerald-400' : 'bg-slate-800';
            const hoverColor = isLightSquare ? 'hover:bg-emerald-600' : 'hover:bg-slate-900';
            const selectedColor = isSelected ? 'bg-yellow-400' : '';

            return (
              <div
                key={j}
                onClick={() => handleClick(square)}
                className={`w-16 h-16 flex justify-center items-center cursor-pointer transition-colors duration-200
                  ${baseColor} ${hoverColor} ${selectedColor} hover:opacity-90`}
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
