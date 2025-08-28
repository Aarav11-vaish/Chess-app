import { Chess } from 'chess.js';

class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
        this.gameId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        // Map sockets to colors
        this.players = new Map([
            [player1, 'white'],
            [player2, 'black']
        ]);

        this.sendInit();
    }

    getCurrentPlayerSocket() {
        return this.board.turn() === 'w'
            ? [...this.players.entries()].find(([_, c]) => c === 'white')[0]
            : [...this.players.entries()].find(([_, c]) => c === 'black')[0];
    }

    getOpponent(socket) {
        return socket === this.player1 ? this.player2 : this.player1;
    }

    sendInit() {
        this.player1.send(JSON.stringify({ type: "init_game", payload: { color: 'white' } }));
        this.player2.send(JSON.stringify({ type: "init_game", payload: { color: 'black' } }));
    }

    handleMove(socket, move) {
        const currentPlayer = this.getCurrentPlayerSocket();
        if (socket !== currentPlayer) {
            return this.sendError(socket, "Not your turn");
        }

        const result = this.board.move(move);
        if (!result) {
            return this.sendError(socket, "Invalid move. Try again.");
        }

        this.moves.push(result);
        const opponent = this.getOpponent(socket);

        // Notify opponent about the move
        opponent.send(JSON.stringify({ type: "move", payload: result }));

        // Handle game state after move
        this.checkGameState();
    }

    checkGameState() {
        if (this.board.inCheck()) {
            const checkedColor = this.board.turn() === 'w' ? 'white' : 'black';
            this.broadcast("check", { checkedColor });
        }

        if (this.board.isCheckmate()) {
            const loserColor = this.board.turn() === 'w' ? 'white' : 'black';
            const winnerColor = loserColor === 'white' ? 'black' : 'white';
            this.broadcast("checkmate", { winner: winnerColor });
        }

        if (this.board.isDraw()) {
            this.broadcast("draw", { message: "The game is a draw." });
        }
    }

    broadcast(type, payload) {
        this.player1.send(JSON.stringify({ type, payload }));
        this.player2.send(JSON.stringify({ type, payload }));
    }

    sendError(socket, message) {
        socket.send(JSON.stringify({ type: "error", payload: { message } }));
    }
}

export default Game;
