import { CreateRequest, GetOpenTeams, GetTeam, LeaveTeam, MakeTeam } from '$lib/database/db.js';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
    const { user } = await parent();

    // admins cannot have teams therefor redirect admins to admin panel
    if (!user) throw redirect(303, '/auth/login');
    if (user.role === 'admin') throw redirect(303, '/admin');

    const results = await GetTeam(user.id);

    return {
        is_leader: results.is_leader,
        teams: await GetOpenTeams(user.id),
        team: results.team,
    }
};

export const actions = {
    // special form named-target
    create_team: async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            return await MakeTeam(session.user.id, formData.name);
        } catch (e) {
            console.error(`[-] Team Creation: ${e}`);
            return { success: false, error: "Error occurred!" };
        }
    },
    request_join: async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            const team_id = formData.team_id;
            return await CreateRequest(session.user.id, team_id);
        } catch (e) {
            console.error(`[-] Team-Request: ${e}`);
            return { success: false, error: "Error occurred!" };
        }
    },
    leave_team: async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            return await LeaveTeam(session.user.id, formData.team_id);
        } catch (e) {
            console.error(`[-] Team-Request: ${e}`);
            return { success: false, error: "Error occurred!" };
        }
    },
};