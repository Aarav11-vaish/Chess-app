import React from "react";
import { useState } from "react";
// import  Chess  from "chess.js";
function ChessBoard({ board , socket}) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  return (
    <div>
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => (
            <div onClick={() => {
              if (from) {
                setTo({ x: i, y: j });
                socket.send(JSON.stringify({ type: "move", payload: { from, to: { x: i, y: j } } }));
                setFrom(null);
                setTo(null);
              } else {
                setFrom({ x: i, y: j });
              }}

            }
              key={j}
              className={`w-14 h-14 flex justify-center items-center ${
                (i + j) % 2 === 0 ? "bg-green-300" : "bg-gray-500"
              }`}
            >
              {square ? (
                <div className="text-2xl">{square.type}</div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default ChessBoard;
