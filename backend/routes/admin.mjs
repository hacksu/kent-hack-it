import { UserCollection, TeamCollection, TeamRequestCollection } from "../db.mjs";
import { IsSiteActive, UpdateSiteInfo, SanitizeAlphaNumeric, IsAdmin, SanitizeString } from "../utils.mjs";
import { SetNewLeader } from "./team.mjs";

import { Router } from "express";
const router = Router();

// expands end-point root '/admin'
router.get("/authenticated", (req, res) => {
    if (!req.isAuthenticated()) {
        console.log("Unauthorized!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Authorized!");
    res.json({ message: "Authorized" });
});

router.get('/get_site_info', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    // use the real value to reflect it across the button on
    // admin panel
    const siteOnline = await IsSiteActive(req, true);
    console.log(`router get_site_info -> ${siteOnline}`)

    return res.json({ activated : siteOnline });
});

router.post('/update_site_info', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const data = req.body;
    if (data && data.activated !== null) {
        const updatedInfo = await UpdateSiteInfo(req, data.activated)
        
        console.log(`[*] Updated Info -> ${JSON.stringify(updatedInfo)}`)
        
        return res.json({
            acknowledge : updatedInfo
        })
    } else {
        return res.json(null)
    }
});

router.get('/get_users', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await GetAllUsers();
    return res.json(users);
});
async function GetAllUsers() {
    // only fetch username|email|team_id|avatarUrl: 1|_id
    const users = await UserCollection.find({}).select('username email team_id avatarUrl _id').lean();

    let readableUsers = users;
    for (let user of readableUsers) {
        // resolve team_id to team name for readability
        const team_id = user.team_id;
        if (team_id !== "None") {
            const teamProfile = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(team_id) })
            if (teamProfile) {
                // console.log(teamProfile.name);
                user.team_id = teamProfile.name;
            }
        }
    }
    // console.log(readableUsers);

    return readableUsers;
}

router.post('/remove_user', async (req, res) => {
    const data = req.body;

    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        // prevent self-deletion
        if (req.user._id.toString() === data.user_id) {
            console.log("[*] Self-Delete Attempted!")
            return res.json(null);
        }

        console.log("Admin Attmepting to Remove User: " + data.user_id)
        const action = await RemoveUser(data.user_id);
        return res.json(action);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function RemoveUser(user_id) {
    // if the user is a team leader we need to update the team
    const userProfile = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(user_id) })

    if (userProfile && userProfile.is_admin) {
        console.log("Deletion attempted against an Admin!")
        return { "acknowledge": false, "message": "Error Deleting User!" }
    }

    if (userProfile && userProfile.team_id !== "None") {
        const teamProfile = await TeamCollection.findOne({ _id: userProfile.team_id })

        // update team record
        if (teamProfile && teamProfile.team_leader_id === user_id) {
            // appoint new team leader
            if (teamProfile.members.length > 0) {
                await SetNewLeader(teamProfile);
            } else {
                // remove team
                await RemoveTeam(userProfile.team_id);
            }
        }
    }

    const action = await UserCollection.deleteOne({ _id: SanitizeAlphaNumeric(user_id) });
    if (action.deletedCount === 1) {
        console.log("User Deleted!")
        return { "acknowledge": true, "message": "User Deleted Successfully!" }
    } else {
        console.log("Issue Deleting User")
        return { "acknowledge": false, "message": "Error Deleting User!" }
    }
}

router.get('/get_teams', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("---- Admin Requesting Teams!");

    console.log("---- Admin Pulling all Teams!")
    const teams = await GetAllTeams();
    return res.json(teams);
});
async function GetAllTeams() {
    // only fetch name|members|_id
    const teams = await TeamCollection.find({}).select('name members team_leader_id _id').lean();

    console.log("Teams: " + JSON.stringify(teams));

    let readableTeams = teams;
    for (let team of readableTeams) {
        // resolve members _id to usernames for readability
        let members = [];
        for (let user_id of team.members) {
            const userProfile = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(user_id) });
            if (userProfile) {
                members.push(userProfile.username);
            } else {
                members.push("Unknown: " + user_id);
            }
        }

        console.log("Team LeaderID: " + team.team_leader_id)
        const leaderProfile = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(team.team_leader_id) });
        if (leaderProfile) {
            members.push(leaderProfile.username);
        } else {
            members.push("Unknown: " + team.team_leader_id);
        }

        team.members = members;
    }

    console.log("Readable Teams: " + JSON.stringify(readableTeams));

    return readableTeams;
}

