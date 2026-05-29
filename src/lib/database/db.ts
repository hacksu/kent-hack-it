import postgres from "postgres";

import { drizzle } from "drizzle-orm/postgres-js";
import {
    eq, sql, arrayContains, and,
    or, asc, isNull, lt, count,
    inArray, ne
} from "drizzle-orm";

import * as schema from "./auth-schema";
import { env } from "$env/dynamic/private"; // dynamic allows the .env file to be read at runtime

import { randomString } from "$lib/utilities";
import { type Stat } from "$lib/mtypes";

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

try {
    console.log("[FIRST-TIME-INIT] Setting default event configuration in DB. . .");
    await db.insert(schema.event_config)
        .values({
            name: 'config',
            event_start: new Date(),
            event_length: 7,
            site_active: false
        })
        .onConflictDoNothing();
} catch (e: any) {
    console.error("Error seeding event_config:", e);
}

export interface ChallengeForm {
    name: string;
    description: string;
    written_by: string;
    category: string;
    difficulty: string;
    flag: string;
    points: number;
    hlinks: string[] | null;
    hints: string[] | null;
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
    rating: string | null;
    hints: string[] | null;
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
    hints: string[] | null;
    hlinks: string[] | null;
    is_active: boolean | null;
    is_gym: boolean | null;
    solves: number;
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
    rating: schema.challenges.rating,
    hlinks: schema.challenges.hlinks,
    hints: schema.challenges.hints,
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

