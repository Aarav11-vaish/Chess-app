import { WebSocketServer } from 'ws';
import { GameManager } from './gamemanager.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
// import env from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;

const app = express();
const PORT = 5000;
const wss = new WebSocketServer({ port: 8080 });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// PostgreSQL client setup
const client = new Client({
       user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

client.connect((err) => {
    if (err) {
        console.error('Failed to connect to PostgreSQL:', err.message);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

// app.get('/oldUser', (req, res) => {
//     res.render('login.jsx')
// })

// Authentication route
app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    // const { email, password } = req.body;

    // Validate input
  

    try {
        // Query the database for the user
        const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
        const values = [email, password];
        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            // User not found or invalid credentials
// res.render('Game.jsx');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.status(200).json({ message: 'Login successful', redirectTo: '/game' });
    } catch (err) {
        console.error('Error querying database:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



wss.on('connection', function connection(ws) {
    gamemanager.addUser(ws);
    ws.on("disconnect", () => gamemanager.removeUser(ws));
    ws.on('error', console.error);
    // Send a welcome message or initial response
    ws.send(JSON.stringify({ type: "connected", message: "Welcome to the Chess server" }));
});
const gamemanager = new GameManager();
