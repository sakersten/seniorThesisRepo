
## Sprint #1
### This sprint I worked on: 
- I began to develop both the backend and frontend of my web application.
- I made a basic frontend interface to test that data was being pulled correctly from my backend. 
- I implemented Google OAuth login and logout functionality. 
- I connected to a weather API to generate a 5 day weather forecast for a given destination (currently hardcoded for testing, but will eventually pull desination(s) from the database). 
- I created database in PostgreSQL.

### This sprint I learned: 
- I learned how to implement Google OAuth login functionality for secure user sessions.
- I learned how to work with API keys to fetch weather data for a given destination.  
- I learned how to work with API keys and .env files. 

### My successes this sprint were: 
- I began to develop both the backend and frontend of my web application. 
- I successfully implemented Google OAuth login and logout functionality. 
- I connected to a weather API to generate a 5-day weather forecast for a given destination. 

### My challenge this sprint were: 
- I realized that it would be difficult to test my project, as I am creating a mobile application on a Windows machine and I have an Apple phone. I chose to change my project from a mobile application to a web application so that this challenge would be reduced. 
- I am unfamiliar with PostgreSQL, so I plan to work more with inserting and pulling data from it in the next sprint. 

--

## Sprint #2
### This sprint I worked on: 
- I planned out my database by mapping out table relationships. 
- I created routes to insert, get, edit, and delete data from my PostgreSQL database. 
- I pulled in historical weather to give the user an idea of what the weather could potentially look like as they are preparing for their trip (current weather forecast is only five days in advance, so that is only shown for last-minute packing). I will implement this later on in the Upcoming Trips page. 
- I connected my backend and frontend together. 

### This sprint I learned: 
- I learned how to connect my index.js, db.js, routes, and controllers together. Through using this format, I was able to better organize the different components within my web application. 
- I learned how to work with PostgreSQL. I successfully inserted, pulled, edited, and deleted data in the database. I tested these methods with Postman before successfully connecting them to my frontend. 
- I learned how important it is to properly manage authentication flow between frontend and backend, especially when dealing with session-based authorization.

### My successes this sprint were: 
- I successfully connected my backend routes with frontend functionality. I created forms for editing/inserting data. I also added page navigation for the various pages I have added. 
- I built forms for adding data. 
- I implemented navigation between the web application pages. 

### My challenge this sprint were: 
- I had difficulty connecting my frontend to my backend at first. 
- I unintentionally implemented OAuth functionality in my frontend, but it wasn't returning session data to my backend. As a result, any user-restricted actions (such as adding items to the database) were not working. 
- I had difficulty with creating a weather widget for each destination within a trip (TripDetails). I chose to table the idea for right now because I need to work on my packing list generation feature. 

## Sprint #3
### Current Goals for Sprint #3:
- Develop packing list generation functionality.
- Align aesthetics of the frontend so it has a cohesive theme (colors, fonts, font size, etc.) across all pages.
- Add update/delete functionality for trips and destinations. 
- Potentially add a weather widget within TripDetails for each destination; would be a nice feature to have when seeing the details of a trip. 