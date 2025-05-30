import Game from './game.js';

class GameManager {
    constructor() {
        this.games = [];
        this.users = [];
        this.pendingUser = null;
    }

    addUser(socket) {
        this.users.push(socket);
        this.handleMessage(socket);
    }

    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        this.games = this.games.filter(game => game.player1 !== socket && game.player2 !== socket);

        if (this.pendingUser === socket) {
            this.pendingUser = null;
        }
    }

    handleMessage(socket) {
        socket.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString());
                switch(message.type) {  
                    case "init_game":
                        this.initGame(socket);
                        break;  
                    case "move":
                         this.routeMove(socket, message.payload); 
                        break;
                        case "check":
                        const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                        if (game) {
                            const checkedColor = game.getCheckedColor();
                            socket.send(JSON.stringify({ type: "check", payload: { checkedColor } }));
                        }
                        

                        case "checkmate":
                        const gameOver = this.games.find(g => g.player1 === socket || g.player2 === socket);
                        if (gameOver) {
                            const winner = gameOver.getWinner();
                            socket.send(JSON.stringify({ type: "checkmate", payload: { winner } }));
                        }


                        case "error":
                        socket.send(JSON.stringify({ type: "error", payload: { message: "Unknown message type." } }));
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
            this.games.push(game);
            this.pendingUser = null;
        } else {
            this.pendingUser = socket;
        }
    }

    routeMove(socket, move) {
        const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
        if (game) game.handlemove(socket, move);
    }
    //what is routemove doing 
    // It finds the game associated with the socket and calls the handlemove method on that game instance.

}

export { GameManager };