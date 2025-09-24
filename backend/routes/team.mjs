import { UserCollection, TeamCollection, TeamRequestCollection, ChallengeCollection } from '../db.mjs';
import { SanitizeString, SanitizeAlphaNumeric, Generate_Checksum, Hash_SHA256 } from '../utils.mjs';

import { Router } from "express";
const router = Router();

// expands end-point root '/team'
router.get("/info", async (req, res) => {
    try {
        if (!req.isAuthenticated()) return res.json(null);

        console.log(`[*] Getting Info for the Team: ${req.user.username} is in.`);
        const teamData = await GetTeamInfo(req.user._id.toString());
        // null | { ... }
        console.log(`Team Info --> "${JSON.stringify(teamData)}"`);
        return res.json(teamData);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});

router.get("/list", async (req, res) => {
    try {
        if (!req.isAuthenticated()) return res.json([]);

        console.log(`[*] Getting list of all teams for dropdown`);
        const teams = await GetAllTeams();
        return res.json(teams);
    } catch (err) {
        console.error(err);
        return res.json([]);
    }
});

async function GetAllTeams() {
    try {
        // Get all teams with basic info and member count
        const teams = await TeamCollection.find({})
            .select('name members')
            .lean();

        // Format teams for dropdown with member count info
        const formattedTeams = teams
            .filter(team => team.members.length < 3) // Only show teams that aren't full
            .map(team => ({
                name: team.name,
                memberCount: team.members.length,
                spotsLeft: 3 - team.members.length
            }));

        return formattedTeams;
    } catch (err) {
        console.error("Error fetching teams:", err);
        return [];
    }
}
async function GetTeamInfo(user_id) {
    user_id = SanitizeString(user_id);

    if (user_id === null) {
        return null;
    }

    const userProfile = await UserCollection.findById(user_id).lean();
    if (!userProfile) {
        return null;
    }

    const teamRecord = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(userProfile.team_id) });

    // null | { ... }
    if (teamRecord) {
        const leader_record = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(teamRecord.team_leader_id) });
        const members_list = await FetchMemberNames(teamRecord.members);

        if (leader_record) {
            console.log(`[*] ${leader_record.username} Leads --> ${teamRecord.name}`);

            // only leaders will be given data about join requests
            if (userProfile._id.toString() === leader_record._id.toString()) {
                console.log("[*] Giving Join Request Data to the Leader!");

                // see if anyone has sent a request to join the team
                // return an array of: [ { _id, checksum } ] so we
                // can generate accept buttons on the team info page
                const requests = await TeamRequestCollection.find({ team_id: teamRecord._id.toString() })
                    .select('_id sender_id checksum')
                    .lean();

                // need to ensure this Array population finishes before returning
                const join_requests = await Promise.all(
                    requests.map(async (request) => {
                        const sender_profile = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(request.sender_id) });
                        if (sender_profile) {
                            return {
                                "_id": request._id,
                                "sender_name": sender_profile.username,
                                "checksum": request.checksum,
                            };
                        }
                        // If no profile, return null
                        return null;
                    })
                );

                // Filter out the nulls from the Array
                const filtered_join_requests = join_requests.filter(item => item !== null);

                return {
                    "name": teamRecord.name,
                    "team_leader": leader_record.username,
                    "members": members_list,
                    "completions": teamRecord.completions,
                    "join_requests": filtered_join_requests,
                };
            } else {
                console.log("[*] Giving Team Member Basic Team Data!");
                return {
                    "name": teamRecord.name,
                    "team_leader": leader_record.username,
                    "members": members_list,
                    "completions": teamRecord.completions,
                };
            }
        } else {
            console.log("[-] Cannot find profile of Team Leader!")
            return null;
        }
    }
    return null;
}
async function FetchMemberNames(member_list) {
    // Find all users whose _id is in the member_list array
    // via Query
    const profiles = await UserCollection.find(
        { _id: { $in: member_list } },
        { username: 1 }  // only fetch the username field
    ).lean();

    // Map query results to an array of usernames (Strings)
    const member_names = profiles.map(user => user.username);
    return member_names;
}

