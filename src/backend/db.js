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
    team: String, // "None" | "xX_RaTT3rs_Xx" <-- '_id'
    created_at: Date
});
// the final argument is the specific collection to link the schema to when performing read/write
const UserCollection = mongoose.model('Users', UserSchema, 'users');

const TeamSchema = new mongoose.Schema({
    name: String,
    team_leader: String, // "yoyojesus" <-- '_id'
    members: Array, // [ "yoyojesus", "ender", ... ]
    completions: Array, // [ "Perplexed", "Guess-My-Cheese", ... ]
    created_at: Date
});
const TeamCollection = mongoose.model('Teams', TeamSchema, 'teams');

const ChallengeSchema = new mongoose.Schema({
    name: String,
    description: String,
    catagory: String, 
    difficulty: String,
    user_rates: Array, // [ 3, 3, 4, 5, 1, 2, ... ] 1-5 stars
    rating: Number, // shows the avg of user_rates (maybe only show whole int or one-decimal place)
    points: Number,
});
const ChallengeCollection = mongoose.model('Challenges', ChallengeSchema, 'challenges');

//==================================================================================================

// Function designed to attempt to sanitize strings
function SanitizeString(input) {
    // Force to string
    const str = String(input);

    // Only allow letters, numbers, underscores, hyphens
    // help prevent someone from using: '{"$ne": ""}' which can
    // lead to NoSQL Injection
    const allowedPattern = /^[a-zA-Z0-9_-]+$/;

    // Invalid string input string detected
    if (!allowedPattern.test(str)) {
        return null;
    }

    // this string is clean we can use it
    return str;
}

async function GenerateJWT(username, email) {
    username = SanitizeString(username);
    email = SanitizeString(email);
    if (username === null || email === null) {
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

    console.log(`FindUser: ${findUser} | FindEmail: ${findEmail}`);
    return findUser !== null || findEmail !== null ? true : false;
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
    const hashed_passwd = crypto.createHash('sha256').update(salted_password).digest('hex');

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
        return "Login Failed!";
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
    const hashed_passwd = crypto.createHash('sha256').update(salted_password).digest('hex');

    // compare the hashes of the given to whats linked in the db
    const userAuth = (hashed_passwd === userRecord.password);

    if (userAuth) {
        console.log("Good Auth!");
        const jwt_token = await GenerateJWT(userRecord.username, userRecord.email);

        return {
            "message": "Login Successful!",
            "token": jwt_token
        }
    } else {
        console.log("Bad Auth!");

        return {
            "message": "Login Failed!"
        }
    }
}

export { LoginUser, RegisterUser };