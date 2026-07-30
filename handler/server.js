import express from 'express'
import { exit } from 'process';
import { access, chmod } from "fs/promises";
import { join, basename, normalize } from "path";

import { CheckFile } from './utils_h.js';
import {
    CreateInstance,
    MIN_PORT, MAX_PORT,
} from './handler.js';

const app = express()
app.use(express.json());
const port = 3000

if (MIN_PORT === MAX_PORT) {
    console.error("[-] Possibly missing env values for MIN_PORT and MAX_PORT!")
    exit(1);
}

app.get('/', (req, res) => {
    return res.status(200).send('Application Online!');
});

app.post('/create_instance', async (req, res) => {
    try {
        const { name, nsjail_conf, flag_value } = req.body;
        console.log("[*] Attempting to Create Instance...");
        const sess = await CreateInstance(name, nsjail_conf, flag_value);
        return res.status(sess.rc).json(sess);
    } catch (err) {
        console.error("[-] Error Creating Instance:", err);
        return res.status(500).json({ success: false, error: 'Failed to create Instance' });
    }
});

app.post('/kill', async (req, res) => {
    const { cpid } = req.body;
    try {
        process.kill(cpid, 'SIGKILL');
        return res.status(200).send(`PID: ${cpid} killed`);
    } catch (err) {
        if (err.code === 'ESRCH') {
            console.log(`Process ${cpid} doesn't exist (already dead?)`);
        } else if (err.code === 'EPERM') {
            console.log("Permission Denied");
        } else {
            throw err;
        }
        return res.status(500).send("PID Kill Failed!");
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log("Handler is listening on port", port)
});