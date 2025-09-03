import { UserCollection, TeamCollection, ChallengeCollection } from "../db.mjs";
import { SanitizeAlphaNumeric, IsAdmin } from "../utils.mjs";

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
        "flag": STRING,
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
        "flag": data.flag,
        "points": Number(data.points),
        "user_rates": [],
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
        "flag": STRING,
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
                "flag": data.flag,
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

export default router;