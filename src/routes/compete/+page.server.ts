import { auth, isAdmin } from '$lib/server/auth';
import { redirect, fail } from '@sveltejs/kit';

import { GetProgress, GetChallenges, CheckFlag, IsSiteActive, GetCompletions } from "$lib/database/db";

export const load = async ({ parent }) => {
    // goes to +layout.server.ts and fetches the user state
    const { user } = await parent();
    
    // redirect unauthenticated users to login
    if (!user) throw redirect(303, '/auth/login');

    const challenges = await GetChallenges(false);
    const completions = await GetCompletions(user.id);
    const progressData = await GetProgress(user.id);

    return {
        user, challenges, progressData, completions
    }
};

// FORM DATA HANDLING ONLY - POSTS ARE HANDLED IN +server.ts
export const actions = {
    // special form named-target
    submit_flag: async ({ cookies, request }) => {
        const session = await auth.api.getSession({
                headers: request.headers,
            });

        // user not authenticated
        if (!session) {
            return redirect(301, "/auth/login");
        }

        // admins cannot score flags : srry <3
        if (await isAdmin(request)) {
            console.log("[*] Admin tried claiming a flag!");
            return { success: false, message: 'Admins cannot participate!' };
        }

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const flag_value = formData.flag_value;
        const cid = formData.cid;
        const uid = session.user.id;

        if (!flag_value || !cid) {
            return { success: false, message: !await IsSiteActive() ? 'No flag submitted' : 'Not accepting flags at this time' };
        }

        console.log(`[${uid}] Checking Flag (${cid}) -> ${flag_value}`);

        try {
            if (!await IsSiteActive()) {
                return { success: false, message: 'Not accepting flags at this time' };
            } else {
                return await CheckFlag(uid, cid, flag_value);
            }
        } catch (e) {
            console.error(`[-] Submit Flag -> ${e}`);
            return fail(500, { success: false, error: 'An error occurred while adding the challenge' });
        }
    },
};