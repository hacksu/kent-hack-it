import { UserCollection, ChallengeCollection } from '../db.mjs';
import { SanitizeAlphaNumeric, SanitizeString,
        Hash_SHA256, ValidRatingNumber,
        IsSiteActive } from '../utils.mjs';

import { Router } from "express";
const router = Router();

// expands end-point root '/ctf'
router.get("/challenges", async (req, res) => {
    if (await IsSiteActive(req, false)) {
        const challenges = await GetChallenges();
        res.send(challenges);
    } else {
        return res.json(null);
    }
});
// generate completions number along side challenges to be displayed
async function CalculateCompletions(challenges) {
    try {
        console.log("Calculating Completion Counts. . .")
        const userData = await UserCollection.find({}, { completions: 1, _id: 0 });
        const completionCounts = new Map();
    
        console.log("Iterating over users. . .")
        for (const user of userData) {
            if (!user.completions) continue;
            for (const completion of user.completions) {
                const id = completion.id?.toString();
                if (!id) continue;
                completionCounts.set(id, (completionCounts.get(id) || 0) + 1);
            }
        }
        
        console.log("Inserting new data. . .")
        // manual iteration needed to update the entires of the challenges array
        for (let i = 0; i < challenges.length; ++i) {
            const challenge_id = challenges[i]._id?.toString() || null;
            const completionCount = completionCounts.get(challenge_id) || 0;
            challenges[i].user_completions = challenge_id ? completionCount : 0;
        }
    
        console.log("Finished!")
        return challenges;
    } catch (err) {
        console.log(`(CalculateCompletions) Error: ${err}`)
        return challenges;
    }
}
async function GetChallenges() {
    let challenges = await ChallengeCollection.find({}, {
        user_rates: 0, flag: 0
    });
    return await CalculateCompletions(challenges);
}

router.post("/challenge", async (req, res) => {
    if (await IsSiteActive(req, false)) {
        const data = req.body;
        // fetches details from given challenge id
        const challenge_details = await GetChallengeInfo(data.challenge_id);
        res.json(challenge_details);
    } else {
        res.json(null)
    }
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
            "written_by": challengeProfile.written_by,
            "rating": challengeProfile.rating,
        }
    } else {
        return null;
    }
}

router.post("/submit-flag", async (req, res) => {
    const data = req.body;
    console.log(`flag submission -> ${JSON.stringify(data)}`)

    try {
        console.log("[*] Attempting to check flag value. . .");

        if (!req.isAuthenticated()) return res.json(null);

        if (await IsSiteActive(req, false)) {
            const user_id = req.user._id.toString();
            if (!user_id) {
                console.log("[-] Bad Flag Submission no user_id!");
                return res.json(null);
            }

            const checkFlag = await ValidateFlag(
                data.challenge_id, data.flag, user_id
            );
            // null | { message }
            return res.json(checkFlag);
        } else {
            return res.json(null);
        }
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
async function UpdateTeamCompletions(team_id) {
    if (team_id === "None" || !team_id) return;
    console.log("[*] Attempting to Update Team Completions. . .");
    let teamProfile = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(team_id) });
    if (teamProfile) {
        const mergedCompletions = [];  // Initialize as an array of objects
        const teamMembers = teamProfile.members;
        teamMembers.push(teamProfile.team_leader_id);

        console.log(`All Members of team ${teamProfile.name}`, teamMembers);

        console.log("\nBEFORE: ", teamProfile.completions);

        // remove entries within TeamCollections.completions that contain
        // memberIds that are not contained in the teamMembers Array
        await TeamCollection.updateOne(
            { _id: SanitizeAlphaNumeric(team_id) },
            {
                $pull: {
                    completions: {
                        memberId: { $nin: teamMembers }
                    }
                }
            }
        );

        // reference update after a modification
        teamProfile = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(team_id) });
        console.log("AFTER: ", teamProfile.completions);

        for (const memberId of teamMembers) {
            const memberProfile = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(memberId) });

            if (!memberProfile || !memberProfile.completions) {
                continue;
            }

            for (const data of Object.entries(memberProfile.completions)) {
                // console.log(`Completions of ${memberProfile.username}`, memberProfile.completions)
                const [index, { id, time }] = data; // break down the entry
                // console.log("Completion Data -> ", { name, time });

                const challengeProfile = await ChallengeCollection.findOne({ _id: SanitizeAlphaNumeric(id) })
                if (challengeProfile) {
                    // Find if the challenge already exists in mergedCompletions
                    const existingChallenge = mergedCompletions.find(completion => completion.id === id);

                    // If challenge doesn't exist or the current timestamp is older, add/update the challenge
                    if (!existingChallenge || time < existingChallenge.timestamp) {
                        const newCompletion = { id: id, memberId: memberId, points: challengeProfile.points, timestamp: time };

                        // Remove the existing challenge entry if it exists
                        if (existingChallenge) {
                            const index = mergedCompletions.indexOf(existingChallenge);
                            mergedCompletions.splice(index, 1);
                        }

                        // Add the new challenge with the oldest timestamp
                        mergedCompletions.push(newCompletion);
                    }
                }
            }
        }

        // console.log("Merged Completions:", mergedCompletions);

        // Update the team completions as an array
        await TeamCollection.updateOne(
            { _id: SanitizeAlphaNumeric(team_id) },
            { $set: { completions: mergedCompletions } }
        );

        console.log("[+] Team completions updated successfully!");
    } else {
        console.log(`[-] Cannot find Team Record for: ${team_id}`);
    }
}

