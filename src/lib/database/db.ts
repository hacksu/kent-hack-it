import postgres from "postgres";

import { drizzle } from "drizzle-orm/postgres-js";
import {
    eq, sql, arrayContains, and,
    or, asc, isNull, lt, count,
    inArray,
} from "drizzle-orm";

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
export async function UpdateChallenge(data: ChallengeForm, id: any) {
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
        const selection = is_admin ? undefined : publicChallengeData;

        const q = (where?: any) => {
            const base = selection
                ? db.select(selection).from(schema.challenges)
                : db.select().from(schema.challenges);
            return where ? base.where(where) : base;
        };

        // grab all
        if (grab_mode === 0) return await q();
        // grab only event
        if (grab_mode === 1) return await q(eq(schema.challenges.is_gym, false));
        // grab only gym
        if (grab_mode === 2) return await q(eq(schema.challenges.is_gym, true));
        return undefined;
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
export async function ToggleChallenge(id: any, set_enabled: boolean) {
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
export async function GetChallenge(id: any) {
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
export async function DeleteChallenge(id: any) {
    try {
        const [row] = await db.delete(schema.challenges)
            .where(eq(schema.challenges.id, id))
            .returning();

        // remove the flag claim from all players if needed
        await db.update(schema.user)
            .set({
                claims: sql`(
                SELECT jsonb_agg(claim)
                FROM jsonb_array_elements(${schema.user.claims}) AS claim
                WHERE (claim->>'challenge_id') != ${id}::text
                )`
            })
            .where(
                sql`EXISTS (
                SELECT 1
                FROM jsonb_array_elements(${schema.user.claims}) AS claim
                WHERE (claim->>'challenge_id') = ${id}::text
                )`
            );

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
export async function DeleteAdmin(id: any) {
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
export async function DeleteUser(id: any) {
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
async function addClaim(uid: any, cid: any): Promise<boolean> {
    try {
        // duplicate claim insert protection
        const [data] = await db.select({ claims: schema.user.claims })
                    .from(schema.user)
                    .where(eq(schema.user.id, uid)).limit(1);
        for (const claim of data.claims || []) {
            if (claim.challenge_id === cid) {
                return true;
            }
        }

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
export async function CheckFlag(uid: any, cid: any, flag_value: any): Promise<{ success: boolean, message: string }> {
    try {
        // fetch users flag claims to determine if they already captured this flag
        const [data] = await db.select({ claims: schema.user.claims })
                    .from(schema.user)
                    .where(eq(schema.user.id, uid)).limit(1);
        for (const claim of data.claims || []) {
            if (claim.challenge_id === cid) {
                return { success: true, message: 'Already Claimed!' };
            }
        }
        

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
            return { success: true, message: 'Correct Flag!' };
        } else {
            return { success: false, message: 'Incorrect Flag!' };
        }
    } catch (error) {
        console.error('Error occurred checking flag:', error);
        return { success: false, message: 'Error Occurred' };
    }
}

export async function GetOpenTeams() {
    try {
        const counts = db
            .select({
                team_id: schema.team_members.team_id,
                count: count().as("count"),
            })
            .from(schema.team_members)
            .groupBy(schema.team_members.team_id)
            .as("counts");

        return await db
            .select({
                id: schema.teams.id,
                name: schema.teams.name,
            })
            .from(schema.teams)
            .leftJoin(counts, eq(schema.teams.id, counts.team_id))
            .where(or(
                isNull(counts.count),
                lt(counts.count, 4)
            ));
    } catch (e: any) {
        console.error("Error occurred fetching open teams:", e);
        return [];
    }
}

export async function LeaveTeam(uid: string, team_id: any) {
    try {
        await db.delete(schema.team_members)
            .where(
                and(
                    eq(schema.team_members.user_id, uid),
                    eq(schema.team_members.team_id, team_id)
                )
            );

        const [team] = await db
            .select()
            .from(schema.teams)
            .where(eq(schema.teams.id, team_id))
            .limit(1);

        if (!team) return { success: true, message: 'Left team!' };

        if (team.leader_id === uid) {
            const [next] = await db
                .select()
                .from(schema.team_members)
                .where(eq(schema.team_members.team_id, team_id))
                .orderBy(asc(schema.team_members.joined_at))
                .limit(1);

            if (next) {
                await db.update(schema.teams)
                    .set({ leader_id: next.user_id })
                    .where(eq(schema.teams.id, team_id));
            } else {
                await db.delete(schema.teams)
                    .where(eq(schema.teams.id, team_id));
            }
        }

        return { success: true, message: 'Left team!' };
    } catch (e: any) {
        console.error("Error occurred leaving team:", e);
        return { success: false, error: "Error occurred!" };
    }
}

export async function MakeTeam(uid: string, name: string) {
    try {
        const [existing] = await db
            .select()
            .from(schema.team_members)
            .where(eq(schema.team_members.user_id, uid))
            .limit(1);

        if (existing) return { success: false, error: "You are already in a team!" };

        const [team_data] = await db.insert(schema.teams).values({
            name,
            leader_id: uid,
        }).returning({ team_id: schema.teams.id });

        await db.insert(schema.team_members).values({
            team_id: team_data.team_id,
            user_id: uid,
        });

        return { success: true, message: 'Team created!' };
    } catch (e: any) {
        console.error("Error occurred creating a team:", e);
        return { success: false, error: "Error occurred!" };
    }
}

export async function GetTeam(uid: string) {
    try {
        const membership = await db
            .select({ team_id: schema.team_members.team_id })
            .from(schema.team_members)
            .where(eq(schema.team_members.user_id, uid))
            .limit(1);

        if (!membership.length) return null;

        const team_id = membership[0].team_id;

        const [team] = await db
            .select()
            .from(schema.teams)
            .where(eq(schema.teams.id, team_id))
            .limit(1);

        const [leader] = await db
            .select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
            .from(schema.user)
            .where(eq(schema.user.id, team.leader_id))
            .limit(1);

        const memberRows = await db
            .select({ user_id: schema.team_members.user_id })
            .from(schema.team_members)
            .where(eq(schema.team_members.team_id, team_id));

        const memberIds = memberRows
            .map(m => m.user_id)
            .filter(id => id !== team.leader_id);

        const memberUsers = memberIds.length > 0
            ? await db
                .select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
                .from(schema.user)
                .where(inArray(schema.user.id, memberIds))
            : [];

        return {
            id: team.id,
            name: team.name,
            leader: { id: leader.id, name: leader.name, image: leader.image },
            members: memberUsers.map(m => ({ id: m.id, name: m.name, image: m.image })),
        };
    } catch (e: any) {
        console.error("Error occurred fetching team:", e);
        return null;
    }
}

import { type Stat } from "$lib/mtypes";
export async function GetProgress(uid: string): Promise<Stat[]> {
    try {
        const [data] = await db.select({ claims: schema.user.claims })
                        .from(schema.user)
                        .where(eq(schema.user.id, uid)).limit(1);
    
        const c_data = await db.select({ name: schema.challenges.name })
                        .from(schema.challenges);
        const evt_data = await db.select({ id: schema.challenges.id, name: schema.challenges.name })
                            .from(schema.challenges)
                            .where(eq(schema.challenges.is_gym, false));
    
        // show progress between both event and gym challenges
        const totalProg: Stat = {
            label: 'Total',
            value: data.claims?.length || 0,
            total: c_data.length
        }
    
        // show event progress
        const eventClaims = data.claims?.filter(c => evt_data.some(e => {
            return String(e.id) === String(c.challenge_id);
        }));
        const eventProg: Stat = {
            label: 'Event',
            value: eventClaims?.length || 0,
            total: evt_data.length,
            color: '#72b35f'
        }
    
        return [
            totalProg,
            eventProg
        ]
    } catch (e) {
        console.error("[-] Error", e);
        return [];
    }
}