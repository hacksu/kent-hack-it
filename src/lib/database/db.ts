import postgres from "postgres";

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

import * as schema from "./auth-schema";
import { env } from "$env/dynamic/private"; // dynamic allows the .env file to be read at runtime

const sql = postgres({
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
export const db = drizzle(sql);

export interface ChallengeForm {
    name: string,
    description: string,
    written_by: string,
    category: string,
    difficulty: string,
    flag: string,
    points: number
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
export async function GetChallenges(grab_mode: number = 0) {
    try {
        if (grab_mode === 0) {
            return await db.select()
                .from(schema.challenges);
        } else if (grab_mode === 1) {
            return await db.select()
                .from(schema.challenges)
                .where(eq(schema.challenges.is_gym, false));
        } else if (grab_mode === 2) {
            return await db.select()
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