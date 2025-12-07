'use strict'; 

const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv'); 
dotenv.config('./.env');

const VITE_GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID; 

const client = new OAuth2Client(VITE_GOOGLE_CLIENT_ID);

const app = express();

app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

const port = 53140; 

// middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', // frontend
  credentials: true
}));

app.use(session({
  secret: 'secret-secret-secret-secret', // change later to make more secure -> using dotenv maybe?
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true if using HTTPS
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// ROUTES

// route to create a new user using google account?

// Google login route
app.post('/login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();

        // store user in session
        req.session.user = {
            name: payload.name,
            email: payload.email,
            googleId: payload.sub
        };

        res.json({ user: { name: payload.name, email: payload.email } });
    } catch (err) {
        console.error(err);
        res.status(401).send('Invalid token');
    }
});

// log out
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
        return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid') ;// clears the session cookie
    res.send('Logged out');
  });
});

// check login status
app.get('/am-i-loggedin', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.user });
    } else {
        res.json({ loggedIn: false, username: null });
    }
});

// ctrl k ctrl u to undo
// // middleware to ensure that the user is logged in
// function isAuthenticated(req, res, next) {
//     if (req.session.userId) {
//         next();
//     } else {
//         res.status(401).send('Unauthorized: You must be logged in.');
//     }
// }

// middleware
app.use((req, res) => { 
    res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`); 
}); 

app.listen(53140, () => console.log(`Server running on http://localhost:${port}`));