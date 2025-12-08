// handles login/logout logic

const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv'); 
dotenv.config('./.env');

const VITE_GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID; 
const client = new OAuth2Client(VITE_GOOGLE_CLIENT_ID);

// Google login route
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: VITE_GOOGLE_CLIENT_ID
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
};

// log out
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
        return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid') ;// clears the session cookie
    res.send('Logged out');
  });
};

// check login status
exports.checkLogin =(req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.user });
    } else {
        res.json({ loggedIn: false, username: null });
    }
};