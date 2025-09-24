import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as DiscordStrategy } from "passport-discord";
import cors from "cors";

import oauthRoutes from "./routes/oauth.mjs";
import ctfRoutes from "./routes/ctf.mjs";
import userRoutes from "./routes/user.mjs";
import adminRoutes from "./routes/admin.mjs";
import adminCtfRoutes from "./routes/adminCtf.mjs";
import teamRoutes from "./routes/team.mjs";
import infoRoutes from "./routes/info.mjs";

import { MongoURI, UserCollection, HandleAccount } from "./db.mjs";
import MongoStore from "connect-mongo";

import cookieParser from 'cookie-parser';

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
const port = 4000;

// --- Middleware

// Allows data to be sent from post requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // middleware to handle JSON
app.use(cookieParser()); // Access cookies

const allowedOrigins = [
    `http://localhost:80`,                  // local dev
    `http://localhost:8080`,
    // 'https://ctf.hacksu.com'                     // production site
];

console.log(`Allowed Origins\n|____ ${allowedOrigins}\n`);

app.use(cors({
    origin: allowedOrigins,  // React app origin
    credentials: true                // allow cookies
}));

// Custom Error Handler to minimize verbose output
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
});

// attempting to cover up digital foot-print
app.disable('x-powered-by');

// Persistent Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || "wheredidweputhteenvfileguys???",
        resave: false, // don’t save session if unmodified
        saveUninitialized: false, // don’t create session until something stored
        store: MongoStore.create({
            mongoUrl: MongoURI(),
            collectionName: "sessions", // collection to store sessions
            ttl: 24 * 60 * 60, // session lifetime in seconds (1 day)
        }),
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            httpOnly: true, // cannot access cookie from JS
            secure: process.env.NODE_ENV === "production", // only HTTPS in prod
        },
    })
);

// --- OAuth Components
app.use(passport.initialize());
app.use(passport.session());

// --- Passport serialize/deserialize ---
passport.serializeUser((user, done) => done(null, user._id)); // store Mongo _id
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserCollection.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// --- GitHub OAuth ---
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
                scope: ["user:email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const user = await HandleAccount("github", profile, accessToken);
                    if (user) {
                        console.log(`Authenticated as ${user.username}`);
                        return done(null, user);
                    } else {
                        console.error("Bad Github OAuth");
                        done(err, null);
                    }
                } catch (err) {
                    console.error("GitHub strategy error:", err);
                    done(err, null);
                }
            }
        )
    );
    // engage the github strategy
    app.get("/auth/github", passport.authenticate("github", {
        scope: ["user:email"]
    }));
} else {
    console.warn("[!] GitHub OAuth disabled - missing env vars");
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_CALLBACK_URL) {
    // --- Discord OAuth ---
    passport.use(
        new DiscordStrategy(
            {
                clientID: process.env.DISCORD_CLIENT_ID,
                clientSecret: process.env.DISCORD_CLIENT_SECRET,
                callbackURL: process.env.DISCORD_CALLBACK_URL,
                scope: ["identify", "email", "guilds", "guilds.members.read"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const user = await HandleAccount("discord", profile, accessToken);
                    if (user) {
                        console.log(`Authenticated as ${user.username}`);
                        return done(null, user);
                    } else {
                        console.error("Bad Discord OAuth");
                        done(err, null);
                    }
                } catch (err) {
                    console.error("Discord strategy error:", err);
                    done(err, null);
                }
            }
        )
    );
    // engage the discord strategy
    app.get("/auth/discord", passport.authenticate("discord", {
        scope: ["identify", "email", "guilds", "guilds.members.read"]
    }));
} else {
    console.warn("[!] Discord OAuth disabled - missing env vars");
}

// ---

// Mount routes under a given path
app.use("/auth", oauthRoutes);  // OAuth
app.use("/ctf", ctfRoutes);     // CTF Challenge interaction
app.use("/admin", adminRoutes); // admin actions
app.use("/admin/ctf", adminCtfRoutes); // admin actions against challenges
app.use("/user", userRoutes);   // user actions
app.use("/team", teamRoutes);   // team actions
app.use("/info", infoRoutes);   // team actions

// verify a user is authenticated
app.get("/authenticated", (req, res) => {
    if (!req.isAuthenticated()) {
        console.log("Unauthorized!");
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("Authorized!");
    res.json({ message: "Authorized" });
});

app.get('/', (req, res) => {
    res.send("You've Reached the Back-End!\n");
});

app.listen(port, host, () => {
    console.log(`Backend Server is Active!\n|____ http://${host}:${port}\n`);
});
export { passport };