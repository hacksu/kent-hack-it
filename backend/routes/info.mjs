import { UserCollection, TeamCollection, ChallengeCollection } from '../db.mjs';
import { SanitizeAlphaNumeric } from '../utils.mjs';

import { Router } from "express";
const router = Router();

// expands end-point root '/info'
router.post('/get-completions', async (req, res) => {
    if (!req.isAuthenticated()) return res.json(null);
    
    const data = req.body;

    try {
        console.log("[*] Attempting to create readable completions. . .");
        const readableCompletions = await ConvertCompletions(
            data.userCompletions, data.teamCompletions
        );
        // null | { ... }
        // console.log("[*] CONVERSION-RESULTS: ", readableCompletions);
        return res.json(readableCompletions);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function ConvertCompletions(userCompletions, teamCompletions) {
    console.log("[*] Attempting Conversions. . .")

    if (userCompletions && userCompletions.length > 0) {
        // create new attribute name based on id attribute
        let readableUserCompletions = userCompletions;
        for (let item of readableUserCompletions) {
            // sanitize the item (alphanum)
            const challengeProfile = await ChallengeCollection.findOne({ _id: SanitizeAlphaNumeric(item.id) })
            if (challengeProfile) {
                item['name'] = challengeProfile.name;
            }
        }
    }

    if (teamCompletions && teamCompletions.length > 0) {
        // Iterate through data and modify memberId using for...of to handle async correctly
        for (let item of teamCompletions) {
            // sanitize the item (alphanum)
            const memberProfile = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(item.memberId) });
            if (memberProfile) {
                const memberUsername = memberProfile.username;
                // Replace memberId with memberName
                item.memberName = memberUsername;  // Add memberName attribute
                delete item.memberId; // Delete memberId attribute
            }

            // create new attribute name based on id attribute
            const challengeProfile = await ChallengeCollection.findOne({ _id: SanitizeAlphaNumeric(item.id) })
            if (challengeProfile) {
                item['name'] = challengeProfile.name;
            }
        }

        console.log("|____ User Completions: ", userCompletions);
        console.log("|____ Team Completions: ", teamCompletions);

        return {
            "userCompletions": userCompletions,
            "teamCompletions": teamCompletions,
        }
    } else {
        console.log("|____ User Completions: ", userCompletions);
        console.log("|____ Team Completions: ", teamCompletions);

        return {
            "userCompletions": userCompletions,
            "teamCompletions": [],
        }
    }
}

router.get('/leaderboard', async (req, res) => {
    const data = await GetLeaderboardData();
    console.log(data);
    return res.json(data)
});
async function GetLeaderboardData() {
    // { name: STRING, points: NUMBER }
    // sort by point desending and if points match
    // sort based on time of recent completion (time attribute (time | timestamp) on last completion)

    try {
        // admins are not recorded on leaderboard
        const soloUsers = await UserCollection.find({ is_admin: false, team_id: "None" }, { username: 1, completions: 1 });

        // extract all string ids of admin users
        const admins = await UserCollection.find({ is_admin: true }, { _id: 1 });
        const adminIds = admins.map(a => a._id.toString());

        console.log(`Admin IDs : ${adminIds}`);

        // get teams that do not consist of an admin
        const teams = await TeamCollection.find(
            { members: { $nin: adminIds }, team_leader_id: { $nin: adminIds } },
            { name: 1, completions: 1 }
        );

        let readableSoloUsers = [];
        let readableTeams = [];

        // for each user we need to calculate accumulated points
        for (let userDoc of soloUsers) {
            const user = userDoc.toObject(); // Make it modifiable

            user.points = 0;
            user.name = user.username;

            for (const completion of user.completions) {
                const challengeProfile = await ChallengeCollection.findOne({ _id: SanitizeAlphaNumeric(completion.id) });
                if (challengeProfile) {
                    user.points += challengeProfile.points;
                }
            }

            user.recent = user.completions.at(-1)?.time ?? 0;
            delete user.completions;
            delete user.username;
            delete user._id;

            readableSoloUsers.push(user); // Save modified copy
        }

        // for each tean we need to calculate accumulated points
        for (let teamDoc of teams) {
            const team = teamDoc.toObject(); // Convert Mongoose document to plain object

            team.points = 0;

            for (const completion of team.completions) {
                team.points += completion.points;
            }

            team.recent = team.completions.at(-1)?.timestamp ?? 0;
            delete team.completions;
            delete team._id;

            readableTeams.push(team); // Store modified team object
        }

        // merge both lists (readableSoloUsers & readableTeams) in sorted fashion
        const merged = [...readableSoloUsers, ...readableTeams];
        merged.sort((a, b) => {
            if (b.points !== a.points) {
                // Sort by points descending
                return b.points - a.points;
            } else {
                // If points are equal, sort by recent (epoch) ascending
                return a.recent - b.recent;
            }
        });

        return merged;
    } catch (err) {
        console.error(`(GetLeaderboardData) Error: ${err}`);
        return [];
    }
}

export default router;