        if (!await IsSiteActive() && !is_admin)
            return undefined;

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
export async function ToggleChallenge(id: any, set_enabled: boolean, set_gym: boolean) {
    try {
        const [challenge_old] = await db.select({ name: schema.challenges.name, is_active: schema.challenges.is_active, is_gym: schema.challenges.is_gym })
                                    .from(schema.challenges)
                                    .where(eq(schema.challenges.id, id));

        const [row] = await db.update(schema.challenges)
                        .set({ is_active: set_enabled, is_gym: set_gym })
                        .where(eq(schema.challenges.id, id));

        console.log(`[*] ToggleChallenge -> ${id} [${ set_enabled ? "ACTIVE" : "DISABLED" }]`);
        console.log(` |___--> ${id} [${ set_gym ? "GYM" : "LIVE" }]`);

        let message = "";
        if (challenge_old.is_active !== set_enabled) {
            message = `"${challenge_old.name}" has been ${ set_enabled ? "enabled" : "disabled" }`;
        } else if (challenge_old.is_gym !== set_gym) {
            message = `"${challenge_old.name}" is now a ${ set_gym ? "gym" : "event" } challenge`;
        }

        console.log(message);

        return { success: true, message };
    } catch (error) {
        console.error('Failed to toggle challenge:', error);
        return { success: false, error: "Error Modifying Challenge" };
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
        if (!await IsSiteActive())
            return [];

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
 * Get the number of solvers based on a challenge id (cid)
 * 
 * @param cid 
 */
export async function GetSolversCount(cid: number) {
    try {
        const result = await db
            .select({ count: count() })
            .from(schema.user)
            .where(
                and(
                    eq(schema.user.role, 'user'),
                    sql`
                        ${schema.user.claims} @> ${JSON.stringify([{ challenge_id: String(cid) }])}::jsonb
                    `
                )
            );

        return result[0]?.count ?? 0;
    } catch (e: any) {
        console.error("[-] Error:", e);
        return 0;
    }
}

/**
 * Return a map of solvers where the key is a challenge id
 * and the value is a set of usernames sorted by claim timestamp
 * 
 * @returns 
 */
export async function GetSolvers() {
    
    try {
        const solvers: Record<number, { name: string; claimed_at: string }[]> = {};
        const sorted: Record<number, string[]> = {};
        
        const users = await db
            .select({ name: schema.user.name, claims: schema.user.claims })
            .from(schema.user)
            .where(eq(schema.user.role, 'user'));


        for (const user of users) {
            for (const claim of user.claims ?? []) {
                const cid = Number(claim.challenge_id);
                if (!solvers[cid]) solvers[cid] = [];
                solvers[cid].push({ name: user.name, claimed_at: claim.claimed_at });
            }
        }

        for (const [cid, entries] of Object.entries(solvers)) {
            sorted[Number(cid)] = entries
                .sort((a, b) => new Date(a.claimed_at).getTime() - new Date(b.claimed_at).getTime())
                .map(e => e.name);
        }

        return sorted;
    } catch (e: any) {
        console.error("[-] Error:", e);
        return undefined;
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
        const users = await db
            .select({
                name: schema.user.name,
                email: schema.user.email,
                image: schema.user.image,
                team_name: schema.teams.name,
            })
            .from(schema.user)
            .leftJoin(schema.team_members, eq(schema.user.id, schema.team_members.user_id))
            .leftJoin(schema.teams, eq(schema.team_members.team_id, schema.teams.id))
            .where(eq(schema.user.role, "user"));

        return users.map(u => ({
            name: u.name,
            email: u.email,
            image: u.image,
            team_name: u.team_name ?? null,
        }));
    } catch (e: any) {
        console.error('Failed to get users:', e);
        return [];
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

export async function GetRated(uid: any) {
    try {
        const [user] = await db.select({ rated: schema.user.ratings })
                        .from(schema.user)
                        .where(eq(schema.user.id, uid)).limit(1);
        if (!user) {
            console.log("[-] Could not find rated list for (UID):", uid);
            return [];
        } else {
            return user.rated;
        }

    } catch (e: any) {
        console.error("[-] Error:", e);
        return [];
    }
}

/**
 * Return two lists of completions, one based on the user
 * the other based on the team the user is potentially
 * associated with
 * 
 * @param uid 
 * @returns 
 */
export async function GetCompletions(uid: any) {
    try {
        const [user] = await db.select({ completions: schema.user.claims })
                        .from(schema.user)
                        .where(eq(schema.user.id, uid)).limit(1);
        if (!user) {
            console.log("[-] Could not find completions for (UID):", uid);
            return {
                user: [],
                team: []
            };
        }

        // find the team id a given user is associated with and find
        // the claims across the entire team
        const [membership] = await db
            .select({ team_id: schema.team_members.team_id })
            .from(schema.team_members)
            .where(eq(schema.team_members.user_id, uid))
            .limit(1);

        if (!membership) {
            console.log("[-] Could not find team id associated with (UID):", uid);
            return {
                user: user.completions,
                team: []
            };
        } else {
            const members = await db
                .select({ user_id: schema.team_members.user_id })
                .from(schema.team_members)
                .where(eq(schema.team_members.team_id, membership.team_id));
    
            if (!members.length) return [];
    
            const member_ids = members.map(m => m.user_id);
    
            const users = await db
                .select({ claims: schema.user.claims })
                .from(schema.user)
                .where(inArray(schema.user.id, member_ids));
    
            const claimed = new Set<number>();
            for (const user of users) {
                for (const claim of user.claims ?? []) {
                    claimed.add(Number(claim.challenge_id));
                }
            }
    
            return {
                user: user.completions,
                team: [... claimed]
            };
        }


    } catch (e: any) {
        console.error("[-] Error:", e);
        return {
            user: [],
            team: []
        };
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

export async function SubmitRating(uid: any, cid: any, rating: number): Promise<{ success: boolean, message: string }> {
    try {
        const [user] = await db
            .select({ claims: schema.user.claims, ratings: schema.user.ratings })
            .from(schema.user)
            .where(eq(schema.user.id, uid))
            .limit(1);

        if (!user) return { success: false, message: 'User not found' };

        // check if user has claimed this challenge
        const hasClaimed = user.claims?.some(c => Number(c.challenge_id) === Number(cid));
        if (!hasClaimed) return { success: false, message: 'You must complete a challenge before rating it' };

        // atomic check + append: only appends if cid is NOT already in ratings
        const ratingUpdate = await db.execute(
            sql`
                UPDATE "user"
                SET ratings = array_append(ratings, ${cid}::int)
                WHERE id = ${uid}
                AND NOT (${cid}::int = ANY(ratings))
                RETURNING id
            `
        );

        // if no rows returned, user already rated
        if (!ratingUpdate.length) {
            return { success: false, message: 'You have already rated this challenge' };
        }

        const [challenge] = await db
            .select({ rating: schema.challenges.rating, user_rates: schema.challenges.user_rates })
            .from(schema.challenges)
            .where(eq(schema.challenges.id, cid))
            .limit(1);

        if (!challenge) {
            return { success: false, message: 'Challenge not found' };
        }

        const prevCount  = challenge.user_rates?.length ?? 0;
        const prevRating = Number(challenge.rating ?? 0);
        const newRating  = ((prevRating * prevCount) + rating) / (prevCount + 1);

        await db.update(schema.challenges)
            .set({
                rating: newRating.toFixed(2),
                user_rates: sql`array_append(${schema.challenges.user_rates}, ${uid})`,
            })
            .where(eq(schema.challenges.id, cid));

        return { success: true, message: 'Rating submitted!' };
    } catch (e: any) {
        console.error('Error occurred rating challenge:', e);
        return { success: false, message: 'Error occurred' };
    }
}

export async function GetTeams() {
    try {
        const teams = await db.select().from(schema.teams);

        return await Promise.all(teams.map(async (team) => {
            const [leader] = await db
                .select({
                    name: schema.user.name,
                    image: schema.user.image,
                })
                .from(schema.user)
                .where(eq(schema.user.id, team.leader_id))
                .limit(1);

            const memberRows = await db
                .select({
                    name: schema.user.name,
                    image: schema.user.image,
                })
                .from(schema.team_members)
                .innerJoin(schema.user, eq(schema.team_members.user_id, schema.user.id))
                .where(
                    and(
                        eq(schema.team_members.team_id, team.id),
                        ne(schema.team_members.user_id, team.leader_id)
                    )
                );

            return {
                id: team.id,
                name: team.name,
                leader: leader,
                members: memberRows.map(m => {m.name,m.image}),
            };
        }));
    } catch (e: any) {
        console.error("Error getting teams:", e);
        return [];
    }
}

export async function IsTeamLeader(uid: string) {
    try {
        const results = await db
            .select({ name: schema.teams.name })
            .from(schema.teams)
            .where(eq(schema.teams.leader_id, uid))
            .limit(1);

        return results.length > 0;
    } catch (e: any) {
        console.error("Error checking leadership status:", e);
        return false;
    }
}

export async function GetOpenTeams(uid: string) {
    try {
        const counts = db
            .select({
                team_id: schema.team_members.team_id,
                count: count().as("count"),
            })
            .from(schema.team_members)
            .groupBy(schema.team_members.team_id)
            .as("counts");

        const teams = await db
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

        const requests = await db
            .select({ to: schema.team_requests.to })
            .from(schema.team_requests)
            .where(eq(schema.team_requests.from, uid));

        const pendingLeaderIds = new Set(requests.map(r => r.to));

        return teams.map(team => ({
            id: team.id,
            name: team.name,
            pending: pendingLeaderIds.has(team.id.toString()),
        }));
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

export async function RemoveTeam(team_id: any) {
    try {
        await db.delete(schema.team_members)
            .where(eq(schema.team_members.team_id, team_id));

        await db.delete(schema.teams)
            .where(eq(schema.teams.id, team_id));

        return true;
    } catch (e: any) {
        console.error("Error occurred removing team:", e);
        return false;
    }
}

export async function GetTeam(uid: string) {
    try {
        const membership = await db
            .select({ team_id: schema.team_members.team_id })
            .from(schema.team_members)
            .where(eq(schema.team_members.user_id, uid))
            .limit(1);

        if (!membership.length) {
            return {
                is_leader: false,
                team: null
            };
        }

        const team_id = membership[0].team_id;

        const [team] = await db
            .select()
            .from(schema.teams)
            .where(eq(schema.teams.id, team_id))
            .limit(1);

        const is_leader = uid === team.leader_id;

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

        const teamJoinRows = await db
            .select({
                id: schema.team_requests.id,
                name: schema.user.name,
                image: schema.user.image,
                checksum: schema.team_requests.checksum,
            })
            .from(schema.team_requests)
            .innerJoin(schema.user, eq(schema.team_requests.from, schema.user.id))
            .where(eq(schema.team_requests.to, team_id as any));

        const requests = (is_leader) ? (
            teamJoinRows.map(r => ({ id: r.id, name: r.name, image: r.image, checksum: r.checksum }))
        ) : [];

        const team_data = {
            id: team.id,
            name: team.name,
            leader: { id: leader.id, name: leader.name, image: leader.image },
            members: memberUsers.map(m => ({ id: m.id, name: m.name, image: m.image })),
            requests,
        };

        return {
            is_leader,
            team: team_data
        };
    } catch (e: any) {
        console.error("Error occurred fetching team:", e);
        return {
            is_leader: false,
            team: null
        };
    }
}

export async function CreateRequest(uid: any, team_id: any) {
    try {
        const existing = await db.select().from(schema.team_requests)
                        .where(
                            and(
                                eq(schema.team_requests.to, team_id),
                                eq(schema.team_requests.from, uid)
                            )
                        ).limit(1);
        if (existing.length > 0) {
            console.log("[*] Request has already been sent!");
            return { success: true, error: "Request Pending" };
        }

        await db.insert(schema.team_requests).values({
            to: team_id,
            from: uid,
            checksum: await randomString(),
        });

        return { success: true, message: 'Request Sent!' };
    } catch (e: any) {
        console.error("Error occurred requesting to join:", e);
        return { success: false, error: "Error occurred!" };
    }
}

export async function AcceptMember(rid: any, r_checksum: any) {
    try {
        const data = await db.select().from(schema.team_requests)
                        .where(
                            and(
                                eq(schema.team_requests.id, rid),
                                eq(schema.team_requests.checksum, r_checksum)
                            )
                        ).limit(1);

        if (data.length === 0) {
            console.log("[*] Bad_Acceptance | Request not found!");
            return { success: false, error: "Acceptance Failed" };
        }

        // remove request from db
        await db.delete(schema.team_requests)
                .where(eq(schema.team_requests.id, rid));

        // update team record
        const join_req = data[0];
        return await AddMember(join_req.to, join_req.from);
    } catch (e: any) {
        console.error("Error occurred accepting request:", e);
        return { success: false, error: "Error occurred!" };
    }
}

export async function AddMember(team_id: any, user_id: any) {
    try {
        const [existing] = await db
            .select()
            .from(schema.team_members)
            .where(eq(schema.team_members.user_id, user_id))
            .limit(1);

        if (existing) return { success: false, error: "User is already in a team!" };

        const [count_row] = await db
            .select({ count: count() })
            .from(schema.team_members)
            .where(eq(schema.team_members.team_id, team_id));

        if (count_row.count >= 4) return { success: false, error: "Team is full!" };

        await db.insert(schema.team_members).values({ team_id, user_id });

        return { success: true, message: "Member added!" };
    } catch (e: any) {
        console.error("Error occurred adding member:", e);
        return { success: false, error: "Error occurred!" };
    }
}

export async function RemoveMember(team_id: any, user_id: any) {
    try {
        await db
            .delete(schema.team_members)
            .where(
                and(
                    eq(schema.team_members.team_id, team_id),
                    eq(schema.team_members.user_id, user_id)
                )
            );

        const [team] = await db
            .select()
            .from(schema.teams)
            .where(eq(schema.teams.id, team_id))
            .limit(1);

        if (!team) return { success: true, message: "Member removed!" };

        if (team.leader_id === user_id) {
            const [next] = await db
                .select()
                .from(schema.team_members)
                .where(eq(schema.team_members.team_id, team_id))
                .orderBy(asc(schema.team_members.joined_at))
                .limit(1);

            if (next) {
                await db
                    .update(schema.teams)
                    .set({ leader_id: next.user_id })
                    .where(eq(schema.teams.id, team_id));
            } else {
                await db.delete(schema.teams).where(eq(schema.teams.id, team_id));
            }
        }

        return { success: true, message: "Member removed!" };
    } catch (e: any) {
        console.error("Error occurred removing member:", e);
        return { success: false, error: "Error occurred!" };
    }
}

export async function GetProgress(uid: string) {
    const category_colors = [
        "#ec8058",
        "#d8a04b",
        "#d4d444",
        "#90b850",
        "#13beb6",
        "#4068c5",
        "#8354b5",
    ];

    try {
        const [data] = await db.select({ claims: schema.user.claims })
            .from(schema.user)
            .where(eq(schema.user.id, uid))
            .limit(1);

        const all_challenges = await db.select({
            id: schema.challenges.id,
            name: schema.challenges.name,
            category: schema.challenges.category,
            is_gym: schema.challenges.is_gym,
        }).from(schema.challenges);

        const evt_challenges = all_challenges.filter(c => !c.is_gym);
        const claims = data.claims ?? [];
        const hasClaim = (id: number) => claims.some(c => String(c.challenge_id) === String(id));

        const byCategory = (challenges: typeof all_challenges): Stat[] => {
            const categories = [...new Set(challenges.map(c => c.category))];

            return categories.map((cat, index) => {
                const group = challenges.filter(c => c.category === cat);

                return {
                    label: cat,
                    value: group.filter(c => hasClaim(c.id)).length,
                    total: group.length,
                    color: category_colors[index % category_colors.length],
                };
            });
        };

        // check if uid is in a team
        const [membership] = await db
            .select({ team_id: schema.team_members.team_id })
            .from(schema.team_members)
            .where(eq(schema.team_members.user_id, uid))
            .limit(1);

        let teamProg = null;

        if (membership) {
            const team_id = membership.team_id;

            // get all team members with their claims
            const team_member_rows = await db
                .select({ user_id: schema.team_members.user_id })
                .from(schema.team_members)
                .where(eq(schema.team_members.team_id, team_id));

            const member_ids = team_member_rows.map(m => m.user_id);

            const member_claims = await db
                .select({ id: schema.user.id, name: schema.user.name, claims: schema.user.claims })
                .from(schema.user)
                .where(inArray(schema.user.id, member_ids));

            // for each challenge, find who completed it first
            // credit goes to earliest claimed_at, ties broken by member order
            type Contribution = { challenge_id: string; winner_id: string; winner_name: string; claimed_at: string };

            const contributions: Contribution[] = [];

            for (const challenge of all_challenges) {
                const completions = member_claims
                    .flatMap(m => (m.claims ?? [])
                        .filter(c => String(c.challenge_id) === String(challenge.id))
                        .map(c => ({ user_id: m.id, name: m.name, claimed_at: c.claimed_at }))
                    )
                    .sort((a, b) => new Date(a.claimed_at).getTime() - new Date(b.claimed_at).getTime());

                if (completions.length > 0) {
                    contributions.push({
                        challenge_id: String(challenge.id),
                        winner_id: completions[0].user_id,
                        winner_name: completions[0].name,
                        claimed_at: completions[0].claimed_at,
                    });
                }
            }

            // category bars — how many challenges per category are completed by anyone on the team
            const categories = [...new Set(all_challenges.map(c => c.category))];

            const categoryBars: Stat[] = categories.map((cat, index) => {
                const group = all_challenges.filter(c => c.category === cat);

                const completed = group.filter(c =>
                    contributions.some(con => con.challenge_id === String(c.id))
                ).length;

                return {
                    label: cat,
                    value: completed,
                    total: group.length,
                    color: category_colors[index % category_colors.length],
                };
            });

            // pie chart data — contribution count per member (first-completion credit)
            const pieData = member_claims.map(m => ({
                user_id: m.id,
                name: m.name,
                contributions: contributions.filter(c => c.winner_id === m.id).length,
            }));

            teamProg = {
                bars: [
                    {
                        label: 'Team Total',
                        value: contributions.length,
                        total: all_challenges.length,
                        color: '#5b93d8',
                    },
                    ...categoryBars,
                ],
                pie: pieData,
            };
        }

        return {
            totalProg: [
                {
                    label: 'Total',
                    value: claims.length,
                    total: all_challenges.length,
                    color: '#5b93d8',
                },
                ...byCategory(all_challenges),
            ] as Stat[],
            eventProg: [
                {
                    label: 'Event',
                    value: evt_challenges.filter(c => hasClaim(c.id)).length,
                    total: evt_challenges.length,
                    color: '#5b93d8',
                },
                ...byCategory(evt_challenges),
            ] as Stat[],
            teamProg,
        };
    } catch (e) {
        console.error("[-] Error", e);
        return { totalProg: [], eventProg: [], teamProg: null };
    }
}

export async function GetConfiguration() {
    try {
        const [data] = await db.select()
                .from(schema.event_config)
                .where(eq(schema.event_config.name, "config"))
                .limit(1);
        return data;
    } catch (e: any) {
        console.error("[-] Error", e);
        return null;
    }
}

export async function IsSiteActive() {
    try {
        const [data] = await db.select({ status: schema.event_config.site_active })
                .from(schema.event_config)
                .where(eq(schema.event_config.name, "config"))
                .limit(1);
        console.log("[SITE-ONLINE]", data.status);
        return data.status;
    } catch (e: any) {
        console.error("[-] Error", e);
        return false;
    }
}

export async function UpdateConfiguration(data: {
    event_start: Date,
    event_length: number,
    site_active: boolean
}) {
    try {
        await db.update(schema.event_config)
            .set({
                event_start: data.event_start,
                event_length: data.event_length,
                site_active: data.site_active,
            })
            .where(eq(schema.event_config.name, 'config'));

        return { success: true, message: 'Config updated!' };
    } catch (e: any) {
        console.error("Error updating config:", e);
        return { success: false, error: "Error updating config" };
    }
}