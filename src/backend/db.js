// Used for establishing a connection to a database
// and interacting with the database
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto, { Hash } from 'crypto';
import dotenv from "dotenv";
dotenv.config();

// returns a string concatination of the URL
function MongoURI() {
    const db_user = process.env.DB_USER;
    const db_pass = process.env.DB_PASS;
    const db_name = process.env.DB_NAME;

    return "mongodb://" + db_user + ":" + db_pass + "@localhost:27017/" + db_name;
}

// Connect to MongoDB
mongoose.connect(MongoURI()).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const jwt_secret = process.env.JWT_SECRET;

//==================================================================================================

/*
#######################################################################
    For ARRAYS we should store the '_id' attributes of the objects
    this way when updates occur we do not lose data connections!
#######################################################################
*/

// Define the schma
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String, // sha-256 salted hex-string
    completions: Array, // [ { "Scrambled": Date.now() } ... ]
    team_id: String, // "None" | '_id' --> "xX_RaTT3rs_Xx"
    created_at: Date
});
// the final argument is the specific collection to link the schema to when performing read/write
const UserCollection = mongoose.model('Users', UserSchema, 'users');

const TeamSchema = new mongoose.Schema({
    name: String,
    team_leader_id: String, // "yoyojesus" <-- '_id'
    members: Array, // Array of _id elements that link to a profile
    completions: Array, // [ { "Perplexed": user._id }, ... ]
    created_at: Date
});
const TeamCollection = mongoose.model('Teams', TeamSchema, 'teams');

// Store the requests to join a team somewhere else
// to not cluster the TeamSchema via a requests attribute
const TeamRequestSchema = new mongoose.Schema({
    sender_id: String, // '_id'
    team_id: String, // '_id'
    checksum: String, // randomly generated hash
    created_at: Date
});
const TeamRequestCollection = mongoose.model(
    'TeamRequests',
    TeamRequestSchema,
    'team_requests'
);

const ChallengeSchema = new mongoose.Schema({
    name: String,
    description: String,
    catagory: String, 
    difficulty: String,
    user_rates: Array, // [ 3, 3, 4, 5, 1, 2, ... ] 1-5 stars
    rating: Number, // shows the avg of user_rates (maybe only show whole int or one-decimal place)
    points: Number,
    flag: String, // KHI{...}
});
const ChallengeCollection = mongoose.model(
    'Challenges',
    ChallengeSchema,
    'challenges'
);

//==================================================================================================

// Function designed to attempt to sanitize strings
function SanitizeString(input) {
    // Force to string
    const str = String(input);

    // Only allow letters, numbers, underscores, hyphens, periods, @
    // help prevent someone from using: '{"$ne": ""}' which can
    // lead to NoSQL Injection
    const allowedPattern = /^[a-zA-Z0-9@._-]+$/;

    // Invalid string input string detected
    if (!allowedPattern.test(str)) {
        return null;
    }

    // this string is clean we can use it
    return str;
}

function Hash_SHA256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function Generate_Checksum() {
    return Hash_SHA256(crypto.randomBytes(64).toString('hex'));
}

async function GenerateJWT(username, email) {
    username = SanitizeString(username);
    email = SanitizeString(email);
    if (username === null) {
        console.log("Bad Username");
        return null;
    }
    if (email === null) {
        console.log("Bad Email");
        return null;
    }

    // every JWT made will always be to a valid user profile
    // (username & email pair ALWAYS exists!)
    if (!email) {
        console.log("No Email Found!");
        return null;
    }

    // Payload can include user info
    const payload = {
        "username": username,
        "email": email
    };
    
    // Options like token expiry
    const options = {
        expiresIn: '24h', // token expires in 24 hours
    };
    
    // Create the token
    const token = jwt.sign(payload, jwt_secret, options);
    console.log(`Here's Your JWT! ${token}`);
    return token;
}

//==================================================================================================

// reusable function to review the completions among team members
// to update the completions of the team for stat showing
/*
    Occurs during:
        - Team Creation
        - Member Join
        - Member Leave
        - Flag Claiming
*/
async function UpdateTeamCompletions(team_id) {
    if (team_id === "None" || !team_id) return;
    console.log("[*] Attempting to Update Team Completions. . .");
    const teamProfile = await TeamCollection.findOne({ _id: team_id });
    if (teamProfile) {
        const mergedCompletions = {};  // { challName: memberId }

        for (const memberId of teamProfile.members) {
            const memberProfile = await UserCollection.findOne({ _id: memberId });

            if (!memberProfile || !memberProfile.completions) {
                continue;
            }

            for (const [challName, timestamp] of Object.entries(memberProfile.completions)) {
                if (
                    !mergedCompletions[challName] || 
                    timestamp < mergedCompletions[challName].timestamp  // compare oldest
                ) {
                    mergedCompletions[challName] = memberId;
                }
            }
        }

        await TeamCollection.updateOne(
            { _id: team_id },
            { $set: { completions: mergedCompletions } }
        );

        console.log("[+] Team completions updated successfully!");
    } else {
        console.log(`[-] Cannot find Team Record for: ${team_id}`)
    }
}

