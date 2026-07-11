import express from 'express'
import { exit } from 'process';
import { access, chmod } from "fs/promises";
import { join, basename, normalize } from "path";
import { CheckFile, CreateInstance } from './handler.js';

const app = express()
app.use(express.json());
const port = 3000

const MIN_PORT = process.env.MIN_PORT;
const MAX_PORT = process.env.MAX_PORT;
const BINS_FOLDER = process.env.BIN_UPLOADS_DIR;

if (!MIN_PORT || !MAX_PORT || !BINS_FOLDER) {
    console.error("[-] Missing values for MIN_PORT and MAX_PORT!")
    exit(1);
}

app.get('/', (req, res) => {
    return res.status(200).send('Application Online!');
});

app.post('/create_instance', async (req, res) => {
    const { name, bin, flag_value } = req.body;

    // executables exists within BINS_FOLDER
    const { success, rc, message } = await CheckFile(BINS_FOLDER, bin);
    if (!success) {
        console.error(`[-] '${BINS_FOLDER}/${bin}' might not exist...`);
        return res.status(rc).send(message);
    }

    console.log("[*] Attempting to Create Instance...");
    const sess = await CreateInstance(name, BINS_FOLDER, bin, flag_value);
    return res.status(sess.rc).json(sess);
});

app.post('/kill', async (req, res) => {
    const { cpid } = req.body;

    try {
        process.kill(pid, 'SIGKILL');
        return res.status(200).send(`PID: ${pid} killed`);
    } catch (err) {
        if (err.code === 'ESRCH') {
            console.log(`Process ${pid} doesn't exist (already dead?)`);
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