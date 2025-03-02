// Used for establishing a connection to a database
// and interacting with the database
import fs from "fs";
import path from "path";
import yaml from "yaml";
import mongoose from 'mongoose';
import { json } from "stream/consumers";

const secrets = yaml.parse(
  fs.readFileSync(path.resolve("../../secrets.yaml"), {
    encoding: "utf-8",
  })
);

// returns a string concatination of the URL
function MongoURI() {
    const db_user = secrets.db_user;
    const db_pass = secrets.db_pass;
    const db_table = secrets.database;

    return "mongodb://" + db_user + ":" + db_pass + "@localhost:27017/" + db_table;
}

// Connect to MongoDB
mongoose.connect(MongoURI()).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Define the schma
const UserSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    username: String,
    password: String,
    email: String,
    teamId: String,
    joinedAt: Date
});
// the final argument is the specific collection to link the schema to when performing read/write
const UserCollection = mongoose.model('Users', UserSchema, 'users');

// query the user collection and display the JSON result
async function GetUsers() {
    const userData = await UserCollection.find();
    return userData;
}
export default GetUsers;

async function DoesExist(username, email) {
    const findUser = await UserCollection.findOne({"username":username});
    const findEmail = await UserCollection.findOne({"email":email});
    console.log(`FindUser: ${findUser} | FindEmail: ${findEmail}`);
    return findUser !== null || findEmail !== null ? true : false;
}

async function RegisterUser(username, password, email, teamName) {
    // check input to attempt protecting from NoSQL Injection (most likely a more secure way)
    if (typeof username !== "string" || typeof password !== "string" || typeof email !== "string" || typeof teamName !== "string") {
        return "Failed to add User!";
    }

    console.log(`DoesExist -> ${await DoesExist(username, email)}`);

    if (await DoesExist(username, email)) {
        return "Failed to add User!";
    }

    console.log(`Attempting to add: ${username}`);

    // declare the values we want to insert in the mongodb
    const userId = crypto.randomUUID();
    const teamId = teamName;
    const joinedAt = Date.now();

    const addUser = await UserCollection.insertOne({
        _id: userId,
        userId,
        username,
        password,
        email,
        teamId,
        joinedAt
    });

    if (addUser) { console.log("User Added Successfully!"); } else { console.log("Failed to add User!"); }
    return addUser ? "User Added Successfully!" : "Failed to add User!";
}

export { GetUsers, RegisterUser };