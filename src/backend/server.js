import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import GetChallenges, { LoginUser, RegisterUser } from './db.js';

const app = express();
const port = 4000; // NOT AN OPEN PORT BACKEND BE FILTERED (ONLY ACCESSIBLE BY LOCAL-HOST)

// Allows data to be sent from post requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware to handle JSON
app.use(cors()); // allow requests from different origins
app.disable('x-powered-by');

// Apply rate limiting to all requests (help prevent malicious brute-forcing)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // limit each IP to 100 requests per windowMs
    standardHeaders: true,    // return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,     // disable `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
});

// Apply to all routes
app.use(limiter);

// Apply to specific route
// app.use('/login', limiter);

app.get('/', (req, res) => {
    res.send("You've Reached the Back-End!\n");
});

app.get('/challenges', async (req, res) => {
    const challenges = await GetChallenges();
    res.send(challenges);
});

app.post('/register', async (req, res) => {
    try {
        console.log(`req.body -> ${JSON.stringify(req.body)}`); // convert json object into string for debugging
        const userData = req.body;
        console.log(`Recv: ${userData}`);

        const regUser = await RegisterUser(userData.username, userData.password, userData.email);
        res.send(regUser);
    } catch (error) {
        console.error("Error sending request:", error);
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log(`req.body -> ${JSON.stringify(req.body)}`); // convert json object into string for debugging
        const userData = req.body;
        console.log(`Recv: ${userData}`);

        const login = await LoginUser(userData.username, userData.password);
        res.send(login);
    } catch (error) {
        console.error("Error sending request:", error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});