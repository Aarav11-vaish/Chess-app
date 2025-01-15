import { Chess } from 'chess.js';

class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.turn = player1;
        this.moves = [];
        this.startTime = new Date();
        this.player1.send(JSON.stringify({ type: "init_game", payload: { color: 'white' } }));
        this.player2.send(JSON.stringify({ type: "init_game", payload: { color: 'black' } }));
        this.movecount = 0;
        this.gameId = null;
    }

    handlemove(socket, move) {
        // Ensure the correct player is making the move
        if (this.movecount % 2 === 0 && socket !== this.player1) {
            this.sendError(socket, "Not your turn");
            return;
        }
        if (this.movecount % 2 === 1 && socket !== this.player2) {
            this.sendError(socket, "Not your turn");
            return;
        }
    
        // Validate and apply the move
        const result = this.board.move(move);
        if (!result) {
            this.sendError(socket, "Invalid move. Try again.");
            return; // Allow the player to try another move
        }

        // Check if the game is over
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? 'black' : 'white';
            this.player1.send(JSON.stringify({ type: "game_over", payload: { winner } }));
            this.player2.send(JSON.stringify({ type: "game_over", payload: { winner } }));
            return;
        }

        // Broadcast the move to the other player
        if (this.movecount % 2 === 0) {
            this.player2.send(JSON.stringify({ type: "move", payload: move }));
        } else {
            this.player1.send(JSON.stringify({ type: "move", payload: move }));
        }

        // Increment the move count
        this.movecount++;
    }

    sendError(socket, message) {
        socket.send(JSON.stringify({ type: "error", payload: { message } }));
    }
}

export default Game;
