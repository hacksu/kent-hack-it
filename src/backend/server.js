import GetChallenges, { LoginUser, RegisterUser,
    GetUserProfile, UpdateUserProfile, GetTeamInfo,
    SendTeamRequest, CreateTeam, UpdateTeam, DoesExist,
    AddMember, RemoveMember, ValidateFlag, ConvertCompletions,
    ReplaceLeader
} from './db.js';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import sanitize from 'sanitize-filename';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { existsSync } from 'fs';

//==================================================================================================
async function DecodeJWT(res, token) {
    if (!token) {
        console.log("No Token Found!");
        ClearCookie(res);
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`Token for ${decoded.username} is valid!`);
        // { username, email }
        return decoded;
    } catch (err) {
        console.error('Invalid token:', err);
        ClearCookie(res);
        return null;
    }
}
//==================================================================================================

const app = express();
/*
#################################################################
        NOT AN OPEN PORT BACKEND 
        BE FILTERED (ONLY ACCESSIBLE BY LOCAL-HOST)
        WE WILL NEED A REVERSE-PROXY SUCH AS APACHE
        OR NGINX TO HAVE THIS BEHAVIOUR IN PRODUCTION
#################################################################
*/
const host = "0.0.0.0"
const port = process.env.REACT_APP_BACKEND_PORT;

// Allows data to be sent from post requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware to handle JSON
app.use(cookieParser()); // Access cookies

const allowedOrigins = [
    `http://localhost:${process.env.FRONT_END_PORT}`,                  // local dev
    `http://${process.env.LAN_HOST}:${process.env.FRONT_END_PORT}`,   // LAN live frontend
    // 'https://khi.io'                     // production site
];

console.log(`Allowed Origins\n|____ ${allowedOrigins}\n`);

// backend will handle setting JWT Cookies so the Frontend never
// sees the tokens passed from a response
app.use(cors({
    origin: allowedOrigins,  // React app origin
    credentials: true                // allow cookies
}));

app.disable('x-powered-by');

/*
######################################################
        Needs revisiting at some point (limiter)
######################################################
*/

/*
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
*/

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

        const loginResp = await LoginUser(userData.username, userData.password);
        
        console.log(`loginResp --> ${loginResp}`);

        if (loginResp.token) {
            console.log(`[*] LoginResp.token => ${loginResp.token}`);
            console.log(`[*] LoginResp.message => ${loginResp.message}`);

            res.cookie('khi_token', loginResp.token, {
                httpOnly: true,
                secure: false,           // set to true if using HTTPS
                sameSite: 'lax',         // or 'none' if cross-site and using HTTPS
                path: '/',
                maxAge: 24000 * 60 * 60  // 24 hours
            });

            // send response back to frontend
            res.json({
                "message": loginResp.message
            });
        } else {
            // send response back to frontend
            console.log("No Token Generated. . .");
            res.json({
                "message": loginResp.message
            });
        }
    } catch (error) {
        console.error("Error sending request:", error);
    }
});

function ClearCookie(res) {
    res.clearCookie('khi_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
}

app.post('/logout', (req, res) => {
    ClearCookie(res);
    res.json({ message: 'Logged out!' });
});

// backend end point to use the Cookie JWT to verify the user
// is properly authenticated
app.get('/user/verify', async (req, res) => {
    const token = req.cookies.khi_token;
    // make sure the JWT is valid
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        // pull username and email from JWT
        // and check if it exists in the DB
        const username = validJWT.username;
        const email = validJWT.email;

        const userExists = await DoesExist(username, email);
        if (userExists) {
            return res.json({
                authenticated: true,
                username: validJWT.username
            });
        } else {
            return res.json({ authenticated: false });
        }
    } else {
        return res.json({ authenticated: false });
    }
});

app.get('/user/info', async (req, res) => {
    const token = req.cookies.khi_token;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        const userData = await GetUserProfile(validJWT.username);
        
        if (userData === null) {
            return res.json(null);
        }

        // { username, email, team, is_leader }
        // console.log(`User Info --> ${JSON.stringify(userData)}`);
        return res.json(userData);
    } else {
        return res.json({ authenticated: false });
    }
});

app.post('/user/update', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        // null | { message, token }
        const profileUpdate = await UpdateUserProfile(data, validJWT);

        // when profiles are updated a new JWT is generated
        // incase username or email values have been altered
        if (profileUpdate) {
            res.cookie('khi_token', profileUpdate.token, {
                httpOnly: true,
                secure: false,           // set to true if using HTTPS
                sameSite: 'lax',         // or 'none' if cross-site and using HTTPS
                path: '/',
                maxAge: 24000 * 60 * 60  // 24 hours
            });
            console.log(`[+] Successfully Updated Profile: ${validJWT.username}`);
            return res.json(profileUpdate);
        } else {
            return res.json(null);
        }
    } else {
        return res.json({ authenticated: false });
    }
});

