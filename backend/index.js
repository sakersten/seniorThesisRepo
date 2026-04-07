'use strict'; 

import DBAbstraction from "./db.js"; 

import dotenv from 'dotenv'; 
dotenv.config(); 

import express from 'express'; 
import session from 'express-session'; 
import bodyParser from 'body-parser';
import cors from 'cors'; 
import morgan from 'morgan'; 
import path from 'path'; 

const __dirname = import.meta.dirname;

const app = express();
const port = 53140; 

const db = new DBAbstraction(); 

// middleware
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

app.use(cors({
  origin: 'http://localhost:5173', // frontend
  credentials: true
}));

// import route files -> each one is a group of endpoints
import authRoutes from './routes/authRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js'; 
import activityRoutes from './routes/activityRoutes.js';
import closetRoutes from './routes/closetRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
//import packingListRoutes from './routes/packingListRoutes.js';
import tripRoutes from './routes/tripRoutes.js';

// session configuration
app.use(session({
  secret: 'secret-secret-secret-secret', // change later to make more secure -> using dotenv maybe?
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true if using HTTPS
}));

// attach user session to res.locals
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// mount routes
app.use('/auth', authRoutes);                // login, logout, google oauth
app.use('/weather', weatherRoutes);          // weather API
app.use('/activities', activityRoutes);      // user trip activities
app.use('/closet', closetRoutes);            // clothing items in user's closet
app.use('/destinations', destinationRoutes); // cities, coords, climate info
//app.use('/packing', packingListRoutes);      // packing list generation & saving
app.use('/trips', tripRoutes);               // user's trips (start date, end date, etc.)


// serve frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// fallback middleware -> runs if no other route handled the request
app.use((req, res) => { 
    res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`); 
}); 

// start server
app.listen(53140, () => console.log(`Server running on http://localhost:${port}`));