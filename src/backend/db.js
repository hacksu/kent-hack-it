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
    completions: Array, // [ "Scrambled", "BitLocker-1", ... ]
    team_id: String, // "None" | '_id' --> "xX_RaTT3rs_Xx"
    created_at: Date
});
// the final argument is the specific collection to link the schema to when performing read/write
const UserCollection = mongoose.model('Users', UserSchema, 'users');

const TeamSchema = new mongoose.Schema({
    name: String,
    team_leader_id: String, // "yoyojesus" <-- '_id'
    members: Array, // Array of _id elements that link to a profile
    completions: Array, // [ "Perplexed", "Guess-My-Cheese", ... ]
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

    console.log(`FindUser: ${findUser.username} | FindEmail: ${findEmail.email}`);
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
        team: "None",
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
                    "team": team_name,
                    "is_leader": true
                }
            } else {
                return {
                    "username": userRecord.username,
                    "team": team_name,
                    "is_leader": false
                }
            }
        } else {
            return {
                "username": userRecord.username,
                "team": "None",
                "is_leader": false
            }
        }
    } else {
        return {
            "username": userRecord.username,
            "team": "None",
            "is_leader": false
        }
    }
}

// Return the json object of the team if one exists
async function GetTeamInfo(teamName) {
    teamName = SanitizeString(teamName);

    if (teamName === null) {
        return null;
    }

    const teamRecord = await TeamCollection.findOne({ name: teamName });
    
    // null | { ... }
    if (teamRecord) {
        const leader_record = await UserCollection.findOne({ _id: teamRecord.team_leader_id });
        const members_list = await FetchMemberNames(teamRecord.members);
        
        return {
            "name": teamRecord.name,
            "team_leader": leader_record.name,
            "members": members_list,
            "completions": teamRecord.completions,
        };
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
        const leader_id = leader_record._id;

        // check if the team_exists
        const team_exists = await TeamCollection.findOne({ _id: leader_record.team_id })
        if (team_exists) {
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
async function AcceptTeamRequest(request_id, checksum) {
    request_id = SanitizeString(request_id);
    checksum = SanitizeString(checksum);

    if (request_id === null) {
        return {
            "success": false
        };
    }

    const requestObject = await TeamRequestCollection.findOne({
        _id: request_id
    });

    // if the request exists
    if (requestObject) {
        // verify the accept is legit through a checksum
        if (requestObject.checksum === checksum) {
            // remove request from the db
            const team_id = requestObject.team_id;
            request_deletion = await TeamRequestCollection.deleteOne({ _id: requestObject._id });
            if (request_deletion) {
                // update the request senders profile
                // to show they are a member of the team
                // (sender is a _id)
                const updateUserData = await UserCollection.updateOne(
                    { _id: requestObject.sender_id },
                    { $set: { team_id: team_id } }
                );

                if (updateUserData) {
                    return {
                        "success": true
                    };
                } else {
                    return {
                        "success": false
                    };
                }
            }
        }
        return {
            "success": false
        };
    }
    
    return {
        "success": false
    };
}

export { LoginUser, RegisterUser, GetUserProfile,
    GetTeamInfo, SendTeamRequest, AcceptTeamRequest,
    CreateTeam, UpdateTeam, DoesExist };