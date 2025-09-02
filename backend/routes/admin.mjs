import { UserCollection, TeamCollection } from "../db.mjs";
import { SanitizeAlphaNumeric } from "../utils.mjs";

import { Router } from "express";
const router = Router();

function IsAdmin(req) {
  if (!req.user) return false;
  console.log(JSON.stringify(req.user));
  return req.user.is_admin === true
}

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
  res.json({ message: "Authorized", user: req.user });
});

router.get('/get_users', async (req, res) => {
    if (!IsAdmin(req)) {
      console.log("Not an Admin!");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("---- Admin Requesting Users!");

    console.log("---- Admin Pulling all Users!")
    const users = await GetAllUsers();
    return res.json(users);
});
async function GetAllUsers() {
    // only fetch username|email|team_id|_id
    const users = await UserCollection.find({}) .select('username email team_id _id').lean();

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
    console.log(readableUsers);

    return readableUsers;
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
    const teams = await TeamCollection.find({}) .select('name members team_leader_id _id').lean();

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

export default router;