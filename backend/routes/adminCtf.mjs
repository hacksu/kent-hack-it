import { UserCollection, TeamCollection, ChallengeCollection } from "../db.mjs";
import { SanitizeAlphaNumeric, IsAdmin, upload, SanitizeFileName } from "../utils.mjs";

import { Router } from "express";
const router = Router();

// expands end-point root '/admin/ctf'
router.get('/fetch_challenges', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        const challenges = await AdminGetChallenges();
        return res.send(challenges);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function AdminGetChallenges() {
    const challenges = await ChallengeCollection.find({}, { user_rates: 0 });
    return challenges;
}

router.post('/create_challenge', async (req, res) => {
    const data = req.body;

    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        console.log("Admin Attmepting to Create Challenge: " + data.name)
        const action = await CreateChallenge(data);

        // { acknowledge, message }
        return res.json(action);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function CreateChallenge(data) {
    /*
    {
        "name": STRING,
        "description": STRING,
        "category": STRING,
        "difficulty": STRING,
        "written_by": STRING,
        "flag": STRING,
        "files": ARRAY_OF_STRINGS,
        "points": NUMBER
    }
    */

    // check if a challenge already exists based on name
    const challengeExists = await ChallengeCollection.findOne({ name: data.name })
    if (challengeExists) {
        console.log("Already Existing Challenge")
        return { acknowledge: false, "message": "Already Existing Challenge!" }
    }

    const action = await ChallengeCollection.insertOne({
        "name": data.name,
        "description": data.description,
        "category": data.category,
        "difficulty": data.difficulty,
        "written_by": data.written_by || "Unknown Author",
        "flag": data.flag,
        "points": Number(data.points),
        "user_rates": [],
        "hlinks": data.files,
        "rating": Number(0),
    })

    if (action) {
        console.log("Created New Challenge")
        return { acknowledge: true, "message": "Challenge Created!" }
    } else {
        console.log("Error Creating Challenge")
        return { acknowledge: false, "message": "Error Creating Challenge!" }
    }
}

router.post('/delete_challenge', async (req, res) => {
    const data = req.body;

    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        if (!req.isAuthenticated())
            return res.json(null);

        console.log("Admin Attmepting to Delete Challenge: " + data.challenge_id)
        const action = await DeleteChallenge(data, req.user.username);

        // { acknowledge, message }
        return res.json(action);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});

async function DeleteChallenge(data, adminUsername) {
    /*
    {
        "challenge_id": STRING
    }
    */
    try {
        console.log("Attempting to Delete Challenge Reference from Sections of DB. . .")

        // we need to remove all references to this challenge from various
        // entries: user.completions | team.completions
        await UserCollection.updateMany(
            {},
            {
                $pull: {
                    completions: { id: data.challenge_id }
                }
            }
        );

        await TeamCollection.updateMany(
            {},
            {
                $pull: {
                    completions: { id: data.challenge_id }
                }
            }
        );

        console.log("Attempting to Delete Challenge Entry from DB. . .")
        const action = await ChallengeCollection.deleteOne({ _id: SanitizeAlphaNumeric(data.challenge_id) })

        if (action.acknowledged && action.deletedCount !== 0) {
            console.log("Deleted Challenge")
            return { acknowledge: true, "message": "Challenge Deleted Successfully!" }
        } else {
            console.log("Error Deleting Challenge")
            return { acknowledge: false, "message": "Error Deleting Challenge!" }
        }
    } catch (error) {
        console.log(error);
        return { acknowledge: false, "message": "Error Deleting Challenge!" }
    }
}

router.post('/update_challenge', async (req, res) => {
    const data = req.body;

    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        console.log("Admin Attmepting to Update Challenge: " + data.challenge_id)
        const action = await UpdateChallenge(data);

        // { acknowledge, message }
        return res.json(action);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function UpdateChallenge(data) {
    /*
    {
        "challenge_id": NUMBER,
        "name": STRING,
        "description": STRING,
        "category": STRING,
        "difficulty": STRING,
        "written_by": STRING,
        "flag": STRING,
        "files": ARRAY_OF_STRINGS,
        "points": NUMBER
    }
    */

    const action = await ChallengeCollection.updateOne(
        { _id: SanitizeAlphaNumeric(data.challenge_id) },
        {
            $set: {
                "challenge_id": SanitizeAlphaNumeric(data.challenge_id),
                "name": data.name,
                "description": data.description,
                "category": data.category,
                "difficulty": data.difficulty,
                "written_by": data.written_by || "Unknown Author",
                "flag": data.flag,
                "hlinks": data.files,
                "points": Number(data.points),
            }
        })

    if (action.matchedCount === 1) {
        console.log("Found Challenge and Updated Details")
        return { acknowledge: true, "message": "Challenge Updated!" }
    } else {
        return { acknowledge: false, "message": "Error Updating Challenge!" }
    }
}

router.post('/toggle_status', async (req, res) => {
    const data = req.body;

    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        if (!req.isAuthenticated())
            return res.json(null);

        console.log("Admin Attmepting to Toggle Challenge: " + data.challenge_id)
        const action = await ToggleChallenge(data, req.user.username);

        // { acknowledge, message }
        return res.json(action);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function ToggleChallenge(data, adminUsername) {
    try {
        const challengeEntity = await ChallengeCollection.findOne({
            _id: SanitizeAlphaNumeric(data.challenge_id)
        });

        if (challengeEntity) {
            console.log("Challenge Entity Found!")
            const activeState = challengeEntity.is_active;
            console.log(`|__ active? ${activeState}`);
    
            // invert status
            const action = await ChallengeCollection.updateOne(
            { _id: SanitizeAlphaNumeric(data.challenge_id) },
            {
                $set: {
                    "is_active": !activeState
                }
            })
            console.log(`action results | ${JSON.stringify(action)}`);
    
            if (action.matchedCount === 1) {
                console.log("Challenge Modified");
                if (!activeState === false) {
                    return { acknowledge: true, "message": "Challenge Disabled!" }
                } else {
                    return { acknowledge: true, "message": "Challenge Enabled!" }
                }
            } else {
                console.log("No entities modified!")
                return { acknowledge: false, "message": "Error Toggling Challenge!" }
            }
        } else {
            console.log("Bad initial search!")
            return { acknowledge: false, "message": "Error Toggling Challenge!" }
        }
    } catch (error) {
        console.log(error);
        return { acknowledge: false, "message": "Error Toggling Challenge!" }
    }
}

router.get('/get_solvers', async (req, res) => {
    try {
        if (!IsAdmin(req)) {
            console.log("Not an Admin!");
            return res.status(401).json(null);
        }

        let challenges = await ChallengeCollection.find({}, {
            user_rates: 0, flag: 0
        });
        const userData = await UserCollection.find({}, { username: 1, completions: 1, _id: 0 });
    
        const challengeSolvers = new Map();
        const result = new Map();
    
        for (const user of userData) {
            if (!user.completions) continue;
    
            for (const completion of user.completions) {
                const id = completion.id?.toString();
                if (!id) continue;
    
                if (!challengeSolvers.has(id)) {
                    challengeSolvers.set(id, []);
                }
    
                challengeSolvers.get(id).push(user.username);
            }
        }
    
        for (const challenge of challenges) {
            const challenge_id = challenge._id?.toString();
            const solvers = challengeSolvers.get(challenge_id) || [];
            result.set(challenge.name, solvers);
        }
    
        // result => ("challenge_name" : [username array])
        return res.json({ acknowledge: true, "message": "Success!", solvers: result });
    } catch (error) {
        console.log(error);
        return res.json({ acknowledge: false, "message": "Error getting solvers!" });
    }
})

//###############################################
//              FILE UPLOADING
//###############################################

// expands end-point root '/admin/ctf'

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.CHALLENGE_UPLOAD_DIR;

async function GetUploads() {
    try {
      const files = await fs.readdir(uploadsDir);
      return files; // returns an array of file names
    } catch (err) {
      console.error('Error reading uploads directory:', err);
      return [];
    }
}

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        console.log("Validating Uploaded File")

        // Check Content-Type of the entire request
        const contentType = req.headers['content-type'];
        console.log("Request Content-Type:", contentType);

        // Multer puts file info on req.file
        const file = req.file;
        if (!file) return res.json({ "acknowledge":false, "message": 'No file uploaded' });

        console.log("Uploaded file MIME type:", file.mimetype);
        console.log("Original filename:", file.originalname);

        // different browsers may change the mimetype
        const allowedMimeTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
        if (!allowedMimeTypes.includes(file.mimetype) || !file.originalname.endsWith('.zip')) {
            fs.unlink(file.path, () => {}); // Cleanup
            return res.json({ acknowledge: false, message: 'Only .zip files are allowed' });
        }

        console.log("Admin uploading challenge ZIP file")
        return res.json({ "acknowledge":true, "message": 'File Uploaded Successfully!' });
    } catch (err) {
        console.error(err);
        return res.json(null);
    }
});

router.get('/get_uploads', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        console.log("Fetching listed Uploads")
        const files = await GetUploads();
    
        console.log(files)
        return res.json(files);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});

router.post('/delete_file', async (req, res) => {
    const data = req.body;
    
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        const filename = SanitizeFileName(data.filename)
        console.log("Admin Attmepting to Delete File: " + filename)

        const filePath = path.join(uploadsDir, filename);

        try {
            console.log(`Attempting to Delete: ${filePath}`)
            await fs.unlink(filePath);
            return res.json({ "acknowledge":true, "message": 'File Deleted Successfully!' });
        } catch (err) {
            console.log(`Error Deleting: ${filePath}`)
            return res.json({ "acknowledge":false, "message": 'Error Deleting File!' });
        }
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});

export default router;