'use strict'; 

const dotenv = require('dotenv'); 
dotenv.config('./.env');

const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = 53140; 

// import route files -> each one is a group of endpoints
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes'); 
// const activityRoutes = require('./routes/activityRoutes');
// const closetRoutes = require('./routes/closetRoutes');
// const destinationRoutes = require('./routes/destinationRoutes');
// const packingListRoutes = require('./routes/packingListRoutes');
// const tripRoutes = require('./routes/tripRoutes');

// middleware
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

app.use(cors({
  origin: 'http://localhost:5173', // frontend
  credentials: true
}));

// session configuration
app.use(session({
  secret: 'secret-secret-secret-secret', // change later to make more secure -> using dotenv maybe?
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true if using HTTPS
}));

// attach user sessiojn to res.locals
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// serve frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// mount routes
app.use('/auth', authRoutes);                // login, logout, google oauth
app.use('/weather', weatherRoutes);          // weather API
// app.use('/activities', activityRoutes);      // user trip activities
// app.use('/closet', closetRoutes);            // clothing items in user's closet
// app.use('/destinations', destinationRoutes); // cities, coords, climate info
// app.use('/packing', packingListRoutes);      // packing list generation & saving
// app.use('/trips', tripRoutes);               // user's trips (start date, end date, etc.)

// fallback middleware -> runs if no other route handled the request
app.use((req, res) => { 
    res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`); 
}); 

// start server
app.listen(53140, () => console.log(`Server running on http://localhost:${port}`));