// Converts the TeamCollection.members _id Array into an Array of Strings
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

async function GetChallenges() {
    const challenges = await ChallengeCollection.find();
    return challenges;
}
export default GetChallenges;

async function DoesExist(username, email) {
    username = SanitizeString(username);
    email = SanitizeString(email);

    if (username === null || email === null) {
        return false;
    }

    const findUser = await UserCollection.findOne({"username":username});
    const findEmail = await UserCollection.findOne({"email":email});

    console.log(`DoesExist --> ${(findUser !== null || findEmail !== null)}`);
    return (findUser !== null || findEmail !== null) ? true : false;
}

async function RegisterUser(username, password, email) {
    username = SanitizeString(username);
    password = SanitizeString(password);
    email = SanitizeString(email);

    if (username === null || password === null || email === null) {
        return "Login Failed!";
    }

    console.log(`DoesExist -> ${await DoesExist(username, email)}`);

    if (await DoesExist(username, email)) {
        return "Failed to add User!";
    }

    console.log(`Attempting to add: ${username}`);

    // salted passwords are very lit
    const SALT = process.env.SALT;
    const salted_password = SALT + password;
    const hashed_passwd = Hash_SHA256(salted_password);

    const addUser = await UserCollection.create({
        username,
        email,
        password: hashed_passwd,
        completions: [],
        team_id: "None",
        created_at: Date.now()
    });

    if (addUser) { console.log("User Added Successfully!"); } else { console.log("Failed to add User!"); }
    return addUser ? "User Added Successfully!" : "Failed to add User!";
}

async function LoginUser(username, password) {
    username = SanitizeString(username);
    password = SanitizeString(password);

    if (username === null || password === null) {
        return "Username of Password Incorrect!";
    }

    // Find the profile data based on username given
    const userRecord = await UserCollection.findOne({ username });
    if (!userRecord) {
        console.log("User not found!");
        return "Login Failed!";
    }

    // salted passwords are very lit
    const SALT = process.env.SALT;
    const salted_password = SALT + password;
    const hashed_passwd = Hash_SHA256(salted_password);

    // compare the hashes of the given to whats linked in the db
    const userAuth = (hashed_passwd === userRecord.password);

    if (userAuth) {
        console.log("Good Auth!");
        const jwt_token = await GenerateJWT(userRecord.username, userRecord.email);

        if (jwt_token) {
            return {
                "message": "Login Successful!",
                "token": jwt_token
            }
        } else {
            return {
                "message": "Login Failed!",
                "token": null
            }
        }
    } else {
        console.log("Bad Auth!");

        return {
            "message": "Login Failed!"
        }
    }
}

// username is provided via JWT attribute when decoded
async function GetUserProfile(username) {
    username = SanitizeString(username);

    if (username === null) {
        return null;
    }

    // Find the profile data based on username given
    const userRecord = await UserCollection.findOne({ username });
    if (!userRecord) {
        console.log("User not found!");
        return null;
    }

    if (userRecord.team_id !== "None") {
        const teamRecord = await TeamCollection.findOne({ _id: userRecord.team_id });
        
        // check if the connection matches
        if (teamRecord) {
            const team_name = teamRecord.name;
            console.log(`[*] Comparing: ${userRecord._id} === ${teamRecord.team_leader_id}`);
            if (userRecord._id.toString() === teamRecord.team_leader_id.toString()) {
                console.log("We got a leader!");
                return {
                    "username": userRecord.username,
                    "email": userRecord.email,
                    "completions": userRecord.completions,
                    "team": team_name,
                    "is_leader": true
                }
            } else {
                return {
                    "username": userRecord.username,
                    "email": userRecord.email,
                    "completions": userRecord.completions,
                    "team": team_name,
                    "is_leader": false
                }
            }
        } else {
            return {
                "username": userRecord.username,
                "email": userRecord.email,
                "completions": userRecord.completions,
                "team": "None",
                "is_leader": false
            }
        }
    } else {
        return {
            "username": userRecord.username,
            "email": userRecord.email,
            "completions": userRecord.completions,
            "team": "None",
            "is_leader": false
        }
    }
}

