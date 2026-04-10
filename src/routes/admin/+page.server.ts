import { redirect } from '@sveltejs/kit';
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
        // validate authentication
        const authCheck = await isAdmin(request);
        if (authCheck.status !== 200) return;

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries());

        // validate the data is present
        if (!formData.name) return;
        if (!formData.description) return;
        if (!formData.written_by) return;
        if (!formData.category) return;
        if (!formData.difficulty) return;
        if (!formData.flag) return;

        // update the points value based on the server-accepted point look-up
        const pointsKey = formData.difficulty.valueOf().toString().toLowerCase();
        const points = PointValues[pointsKey as keyof typeof PointValues];
        if (!points) return;

        try {
            // write new challenge into db
            console.log("[!] Admin is writing to the database");
            
            const data: ChallengeForm = {
                name: formData.name.valueOf().toString(),
                description: formData.description.valueOf().toString(),
                written_by: formData.written_by.valueOf().toString(),
                category: formData.category.valueOf().toString(),
                difficulty: formData.difficulty.valueOf().toString(),
                flag: formData.flag.valueOf().toString(),
                points,
            };
            await AddChallenge(data);
        } catch (e) {
            console.error(`[-] Add_Challenge -> ${e}`);
        }
	},
    edit_challenge: async ({ cookies, request }) => {
        // validate authentication
        const authCheck = await isAdmin(request);
        if (authCheck.status !== 200) return;

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries());

        // validate the data is present
        if (!formData.id) return;
        if (!formData.name) return;
        if (!formData.description) return;
        if (!formData.written_by) return;
        if (!formData.category) return;
        if (!formData.difficulty) return;
        if (!formData.flag) return;

        // update the points value based on the server-accepted point look-up
        const pointsKey = formData.difficulty.valueOf().toString().toLowerCase();
        const points = PointValues[pointsKey as keyof typeof PointValues];
        if (!points) return;

        try {
            // write new challenge into db
            console.log("[!] Admin is modifying a challenge");
            
            const data: ChallengeForm = {
                name: formData.name.valueOf().toString(),
                description: formData.description.valueOf().toString(),
                written_by: formData.written_by.valueOf().toString(),
                category: formData.category.valueOf().toString(),
                difficulty: formData.difficulty.valueOf().toString(),
                flag: formData.flag.valueOf().toString(),
                points,
            };
            await UpdateChallenge(data, formData.id.valueOf().toString());
        } catch (e) {
            console.error(`[-] Edit_Challenge -> ${e}`);
        }
	},
};