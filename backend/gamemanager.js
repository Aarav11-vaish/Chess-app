import Game from './game.js';

class GameManager {   
    constructor() {
        this.game = []; // To store game state
        this.users = []; // List of active users
        this.pendingUser = null;
    }

    addUser(socket) {
        this.users.push(socket);
        this.handleMessage(socket);
    }

    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
    }

    handleMessage(socket) {
        socket.on("message", (data) => {
            console.log("Received message:", data.toString());
            try {
                const message = JSON.parse(data.toString());

                if (message.type === "init_game") {
                    console.log("Handling init_game message") ;
                    if (this.pendingUser) {
                        console.log("Pairing with pending user");
                        const game = new Game(socket, this.pendingUser);
                        // console.log(game);
                        this.game.push(game);
                        // console.log(socket);
                        
                        this.pendingUser = null ;
                    } else {
                        console.log("Setting user as pending");
                        this.pendingUser = socket;
                    }
                } else if (message.type === "move") {
                    const game = this.game.find(game => game.player1 === socket || game.player2 === socket);
                    
                    if (game) {
                        game.handlemove(socket, message.payload.move); // Fix: Correctly access `message.move`
                    }
                }
            } catch (err) {
                console.error("Error handling message:", err);
            }
        });
    }
    


    // joinGame(socket) {
    //     // Implementation here
    // }
}

export { GameManager };