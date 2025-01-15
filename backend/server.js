// const WebSocket = require('ws');
import WebSocket from 'ws';
const { Chess } = require('chess.js');

const wss = new WebSocket.Server({ port: 8080 });
const chess = new Chess();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'init_game':
                chess.reset();
                broadcast({ type: 'init_game' });
                break;
            case 'move':
                const move = data.payload.move;
                chess.move(move);
                broadcast({ type: 'move', payload: { move } });
                break;
            // ...existing code...
        }
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