router.post('/rate-challenge', async (req, res) => {
    if (!req.isAuthenticated()) return res.json(null);
    
    const data = req.body;

    try {
        if (await IsSiteActive(req, false)) {
            const ratingChallenge = await UserRatingChallenge(data, req.user.username);
            return res.json(ratingChallenge);
        } else {
            return res.json(null)
        }
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function UserRatingChallenge(ratingData, username) {
    username = SanitizeString(username);

    if (!ratingData || username === null) {
        console.log("[-] Error bad data!");
        return null;
    }

    console.log(JSON.stringify(ratingData));

    const userProfile = await UserCollection.findOne({ username: username })
    if (!userProfile) {
        console.log("[-] Profile could not be Found!");
        return null;
    }

    // check if the userProfile completed the challenge theyre rating
    let completedChallenge = false;

    // check that numberRating is a valid number
    const challengeID = SanitizeAlphaNumeric(ratingData.challenge_id);

    // Check if numberRating is a valid number
    if (!ValidRatingNumber(ratingData.rating)) {
        console.log("[-] Error: rating must be a positive number, whole or ending in .5");
        console.log(" |___ User Submitted: " + ratingData.rating);
        return null;
    }

    const numberRating = ratingData.rating;

    console.log("Rating Challenge ID: " + challengeID);
    console.log("|______" + numberRating);

    // check if this user has already rated the challenge
    // in ratingData
    if (userProfile.ratings.includes(challengeID)) {
        console.log("[*] " + userProfile.username + " has already submitted a rating for challenge_id: " + challengeID);
        return null;
    }

    // iterate the users completions
    for (const data of Object.entries(userProfile.completions)) {
        const [index, { id, time }] = data; // break down the user completion entry
        const challengeProfile = await ChallengeCollection.findOne({ _id: SanitizeAlphaNumeric(id) })

        if (challengeProfile) {
            // check if the challengeID given in the request is contained in the users
            // completion data in the database
            if (challengeProfile._id.toString() === challengeID) {
                console.log("[*] User has completed this challenge!")
                console.log(challengeProfile)
                completedChallenge = true;
                break;
            }
        }
    }

    // they didnt complete the challenge
    if (!completedChallenge) {
        console.log("[-] User tried rating a challenge they have not completed!")
        return null;
    } else {
        // they completed the challenge we can take their number rating
        // and apply it to the challenge entry in the db
        await ChallengeCollection.updateOne(
            { _id: challengeID },
            { $push: { user_rates: Number(numberRating) } } // user_rates are used to calulate rating attribute
        );

        // update the challenges rating attribute based on its user_rates
        const updatedChallenge = await ChallengeCollection.findOne({ _id: challengeID });
        if (updatedChallenge && updatedChallenge.user_rates.length > 0) {
            const total = updatedChallenge.user_rates.reduce((sum, r) => sum + r, 0);
            const avg = total / updatedChallenge.user_rates.length;

            await ChallengeCollection.updateOne(
                { _id: challengeID },
                { $set: { rating: avg } }
            );
        }

        // mark this action in the user profile so
        // they cannot spam ratings for a challenge
        await UserCollection.updateOne(
            { _id: userProfile._id },
            { $addToSet: { ratings: challengeID } }
        );

        console.log("[+] Rate Uploaded Successfully!")

        return {
            "message": "Rate Uploaded Successfully!"
        }
    }
}

import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import sanitize from 'sanitize-filename';

router.get('/download/:filename', (req, res, next) => {
    if (!req.isAuthenticated()) return res.send('Unauthorized!');

    if (!IsSiteActive(req, false)) {
        return res.send('Unauthorized!');
    }
    
    try {
        const uploadsDir = process.env.CHALLENGE_UPLOAD_DIR;

        const __filename = fileURLToPath(import.meta.url);

        const allowedExtensions = ['.zip'];

        const rawFilename = req.params.filename;
        const safeFilename = sanitize(rawFilename);
        const ext = path.extname(safeFilename).toLowerCase();

        // attempt to check file types
        if (!allowedExtensions.includes(ext)) {
            console.log("Invalid file type!")
            return res.status(400).send('Invalid file type.');
        }

        // attempt to sanitize file path to prevent LFI
        const filePath = path.join(uploadsDir, safeFilename);

        if (!filePath.startsWith(uploadsDir)) {
            console.log("Invalid file path!")
            return res.status(400).send('Invalid file path.');
        }

        if (!existsSync(filePath)) {
            console.log("File not found!")
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

export default router;