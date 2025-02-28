import express from 'express';
import GetUsers from './db.js';

const app = express();
const port = 4000; // NOT AN OPEN PORT BACKEND BE FILTERED (ONLY ACCESSIBLE BY LOCAL-HOST)


// Allows data to be sent from post requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware to handle JSON
app.disable('x-powered-by');

app.get('/', (req, res) => {
    res.send("You've Reached the Back-End!\n");
});

// display the JSON output of everything in the user collection
app.get('/users', async (req, res) => {
    const userData = await GetUsers();
    res.json(userData);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});