// data = { username, email, password, newPassword }
// Uses the username in the JWT to find the account it will update
async function UpdateUserProfile(data, jwt) {
    const newUsername = SanitizeString(data.username);
    const newEmail = SanitizeString(data.email);
    const newPassword = SanitizeString(data.newPassword);
    const password = SanitizeString(data.password); // must always be present

    if (password === null) {
        return null;
    }

    const userProfile = await UserCollection.findOne({ username: jwt.username, email: jwt.email })
    if (userProfile) {
        // verify credential given
        const SALT = process.env.SALT;
        const salted_password = SALT + password;
        const password_hash = Hash_SHA256(salted_password);
        if (userProfile.password !== password_hash) {
            return null;
        }

        let profileUpdated = false;
        if (newUsername !== null) {
            // update username
            userProfile.username = newUsername;
            profileUpdated = true;
        }
        if (newEmail !== null) {
            // update email
            userProfile.email = newEmail;
            profileUpdated = true;
        }
        if (newPassword !== null) {
            // update password
            const new_salted_password = SALT + newPassword;
            userProfile.password = Hash_SHA256(new_salted_password);
            profileUpdated = true;
        }

        if (profileUpdated) {
            await userProfile.save();
            const jwt_token = await GenerateJWT(userProfile.username, userProfile.email);
        
            return {
                "message": "Profile Updated Successfully!",
                "token": jwt_token
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
}

// Locates the team object from the username provided in the JWT
// to then return a JSON object reguarding informatio about the
// team the user is currently joined in
async function GetTeamInfo(username) {
    username = SanitizeString(username);

    if (username === null) {
        return null;
    }

    const userProfile = await UserCollection.findOne({username: username});
    if (!userProfile) {
        return null;
    }

    const teamRecord = await TeamCollection.findOne({ _id: userProfile.team_id });
    
    // null | { ... }
    if (teamRecord) {
        const leader_record = await UserCollection.findOne({ _id: teamRecord.team_leader_id });
        const members_list = await FetchMemberNames(teamRecord.members);

        if (leader_record) {
            console.log(`[*] ${leader_record.username} Leads --> ${teamRecord.name}`);
            
            // only leaders will be given data about join requests
            if (userProfile._id.toString() === leader_record._id.toString()) {
                console.log("[*] Giving Join Request Data to the Leader!");

                // see if anyone has sent a request to join the team
                // return an array of: [ { _id, checksum } ] so we
                // can generate accept buttons on the team info page
                const requests = await TeamRequestCollection.find({ team_id: teamRecord._id })
                .select('_id sender_id checksum')
                .lean();

                // need to ensure this Array population finishes before returning
                const join_requests = await Promise.all(
                    requests.map(async (request) => {
                        const sender_profile = await UserCollection.findOne({ _id: request.sender_id });
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

// attempt to create a new team linking
// the creater's profile _id
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

        const leader_id = leader_record._id;

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
                    { _id: leader_id },
                    { $set: { team_id: addNewTeam._id } }
                );

                UpdateTeamCompletions(addNewTeam._id);

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
        const team_exists = await TeamCollection.findOne({ _id: leader_record.team_id })
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
                { _id: leader_record.team_id },
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
// user will send a request using the name of the team
// and implicitly send their username
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
        // team_name points to the ID in the db incase the
        // team leader changes the name (ensures data connection)
        const requestObject = await TeamRequestCollection.findOne({
            team_name: teamRecord._id
        });

        // if this request is new attempt inserting
        if (requestObject === null) {
            // pull the users _id from the sender variable so if they
            // change their username we maintain data-connection
            const userRecord = await UserCollection.findOne({ username: sender });
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
                        return {
                            "message": "Could not send request, try again!"
                        };
                    }
                } else {
                    return {
                        "message": "You have already sent a request to this team."
                    };
                }
            } else {
                return {
                    "message": "Could not send request, try again!"
                };
            }
        } else {
            return {
                "message": "You have already sent a request to this team."
            };
        }
    }

    return {
        "message": "Could not send request, try again!"
    };
}
// request_id and checksum will be attached to the handler
// that triggers this function
async function AddMember(request_id, checksum) {
    request_id = SanitizeString(request_id);
    checksum = SanitizeString(checksum);

    if (request_id === null || checksum === null) {
        console.log("[-] AddMember Parameters Invalid!");
        return null;
    }

    // find the request object that has matching attributes
    // to request_id and checksum
    const joinRequest = await TeamRequestCollection.findOne({ _id: request_id, checksum: checksum })
    if (joinRequest) {
        console.log("[+] Found Request Object!");
        
        // add the sender_id into the team object where _id matches team_id
        const insertNewMember = await TeamCollection.updateOne(
            { _id: joinRequest.team_id },
            { $addToSet: { members: joinRequest.sender_id } }
        );

        if (!insertNewMember) {
            console.log("[-] Error Inserting Member into this Team Object!");
            return null;
        }

        // update sender_id user object to show they are on the team
        const updateMemberProfile = await UserCollection.updateOne(
            { _id: joinRequest.sender_id },
            { $set: { team_id: joinRequest.team_id } }
        );

        if (!updateMemberProfile) {
            console.log("[-] Error Updating Member Object Attributes!");
            return null;
        }

        // remove all join requests that match sender_id
        const result = await TeamRequestCollection.deleteMany({ sender_id: joinRequest.sender_id });
        if (result) {
            console.log(`[*] ${result.deletedCount} requests sent by "${joinRequest.sender_id}" were deleted`);
        }

        if (insertNewMember && updateMemberProfile) {
            UpdateTeamCompletions(joinRequest.team_id)
            return { "message": "Member Added Successfully!" }
        }
    } else {
        console.log("[-] Could not find Join Request Object");
        console.log(`|___ request_id >> ${request_id}`);
        console.log(`|___ checksum  >> ${checksum}\n`);
        return null;
    }
}
async function RemoveMember(member_username) {
    member_username = SanitizeString(member_username);

    if (member_username === null) {
        console.log("[-] RemoveMember Parameters Invalid!");
        return null;
    }

    const memberProfile = await UserCollection.findOne({ username: member_username })
    if (!memberProfile) {
        console.log("[-] Error finding Member Profile!");
        return null;
    }
    const member_id = memberProfile._id.toString();
    console.log(`[*] Attempting to remove: ${member_id}`);

    // update the team profile and remove the member from the
    // members Array
    const removeMember = await TeamCollection.updateOne(
        { _id: memberProfile.team_id },
        { $pull: { members: member_id } }
    );

    if (!removeMember) {
        console.log("[-] Error Removing Member from this Team Object!");
        return null;
    }
    
    // update the user profile of member_username and set their
    // team attribute to None
    const updateMemberProfile = await UserCollection.updateOne(
        { _id: memberProfile._id },
        { $set: { team_id: "None" } }
    );

    if (!updateMemberProfile) {
        console.log("[-] Error Updating Member Object Attributes!");
        return null;
    }

    if (removeMember && updateMemberProfile) {
        UpdateTeamCompletions(removeMember._id)
        console.log("[+] Member Removed Successfully!");
        return { "message": "Member Removed Successfully!" }
    }
}

// we use the JWT so if the flag_value matches for
// the challenge its submitted for we can give the
// challenge points to the owner of the JWT (username|email)
async function ValidateFlag(challenge_id, flag_value, jwt) {
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
    const chall = await ChallengeCollection.findOne({ _id: challenge_id })
    if (chall) {
        // check if the user has already claimed the flag:
        // before doing an insert check if there is an object with
        // a name attribute matching simplifiedChallengeName
        // EX: completions: [ { name: 'BasicWebExploit', time: 1746503187547 } ]
        const userProfile = await UserCollection.findOne({ username: jwt.username });
        const simplifiedChallengeName = chall.name.replaceAll(' ', '');
        if (userProfile) {
            const currentCompletions = userProfile.completions;
            for (const claim of currentCompletions) {
                console.log("Reviewing Claim");
                console.log(`|____ ${claim.name} === ${simplifiedChallengeName}`);
                if (claim.name === simplifiedChallengeName) {
                    console.log("CLAIM ALREADY EXISTS!");
                    return {
                        message: "Already Claimed this Flag!"
                    };
                }
            }
        } else {
            return {
                "message": "Error locating User Profile!"
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
                { username: jwt.username },
                {
                    $addToSet: {
                        completions: {
                            name: simplifiedChallengeName, time: Date.now()
                        }
                    }
                }
            );

            if (updateUser) {
                const userProfile = await UserCollection.findOne({ username: jwt.username })
                UpdateTeamCompletions(userProfile.team_id)
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

export { LoginUser, RegisterUser, GetUserProfile, UpdateUserProfile,
    GetTeamInfo, SendTeamRequest, CreateTeam, UpdateTeam,
    DoesExist, AddMember, RemoveMember, ValidateFlag };