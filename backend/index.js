import { WebSocketServer } from 'ws';
import { GameManager } from './gamemanager.js';

const wss = new WebSocketServer({ port: 8080 });

const gamemanager = new GameManager();

wss.on('connection', function connection(ws) {
    gamemanager.addUser(ws);
    ws.on("disconnect", () => gamemanager.removeUser(ws));
    ws.on('error', console.error);
    // Send a welcome message or initial response
    ws.send(JSON.stringify({ type: "connected", message: "Welcome to the Chess server" }));
});
