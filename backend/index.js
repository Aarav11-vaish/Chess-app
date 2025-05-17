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

dotenv.config();

const app = express();
const PORT = 5000;
const wss = new WebSocketServer({ port: 8080 });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(console.error);

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, unique: true, sparse: true },
    password: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);

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
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/game",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return cb(null, existingUser);

        const newUser = new User({
            googleId: profile.id,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + profile.id.slice(-4)
        });
        await newUser.save();
        cb(null, newUser);
    } catch (err) {
        cb(err);
    }
}));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', (req, res) => {
    res.status(req.isAuthenticated() ? 200 : 401).json({
        message: req.isAuthenticated() ? "Authenticated" : "Unauthorized"
    });
});

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ username: req.user.username });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/game',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => res.redirect('http://localhost:5173/dashboard'));

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

app.listen(PORT, () => console.log(`HTTP server running on http://localhost:${PORT}`));

const gamemanager = new GameManager();
wss.on('connection', ws => {
    gamemanager.addUser(ws);
    ws.on('close', () => gamemanager.removeUser(ws));
    ws.on('error', console.error);
    ws.send(JSON.stringify({ type: "connected", message: "Welcome to the Chess server" }));
});