router.post('/remove_team', async (req, res) => {
    const data = req.body;

    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json(null);
    }

    try {
        console.log("Admin Attmepting to Remove Team: " + data.team_id)
        const action = await RemoveTeam(data.team_id);
        return res.json(action);
    } catch (err) {
        console.error(err);
        return res.json(null);
    }
});
async function RemoveTeam(team_id) {
    if (!team_id) {
        console.log("Issue Deleting Team")
        return { "acknowledge": false, "message": "Error Deleting Team!" }
    }

    // change every member and leader team_id to None before deletion
    const teamProfile = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(team_id.toString()) })
    if (teamProfile) {
        // remove all join requests to this team
        await TeamRequestCollection.deleteMany({ team_id: teamProfile._id.toString() });

        // update leader
        const updateLeaderProfile = await UserCollection.updateOne(
            { _id: teamProfile.team_leader_id },
            { $set: { team_id: "None" } })

        if (updateLeaderProfile.matchedCount === 1) {
            console.log("Found Leader Profile and Updated Attribute")
        }

        // update members
        for (let member_id in teamProfile.members) {
            const updateMemberProfile = await UserCollection.updateOne(
                { _id: member_id },
                { $set: { team_id: "None" } })

            if (updateMemberProfile.matchedCount === 1) {
                console.log("Found Profile and Updated Attribute")
            }
        }
    }

    // remove the team entry
    const action = await TeamCollection.deleteOne({ _id: team_id.toString() });
    if (action.deletedCount === 1) {
        console.log("Team Deleted!")
        return { "acknowledge": true, "message": "Team Deleted Successfully!" }
    } else {
        console.log("Issue Deleting Team")
        return { "acknowledge": false, "message": "Error Deleting Team!" }
    }
}

router.get('/fetch_admins', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const admins = await GetAdmins();
    res.send(admins);
});
async function GetAdmins() {
    // check if profile is protected from deletion
    const admins = await UserCollection.find({ is_admin: true },
        { username: 1, avatarUrl: 1 });
    // console.log("ADMIN LIST")
    // console.log(admins)
    return admins;
}

router.post('/remove_admin', async (req, res) => {
    if (!IsAdmin(req)) {
        console.log("Not an Admin!");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const data = req.body;

    if (data && data.username) {
        // prevent self-deletion
        if (req.user.username === data.username) {
            console.log("[*] Admin Self-Delete Attempted!")
            return res.json(null);
        }


        try {
            console.log("Admin Attmepting to Remove Admin: " + data.username)
            const action = await RemoveAdmin(data.username);
            return res.json(action);
        } catch (err) {
            console.error(err)
            return res.json(null);
        }
    }
});
async function RemoveAdmin(adminUsername) {
    adminUsername = SanitizeString(adminUsername);
    // check if profile is protected from deletion
    const adminProfile = await UserCollection.findOne({ username: adminUsername, is_admin: true });

    if (adminProfile) {
        // profile exists and is not protected
        const action = await UserCollection.deleteOne({ username: adminUsername });

        if (action.deletedCount === 1) {
            console.log("Admin Deleted!")
            return { "acknowledge": true, "message": "Admin Deleted Successfully!" }
        } else {
            console.log("Issue Deleting Admin")
            return { "acknowledge": false, "message": "Error Deleting Admin!" }
        }
    } else {
        // attempt to delete non-existing profile
        console.log("Issue Deleting Admin")
        return { "acknowledge": false, "message": "Error Deleting Admin!" }
    }
}

export default router;