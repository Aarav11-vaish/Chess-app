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

        this.player1.send(JSON.stringify({ type: "init_game", payload: { color: 'white' }}));
        this.player2.send(JSON.stringify({ type: "init_game", payload: { color: 'black' }}));
    }

    handleMove(move) {
        // Validate player turn
        if (this.board.turn() === 'w' && this.turn !== this.player1) {
            this.player1.send(JSON.stringify({ type: "error", message: "Not your turn" }));
            return;
        }
        if (this.board.turn() === 'b' && this.turn !== this.player2) {
            this.player2.send(JSON.stringify({ type: "error", message: "Not your turn" }));
            return;
        }
    
        try {
            const result = this.board.move(move);
            if (!result) {
                // Invalid move
                this.turn.send(JSON.stringify({ type: "error", message: "Invalid move" }));
                return;
            }
        } catch (e) {
            console.log(e);
            this.turn.send(JSON.stringify({ type: "error", message: "Invalid move" }));
            return;
        }
    
        // Check if game over
        console.log(this.board.moves());
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? 'black' : 'white';
            this.player1.send(JSON.stringify({ type: "game_over", payload: { winner } }));
            this.player2.send(JSON.stringify({ type: "game_over", payload: { winner } }));
            return;
        }
    
        // Broadcast move to both players
        const payload = { type: "move", move };
        // if(this.movecount)
        this.player1.send(JSON.stringify(payload));
        this.player2.send(JSON.stringify(payload));
    
        // Update turn
        this.moves.push(move);
        this.turn = this.turn === this.player1 ? this.player2 : this.player1;
    }
}    

export default Game;