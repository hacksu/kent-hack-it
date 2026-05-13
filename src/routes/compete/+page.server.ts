import { auth } from '$lib/server/auth';
import { redirect, fail } from '@sveltejs/kit';

import { GetChallenges, CheckFlag } from "$lib/database/db";

export const load = async ({ parent }) => {
    // goes to +layout.server.ts and fetches the user state
    const { user } = await parent();
    
    // redirect unauthenticated users to login
    if (!user) throw redirect(303, '/auth/login');

    const challenges = await GetChallenges(false);

    return {
        user, challenges
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

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const flag_value = formData.flag_value;
        const cid = formData.cid;
        const uid = session.user.id;

        if (!flag_value || !cid) {
            return { success: false, message: 'No flag submitted' };
        }

        console.log(`[${uid}] Checking Flag (${cid}) -> ${flag_value}`);

        try {
            return ( await CheckFlag(uid, cid, flag_value) ) ? {
                success: true, message: 'Correct Flag!'
            } : {
                success: false, message: 'Incorrect Flag!'
            };
        } catch (e) {
            console.error(`[-] Submit Flag -> ${e}`);
            return fail(500, { error: 'An error occurred while adding the challenge' });
        }
    },
};