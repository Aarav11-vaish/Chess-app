import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import WebSocket from 'ws';

const { Chess } = require('chess.js');

const wss = new WebSocket.Server({ port: 8080 });
const chess = new Chess();

const app = express();
const port = process.env.PORT || 4000; // Fixed 'port' env variable

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true })); // CORS to allow cross-origin requests

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

wss.on('connection', (ws) => {
    console.log('New player connected');

    // Send current game state to newly connected client
    ws.send(JSON.stringify({ type: 'game_state', payload: { fen: chess.fen() } }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'init_game':
                    chess.reset();
                    broadcast({ type: 'init_game', payload: { fen: chess.fen() } });
                    break;

                case 'move':
                    const move = data.payload.move;
                    const result = chess.move(move);

                    if (result) {
                        broadcast({ type: 'move', payload: { move, fen: chess.fen() } });
                    } else {
  ws.send(JSON.stringify({
                            type: 'invalid_move',
                            payload: { move, reason: "Invalid move" }
                        }));

                        // Send the correct game state to prevent frontend from getting stuck
                        ws.send(JSON.stringify({ type: 'game_state', payload: { fen: chess.fen(), turn: chess.turn() } }));                        
                    }
                    break;
            }
        } catch (error) {
            console.error('Invalid message received:', message);
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid data format' } }));
        }
    });

    ws.on('close', () => {
        console.log('A player disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
