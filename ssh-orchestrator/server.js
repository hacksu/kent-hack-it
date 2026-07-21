import express from 'express';
import { exit } from 'process';
import { CreateSSHInstance, StopInstance } from './orchestrator.js';

const app = express();
app.use(express.json());
const port = 3000;

if (!process.env.SSH_MIN_PORT || !process.env.SSH_MAX_PORT) {
    console.error("[-] Missing values for SSH_MIN_PORT and SSH_MAX_PORT!");
    exit(1);
}

app.get('/', (req, res) => {
    return res.status(200).send('SSH Orchestrator Online!');
});

app.post('/create_instance', async (req, res) => {
    try {
        const { uid, image_ref } = req.body;
        const result = await CreateSSHInstance(uid, image_ref);
        return res.status(result.rc).json(result);
    } catch (err) {
        console.error("[-] create_instance error:", err);
        return res.status(500).json({ success: false, error: 'Failed to create SSH instance' });
    }
});

app.post('/stop_instance', async (req, res) => {
    try {
        const { container_id } = req.body;
        const result = await StopInstance(container_id);
        return res.status(result.rc).json(result);
    } catch (err) {
        console.error("[-] stop_instance error:", err);
        return res.status(500).json({ success: false, error: 'Failed to stop SSH instance' });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log("SSH Orchestrator listening on port", port);
});
