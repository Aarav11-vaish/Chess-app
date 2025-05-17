import { Chess } from 'chess.js';

class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.turn = player1;
        this.moves = [];
        this.startTime = new Date();
        this.movecount = 0;
        this.gameId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        this.sendInit();
    }

    sendInit() {
        this.player1.send(JSON.stringify({ type: "init_game", payload: { color: 'white' } }));
        this.player2.send(JSON.stringify({ type: "init_game", payload: { color: 'black' } }));
    }

    handlemove(socket, move) {
        const currentPlayer = this.movecount % 2 === 0 ? this.player1 : this.player2;
        const opponent = this.movecount % 2 === 0 ? this.player2 : this.player1;

        if (socket !== currentPlayer) {
            return this.sendError(socket, "Not your turn");
        }

        const result = this.board.move(move);
        if (!result) {
            return this.sendError(socket, "Invalid move. Try again.");
        }

        opponent.send(JSON.stringify({ type: "move", payload: move }));
        this.movecount++;

        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? 'black' : 'white';
            this.player1.send(JSON.stringify({ type: "game_over", payload: { winner } }));
            this.player2.send(JSON.stringify({ type: "game_over", payload: { winner } }));
        }
    }

    sendError(socket, message) {
        socket.send(JSON.stringify({ type: "error", payload: { message } }));
    }
}

export default Game;