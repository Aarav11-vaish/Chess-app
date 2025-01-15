import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { COOKIE_MAX_AGE } from '../consts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set!');
}

// Guest login route
router.post('/guest', async (req, res) => {
  const guestUUID = 'guest-' + uuidv4();

  try {
    // Insert guest user into the database
    const result = await query(
      `INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, username, email`,
      [guestUUID, `${guestUUID}@chess100x.com`]
    );

    const user = result.rows[0]; // Retrieve the inserted user
    const token = jwt.sign(
      { userId: user.id, username: user.username, isGuest: true },
      JWT_SECRET
    );

    // Set a secure cookie in production
    const cookieOptions = {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    };
    res.cookie('guest', token, cookieOptions);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
      isGuest: true,
    });
  } catch (error) {
    console.error('Error creating guest user:', error);
    res.status(500).json({ error: 'Failed to create guest user' });
  }
});

export default router;
