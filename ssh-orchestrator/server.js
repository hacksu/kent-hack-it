import express from 'express';

const app = express();
app.use(express.json());
const port = 3000;

app.get('/', (req, res) => {
    return res.status(200).send('SSH Orchestrator Online!');
});

app.listen(port, "0.0.0.0", () => {
    console.log("SSH Orchestrator listening on port", port);
});
