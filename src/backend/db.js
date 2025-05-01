// Used for establishing a connection to a database
// and interacting with the database
import mongoose from 'mongoose';
import dotenv from "dotenv";
import crypto from 'crypto';
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


//==================================================================================================

// Define the schma
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String, // sha-256 salted hex-string
    completions: Array, // [ "Scrambled", "BitLocker-1", ... ]
    team: String, // "None" | "xX_RaTT3rs_Xx"
    created_at: Date
});
// the final argument is the specific collection to link the schema to when performing read/write
const UserCollection = mongoose.model('Users', UserSchema, 'users');

const TeamSchema = new mongoose.Schema({
    name: String,
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

async function GetChallenges() {
    const challenges = await ChallengeCollection.find();
    return challenges;
}
export default GetChallenges;

async function DoesExist(username, email) {
    const findUser = await UserCollection.findOne({"username":username});
    const findEmail = await UserCollection.findOne({"email":email});
    console.log(`FindUser: ${findUser} | FindEmail: ${findEmail}`);
    return findUser !== null || findEmail !== null ? true : false;
}

async function RegisterUser(username, password, email) {
    // check input to attempt protecting from NoSQL Injection (most likely a more secure way)
    if (typeof username !== "string" || typeof password !== "string" || typeof email !== "string") {
        return "Failed to add User!";
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
    // check input to attempt protecting from NoSQL Injection (most likely a more secure way)
    if (typeof username !== "string" || typeof password !== "string") {
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

    if (userAuth) { console.log("Good Auth!"); } else { console.log("Bad Auth!"); }
    return userAuth ? "Login Successful!" : "Login Failed!";
}

export { LoginUser, RegisterUser };