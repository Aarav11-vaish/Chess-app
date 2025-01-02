import { useEffect, useState } from 'react';
import Button from '../component/Button';
import ChessBoard from '../component/ChessBoard';
import usesocket from '../hooks/usesocket';
import { Chess } from 'chess.js';

function Game() {
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const socket = usesocket();

   
    useEffect(() => {
        if (!socket) {
            return;
        }

        
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);

            switch (message.type) {
                case "init_game":
                    const newChess = new Chess();
                    setChess(newChess);
                    setBoard(chess.board());
                    console.log("Game is initialized");
                    break;
                case "move":
                    const move =  message.payload;
                    chess.move(move);
                    setBoard(chess.board());

                    // const move = message.move;
                    // setChess((prev) => {
                    //     const updated = new Chess(prev.fen());
                    //     updated.move(move);
                    //     setBoard(updated.board());
                    //     return updated;
                    // });
                    console.log("Move received", message);
                    break;
                case "game_over":
                    console.log("Game over", message);
                    break;
                default:
                    console.log("Unknown message type", message);
                    break;
            }
        };
}, [socket]);

    return (
        <div className="justify-center flex">
            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-6 w-full">
                    <div className="col-span-4 bg-red-200 w-full">
                        <ChessBoard socket={socket} board={board} />
                    </div>
                    <div className="col-span-2 bg-blue-200 w-full">
                        <Button
                            onClick={() => {
                                socket.send(JSON.stringify({ type: "init_game" }));
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;