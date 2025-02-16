import { WebSocketServer } from 'ws';
import { GameManager } from './gamemanager.js';
import express from 'express';
import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { Strategy as FacebookStrategy } from 'passport-facebook';
import findOrCreate from 'mongoose-findorcreate';
import { profile } from 'console';
dotenv.config();
const app = express();
const PORT = 5000;
const wss = new WebSocketServer({ port: 8080 });

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }  
}));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

  // Define the User schema
  const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },  // ✅ Prevents duplicate `null` values
    username: { type: String, unique: true, sparse: true },  // ✅ Allows `null`
    password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);

// Passport configuration
passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id); // ✅ Use `await`
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:5000/auth/google/game",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"

//   },
//   function(accessToken, refreshToken, profile, cb) {
//     console.log(profile);
    
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/game",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    
    try {
        const existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
            return cb(null, existingUser);
        }

        const newUser = new User({
            googleId: profile.id,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + profile.id.slice(-4) // Generate a unique username
        });

        await newUser.save();
        return cb(null, newUser);
    } catch (err) {
        return cb(err);
    }
  }
));


// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: "http://www.example.com/auth/facebook/callback"
//     },
//     function(accessToken, refreshToken, profile, cb) {
//         User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//             return cb(err, user);
//         });
//     }
// ));
app.get('/auth/google',  
        passport.authenticate('google', { scope: ['profile'] }));
        console.log(profile);

app.get(
    '/auth/google/game',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('http://localhost:5173/game'); // ✅ Redirect user after successful login
    }
);


app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    User.register(new User({ username }), password, (err, user) => {
        if (err) {
            console.error("Signup error:", err);
            return res.status(400).json({ error: 'Signup failed: ' + err.message });
        }

        req.login(user, (err) => {  
            if (err) {
                console.error("Auto-login error after signup:", err);
                return res.status(500).json({ error: 'Auto-login failed' });
            }
            res.json({ message: 'Signup successful', redirectTo: '/game' });
        });
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Login error:", err);
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        req.login(user, (err) => {  
            if (err) {
                console.error("Session creation error:", err);
                return res.status(500).json({ error: 'Login failed' });
            }
            res.json({ message: 'Login successful', redirectTo: '/game' });
        });
    })(req, res, next);
});

app.get('/game', (req, res) => {
    console.log("Session:", req.session);
    console.log("User:", req.user); 
    if (req.isAuthenticated()) {
        res.status(200).json({ message: "Authenticated" });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});


app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) return next(err);
            console.log(req.user ,"logged out");
            
            res.clearCookie('connect.sid'); 
            res.json({ message: "Logged out" }); 
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
const gamemanager = new GameManager();
wss.on('connection', function connection(ws) {
    gamemanager.addUser(ws);
    ws.on("disconnect", () => gamemanager.removeUser(ws));
    ws.on('error', console.error);
    // Send a welcome message or initial response
    ws.send(JSON.stringify({ type: "connected", message: "Welcome to the Chess server" }));
});
