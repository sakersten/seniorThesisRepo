// handles login/logout logic

import DBAbstraction from "../db.js"; 
const db = new DBAbstraction(); 

import { OAuth2Client } from 'google-auth-library';

import dotenv from 'dotenv'; 
dotenv.config(); 

const VITE_GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID; 
const client = new OAuth2Client(VITE_GOOGLE_CLIENT_ID);

// Google login route, verify token, create/check user in database, start session
const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: VITE_GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // check if the user exists in PostgreSQL
        let result = await db.findUser(googleId);

        if (result === false) {
            // new user -> insert
            const insertResult = await db.insertNewUser(googleId, email, name); 
        }

        // store internal user_id in session
        req.session.userId = googleId; 

        res.json({ user: { name: name, email: email } });
    } catch (err) {
        console.error(err);
        res.status(401).send('Invalid token');
    }
};

// log out
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
        return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid') ; // clears the session cookie
    res.send('Logged out');
  });
};

// check login status
const checkLogin =(req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.user });
    } else {
        res.json({ loggedIn: false, username: null });
    }
};

export default {
  googleLogin,
  logout,
  checkLogin
};