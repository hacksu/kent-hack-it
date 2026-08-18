import { auth, isAdmin } from '$lib/server/auth';
import { redirect, fail } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";

import {
    CheckFlag, SubmitRating,
    CreateInstance, CreateSSHInstance,
} from "$lib/database/db";

export const challengeActions = {
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
            // PROD env var will not appear in developer env
            if (process.env.PROD || env.PROD)
                return { success: false, message: 'Admins cannot participate!' };
        }

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const flag_value = formData.flag_value;
        const cid = formData.cid;
        const uid = session.user.id;

        if (!flag_value || !cid) {
            return { success: false, message: 'No flag submitted' };
        }

        try {
            console.log(`[${uid}] Checking Flag (${cid})`);
            return await CheckFlag(uid, cid, flag_value);
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
            if (process.env.PROD || env.PROD)
                return { success: false, message: 'Admins cannot participate!' };
        }

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const cid = formData.cid;
        const uid = session.user.id;

        if (!formData.rating || !cid) {
            return { success: false, message: 'Not accepting ratings at this time' };
        }

        const rating = Number(formData.rating);
        if (rating < 0 || rating > 5) {
            console.warn(`[!] UID: ${uid} tried submitting a rating of: ${rating} for challenge id: ${cid}`);
            return { success: false, message: 'Invalid rating' };
        }

        try {
            console.log("[*] Attempting to Submit a Rating");
            return await SubmitRating(uid, cid, rating);
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
            console.log("[*] Attempting to prepare Instance");
            const instance_data = await CreateInstance(uid, cid);
            console.log(instance_data);
            return instance_data;
        } catch (e) {
            console.error(`[-] Create Instance -> ${e}`);
            return fail(500, { success: false, error: 'An error occurred while preparing Instance' });
        }
    },

    create_ssh_instance: async ({ request }) => {
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
            console.log("[*] Attempting to prepare SSH Instance");
            const instance_data = await CreateSSHInstance(uid, cid);
            console.log(instance_data);
            return instance_data;
        } catch (e) {
            console.error(`[-] Create SSH Instance -> ${e}`);
            return fail(500, { success: false, error: 'An error occurred while preparing SSH Instance' });
        }
    },
};
