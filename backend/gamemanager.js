import Game from './game.js';

class GameManager {
    constructor() {
        this.games = new Set();     // store Game instances
        this.users = new Set();     // active sockets
        this.pendingUser = null;
    }

    addUser(socket) {
        this.users.add(socket);
        this.handleMessage(socket);
    }

    removeUser(socket) {
        this.users.delete(socket);

        // Remove from games
        for (let game of this.games) {
            if (game.player1 === socket || game.player2 === socket) {
                this.games.delete(game);
            }
        }

        if (this.pendingUser === socket) {
            this.pendingUser = null;
        }
    }

    handleMessage(socket) {
        socket.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString());

                switch (message.type) {  
                    case "init_game":
                        this.initGame(socket);
                        break;  

                    case "move":
                        this.routeMove(socket, message.payload); 
                        break;

                    default:
                        socket.send(JSON.stringify({ 
                            type: "error", 
                            payload: { message: "Unknown message type." } 
                        }));
                        break;
                }
            } catch (err) {
                console.error("Message parse error:", err);
                socket.send(JSON.stringify({ type: "error", payload: { message: "Malformed message." } }));
            }
        });
    }

    initGame(socket) {
        if (this.pendingUser) {
            const game = new Game(this.pendingUser, socket);
            this.games.add(game);
            this.pendingUser = null;
        } else {
            this.pendingUser = socket;
        }
    }

   routeMove(socket, move) {
    for (let game of this.games) {
        if (game.player1 === socket || game.player2 === socket) {
            game.handleMove(socket, move);
            break;
        }
    }
}

}

export { GameManager };






