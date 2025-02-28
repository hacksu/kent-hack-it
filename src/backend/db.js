// Used for establishing a connection to a database
// and interacting with the database
import fs from "fs";
import path from "path";
import yaml from "yaml";
import mongoose from 'mongoose';

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
mongoose.connect(MongoURI(), {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Define the schma
const UserSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    username: String,
    email: String,
    teamId: String,
    joinedAt: Date
});
// the final argument is the specific collection to link the schema to when performing read/write
const UserCollection = mongoose.model('User', UserSchema, 'user');

// query the user collection and display the JSON result
async function GetUsers() {
    const userData = await UserCollection.find();
    return userData;
}
export default GetUsers;