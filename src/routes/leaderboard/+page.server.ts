import {
    type LeaderboardEntry, GetLeaderboard,
    GetLeaderboardScoreRace, GetTeamFromPlayer
} from "$lib/database/db";
import { ArchiveLeaderboard } from "$lib/preserveLeaderboard";
import { isAdmin } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
    const { user } = await parent();

    const leaderboard = await GetLeaderboard();
    const scoreRace = await GetLeaderboardScoreRace(4);
    let self_placement: LeaderboardEntry | undefined = leaderboard.find(entry => entry.name === user?.name );

    async function FindSelf() {
        // if the user is not solo find their team
        if (!self_placement && user) {
            // find the team the user is associated with
            const membership = await GetTeamFromPlayer(user.id);
            if (membership) {
                self_placement = leaderboard.find(entry => entry.name === membership.name );
            }
        }
    }
    await FindSelf();
    
    return {
        board: leaderboard,
        user_placement: self_placement,
        scoreRace,
        isAdmin: user?.role === "admin"
    };
};

export const actions = {
    // special form named-target
    archive_leaderboard: async ({ request }) => {
        // only admins can request leaderboard archiving
        if (!await isAdmin(request))
            throw redirect(303, '/auth/login');
        
        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            if (!formData.year || !formData.leaderboard) {
                return fail(500, { error: 'An error occurred' });
            }

            console.log(`[!] Admin is creating a leaderboard archive for KHI ${formData.year}`);
            const leaderboard = JSON.parse(formData.leaderboard);
            const result = await ArchiveLeaderboard(Number(formData.year), leaderboard.board);

            if (!result.success) {
                return fail(409, { error: result.error });
            }

            return { success: true, message: result.message };
        } catch (e) {
            console.error(`[-] archive_leaderboard -> ${e}`);
            return fail(500, { error: 'An error occurred' });
        }
    }
};