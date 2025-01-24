// const WebSocket = require('ws');
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import { Chess } from 'chess.js';

import WebSocket from 'ws';
const { Chess } = require('chess.js');

const wss = new WebSocket.Server({ port: 8080 });
const chess = new Chess();

const app=express();
app.use(bodyParser.urlencoded({ extended: true }));
const port= process.env.port||4000;
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true }));
   //cors is used to allow the request from different origin)

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});

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
