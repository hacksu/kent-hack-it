import { auth, isAdmin } from '$lib/server/auth';
import { redirect, fail } from '@sveltejs/kit';

import {
    GetProgress, GetChallenges, CheckFlag,
    IsSiteActive, GetCompletions, GetSolversCount,
    SubmitRating, GetRated,
    CreateInstance,
} from "$lib/database/db";

export const load = async ({ parent, setHeaders }) => {
    // goes to +layout.server.ts and fetches the user state
    const { user } = await parent();
    
    // redirect unauthenticated users to login
    if (!user) throw redirect(303, '/auth/login');

    let challenges = await GetChallenges(false, 1); // only fetch event/live challenges
    const completions = await GetCompletions(user.id);
    const rated = await GetRated(user.id);
    const progressData = await GetProgress(user.id);

    // modify object to attach the solvers attribute
    for (let c of challenges || []) {
        c['solves'] = await GetSolversCount(c.id);
    }

    setHeaders({
        "cache-control": "no-store"
    });

    return {
        user, challenges, progressData, completions, rated
    }
};

// FORM DATA HANDLING ONLY - POSTS ARE HANDLED IN +server.ts
export const actions = {
    // special form named-target
    submit_flag: async ({ request }) => {
        const session = await auth.api.getSession({
                headers: request.headers,
            });

        // user not authenticated
        if (!session) {
            throw redirect(302, "/auth/login");
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

    submit_rating: async ({ request }) => {
        const session = await auth.api.getSession({
                headers: request.headers,
            });

        // user not authenticated
        if (!session) {
            throw redirect(302, "/auth/login");
        }

        // admins cannot submit rating : srry again <3
        if (await isAdmin(request)) {
            console.log("[*] Admin tried rating a challenge!");
            return { success: false, message: 'Admins cannot participate!' };
        }

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const cid = formData.cid;
        const uid = session.user.id;
        
        if (!formData.rating || !cid) {
            return { success: false, message: !await IsSiteActive() ? 'No rating submitted' : 'Not accepting ratings at this time' };
        }
        
        const rating = Number(formData.rating);
        if (rating < 0 || rating > 5) {
            console.warn(`[!] UID: ${uid} tried submitting a rating of: ${rating} for challenge id: ${cid}`);
            return { success: false, message: 'Invalid rating' };
        }

        try {
            if (!await IsSiteActive()) {
                return { success: false, message: 'Not accepting ratings at this time' };
            } else {
                console.log("[*] Attempting to Submit a Rating");
                return await SubmitRating(uid, cid, rating);
            }
        } catch (e) {
            console.error(`[-] Submit Rating -> ${e}`);
            return fail(500, { success: false, error: 'An error occurred while rating the challenge' });
        }
    },

    create_instance: async ({ request }) => {
        const session = await auth.api.getSession({
                headers: request.headers,
            });

        // user not authenticated
        if (!session) {
            throw redirect(302, "/auth/login");
        }

        const form = await request.formData();
        const { cid } = Object.fromEntries(form.entries()) as Record<string, string>;
        const uid = session.user.id;

        try {
            if (!await IsSiteActive()) {
                return { success: false, message: 'Cannot create Instances at this time, try again later!' };
            } else {
                console.log("[*] Attempting to prepare Instance");
                const instance_data = await CreateInstance(uid, cid);
                console.log(instance_data);
                return instance_data;
            }
        } catch (e) {
            console.error(`[-] Create Instance -> ${e}`);
            return fail(500, { success: false, error: 'An error occurred while preparing Instance' });
        }
    },
};