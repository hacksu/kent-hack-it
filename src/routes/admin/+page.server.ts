import { redirect, fail } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth'
import { AddChallenge, GetChallenges, UpdateChallenge } from "$lib/database/db";

// importing interface alias
import type { ChallengeForm } from "$lib/database/db";

export const load = async ({ parent }) => {
    // goes to +layout.server.ts and fetches the user state
    const { user } = await parent();

    // redirect unauthenticated users to login
    if (!user) throw redirect(303, '/auth/login');
    if (user.role !== 'admin') throw redirect(303, '/');

    let challenges = await GetChallenges();

    return { user, challenges }
};

const PointValues = {
    "simple": 100,
    "easy": 200,
    "medium": 300,
    "hard": 400,
    "extreme": 500,
};

// FORM DATA HANDLING ONLY - POSTS ARE HANDLED IN +server.ts
export const actions = {
    // special form named-target
	add_challenge: async ({ cookies, request }) => {
        const authCheck = await isAdmin(request);
        if (authCheck.status !== 200)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;

        if (!formData.name || !formData.description || !formData.written_by || 
            !formData.category || !formData.difficulty || !formData.flag)
            return fail(400, { error: 'Missing required data' });

        const points = PointValues[formData.difficulty.toLowerCase() as keyof typeof PointValues];
        if (!points)
            return fail(400, { error: 'Invalid difficulty value' });

        try {
            const data: ChallengeForm = {
                name: formData.name,
                description: formData.description,
                written_by: formData.written_by,
                category: formData.category,
                difficulty: formData.difficulty,
                flag: formData.flag,
                points,
            };

            await AddChallenge(data);
            return { success: true, message: 'Challenge added!' };
        } catch (e) {
            console.error(`[-] Add_Challenge -> ${e}`);
            return fail(500, { error: 'An error occurred while adding the challenge' });
        }
    },
    edit_challenge: async ({ request }) => {
        const authCheck = await isAdmin(request);
        if (authCheck.status !== 200)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        if (!formData.id || !formData.name || !formData.description ||
            !formData.written_by || !formData.category || !formData.difficulty || !formData.flag)
            return fail(400, { error: 'Missing required data' });

        const points = PointValues[formData.difficulty.toLowerCase() as keyof typeof PointValues];
        if (!points)
            return fail(400, { error: 'Invalid difficulty value' });

        try {
            console.log("[!] Admin is modifying a challenge");

            await UpdateChallenge({
                name: formData.name,
                description: formData.description,
                written_by: formData.written_by,
                category: formData.category,
                difficulty: formData.difficulty,
                flag: formData.flag,
                points,
            }, formData.id);

            return { success: true, message: 'Challenge updated!' };
        } catch (e) {
            console.error(`[-] Edit_Challenge -> ${e}`);
            return fail(500, { error: 'An error occurred while updating the challenge' });
        }
    },
};