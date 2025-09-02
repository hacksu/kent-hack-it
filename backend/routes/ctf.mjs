import { UserCollection, ChallengeCollection } from '../db.mjs';
import { SanitizeAlphaNumeric, SanitizeString, Hash_SHA256 } from '../utils.mjs';

import { Router } from "express";
const router = Router();

// expands end-point root '/ctf'
router.get("/challenges", async (req, res) => {
    const challenges = await GetChallenges();
    res.send(challenges);
});
async function GetChallenges() {
    const challenges = await ChallengeCollection.find({}, {
        user_rates: 0, flag: 0
    });
    return challenges;
}

router.post("/challenge", async (req, res) => {
    const [challenge_id] = req.body;
    // fetches details from given challenge id
    const challenge_details = await GetChallengeInfo(challenge_id);
    res.json(challenge_details);
});
async function GetChallengeInfo(challenge_id) {
    challenge_id = SanitizeAlphaNumeric(challenge_id)
    const challengeProfile = await ChallengeCollection.findOne({ _id: challenge_id })
    if (challengeProfile) {
        return {
            "name": challengeProfile.name,
            "description": challengeProfile.description,
            "category": challengeProfile.category,
            "difficulty": challengeProfile.difficulty,
            "rating": challengeProfile.rating,
        }
    } else {
        return null;
    }
}

router.post("/submit-flag", async (req, res) => {
    const [challenge_id, flag_value] = req.body;

    try {
        console.log("[*] Attempting to check flag value. . .");

        if (!req.isAuthenticated()) return res.json(null);

        const user_id = req.user._id;
        if (!user_id) {
            console.log("[-] Bad Flag Submission no user_id!");
            return res.json(null);
        }

        const checkFlag = await ValidateFlag(challenge_id, flag_value, user_id);
        // null | { message }
        return res.json(checkFlag);
    } catch (err) {
        console.error(err)
        console.log("[-] Bad Flag Submission Request!");
        return res.json(null);
    }
});
async function ValidateFlag(challenge_id, flag_value, user_id) {
    // hash the flag so it passes Sanitization as it includes
    // characters such as: "{}"
    challenge_id = SanitizeString(challenge_id);
    // the hashing helps prevent injections due to the "{}" characters
    const flag_hash = SanitizeString(Hash_SHA256(flag_value));

    if (flag_value === null || challenge_id === null) {
        console.log("[-] Bad Parameters in ValidateFlag!");
        return null;
    }

    // find the challenge object based off the id
    const chall = await ChallengeCollection.findOne({
        _id: SanitizeAlphaNumeric(challenge_id)
    })
    if (chall) {
        // check if the user has already claimed the flag:
        // before doing an insert check if there is an object with
        // a name attribute matching simplifiedChallengeName

        // EX: completions: [ { id: 'e168c4626a', time: 1746503187547 } ]
        const userProfile = await UserCollection.findById(user_id).lean();

        if (userProfile) {
            const currentCompletions = userProfile.completions;
            for (const claim of currentCompletions) {
                if (claim.id === challenge_id) {
                    return {
                        message: "Already Claimed this Flag!"
                    };
                }
            }
        } else {
            return {
                message: "Error locating User Profile!"
            }
        }

        // check if the flag_value matches the collection flag value
        if (Hash_SHA256(chall.flag) === flag_hash) {
            console.log("[+] Correct Flag Submitted");
            // move the challenge into the user
            // profile's completions Array
            // the Array will store the name of the challenge
            // this way if it is removed from the DB and potentially
            // reinserted there is no data-loss

            const updateUser = await UserCollection.updateOne(
                { _id: user_id },
                {
                    $addToSet: {
                        completions: {
                            id: challenge_id, time: Date.now()
                        }
                    }
                }
            );

            if (updateUser) {
                const userProfile = await UserCollection.findById(user_id).lean();
                await UpdateTeamCompletions(userProfile.team_id)
                return {
                    "message": "Correct Flag!"
                }
            } else {
                return {
                    "message": "Correct Flag! Error marking Completion!"
                }
            }
        } else {
            console.log("[-] Incorrect Flag Submitted");
            return {
                "message": "Incorrect Flag!"
            }
        }
    } else {
        console.log("[-] Challenge ID could not be located!");
        return null;
    }
}

export default router;