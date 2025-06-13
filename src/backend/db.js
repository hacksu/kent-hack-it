// Used for establishing a connection to a database
// and interacting with the database
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
const adm_jwt_secret = process.env.ADM_JWT_SECRET;

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
    ratings: Array, // [ "name", "name_1" ... ]
    team_id: String, // "None" | '_id' --> "xX_RaTT3rs_Xx"
    created_at: Date
});
// the final argument is the specific collection to link the schema to when performing read/write
const UserCollection = mongoose.model('Users', UserSchema, 'users');

const AdminSchema = new mongoose.Schema({
    username: String,
    password: String, // sha-256 salted hex-string
    isProtected: Boolean,
    created_at: Date
});
const AdminCollection = mongoose.model('Admins', AdminSchema, 'admins');

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
    category: String, 
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
    const allowedPattern = /^[a-zA-Z0-9@._\-!]+$/;

    // Invalid string input string detected
    if (!allowedPattern.test(str)) {
        return null;
    }

    // this string is clean we can use it
    return str;
}

function ValidRatingNumber(num) {
    const numeric = Number(num);
    return !(
        isNaN(numeric) ||
        numeric <= 0 ||
        (numeric * 10) % 5 !== 0
    );
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

async function GenerateAdminJWT(username) {
    username = SanitizeString(username);

    if (username === null) {
        console.log("Bad Admin Username");
        return null;
    }

    // Payload can include user info
    const payload = {
        "username": username,
        "is_admin": true
    };
    
    // Options like token expiry
    const options = {
        expiresIn: '24h', // token expires in 24 hours
    };
    
    // Create the token
    const token = jwt.sign(payload, adm_jwt_secret, options);
    console.log(`Here's Your Admin JWT! ${token}`);
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
    let teamProfile = await TeamCollection.findOne({ _id: team_id });
    if (teamProfile) {
        const mergedCompletions = [];  // Initialize as an array of objects
        const teamMembers = teamProfile.members;
        teamMembers.push(teamProfile.team_leader_id);

        console.log(`All Members of team ${teamProfile.name}`, teamMembers);

        console.log("\nBEFORE: ", teamProfile.completions);

        // remove entries within TeamCollections.completions that contain
        // memberIds that are not contained in the teamMembers Array
        await TeamCollection.updateOne(
            { _id: team_id },
            {
                $pull: {
                    completions: {
                        memberId: { $nin: teamMembers }
                    }
                }
            }
        );

        // reference update after a modification
        teamProfile = await TeamCollection.findOne({ _id: team_id });
        console.log("AFTER: ", teamProfile.completions);

        for (const memberId of teamMembers) {
            const memberProfile = await UserCollection.findOne({ _id: memberId });

            if (!memberProfile || !memberProfile.completions) {
                continue;
            }

            for (const data of Object.entries(memberProfile.completions)) {
                // console.log(`Completions of ${memberProfile.username}`, memberProfile.completions)
                const [index, { id, time }] = data; // break down the entry
                // console.log("Completion Data -> ", { name, time });

                const challengeProfile = await ChallengeCollection.findOne({ _id: id })
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
            { _id: team_id },
            { $set: { completions: mergedCompletions } }
        );

        console.log("[+] Team completions updated successfully!");
    } else {
        console.log(`[-] Cannot find Team Record for: ${team_id}`);
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
    const challenges = await ChallengeCollection.find({}, { user_rates: 0, flag: 0 });
    return challenges;
}
export default GetChallenges;

// data = { challenge_name }
async function GetChallengeInfo(data) {
    const challengeName = SanitizeString(data.challenge_name)
    if (challengeName === null) {
        return null
    } else {
        const challengeProfile = await ChallengeCollection.findOne({ name: challengeName.replaceAll('_', ' ') })
        
        return {
            "name": challengeProfile.name,
            "description": challengeProfile.description,
            "category": challengeProfile.category,
            "difficulty": challengeProfile.difficulty,
            "rating": challengeProfile.rating,
        }
    }
}

// if a player is not in a team calculate collected points and display their username
// otherwise calculate points collected by the team and display the team name
async function GetLeaderboardData() {
    // { name: STRING, points: NUMBER }
    // sort by point desending and if points match
    // sort based on time of recent completion (time attribute (time | timestamp) on last completion)
    let leaderboardData = []

    const soloUsers = await UserCollection.find({ team_id: "None" }, { username: 1, completions: 1 })
    const teams = await TeamCollection.find({}, { name: 1, completions: 1 })

    let readableSoloUsers = [];
    let readableTeams = [];

    // for each user we need to calculate accumulated points
    for (let userDoc of soloUsers) {
        const user = userDoc.toObject(); // Make it modifiable
    
        user.points = 0;
        user.name = user.username;
    
        for (const completion of user.completions) {
            const challengeProfile = await ChallengeCollection.findOne({ _id: completion.id });
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
}

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
async function DoesAdminExist(username) {
    username = SanitizeString(username);

    if (username === null) {
        return false;
    }

    const findAdmin = await AdminCollection.findOne({"username":username});

    console.log(`DoesExist --> ${(findAdmin !== null)}`);
    return (findAdmin !== null) ? true : false;
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

async function LoginAdmin(username, password) {
    username = SanitizeString(username);
    password = SanitizeString(password);

    if (username === null || password === null) {
        console.log("Potentially Malformed Data!");
        return "Username of Password Incorrect!";
    }

    // Find the profile data based on username given
    const adminRecord = await AdminCollection.findOne({ username });
    if (!adminRecord) {
        console.log("Admin not found!");
        return "Login Failed!";
    }

    // salted passwords are very lit
    const SALT = process.env.SALT;
    const salted_password = SALT + password;
    const hashed_passwd = Hash_SHA256(salted_password);

    // compare the hashes of the given to whats linked in the db
    const adminAuth = (hashed_passwd === adminRecord.password);

    if (adminAuth) {
        console.log("Good Admin Auth!");
        const jwt_token = await GenerateAdminJWT(adminRecord.username);

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
        console.log("Bad Admin Auth!");

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
            // console.log(`[*] Comparing: ${userRecord._id} === ${teamRecord.team_leader_id}`);
            if (userRecord._id.toString() === teamRecord.team_leader_id.toString()) {
                console.log("We got a leader!");
                return {
                    "username": userRecord.username,
                    "email": userRecord.email,
                    "completions": userRecord.completions,
                    "team": team_name,
                    "user_rates": userRecord.ratings,
                    "is_leader": true
                }
            } else {
                return {
                    "username": userRecord.username,
                    "email": userRecord.email,
                    "completions": userRecord.completions,
                    "team": team_name,
                    "user_rates": userRecord.ratings,
                    "is_leader": false
                }
            }
        } else {
            return {
                "username": userRecord.username,
                "email": userRecord.email,
                "completions": userRecord.completions,
                "team": "None",
                "user_rates": userRecord.ratings,
                "is_leader": false
            }
        }
    } else {
        return {
            "username": userRecord.username,
            "email": userRecord.email,
            "completions": userRecord.completions,
            "team": "None",
            "user_rates": userRecord.ratings,
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
        // check if the sender is already inclueded in the team profile based on team_name
        const userRecord = await UserCollection.findOne({ username: sender });
        if (userRecord) {
            if (userRecord.team_id === teamRecord._id.toString()) {
                return {
                    "message": "Could not send request, try again!"
                };
            }
        } else {
            // user not found
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
            team_id: teamRecord._id
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

        // if there are already 3 members we need to drop this
        // addMember request
        const teamProfile = await TeamCollection.findOne({ _id: joinRequest.team_id })
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
async function RemoveMember(member_username, jwt) {
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
    const team_id = memberProfile.team_id; // reference to the team this user is removed from
    
    // fetch the user profile based off the JWT
    const userProfile = await UserCollection.findOne({ username: jwt.username, email: jwt.email })
    if (!userProfile) {
        console.log("[-] Cannot find User Profile based off token values!")
        return null;
    }

    const teamProfile = await TeamCollection.findOne({  _id: team_id });
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
        await UpdateTeamCompletions(team_id)
        console.log("[+] Member Removed Successfully!");
        return { "message": "Member Removed Successfully!" }
    }
}

// returns null | { message }
async function SetNewLeader(teamProfile) {
    // find the member_id of the user profile
    // who will be the new team leader
    let nextInLine = null;
    let maxCompletions = -1;

    for (const member_id of teamProfile.members) {
        const memberProfile = await UserCollection.findOne({ _id: member_id });
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
    const SALT = process.env.SALT;
    const hashed_password = Hash_SHA256(SALT + data.password);
    const team_name = data.team_data.name;
    
    // find the team object based on team_name
    const teamProfile = await TeamCollection.findOne({ name: team_name })
    if (teamProfile) {
        // pull user profile based off leader_username to compare the _id
        // to the team leader _id in teamProfile
        const userProfile = await UserCollection.findOne({ username: leader_username })
        if (userProfile) {
            if (userProfile._id.toString() === teamProfile.team_leader_id) {
                // this is the true leader
                // validate password entry
                if (userProfile.password === hashed_password) {
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
                    console.log("[-] Request Invalid, username or password incorrect!")
                    return null;
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

        // EX: completions: [ { id: 'e168c4626a', time: 1746503187547 } ]
        const userProfile = await UserCollection.findOne({ username: jwt.username });
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
                            id: challenge_id, time: Date.now()
                        }
                    }
                }
            );

            if (updateUser) {
                const userProfile = await UserCollection.findOne({ username: jwt.username })
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

async function ConvertCompletions(userCompletions, teamCompletions) {
    console.log("[*] Attempting Conversions. . .")
    
    if (userCompletions && userCompletions.length > 0) {
        // create new attribute name based on id attribute
        let readableUserCompletions = userCompletions;
        for (let item of readableUserCompletions) {
            const challengeProfile = await ChallengeCollection.findOne({ _id: item.id })
            if (challengeProfile) {
                item['name'] = challengeProfile.name;
            }
        }
    }

    if (teamCompletions && teamCompletions.length > 0) {
        // Iterate through data and modify memberId using for...of to handle async correctly
        for (let item of teamCompletions) {
            const memberProfile = await UserCollection.findOne({ _id: item.memberId });
            if (memberProfile) {
                const memberUsername = memberProfile.username;
                // Replace memberId with memberName
                item.memberName = memberUsername;  // Add memberName attribute
                delete item.memberId; // Delete memberId attribute
            }

            // create new attribute name based on id attribute
            const challengeProfile = await ChallengeCollection.findOne({ _id: item.id })
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

async function UserRatingChallenge(ratingData, jwt) {
    const userProfile = await UserCollection.findOne({ username: jwt.username, email: jwt.email })
    if (!userProfile || !ratingData) {
        return null;
    }

    // check if the userProfile completed the challenge theyre rating
    let completedChallenge = false;

    // check that numberRating is a valid number
    ratingData.challenge_name = SanitizeString(ratingData.challenge_name);
    if (ratingData.challenge_name === null) {
        console.log("[-] Error rating challenge_name attribute malformed!");
        return null;
    }

    // Check if numberRating is a valid number
    if ( !ValidRatingNumber(ratingData.rating) ) {
        console.log("[-] Error: rating must be a positive number, whole or ending in .5");
        console.log(" |___ User Submitted: " + ratingData.rating);
        return null;
    }
    
    const numberRating = ratingData.rating;
    const challengeName = ratingData.challenge_name.replaceAll('_', ' ');

    console.log("Rating Challenge: " + challengeName);
    console.log("|______" + numberRating);

    // check if this user has already rated the challenge
    // in ratingData
    if (userProfile.ratings.includes(challengeName)) {
        console.log("[*] " + userProfile.username + " has already submitted a rating for: " + challengeName);
        return null;
    }

    // iterate the users completions
    for (const data of Object.entries(userProfile.completions)) {
        const [index, { name, time }] = data; // break down the entry
        const challengeProfile = await ChallengeCollection.findOne({ name: name.replaceAll('_', ' ') })

        if (challengeProfile) {
            // users completions have the challenge name
            // listed as completed
            if (challengeProfile.name === challengeName) {
                completedChallenge = true;
                break;
            }
        }
    }

    // they didnt complete the challenge
    if (!completedChallenge) {
        return null;
    } else {
        // they completed the challenge we can take their number rating
        // and apply it to the challenge entry in the db
        await ChallengeCollection.updateOne(
            { name: challengeName },
            { $push: { user_rates: Number(numberRating) } } // user_rates are used to calulate rating attribute
        )

        // update the challenges rating attribute based on its user_rates
        const updatedChallenge = await ChallengeCollection.findOne({ name: challengeName });
        if (updatedChallenge && updatedChallenge.user_rates.length > 0) {
            const total = updatedChallenge.user_rates.reduce((sum, r) => sum + r, 0);
            const avg = total / updatedChallenge.user_rates.length;

            await ChallengeCollection.updateOne(
                { name: challengeName },
                { $set: { rating: avg } }
            );
        }

        // mark this action in the user profile so
        // they cannot spam ratings for a challenge
        await UserCollection.updateOne(
            { _id: userProfile._id },
            { $addToSet: { ratings: challengeName } }
        )

        return {
            "message": "Rate Uploaded Successfully!"
        }
    }
}

async function GetAllUsers() {
    // only fetch username|email|team_id|_id
    const users = await UserCollection.find({}) .select('username email team_id _id').lean();

    let readableUsers = users;
    for (let user of readableUsers) {
        // resolve team_id to team name for readability
        const team_id = user.team_id;
        if (team_id !== "None") {
            const teamProfile = await TeamCollection.findOne({ _id: team_id })
            if (teamProfile) {
                // console.log(teamProfile.name);
                user.team_id = teamProfile.name;
            }
        }
    }
    console.log(readableUsers);

    return readableUsers;
}
async function GetAllTeams() {
    // only fetch name|members|_id
    const teams = await TeamCollection.find({}) .select('name members team_leader_id _id').lean();

    console.log("Teams: " + JSON.stringify(teams));

    let readableTeams = teams;
    for (let team of readableTeams) {
        // resolve members _id to usernames for readability
        let members = [];
        for (let user_id of team.members) {
            const userProfile = await UserCollection.findOne({ _id: user_id });
            if (userProfile) {
                members.push(userProfile.username);
            } else {
                members.push("Unknown: " + user_id);
            }
        }

        console.log("Team LeaderID: " + team.team_leader_id)
        const leaderProfile = await UserCollection.findOne({ _id: team.team_leader_id });
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

async function RemoveTeam(team_id) {
    if (!team_id) {
        console.log("Issue Deleting Team")
        return { "acknowledge":false, "message":"Error Deleting Team!" }
    }

    // change every member and leader team_id to None before deletion
    const teamProfile = await TeamCollection.findOne({ _id: team_id.toString() })
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
        return { "acknowledge":true, "message":"Team Deleted Successfully!" }
    } else {
        console.log("Issue Deleting Team")
        return { "acknowledge":false, "message":"Error Deleting Team!" }
    }
}

async function RemoveUser(user_id) {
    // if the user is a team leader we need to update the team
    const userProfile = await UserCollection.findOne({ _id: user_id })
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

    const action = await UserCollection.deleteOne({ _id: user_id });
    if (action.deletedCount === 1) {
        console.log("User Deleted!")
        return { "acknowledge":true, "message":"User Deleted Successfully!" }
    } else {
        console.log("Issue Deleting User")
        return { "acknowledge":false, "message":"Error Deleting User!" }
    }
}

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
        { _id: data.challenge_id },
        { $set: {
            "challenge_id": data.challenge_id,
            "name": data.name,
            "description": data.description,
            "category": data.category,
            "difficulty": data.difficulty,
            "flag": data.flag,
            "points": Number(data.points),
        }})
    
    if (action.matchedCount === 1) {
        console.log("Found Challenge and Updated Details")
        return { acknowledge: true, "message": "Challenge Updated!" }
    } else {
        return { acknowledge: false, "message": "Error Updating Challenge!" }
    }
}

async function AdminGetChallenges() {
    const challenges = await ChallengeCollection.find({}, { user_rates: 0 });
    return challenges;
}

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

async function DeleteChallenge(data, adminUsername) {
    /*
    {
        "challenge_id": STRING,
        "password": STRING,
    }
    */
    try {
        // check if password matches admin username
        const adminProfile = await AdminCollection.findOne({ username: adminUsername });
        if (adminProfile) {
            // check calculated password hash
            const SALT = process.env.SALT;
            const salted_password = SALT + data.password;
            const hashed_passwd = Hash_SHA256(salted_password);

            if (adminProfile.password === hashed_passwd) {
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
            } else {
                console.log("Bad Admin Auth")
                console.log(`${adminUsername}:${data.password} | ${hashed_passwd} --> ${adminProfile.password}`)
                return { acknowledge: false, "message": "Error Deleting Challenge!" }
            }
        } else {
            console.log("Bad Admin Auth")
            console.log(`Username: ${adminUsername}`)
            return { acknowledge: false, "message": "Error Deleting Challenge!" }
        }

        console.log("Attempting to Delete Challenge Entry from DB. . .")
        const action = await ChallengeCollection.deleteOne({ _id: data.challenge_id })
        
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

async function RegisterAdmin(username, password) {
    username = SanitizeString(username);
    password = SanitizeString(password);

    if (username === null || password === null) {
        return "Register Failed!";
    }

    // check if admin under username exists
    if (await AdminCollection.findOne({ username: username })) {
        return "Failed to add Admin!";
    }

    console.log(`Attempting to add Admin: ${username}`);

    // salted passwords are very lit
    const SALT = process.env.SALT;
    const salted_password = SALT + password;
    const hashed_passwd = Hash_SHA256(salted_password);

    const addAdmin = await AdminCollection.insertOne({
        username,
        password: hashed_passwd,
        isProtected: false,
        created_at: Date.now()
    });

    if (addAdmin) { console.log("Admin Added Successfully!"); } else { console.log("Failed to add Admin!"); }
    return addAdmin ? "Admin Added Successfully!" : "Failed to add Admin!";
}

async function RemoveAdmin(adminUsername) {
    // check if profile is protected from deletion
    const adminProfile = await AdminCollection.findOne({ username: adminUsername });

    if (adminProfile) {
        if (!adminProfile.isProtected) {
            // profile exists and is not protected
            const action = await AdminCollection.deleteOne({ username: adminUsername });
    
            if (action.deletedCount === 1) {
                console.log("Admin Deleted!")
                return { "acknowledge":true, "message":"Admin Deleted Successfully!" }
            } else {
                console.log("Issue Deleting Admin")
                return { "acknowledge":false, "message":"Error Deleting Admin!" }
            }
        } else {
            console.log("Attempted to delete protected account")
            return { "acknowledge":false, "message":"Cannot delete administrator!" }
        }
    } else {
        // attempt to delete non-existing profile
        console.log("Issue Deleting Admin")
        return { "acknowledge":false, "message":"Error Deleting Admin!" }
    }
}

async function GetAdmins() {
    // check if profile is protected from deletion
    const admins = await AdminCollection.find({}, { username: 1 });
    console.log("ADMIN LIST")
    console.log(admins)
    return admins;
}

// check user:pass to verify admin auth
async function ValidateAdmin(username, password) {
    const adminProfile = await AdminCollection.findOne({ username: username })
    if (adminProfile) {
        // check salted password hash
        const SALT = process.env.SALT;
        const salted_password = SALT + password;
        const hashed_passwd = Hash_SHA256(salted_password);
        console.log(`${username}:${password} | ${hashed_passwd} --> ${adminProfile.password}`)
        return (adminProfile.password === hashed_passwd);
    } else {
        return false;
    }
}

export { LoginUser, LoginAdmin, RegisterUser, GetUserProfile, UpdateUserProfile,
    GetTeamInfo, SendTeamRequest, CreateTeam, UpdateTeam,
    DoesExist, DoesAdminExist, AddMember, RemoveMember, ValidateFlag,
    ConvertCompletions, ReplaceLeader, UserRatingChallenge,
    GetChallengeInfo, GetAllUsers, GetAllTeams, RemoveTeam,
    RemoveUser, UpdateChallenge, AdminGetChallenges,
    CreateChallenge, DeleteChallenge, RegisterAdmin, RemoveAdmin,
    GetAdmins, ValidateAdmin, GetLeaderboardData };