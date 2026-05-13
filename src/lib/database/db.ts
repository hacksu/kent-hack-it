import postgres from "postgres";

import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql, arrayContains, and } from "drizzle-orm";

import * as schema from "./auth-schema";
import { env } from "$env/dynamic/private"; // dynamic allows the .env file to be read at runtime

const PSQL = postgres({
    host: env.PG_HOST,
    port: Number(env.PG_PORT),
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE
});

/*
   To prepare the postgresql db you must:
        - create the drizzle.config.ts
        - npx drizzle-kit generate
        - force feed psql the generated .sql file
*/
export const db = drizzle(PSQL);

export interface ChallengeForm {
    name: string,
    description: string,
    written_by: string,
    category: string,
    difficulty: string,
    flag: string,
    points: number,
    hlinks: string[] | null;
};

export interface ChallengeData {
    id: number;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    written_by: string | null;
    flag: string;
    points: number;
    user_rates: number[] | null;
    rating: string | null;
    hlinks: string[] | null;
    is_active: boolean | null;
    is_gym: boolean | null;
};

export interface ViewableChallengeData {
    id: number;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    written_by: string | null;
    points: number;
    rating: string | null;
    hlinks: string[] | null;
    is_active: boolean | null;
    is_gym: boolean | null;
}

// special select type used in challenge querying
const publicChallengeData = {
    id: schema.challenges.id,
    name: schema.challenges.name,
    description: schema.challenges.description,
    category: schema.challenges.category,
    difficulty: schema.challenges.difficulty,
    written_by: schema.challenges.written_by,
    points: schema.challenges.points,
    hlinks: schema.challenges.hlinks,
    rating: schema.challenges.rating,
    is_active: schema.challenges.is_active,
    is_gym: schema.challenges.is_gym,
};

/**
 * Insert challenge data into the challenges table (register new challenge)
 * 
 * @param data
 */
export async function AddChallenge(data: ChallengeForm) {
    try {
        const [row] = await db.insert(schema.challenges).values(data).returning();
        console.log(`[*] AddChallenge -> inserted ${row.id}`);
        return true;
    } catch (error) {
        console.error('Failed to insert challenge:', error);
        return false;
    }
}

/**
 * Update a specific challenge
 * 
 * @param data 
 * @param id 
 * @returns 
 */
export async function UpdateChallenge(data: ChallengeForm, id) {
    try {
        const [row] = await db.update(schema.challenges)
                        .set(data)
                        .where(eq(schema.challenges.id, id)).returning();
        console.log(`[*] UpdateChallenge -> updated ${row.id}`);
        return true;
    } catch (error) {
        console.error('Failed to update challenge:', error);
        return false;
    }
}

/**
 * Return all challenges based on mode integer
 * @param grab_mode `0 - all, 1 - event only, 2 - gym only`
 */
export async function GetChallenges(is_admin: boolean, grab_mode: number = 0) {
    try {
        if (grab_mode === 0) {
            return await db.select( !is_admin ? publicChallengeData : {} )
                .from(schema.challenges);
        } else if (grab_mode === 1) {
            return await db.select( !is_admin ? publicChallengeData : {})
                .from(schema.challenges)
                .where(eq(schema.challenges.is_gym, false));
        } else if (grab_mode === 2) {
            return await db.select( !is_admin ? publicChallengeData : {})
                .from(schema.challenges)
                .where(eq(schema.challenges.is_gym, true));
        } else {
            return undefined;
        }
    } catch (error) {
        console.error('Failed to insert challenge:', error);
        return undefined;
    }
}

/**
 * Update a challenge entry based on id and toggle
 * its is_active attribute
 * 
 * @param id
 * @param set_enabled
 * @returns 
 */
export async function ToggleChallenge(id, set_enabled: boolean) {
    try {
        const [row] = await db.update(schema.challenges)
                        .set({ is_active: set_enabled })
                        .where(eq(schema.challenges.id, id));

        console.log(`[*] ToggleChallenge -> ${id} [${ set_enabled ? "ACTIVE" : "DISABLED" }]`);
        return true;
    } catch (error) {
        console.error('Failed to toggle challenge:', error);
        return false;
    }
}

/**
 * Fetch the publically viewable data of a specific challenge
 * 
 * @param id 
 * @returns 
 */
export async function GetChallenge(id) {
    try {
        return await db.select(publicChallengeData)
                        .from(schema.challenges)
                        .where(eq(schema.challenges.id, id))
                        .limit(1);
    } catch (error) {
        console.error(`Failed to fetch challenge (${id}):`, error);
        return [];
    }
}

/**
 * Delete a challenge with a given id
 * 
 * @param id 
 * @returns 
 */
export async function DeleteChallenge(id) {
    try {
        const [row] = await db.delete(schema.challenges)
            .where(eq(schema.challenges.id, id))
            .returning();

        console.log(`[*] DeleteChallenge -> deleted ${row.id}`);
        return true;
    } catch (error) {
        console.error('Failed to delete challenge:', error);
        return false;
    }
}