router.post('/request', async (req, res) => {
    const data = req.body;
    try {
        if (!req.isAuthenticated()) return res.json(null);

        console.log("[*] Attempting to send Team Request")
        const teamRequest = await SendTeamRequest(req.user.username, data.team_name);
        console.log(JSON.stringify(teamRequest))
        return res.json(teamRequest);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function SendTeamRequest(sender, team_name) {
    sender = SanitizeString(sender);
    team_name = SanitizeString(team_name);

    if (team_name === null || sender === null) {
        console.log(`Bad Arguments for Team Request | ${sender}:${team_name}`);
        return {
            "message": "Could not send request, try again!"
        };
    }

    // if the team exists review if the request is already present
    // in the database or if it is a new join-request
    const teamRecord = await TeamCollection.findOne({ name: team_name });
    if (teamRecord) {
        // check if the sender is already inclueded in the team profile based on team_name
        const userRecord = await UserCollection.findOne({ username: sender });
        if (userRecord) {
            if (userRecord.team_id === teamRecord._id.toString()) {
                console.log("Team record id matching error!")
                return {
                    "message": "Could not send request, try again!"
                };
            }
        } else {
            // user not found
            console.log("Cant find user record of sender!")
            return {
                "message": "Could not send request, try again!"
            };
        }

        // if the team already has 3 members we need to drop
        // this join-request due to the team being full
        if (teamRecord.members.length === 3) {
            console.log(`[-] Request Dropped: Team ${team_name} is Full!`);
            return {
                "message": "Request Denied, this team is full!"
            };
        }

        // team_name points to the ID in the db incase the
        // team leader changes the name (ensures data connection)
        const requestObject = await TeamRequestCollection.findOne({
            team_id: teamRecord._id.toString()
        });

        // if this request is new attempt inserting
        if (requestObject === null) {
            // pull the users _id from the sender variable so if they
            // change their username we maintain data-connection
            if (userRecord) {
                /*
                    sender_id: String, // '_id'
                    team_id: String, // '_id'
                    checksum: String, // randomly generated hash
                    created_at: Date
                */
                const requestChecksum = Generate_Checksum();
                const req_data = {
                    "sender_id": userRecord._id,
                    "team_id": teamRecord._id,
                    "checksum": requestChecksum,
                    "created_at": Date.now(),
                }

                // check if a request has already been created
                const requestExists = await TeamRequestCollection.findOne({ sender_id: req_data.sender_id })
                if (!requestExists) {
                    const addJoinRequest = await TeamRequestCollection.insertOne(req_data);
                    if (addJoinRequest) {
                        return {
                            "message": "Request Sent Successfully!"
                        };
                    } else {
                        console.log("Failed to add team join request!")
                        return {
                            "message": "Could not send request, try again!"
                        };
                    }
                } else {
                    console.log("Already sent a request to this team!")
                    return {
                        "message": "You have already sent a request to this team."
                    };
                }
            } else {
                console.log("No user record found!")
                return {
                    "message": "Could not send request, try again!"
                };
            }
        } else {
            console.log("Already send a request to this team!")
            return {
                "message": "You have already sent a request to this team."
            };
        }
    } else {
        console.log("Cannot locate team record!")
        return {
            "message": "Could not send request, try again!"
        };
    }
}

router.post('/create', async (req, res) => {
    const data = req.body;

    try {
        if (!req.isAuthenticated()) return res.json(null);

        const team_name = data.team_name;
        const team_creator = req.user.username;

        console.log(`[*] team create post-data --> ${data}`);
        console.log(`[*] Attempting to create Team: ${team_name}`);

        const teamCreate = await CreateTeam(team_creator, team_name);
        // { message }
        return res.json(teamCreate);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function CreateTeam(team_creator, team_name) {
    team_creator = SanitizeString(team_creator);
    team_name = SanitizeString(team_name);

    // most likely the team_name is invalid
    if (team_creator === null || team_name === null) {
        return {
            "message": "Error creating team."
        }
    }

    // find the team_creators profile to link their _id
    // to the new team entry
    const leader_record = await UserCollection.findOne({ username: team_creator });
    if (leader_record) {
        // if the creator already had a team they cannot create another one
        if (leader_record.team_id !== "None") {
            return {
                "message": "Error creating team."
            }
        }

        const leader_id = leader_record._id.toString();

        // check if team_name is already taken
        const team_exists = await TeamCollection.findOne({ name: team_name })
        if (!team_exists) {
            const addNewTeam = await TeamCollection.insertOne({
                name: team_name,
                team_leader_id: leader_id,
                members: [],
                completions: [],
                created_at: Date.now()
            });

            if (addNewTeam) {
                console.log(`[+] ${team_name} created successfully!`);

                // update leader_record to show theyre on a team
                const leaderUpdate = await UserCollection.updateOne(
                    { _id: SanitizeAlphaNumeric(leader_id) },
                    { $set: { team_id: addNewTeam._id } }
                );

                // pull up the updated leader record and pass their team_id
                const leader_record = await UserCollection.findOne({ username: team_creator });
                await UpdateTeamCompletions(leader_record.team_id);

                return {
                    "message": "Team created Successfully!"
                }
            } else {
                console.log(`[-] An Error occured creating ${team_name}`);
                return {
                    "message": "Error creating team."
                }
            }
        } else {
            console.log(`[*] ${team_name} is already taken!`);
            return {
                "message": "Team name already taken!"
            }
        }
    } else {
        console.log(`[*] Cannot find profile data for: ${team_creator}`);
        return {
            "message": "Error creating team."
        }
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

router.post('/update', async (req, res) => {
    const data = req.body;

    try {
        if (!req.isAuthenticated()) return res.json(null);

        const new_team_name = data.team_name;
        const team_creator = req.user.username;

        console.log("[*] Attempting to update Team");
        const teamUpdate = await UpdateTeam(team_creator, new_team_name);
        // { message }
        console.log(JSON.stringify(teamUpdate));
        return res.json(teamUpdate);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function UpdateTeam(team_creator, new_team_name) {
    team_creator = SanitizeString(team_creator);
    new_team_name = SanitizeString(new_team_name);

    // most likely the new_team_name is invalid
    if (team_creator === null || new_team_name === null) {
        console.log("Invalid Input(s)");
        return null;
    }

    // find the team_creators profile to find the team entry
    // linked to them
    const leader_record = await UserCollection.findOne({ username: team_creator });
    if (leader_record) {
        // check if the team_exists
        const team_exists = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(leader_record.team_id) })
        if (team_exists) {
            // check if the name matches
            if (new_team_name === team_exists.name) {
                return {
                    "message": "New name matches current Team Name!"
                }
            }

            // only team leaders can modify team data
            // ensure this request came from the real leader
            if (team_exists.team_leader_id.toString() !== leader_record._id.toString()) {
                console.log(`[-] Non-Member: "${leader_record._id.toString()}" tried to Update Team Information of --> "${team_exists.name}"`);
                return {
                    "message": "Team Name Updated Successfully!"
                }
            }

            // update the name attribute of the team entry
            const updateTeamName = await TeamCollection.updateOne(
                { _id: SanitizeAlphaNumeric(leader_record.team_id) },
                { $set: { name: new_team_name } }
            );

            if (updateTeamName) {
                console.log("[+] Team Name Updated Successfully!");
                return {
                    "message": "Team Name Updated Successfully!"
                }
            } else {
                console.log("[-] Error Occured when Updating Team Name.");
                return null;
            }
        } else {
            console.log("[-] Cannot find team linked to leader. . .");
            return null;
        }
    } else {
        console.log(`[*] Cannot find profile data for: ${team_creator}`);
        return null;
    }
}

router.post('/add-member', async (req, res) => {
    if (!req.isAuthenticated()) return res.json(null);
    
    const data = req.body;

    try {
        const addTeamMember = await AddMember(data.request_id, data.checksum);
        // null | { message }
        return res.json(addTeamMember);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function AddMember(request_id, checksum) {
    request_id = SanitizeString(request_id);
    checksum = SanitizeString(checksum);

    if (request_id === null || checksum === null) {
        console.log("[-] AddMember Parameters Invalid!");
        return null;
    }

    // find the request object that has matching attributes
    // to request_id and checksum
    const joinRequest = await TeamRequestCollection.findOne({ _id: SanitizeAlphaNumeric(request_id), checksum: checksum })
    if (joinRequest) {
        console.log("[+] Found Request Object!");

        // if there are already 3 members we need to drop this
        // addMember request
        const teamProfile = await TeamCollection.findOne({ _id: SanitizeAlphaNumeric(joinRequest.team_id) })
        if (teamProfile) {
            if (teamProfile.members.length === 3) {
                console.log("[-] This Team has reached Maximum number of Members!");
                return null;
            }
        } else {
            console.log("[-] Error locating Team Profile!");
            return null;
        }

        // add the sender_id into the team object where _id matches team_id
        const insertNewMember = await TeamCollection.updateOne(
            { _id: SanitizeAlphaNumeric(joinRequest.team_id) },
            { $addToSet: { members: joinRequest.sender_id } }
        );

        if (!insertNewMember) {
            console.log("[-] Error Inserting Member into this Team Object!");
            return null;
        }

        // update sender_id user object to show they are on the team
        const updateMemberProfile = await UserCollection.updateOne(
            { _id: SanitizeAlphaNumeric(joinRequest.sender_id) },
            { $set: { team_id: joinRequest.team_id } }
        );

        if (!updateMemberProfile) {
            console.log("[-] Error Updating Member Object Attributes!");
            return null;
        }

        // remove all join requests that match sender_id
        const result = await TeamRequestCollection.deleteMany({ sender_id: SanitizeAlphaNumeric(joinRequest.sender_id) });
        if (result) {
            console.log(`[*] ${result.deletedCount} requests sent by "${joinRequest.sender_id}" were deleted`);
        }

        if (insertNewMember && updateMemberProfile) {
            await UpdateTeamCompletions(joinRequest.team_id)
            return { "message": "Member Added Successfully!" }
        }
    } else {
        console.log("[-] Could not find Join Request Object");
        console.log(`|___ request_id >> ${request_id}`);
        console.log(`|___ checksum  >> ${checksum}\n`);
        return null;
    }
}

router.post('/remove-member', async (req, res) => {
    const data = req.body;

    try {
        if (!req.isAuthenticated()) return res.json(null);

        const removeTeamMember = await RemoveMember(
            data.member_username, req.user.username
        );
        // null | { message }
        return res.json(removeTeamMember);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function RemoveMember(member_username, username) {
    member_username = SanitizeString(member_username);

    if (member_username === null) {
        console.log("[-] RemoveMember Parameters Invalid!");
        return null;
    }

    const memberProfile = await UserCollection.findOne({
        username: member_username
    })
    if (!memberProfile) {
        console.log("[-] Error finding Member Profile!");
        return null;
    }
    const member_id = memberProfile._id.toString();
    const team_id = memberProfile.team_id; // reference to the team this user is removed from

    const userProfile = await UserCollection.findOne({
        username: username
    })
    if (!userProfile) {
        console.log("[-] Cannot find User Profile based off token values!")
        return null;
    }

    const teamProfile = await TeamCollection.findOne({ _id: team_id });
    if (!teamProfile) {
        console.log("[-] Cannot find Team Profile!")
        return null;
    }

    // ensure the person making this request is the team leader
    if (teamProfile.team_leader_id !== userProfile._id.toString()) {
        console.log("[-] Error requester is not Team Leader!")
        return null;
    }

    console.log(`[*] Attempting to remove: ${member_id}`);

    // update the team profile and remove the member from the
    // members Array
    const removeMember = await TeamCollection.updateOne(
        { _id: SanitizeAlphaNumeric(memberProfile.team_id) },
        { $pull: { members: member_id } }
    );

    if (!removeMember) {
        console.log("[-] Error Removing Member from this Team Object!");
        return null;
    }

    // update the user profile of member_username and set their
    // team attribute to None
    const updateMemberProfile = await UserCollection.updateOne(
        { _id: SanitizeAlphaNumeric(memberProfile._id.toString()) },
        { $set: { team_id: "None" } }
    );

    if (!updateMemberProfile) {
        console.log("[-] Error Updating Member Object Attributes!");
        return null;
    }

    if (removeMember && updateMemberProfile) {
        await UpdateTeamCompletions(team_id)
        console.log("[+] Member Removed Successfully!");
        return { "message": "Member Removed Successfully!" }
    }
}

router.post('/replace-leader', async (req, res) => {
    if (!req.isAuthenticated()) return res.json(null);
    
    const data = req.body;

    try {
        const leaderLeaveTeam = await ReplaceLeader(req.user.username, data);
        // null | { message }
        console.log(leaderLeaveTeam);
        return res.json(leaderLeaveTeam);
    } catch (err) {
        console.error(err)
        return res.json(null);
    }
});
async function SetNewLeader(teamProfile) {
    // find the member_id of the user profile
    // who will be the new team leader
    let nextInLine = null;
    let maxCompletions = -1;

    for (const member_id of teamProfile.members) {
        const memberProfile = await UserCollection.findOne({ _id: SanitizeAlphaNumeric(member_id) });
        if (memberProfile && Array.isArray(memberProfile.completions)) {
            const numCompletions = memberProfile.completions.length;

            if (numCompletions > maxCompletions) {
                maxCompletions = numCompletions;
                nextInLine = memberProfile._id.toString();
            }
        }
    }

    console.log(`[*] Next in line: ${nextInLine} with ${maxCompletions} completions`)

    if (!nextInLine || maxCompletions === -1) {
        console.log("[-] Error occured finding Next In Line!")
        return null;
    }

    const appointNewLeader = await TeamCollection.updateOne(
        { _id: teamProfile._id },
        { $set: { team_leader_id: nextInLine } }
    )
    if (!appointNewLeader) {
        console.log(`[-] Error in appointing new leader for team: ${teamProfile.name}`)
        return null;
    }

    const updateTeamMemberList = await TeamCollection.updateOne(
        { _id: teamProfile._id },
        { $pull: { members: nextInLine } }
    )
    if (!updateTeamMemberList) {
        console.log("[-] Error in removing leader_id from members list")
        return null;
    }

    console.log(`[+] New leader has been appointed for team: ${teamProfile.name}`)
    return {
        "message": "New leader has been appointed!"
    }
}
async function ReplaceLeader(leader_username, data) {
    const team_name = SanitizeString(data.team_data.name);

    // find the team object based on team_name
    const teamProfile = await TeamCollection.findOne({ name: team_name })
    if (teamProfile) {
        // pull user profile based off leader_username to compare the _id
        // to the team leader _id in teamProfile
        const userProfile = await UserCollection.findOne({ username: leader_username })
        if (userProfile) {
            if (userProfile._id.toString() === teamProfile.team_leader_id) {
                // this is the true leader
                console.log(`[*] Modifying old team leader profile. . .`)

                // set their team_id attribute to None
                const revokeLeader = await UserCollection.updateOne(
                    { _id: userProfile._id },
                    { $set: { team_id: "None" } }
                );
                if (!revokeLeader) {
                    console.log("Error occured revoking team_id!");
                    return null;
                }

                // no members means no one is next in line to take
                // charge, therefor we delete the team entry
                if (teamProfile.members.length === 0) {
                    console.log(`[*] Team ${teamProfile.name} has no members!`)
                    // delete the team profile from the database
                    const deleteTeam = await TeamCollection.deleteOne({ _id: teamProfile._id })
                    if (!deleteTeam) {
                        return null;
                    } else {
                        console.log(`[*] Team ${teamProfile.name} has been deleted!`);

                        // if the team is deleted remove all join requests towards this team
                        const requestObject = await TeamRequestCollection.deleteMany({
                            team_id: teamProfile._id.toString()
                        });

                        return {
                            "message": "Leader Left Team!"
                        };
                    }
                } else {
                    return await SetNewLeader(teamProfile);
                }
            } else {
                console.log("[-] Request Invalid, requester is not Team Leader!")
                return null;
            }
        }
    } else {
        return null;
    }
}

export default router;