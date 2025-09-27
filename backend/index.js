import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { GameManager } from './gamemanager.js';
import passportLocalMongoose from 'passport-local-mongoose';
import findOrCreate from 'mongoose-findorcreate';
import bodyParser from 'body-parser';
import {createServer} from 'http';
import bcrypt from 'bcryptjs';
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const WSPORT = process.env.WSPORT || 8080;

// -----------------------------
// MongoDB Connection
// -----------------------------
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// -----------------------------
// User Schema & Model
// -----------------------------
const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, unique: true, sparse: true },
    password: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

// -----------------------------
// Passport Config
// -----------------------------
passport.use(User.createStrategy());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
//why do we serialize and desiarilize the user? to store user info in session and retrieve it later

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    userProfileURL: process.env.user_profile_URL
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await new User({
                googleId: profile.id,
                username: profile.displayName.replace(/\s+/g, '').toLowerCase() + profile.id.slice(-4)
            }).save();
        }
        cb(null, user);
    } catch (err) {
        cb(err);
    }
}));
// -----------------------------
// Middlewares
// -----------------------------
app.use(cors({ origin: process.env.front_end_URL,credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));
app.use(passport.initialize());
app.use(passport.session());

// Helper middleware
const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Unauthorized" });
};

// -----------------------------
// Routes
// -----------------------------
app.get('/', (req, res) => {
    res.status(req.isAuthenticated() ? 200 : 401).json({
        message: req.isAuthenticated() ? "Authenticated" : "Unauthorized"
    });
});

app.get('/dashboard', ensureAuth, (req, res) => {

    res.json({ username: req.user.username });
});

// Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/game',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => res.redirect(`${process.env.front_end_URL}/dashboard`)
);

// Local Signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });

    User.register(new User({ username }), password, (err, user) => {
        if (err) return res.status(400).json({ error: 'Signup failed: ' + err.message });

        req.login(user, err => {
            if (err) return res.status(500).json({ error: 'Auto-login failed' });
            res.json({ message: 'Signup successful' });
        });
    });
});

// Local Login
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        req.login(user, err => {
            if (err) return res.status(500).json({ error: 'Login failed' });
            res.json({ message: 'Login successful' });
        });
    })(req, res, next);
});

// Logout
app.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(err => {
            if (err) return next(err);
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out' });
        });
    });
});

// -----------------------------
// HTTP + WebSocket Servers
// -----------------------------
server.listen(PORT, () => console.log(`🚀 HTTP server running at http://localhost:${PORT}`));

const wss = new WebSocketServer({server});
const gamemanager = new GameManager();

wss.on('connection', ws => {
    gamemanager.addUser(ws);
    ws.on('close', () => gamemanager.removeUser(ws));
    ws.on('error', console.error);

    ws.send(JSON.stringify({ type: "connected", message: "Welcome to the Chess server" }));
});