// Displays information about the inputted team
app.get('/team/info', async (req, res) => {
    const token = req.cookies.khi_token;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        console.log(`[*] Getting Info for the Team: ${validJWT.username} is in.`);
        const teamData = await GetTeamInfo(validJWT.username);
        // null | { ... }
        // console.log(`Team Info --> "${JSON.stringify(teamData)}"`);
        return res.json(teamData);
    } else {
        return res.json(null);
    }
});

app.post('/team/request', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        const teamRequest = await SendTeamRequest(data.sender, data.team_name);
        return res.json(teamRequest);
    } else {
        return res.json(null);
    }
});

app.post('/team/create', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        const team_name = data.team_name;
        const team_creator = validJWT.username;

        console.log(`[*] team create post-data --> ${data}`);
        console.log(`[*] Attempting to create Team: ${team_name}`);
        const teamCreate = await CreateTeam(team_creator, team_name);
        // { message }
        return res.json(teamCreate);
    } else {
        return res.json(null);
    }
});

app.post('/team/update', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        const new_team_name = data.team_name;
        const team_creator = validJWT.username;

        console.log("[*] Attempting to update Team");
        const teamUpdate = await UpdateTeam(team_creator, new_team_name);
        // { message }
        console.log(JSON.stringify(teamUpdate));
        return res.json(teamUpdate);
    } else {
        return res.json(null);
    }
});

app.post('/team/add-member', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        const addTeamMember = await AddMember(data.request_id, data.checksum);
        // null | { message }
        return addTeamMember;
    } else {
        return res.json(null);
    }
});
app.post('/team/remove-member', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        const removeTeamMember = await RemoveMember(data.member_username, validJWT);
        // null | { message }
        return removeTeamMember;
    } else {
        return res.json(null);
    }
});
app.post('/team/replace-leader', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        const leaderLeaveTeam = await ReplaceLeader(validJWT.username, data);
        // null | { message }
        return leaderLeaveTeam;
    } else {
        return res.json(null);
    }
});

app.post('/submit-flag', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        console.log("[*] Attempting to check flag value. . .");
        const checkFlag = await ValidateFlag(data.challenge_id, data.flag, validJWT);
        // null | { message }
        console.log(checkFlag);
        return res.json(checkFlag);
    } else {
        return res.json(null);
    }
});

app.post('/data/get-completions', async (req, res) => {
    const token = req.cookies.khi_token;
    const data = req.body;
    const validJWT = await DecodeJWT(res, token);

    if (validJWT) {
        console.log("[*] Attempting to create readable completions. . .");
        const readableCompletions = await ConvertCompletions(data.userCompletions, data.teamCompletions);
        // null | { ... }
        // console.log("[*] CONVERSION-RESULTS: ", readableCompletions);
        return res.json(readableCompletions);
    } else {
        return res.json(null);
    }
});

// this path is for downloading challenge archives to solve
// (used for reverse engineering | forensics challenges)
// |___ http://HOST:4000/download/test_archive.zip
app.get('/download/:filename', (req, res, next) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const uploadsDir = path.join(__dirname, 'challenge_archives');
        const allowedExtensions = ['.zip'];

        const rawFilename = req.params.filename;
        const safeFilename = sanitize(rawFilename);
        const ext = path.extname(safeFilename).toLowerCase();

        // attempt to check file types
        if (!allowedExtensions.includes(ext)) {
            return res.status(400).send('Invalid file type.');
        }

        // attempt to sanitize file path to prevent LFI
        const filePath = path.join(uploadsDir, safeFilename);

        if (!filePath.startsWith(uploadsDir)) {
            return res.status(400).send('Invalid file path.');
        }

        if (!existsSync(filePath)) {
            return res.status(404).send('File not found.');
        }

        // if something gets around it at least we log it!
        // cause then we will dox them and cheer >w<
        console.log(`[*] ${req.ip} downloading --> ${filePath}`);

        res.download(filePath, (err) => {
            if (err) {
                if (err.code === 'ECONNABORTED') {
                    console.warn(`[*] ${req.ip} aborted download. . .`);
                } else {
                    console.error('Download error:', err);
                }
            }
        });
    } catch (error) {
        console.error("Err: ", error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(port, host, () => {
    console.log(`Backend Server is Active!\n|____ http://${host}:${port}\n`);
});