/**
 * Returns list of all admins on the DB
 * 
 * @returns 
 */
export async function GetAdmins() {
    try {
        return await db.select()
                .from(schema.user)
                .where(eq(schema.user.role, "admin"));
    } catch (error) {
        console.error('Failed to get admins:', error);
        return false;
    }
}

/**
 * Removes an admin entry from the db
 * 
 * @param id 
 * @returns 
 */
export async function DeleteAdmin(id) {
    try {
        // remove user entry
        const [user_data] = await db.delete(schema.user)
            .where(eq(schema.user.id, id))
            .returning();

        // remove account entry
        const [acc_data] = await db.delete(schema.account)
            .where(eq(schema.account.userId, id))
            .returning();
        // remove session entry
        const [sess_data] = await db.delete(schema.session)
            .where(eq(schema.session.userId, id))
            .returning();

        console.log('[+] Deleted Admin');

        const all_data = [user_data, acc_data, sess_data];
        console.log(all_data);

        return true;
    } catch (error) {
        console.error('Failed to delete admin:', error);
        return false;
    }
}

/**
 * Returns a list of CTF players
 * 
 * @returns 
 */
export async function GetUsers() {
    try {
        return await db.select()
                .from(schema.user)
                .where(eq(schema.user.role, "user"));
    } catch (error) {
        console.error('Failed to get users:', error);
        return false;
    }
}

/**
 * Delete a CTF Player with the respective id
 * 
 * @param id 
 * @returns 
 */
export async function DeleteUser(id) {
    try {
        // remove user entry
        const [user_data] = await db.delete(schema.user)
            .where(eq(schema.user.id, id))
            .returning();

        // remove account entry
        const [acc_data] = await db.delete(schema.account)
            .where(eq(schema.account.userId, id))
            .returning();
        // remove session entry
        const [sess_data] = await db.delete(schema.session)
            .where(eq(schema.session.userId, id))
            .returning();

        console.log('[+] Deleted CTF Player');

        const all_data = [user_data, acc_data, sess_data];
        console.log(all_data);

        return true;
    } catch (error) {
        console.error('Failed to delete CTF Player:', error);
        return false;
    }
}

/**
 * Delete a specific challenge archive from the server
 * 
 * @param file 
 * @returns 
 */
export async function UnlinkArchive(file: string) {
    try {
        // fetch all challenges that reference "file" in their hlinks array
        const challenges = await db.select()
            .from(schema.challenges)
            .where(arrayContains(schema.challenges.hlinks, [file]));

        // unlink file from all collected challenges
        for (const challenge of challenges) {
            const updatedLinks = (challenge.hlinks ?? []).filter(f => f !== file);
            await db.update(schema.challenges)
                .set({ hlinks: updatedLinks })
                .where(eq(schema.challenges.id, challenge.id));
        }

        console.log(`[+] File "${file}" unlinked from ${challenges.length} challenge(s)`);
        return true;
    } catch (error) {
        console.error('Failed to unlink file from challenges:', error);
        return false;
    }
}

/**
 * Append a flag claim to a specific user
 * 
 * @param uid 
 * @param cid 
 * @returns 
 */
async function addClaim(uid, cid): Promise<boolean> {
    try {
        await db.update(schema.user)
            .set({
                claims: sql`coalesce(${schema.user.claims}, '[]'::jsonb) || ${JSON.stringify([{
                    challenge_id: cid,
                    claimed_at: new Date().toISOString()
                }])}::jsonb`
            })
            .where(eq(schema.user.id, uid));

        return true;
    } catch (e) {
        console.error('Failed to add claim:', e);
        return false;
    }
}

/**
 * Check challenge flag value submission
 * 
 * @param cid 
 * @param flag_value 
 * @returns 
 */
export async function CheckFlag(uid, cid, flag_value) {
    try {
        // determine if the player has captured this flag already
        
        // @todo - test for SQLI
        const result = await db.select()
            .from(schema.user)
            .where(
                and(
                    eq(schema.user.role, "user"), // admins cannot claim flags
                    sql`${schema.user.id} = ${uid} AND EXISTS (
                        SELECT 1 FROM jsonb_array_elements(${schema.user.claims}) AS claim
                        WHERE (claim->>'challenge_id')::int = ${cid}
                    )`
                )
            )
            .limit(1);
        

        // check flag validiity
        const row = await db.select()
            .from(schema.challenges)
            .where(
                and(
                    eq(schema.challenges.id, cid),
                    eq(schema.challenges.flag, flag_value)
                )
            );
            
        
        // append the flag entry to the user as a claim
        const claimed = row.length === 1;
        if (claimed) {
            const has_appended = await addClaim(uid, cid);
            console.log(`[*] Appended Claim Status: ${has_appended}`);
        }

        return claimed;
    } catch (error) {
        console.error('Error occurred checking flag:', error);
        return false;
    }
}