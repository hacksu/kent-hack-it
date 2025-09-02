// Used for establishing a connection to a database
// and interacting with the database
import mongoose from 'mongoose';
import * as dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
dotenvExpand(dotenv.config());

/*
LOCAL TESTING:
docker run -d --name khi_db -e MONGO_INITDB_ROOT_USERNAME=mongo -e MONGO_INITDB_ROOT_PASSWORD=mongo -e MONGO_INITDB_DATABASE=khi2025 -v mongodb_data:/data/db -p 27017:27017 mongo:latest
*/

// returns a string concatination of the URL
export function MongoURI() {
    const db_user = process.env.DB_USER;
    const db_pass = process.env.DB_PASS;
    const db_name = process.env.DB_NAME;
    const db_host = process.env.DB_HOST;

    return "mongodb://" + db_user + ":" + db_pass + `@${db_host}:27017/` + db_name + "?authSource=admin";
}

console.log(`[*] Attempting to Connect to: ${MongoURI()}`);
// Connect to MongoDB
mongoose.connect(MongoURI()).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

//==================================================================================================

/*
#######################################################################
    For ARRAYS we should store the '_id' attributes of the objects
    this way when updates occur we do not lose data connections!
#######################################################################
*/

// Define the schma
const UserSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true, unique: true },
    username: String,
    email: String,
    avatarUrl: String,
    appMetadata: {
        role: { type: String, default: "user" },
        preferences: { type: Object, default: {} },
    },
    completions: Array, // [ { "Scrambled": Date.now() } ... ]
    ratings: Array,     // [ "name", "name_1" ... ]
    team_id: { type: String, default: "None" },    // "None" | '_id' --> "xX_RaTT3rs_Xx"
    is_admin: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });
export const UserCollection = mongoose.model("User", UserSchema);

const TeamSchema = new mongoose.Schema({
    name: String,
    team_leader_id: String, // "yoyojesus" <-- '_id'
    members: Array,         // Array of _id elements that link to a profile
    completions: Array,     // [ { "Perplexed": user._id }, ... ]
    created_at: { type: Date, default: Date.now }
});
export const TeamCollection = mongoose.model('Teams', TeamSchema, 'teams');

// Store the requests to join a team somewhere else
// to not cluster the TeamSchema via a requests attribute
const TeamRequestSchema = new mongoose.Schema({
    sender_id: String, // '_id'
    team_id: String,   // '_id'
    checksum: String,  // randomly generated hash
    created_at: { type: Date, default: Date.now }
});
export const TeamRequestCollection = mongoose.model(
    'TeamRequests',
    TeamRequestSchema,
    'team_requests'
);

const ChallengeSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    difficulty: String,
    user_rates: { type: Array, default: [] }, // [ 3, 3, 4, 5, 1, 2, ... ] 1-5 stars
    rating: { type: Number, default: 0 },    // shows the avg of user_rates (maybe only show whole int or one-decimal place)
    points: Number,
    flag: String,      // KHI{...}
});
export const ChallengeCollection = mongoose.model(
    'Challenges',
    ChallengeSchema,
    'challenges'
);

//==================================================================================================

export async function UserIsAdmin(accessToken, guildId, roleId) {
    const res = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    if (!res.ok) {
        console.error("Failed to fetch member info:", res.status);
        return false;
    }

    const member = await res.json();
    return member.roles.includes(roleId);
}