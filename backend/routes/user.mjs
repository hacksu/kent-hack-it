import { UserCollection, TeamCollection } from '../db.mjs';
import { SanitizeAlphaNumeric, SanitizeString, Hash_SHA256 } from '../utils.mjs';

import { Router } from "express";
const router = Router();

// expands end-point root '/user'
router.get("/info", async (req, res) => {
    try {
        const userData = await GetUserProfile(req.user._id);
        
        if (userData === null) {
            return res.json(null);
        }

        return res.json(userData);
    } catch {
        return res.json({ authenticated: false });
    }
});
async function GetUserProfile(user_id) {
    if (user_id === null) {
        return null;
    }

    // Find the profile data based on username given
    const userRecord = await UserCollection.findById(user_id).lean();
    if (!userRecord) {
        console.log("User not found!");
        return null;
    }

    if (userRecord.team_id !== "None") {
        const teamRecord = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(userRecord.team_id) });
        
        // check if the connection matches
        if (teamRecord) {
            const team_name = teamRecord.name;
            // console.log(`[*] Comparing: ${userRecord._id} === ${teamRecord.team_leader_id}`);
            if (userRecord._id.toString() === teamRecord.team_leader_id.toString()) {
                console.log("We got a leader!");
                return {
                    "username": userRecord.username,
                    "avatarUrl": userRecord.avatarUrl,
                    "completions": userRecord.completions,
                    "team": team_name,
                    "user_rates": userRecord.ratings,
                    "is_leader": true
                }
            } else {
                return {
                    "username": userRecord.username,
                    "avatarUrl": userRecord.avatarUrl,
                    "completions": userRecord.completions,
                    "team": team_name,
                    "user_rates": userRecord.ratings,
                    "is_leader": false
                }
            }
        } else {
            return {
                "username": userRecord.username,
                "avatarUrl": userRecord.avatarUrl,
                "completions": userRecord.completions,
                "team": "None",
                "user_rates": userRecord.ratings,
                "is_leader": false
            }
        }
    } else {
        return {
            "username": userRecord.username,
            "avatarUrl": userRecord.avatarUrl,
            "completions": userRecord.completions,
            "team": "None",
            "user_rates": userRecord.ratings,
            "is_leader": false
        }
    }
}

export default router;